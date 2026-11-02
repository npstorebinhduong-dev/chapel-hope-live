import { engagementEventSchema } from "../../../packages/shared/src/engagement.ts";
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
import {
  fillGiftedSeats,
  fillAcceptance,
} from "../../../packages/shared/src/fixtures.ts";

import { TikFinityEventAdapter } from "./tikfinity.ts";
import { operatorConfig } from "./operatorConfig.ts";
import {
  productionSchema,
  sourceConfigSchema,
} from "../../../packages/shared/src/production.ts";
export function createChapelServer(
  options: {
    configFile?: string;
    retryBase?: number;
    shutdownToken?: string;
    onShutdown?: () => void;
  } = {},
) {
  const engine = new ChapelEngine();
  const config = operatorConfig(options.configFile);
  let production = config.production;
  engine.community.setSettings(production.engagement);
  const adapter = new TikFinityEventAdapter(
    (e) =>
      e.type === "comment"
        ? engine.comment(e)
        : e.type === "gift"
          ? engine.gift(e)
          : engine.engage(e),
    () => {},
    options.retryBase,
  );
  adapter.configure(config.source);
  let audioCommand: import("@chapel/shared").AudioCommand | null = null;
  const snapshot = () => ({
    audioCommand,
    ...engine.snapshot(),
    production,
    source: adapter.status,
  });
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
  const metrics = new Map<
    WebSocket,
    {
      fps: number;
      renderer: string;
      at: number;
      canvas: boolean;
      ratio: number;
      audio: boolean;
      voice: boolean;
      voiceStatus: string;
      audioLevels: Record<string, number>;
    }
  >();
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
      // Snapshots supersede one another. Skip a stale update while a previous
      // frame is in flight instead of queuing megabytes or disconnecting crowds.
      if (ws.bufferedAmount > 0) return;
      ws.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  };
  const broadcast = () => {
    const reports = [...metrics.values()].filter(
      (m) => m.canvas && Date.now() - m.at < 5000,
    );
    engine.engagementReady =
      reports.some((m) => m.audio) &&
      (adapter.status.mode === "mock" ||
        adapter.status.connection === "connected");
    engine.speechBusy = reports.some((m) => m.voiceStatus === "speaking");
    const message = {
      type: "snapshot",
      snapshot: snapshot(),
      metrics: [...metrics.values()],
    };
    const encoded = JSON.stringify(message);
    for (const ws of wss.clients) send(ws, encoded);
  };
  wss.on("connection", (ws) => {
    send(ws, {
      type: "snapshot",
      snapshot: snapshot(),
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
            at: Date.now(),
            canvas: data.canvas === true,
            ratio: Number.isFinite(data.ratio) ? data.ratio : 0,
            audio: data.audio === true,
            voice: data.voice === true,
            voiceStatus: String(data.voiceStatus ?? "unknown").slice(0, 32),
            audioLevels: Object.fromEntries(
              ["master", "music", "ambient", "sfx"].map((k) => [
                k,
                Number.isFinite(data.audioLevels?.[k])
                  ? Math.min(1, Math.max(0, data.audioLevels[k]))
                  : 0,
              ]),
            ),
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
      mode: adapter.status.mode,
      product: "chapel-hope-live",
      version: "1.9.0",
      source: adapter.status.connection,
      viewers: engine.snapshot().totalAttendees,
      queue: engine.queue.length,
    }),
  );
  app.get("/state", (_req, res) => res.json(snapshot()));
  app.use("/mock", (req, res, next) => {
    if (adapter.status.mode !== "mock" && req.path !== "/control") {
      res
        .status(409)
        .json({ error: "Switch to Mock before sending test events" });
      return;
    }
    next();
  });
  app.post("/launcher/stop", (req, res) => {
    if (
      !options.shutdownToken ||
      req.get("X-Chapel-Launcher") !== options.shutdownToken
    ) {
      res.status(403).json({ error: "not_launcher_owner" });
      return;
    }
    res.json({ ok: true });
    setTimeout(() => options.onShutdown?.(), 100);
  });
  app.post("/production", (req, res) => {
    const parsed = productionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_production_settings" });
      return;
    }
    config.save(parsed.data, adapter.status);
    production = parsed.data;
    engine.community.setSettings(production.engagement);
    broadcast();
    res.json({ ok: true });
  });
  app.post("/source", (req, res) => {
    const parsed = sourceConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_source_loopback_or_mapping" });
      return;
    }
    if (
      parsed.data.mode !== adapter.status.mode &&
      (engine.attendees.size ||
        engine.community.hearts ||
        engine.community.shares ||
        engine.community.follows) &&
      req.body.reset !== true
    ) {
      res.status(409).json({ error: "Confirm reset before changing source" });
      return;
    }
    config.save(production, parsed.data);
    if (parsed.data.mode !== adapter.status.mode) {
      engine.control("reset");
      adapter.clearSession();
    }
    adapter.configure(parsed.data);
    broadcast();
    res.json({ ok: true });
  });
  app.post("/source/connect", (_req, res) => {
    adapter.connect();
    broadcast();
    res.json({ ok: true });
  });
  app.post("/source/disconnect", (_req, res) => {
    adapter.disconnect();
    broadcast();
    res.json({ ok: true });
  });
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
      source: "mock" as const,
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
      source: "mock" as const,
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
  app.post("/mock/engagement", (req, res) => {
    const parsed = engagementEventSchema.safeParse({
      ...req.body,
      eventId: req.body.eventId ?? randomUUID(),
      timestamp: Date.now(),
      source: "mock",
    });
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_engagement" });
      return;
    }
    const result = engine.engage(parsed.data);
    broadcast();
    res.json(result);
  });
  app.post("/mock/inactivity", (req, res) => {
    const seconds = Number(req.body.seconds);
    if (![60, 120].includes(seconds)) {
      res.status(400).json({ error: "invalid_inactivity" });
      return;
    }
    engine.community.lastActivity = Date.now() - seconds * 1000;
    engine.community.lastShare = Math.min(
      engine.community.lastShare,
      engine.community.lastActivity,
    );
    broadcast();
    res.json({ status: "accepted" });
  });
  app.post("/audio/command", (req, res) => {
    const parsed = z
      .object({
        action: z.enum([
          "stopVoice",
          "resumeVoice",
          "testAll",
          "stopAll",
          "sample",
        ]),
        locale: z.enum(["en", "vi", "it"]).optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_audio_command" });
      return;
    }
    audioCommand = { ...parsed.data, id: randomUUID(), at: Date.now() };
    broadcast();
    res.json({ status: "accepted" });
  });
  app.post("/engagement/invite", (_req, res) => {
    engine.community.tick(
      Date.now(),
      !!engine.active || engine.queue.length > 0,
      engine.engagementReady && !engine.settings.muted,
      engine.speechBusy,
      true,
    );
    broadcast();
    res.json({ status: "accepted" });
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
        source: "mock",
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
      capacity: null, // no fixed AMEN crowd cap; session TTL still applies
    });
  });
  app.post("/mock/acceptance", (_req, res) => {
    fillAcceptance(engine);
    broadcast();
    res.json({ status: "accepted" });
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
    if (input.data.action === "reset") adapter.clearSession();
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
    adapter,
    close: async () => {
      clearInterval(timer);
      adapter.disconnect();
      for (const ws of wss.clients) ws.terminate();
      await new Promise<void>((resolve) => wss.close(() => resolve()));
      if (server.listening)
        await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
