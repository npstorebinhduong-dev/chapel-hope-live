import express from "express";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import {
  GIFTS,
  commentSchema,
  giftSchema,
  controlSchema,
} from "@chapel/shared";
import { ChapelEngine } from "../../../packages/shared/src/engine.ts";
import path from "node:path";
import { fillGiftedSeats } from "../../../packages/shared/src/fixtures.ts";

export function createChapelServer() {
  const engine = new ChapelEngine();
  const app = express(),
    server = createServer(app);
  app.disable("x-powered-by");
  app.use((req, _res, next) => {
    if (req.url.startsWith("/api/")) req.url = req.url.slice(4);
    next();
  });
  // Local operator API: forbid cross-site browser writes, including LAN-origin CSRF.
  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (
      origin &&
      origin !== `http://${req.get("host")}` &&
      origin !== "http://127.0.0.1:5173" &&
      origin !== "http://localhost:5173"
    ) {
      res.status(403).json({ error: "Local operator origin required" });
      return;
    }
    next();
  });
  app.use(express.json({ limit: "8kb" }));
  let bucket = 200,
    refilled = Date.now();
  app.use((req, res, next) => {
    const now = Date.now();
    bucket = Math.min(200, bucket + (now - refilled) * 0.05);
    refilled = now;
    if (req.method === "POST" && bucket < 1) {
      res.status(429).json({ error: "rate_limit", retryAfterMs: 1000 });
      return;
    }
    if (req.method === "POST") bucket--;
    next();
  });
  const metrics = new Map<WebSocket, { fps: number; renderer: string }>();
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 });
  server.on("upgrade", (req, socket, head) => {
    const origin = req.headers.origin;
    if (
      req.url !== "/ws" ||
      wss.clients.size >= 12 ||
      (origin &&
        origin !== `http://${req.headers.host}` &&
        origin !== "http://127.0.0.1:5173" &&
        origin !== "http://localhost:5173")
    ) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) =>
      wss.emit("connection", ws, req),
    );
  });
  const send = (ws: WebSocket, data: unknown) => {
    if (ws.readyState === WebSocket.OPEN) {
      if (ws.bufferedAmount > 1_000_000) {
        ws.terminate();
        return;
      }
      ws.send(JSON.stringify(data));
    }
  };
  const broadcast = () => {
    const message = {
      type: "snapshot",
      snapshot: engine.snapshot(),
      metrics: [...metrics.values()],
    };
    for (const ws of wss.clients) send(ws, message);
  };
  wss.on("connection", (ws) => {
    send(ws, {
      type: "snapshot",
      snapshot: engine.snapshot(),
      metrics: [...metrics.values()],
    });
    let lastMetric = 0;
    ws.on("message", (raw) => {
      if (Date.now() - lastMetric < 900) return;
      lastMetric = Date.now();
      try {
        const data = JSON.parse(raw.toString());
        if (
          data.type === "metrics" &&
          Number.isFinite(data.fps) &&
          data.fps >= 0 &&
          data.fps <= 300
        )
          metrics.set(ws, {
            fps: Math.round(data.fps),
            renderer: String(data.renderer).slice(0, 40),
          });
      } catch {
        /* Ignore malformed telemetry. */
      }
    });
    ws.on("close", () => metrics.delete(ws));
    ws.on("error", () => ws.terminate());
  });
  app.get("/health", (_req, res) =>
    res.json({
      ok: true,
      mode: "mock",
      viewers: engine.attendees.size,
      queue: engine.queue.length,
    }),
  );
  app.get("/state", (_req, res) => res.json(engine.snapshot()));
  app.post("/mock/comment", (req, res) => {
    const input = commentSchema.safeParse(req.body);
    if (!input.success) {
      res
        .status(400)
        .json({ error: "invalid_comment", issues: input.error.issues });
      return;
    }
    const event = {
      ...input.data,
      eventId: input.data.eventId ?? randomUUID(),
      type: "comment" as const,
      timestamp: Date.now(),
    };
    const result = engine.comment(event);
    broadcast();
    res.json({ ...result, eventId: event.eventId });
  });
  app.post("/mock/gift", (req, res) => {
    const input = giftSchema.safeParse(req.body);
    if (!input.success) {
      res
        .status(400)
        .json({ error: "invalid_gift", issues: input.error.issues });
      return;
    }
    const event = {
      ...input.data,
      eventId: input.data.eventId ?? randomUUID(),
      type: "gift" as const,
      coinValue: GIFTS[input.data.giftKey].coins,
      timestamp: Date.now(),
    };
    const result = engine.gift(event);
    broadcast();
    res.status(result.status === "queue_full" ? 429 : 200).json({
      ...result,
      eventId: event.eventId,
      ...(result.status === "queue_full" ? { retryAfterMs: 2000 } : {}),
    });
  });
  app.post("/mock/spam-amen", (req, res) => {
    const input = z
      .object({ count: z.number().int().min(1).max(100) })
      .safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ error: "count_must_be_1_to_100" });
      return;
    }
    const batch = randomUUID(),
      now = Date.now();
    let joined = 0;
    for (let i = 0; i < input.data.count; i++) {
      const result = engine.comment({
        type: "comment",
        eventId: `${batch}-${i}`,
        userId: `mock-${batch}-${i}`,
        username: `Guest ${engine.attendees.size + 1}`,
        text: "AMEN",
        timestamp: now,
      });
      if (result.status === "joined") joined++;
    }
    broadcast();
    res.json({
      status: "completed",
      requested: input.data.count,
      joined,
      capacity: 100,
    });
  });
  app.post("/mock/full-seat", (_req, res) => {
    const result = fillGiftedSeats(engine);
    broadcast();
    res.json(result);
  });
  app.post("/mock/control", (req, res) => {
    const input = controlSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ error: "invalid_control" });
      return;
    }
    engine.control(
      input.data.action,
      "enabled" in input.data ? input.data.enabled : undefined,
    );
    broadcast();
    res.json({ ok: true });
  });
  // Same-origin production serving; npm run build must have run first.
  const clientDir = path.resolve(
    process.cwd(),
    process.cwd().endsWith(`${path.sep}apps${path.sep}server`)
      ? "../client/dist"
      : "apps/client/dist",
  );
  app.use(express.static(clientDir));
  app.get(["/", "/control"], (_req, res) =>
    res.sendFile(path.join(clientDir, "index.html")),
  );
  app.use((_req, res) => res.status(404).json({ error: "not_found" }));
  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(error instanceof SyntaxError ? 400 : 500).json({
        error: error instanceof SyntaxError ? "invalid_json" : "request_failed",
      });
    },
  );
  const timer = setInterval(broadcast, 100);
  return {
    app,
    server,
    engine,
    close: async () => {
      clearInterval(timer);
      for (const ws of wss.clients) ws.terminate();
      await new Promise<void>((resolve) => wss.close(() => resolve()));
      if (server.listening)
        await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
