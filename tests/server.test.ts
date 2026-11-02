import { test } from "node:test";
import assert from "node:assert/strict";
import { WebSocket } from "ws";
import { createChapelServer } from "../apps/server/src/app.ts";
import { giftKeys, GIFTS } from "../packages/shared/src/index.ts";

test("HTTP validation, normalized gifts, bounded bursts and WebSocket multi-tab snapshots", async () => {
  const runtime = createChapelServer();
  await new Promise<void>((resolve) =>
    runtime.server.listen(0, "127.0.0.1", resolve),
  );
  const address = runtime.server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;
  const a = new WebSocket(base.replace("http", "ws") + "/ws"),
    b = new WebSocket(base.replace("http", "ws") + "/ws");
  const messages: unknown[] = [];
  b.on("message", (raw) => messages.push(JSON.parse(raw.toString())));
  try {
    await Promise.all(
      [a, b].map(
        (ws) =>
          new Promise<void>((resolve, reject) => {
            ws.once("open", resolve);
            ws.once("error", reject);
          }),
      ),
    );
    const post = (url: string, data: unknown, headers = {}) =>
      fetch(base + url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(data),
      });
    assert.equal((await (await fetch(base + "/health")).json()).mode, "mock");
    assert.equal(
      (
        await post("/mock/comment", {
          userId: "u",
          username: "Guest",
          text: "Amen!",
          eventId: "same",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await (
          await post("/mock/comment", {
            userId: "u",
            username: "Guest",
            text: "AMEN",
            eventId: "same",
          })
        ).json()
      ).status,
      "duplicate",
    );
    assert.equal(
      (
        await post("/mock/gift", {
          userId: "u",
          username: "Guest",
          coinValue: 5,
        })
      ).status,
      400,
    );
    for (const giftKey of giftKeys) {
      const response = await post("/api/mock/gift", {
        userId: "u",
        username: "Guest",
        giftKey,
        coinValue: 999999,
      });
      assert.equal(response.status, 200);
    }
    assert.equal(runtime.engine.active!.event.coinValue, GIFTS.candle_1.coins);
    assert.deepEqual(
      runtime.engine.queue.map((e) => e.giftKey),
      giftKeys.slice(1),
    );
    assert.equal((await post("/mock/spam-amen", { count: 101 })).status, 400);
    assert.equal((await post("/mock/spam-amen", { count: 50 })).status, 200);
    assert.equal(
      (await post("/mock/control", { action: "npcs", enabled: false })).status,
      200,
    );
    assert.equal(
      (
        await post(
          "/mock/control",
          { action: "muted", enabled: false },
          { origin: "https://untrusted.example" },
        )
      ).status,
      403,
    );
    const invalidJson = await fetch(base + "/mock/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal(invalidJson.status, 400);
    await new Promise((resolve) => setTimeout(resolve, 150));
    const last = messages.at(-1) as {
      type: string;
      snapshot: { attendees: unknown[]; settings: { npcs: boolean } };
    };
    assert.equal(last.type, "snapshot");
    assert.equal(last.snapshot.attendees.length, 51);
    assert.equal(last.snapshot.settings.npcs, false);
    // A new tab receives current state, not a replay that can duplicate visitors.
    const reconnect = new WebSocket(base.replace("http", "ws") + "/ws");
    const restored = await new Promise<{ snapshot: { attendees: unknown[] } }>(
      (resolve, reject) => {
        reconnect.once("message", (raw) => resolve(JSON.parse(raw.toString())));
        reconnect.once("error", reject);
      },
    );
    assert.equal(restored.snapshot.attendees.length, 51);
    reconnect.close();
    await post("/mock/control", { action: "reset" });
    assert.equal(runtime.engine.attendees.size, 0);
    assert.equal(runtime.engine.active, null);
  } finally {
    a.terminate();
    b.terminate();
    await runtime.close();
  }
});
