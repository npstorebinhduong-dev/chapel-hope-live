import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { WebSocketServer } from "ws";
import { ChapelEngine } from "../packages/shared/src/engine.ts";
import { giftKeys, GIFTS } from "../packages/shared/src/index.ts";
import {
  defaultProduction,
  sourceConfigSchema,
  safeDisplayName,
  spokenName,
} from "../packages/shared/src/production.ts";
import { TikFinityEventAdapter } from "../apps/server/src/tikfinity.ts";
import { createChapelServer } from "../apps/server/src/app.ts";
import {
  giftVoiceLines,
  LineRotation,
} from "../apps/client/src/voice/lines.ts";
import {
  matchingVoices,
  type VoiceProvider,
  type VoiceResult,
} from "../apps/client/src/voice/providers.ts";
import { VoiceQueue, type VoiceJob } from "../apps/client/src/voice/queue.ts";
const mapping = Object.fromEntries(
  giftKeys.map((k, i) => [String(101 + i), k]),
);
const fixtures = JSON.parse(
  fs.readFileSync("tests/fixtures/tikfinity.json", "utf8"),
);
const until = async (check: () => boolean) => {
  const deadline = Date.now() + 3000;
  while (!check()) {
    if (Date.now() > deadline) throw Error("Timed out");
    await new Promise((r) => setTimeout(r, 20));
  }
};
test("TikFinity replay: chat/gender, six IDs, two five-coin gifts, streak final and dedupe, unknown and malformed", () => {
  const engine = new ChapelEngine(),
    events: any[] = [];
  const adapter = new TikFinityEventAdapter((e) => {
    events.push(e);
    return e.type === "gift" ? engine.gift(e, 1000) : engine.comment(e, 1000);
  });
  adapter.configure({
    mode: "tikfinity",
    endpoint: "ws://127.0.0.1:21213/",
    mapping,
  });
  for (const f of fixtures) adapter.ingest(JSON.stringify(f), 1000);
  adapter.ingest("{", 1000);
  adapter.ingest("null", 1000);
  const gifts = events.filter((e) => e.type === "gift");
  assert.deepEqual(
    gifts.map((e) => e.giftKey),
    giftKeys,
  );
  assert.equal(gifts[0].repeatCount, 3);
  assert.equal(adapter.status.duplicates, 1);
  assert.equal(adapter.status.unknown[0].giftId, "999");
  assert.equal(engine.attendees.size, 2);
  assert.equal([...engine.attendees.values()][0].gender, "female");
  assert.ok(!JSON.stringify(adapter.status).includes("viewer-a"));
  assert.ok(events.every((e) => e.source === "tikfinity"));
  adapter.configure({
    mode: "mock",
    endpoint: adapter.status.endpoint,
    mapping,
  });
  adapter.ingest(JSON.stringify(fixtures[0]));
  assert.equal(events.filter((e) => e.type === "gift").length, 6);
});
test("TikFinity loopback restriction rejects remote URLs and credentials", () => {
  for (const endpoint of [
    "ws://example.com:21213",
    "wss://127.0.0.1:21213",
    "ws://user:pass@localhost:21213",
    "ws://127.0.0.1:21213/?token=x",
  ])
    assert.equal(
      sourceConfigSchema.safeParse({ mode: "tikfinity", endpoint, mapping })
        .success,
      false,
    );
  assert.equal(
    sourceConfigSchema.safeParse({
      mode: "tikfinity",
      endpoint: "ws://localhost:21213/",
      mapping,
    }).success,
    true,
  );
});
test("TikFinity actual local WebSocket reconnect, clean disconnect and no duplicate listener", async () => {
  const wss = new WebSocketServer({ port: 0, host: "127.0.0.1" });
  await new Promise<void>((r) => wss.once("listening", r));
  let count = 0,
    opens = 0;
  wss.on("connection", (ws) => {
    opens++;
    ws.send(JSON.stringify(fixtures[0]));
  });
  const adapter = new TikFinityEventAdapter(
    () => {
      count++;
      return { status: "joined" };
    },
    () => {},
    20,
  );
  try {
    adapter.configure({
      mode: "tikfinity",
      endpoint: `ws://127.0.0.1:${(wss.address() as any).port}`,
      mapping,
    });
    adapter.connect();
    await until(() => count === 1);
    for (const ws of wss.clients) ws.terminate();
    await until(() => opens === 2 && count === 2);
    assert.equal(adapter.status.connection, "connected");
    assert.equal(adapter.status.disconnects, 1);
    adapter.disconnect();
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(opens, 2);
    assert.equal(adapter.status.connection, "disconnected");
  } finally {
    adapter.disconnect();
    for (const ws of wss.clients) ws.terminate();
    await new Promise<void>((r) => wss.close(() => r()));
  }
});
test("30 gifts complete without duplicates or dropped events; repeat cap and identity are explicit", () => {
  const engine = new ChapelEngine();
  let now = 1000;
  const adapter = new TikFinityEventAdapter((e) =>
    e.type === "gift" ? engine.gift(e, now) : engine.comment(e, now),
  );
  adapter.configure({
    mode: "tikfinity",
    endpoint: "ws://localhost:21213/",
    mapping,
  });
  for (let i = 0; i < 30; i++)
    adapter.ingest(
      JSON.stringify({
        event: "gift",
        data: {
          userId: "donor",
          giftId: 101 + (i % 6),
          msgId: "tx-" + i,
          repeatCount: i === 0 ? 200 : 1,
        },
      }),
      now,
    );
  assert.equal(engine.accepted, 30);
  assert.ok(engine.active);
  assert.match(adapter.status.lastEvent, /accepted|queued/);
  while (engine.active || engine.queue.length) {
    now = engine.active!.returnEndsAt! + 1;
    engine.tick(now);
  }
  assert.equal(engine.completed, 30);
  assert.equal(engine.attendees.size, 1);
  assert.equal(engine.rejected, 0);
  assert.equal(engine.candles, 24);
});
test("36 exact-language wishes, independent gift rotation and matching voice language only", () => {
  for (const locale of ["en", "vi", "it"] as const) {
    assert.equal(
      new Set(Object.values(giftVoiceLines[locale]).flat()).size,
      12,
    );
    const rotation = new LineRotation();
    for (const key of giftKeys) {
      const first = rotation.next(locale, key);
      const second = rotation.next(locale, key);
      assert.notEqual(first.text, second.text);
      assert.equal(rotation.next(locale, key).text, first.text);
    }
  }
  assert.equal(
    giftVoiceLines.en.candle_1[0],
    "May a gentle light bring you peace.",
  );
  assert.equal(
    giftVoiceLines.vi.altar_100[0],
    "Cầu chúc bạn và gia đình luôn bình an.",
  );
  assert.equal(
    giftVoiceLines.it.ceremony_500[0],
    "Che la pace e la speranza ci uniscano tutti.",
  );
  const list = [
    { lang: "en-US" },
    { lang: "vi-VN" },
    { lang: "it-IT" },
  ] as SpeechSynthesisVoice[];
  assert.deepEqual(matchingVoices(list, "vi"), [list[1]]);
  assert.equal(matchingVoices([list[0]], "it").length, 0);
  assert.equal(spokenName("https://example.com"), "Guest");
  assert.equal(spokenName("bad123$$"), "");
  assert.equal(safeDisplayName("<A>\u202e"), "A");
});
test("voice queue serializes, coalesces overload, restores ducking and never substitutes missing voices", async () => {
  const started: string[] = [],
    banners: string[] = [],
    ducks: boolean[] = [],
    results: VoiceResult[] = [];
  let finish: (r: VoiceResult) => void = () => {};
  const provider: VoiceProvider = {
    available: () => true,
    cancel: () => finish("error"),
    play: (r, start) => {
      started.push(r.text);
      start();
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
  };
  const queue = new VoiceQueue(
    (j) => banners.push(j.id),
    (v) => ducks.push(v),
    (s) => results.push(s),
  );
  const job = (id: string, priority = 0): VoiceJob => ({
    id,
    text: id,
    name: "Guest",
    locale: "en",
    voiceURI: "",
    rate: 1,
    volume: 1,
    clipKey: "candle_1-0",
    created: Date.now(),
    expires: Date.now() + 10000,
    priority,
    enabled: true,
    provider,
  });
  queue.enqueue(job("a"));
  queue.enqueue(job("b"));
  queue.enqueue(job("c"));
  queue.enqueue(job("big", 3));
  assert.equal(started.length, 1);
  assert.equal(queue.skipped, 1);
  assert.ok(
    !banners.includes("c"),
    "overload must not overwrite text of an active utterance",
  );
  finish("ended");
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(started, ["a", "big"]);
  assert.deepEqual(ducks.slice(0, 3), [true, false, true]);
  queue.stop();
  assert.equal(ducks.at(-1), false);
  assert.equal(queue.pending.length, 0);
  queue.enqueue({
    ...job("missing"),
    provider: { ...provider, available: () => false },
  });
  assert.equal(results.at(-1), "missing");
  assert.equal(started.length, 2);
});
test("production server source isolation, persisted operator settings, mapping validation and scoped shutdown", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "chapel-operator-"));
  const configFile = path.join(dir, "settings.json");
  let stopped = false;
  const runtime = createChapelServer({
    configFile,
    shutdownToken: "test-owner",
    onShutdown: () => {
      stopped = true;
    },
  });
  await new Promise<void>((r) => runtime.server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(runtime.server.address() as any).port}`;
  const post = (url: string, body: unknown, headers = {}) =>
    fetch(base + url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  try {
    assert.equal(
      (await post("/production", { ...defaultProduction(), locale: "vi" }))
        .status,
      200,
    );
    assert.equal(
      (
        await post("/source", {
          mode: "tikfinity",
          endpoint: "ws://localhost:21213/",
          mapping,
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await post("/mock/gift", {
          userId: "a",
          username: "a",
          giftKey: "candle_1",
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await post("/source", {
          mode: "tikfinity",
          endpoint: "ws://remote.example/",
          mapping,
        })
      ).status,
      400,
    );
    const stored = JSON.parse(fs.readFileSync(configFile, "utf8"));
    assert.equal(stored.production.locale, "vi");
    assert.equal(stored.source.mode, "mock");
    assert.ok(!("attendees" in stored));
    assert.equal((await post("/launcher/stop", {})).status, 403);
    assert.equal(
      (await post("/launcher/stop", {}, { "X-Chapel-Launcher": "test-owner" }))
        .status,
      200,
    );
    await until(() => stopped);
  } finally {
    await runtime.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("mapping update retains a connected socket and observed gift metadata", async () => {
  const wss = new WebSocketServer({ port: 0, host: "127.0.0.1" });
  await new Promise<void>((r) => wss.once("listening", r));
  let opens = 0;
  wss.on("connection", () => opens++);
  const adapter = new TikFinityEventAdapter(
    () => ({ status: "accepted" }),
    () => {},
    20,
  );
  try {
    const endpoint = `ws://127.0.0.1:${(wss.address() as any).port}`;
    adapter.configure({ mode: "tikfinity", endpoint, mapping: {} });
    adapter.connect();
    await until(() => adapter.status.connection === "connected");
    adapter.ingest(JSON.stringify(fixtures[6]));
    assert.equal(adapter.status.unknown.length, 1);
    adapter.configure({ mode: "tikfinity", endpoint, mapping });
    assert.equal(adapter.status.connection, "connected");
    assert.equal(opens, 1);
    assert.equal(adapter.status.unknown.length, 0);
    assert.equal(adapter.status.observed[0].giftId, "102");
  } finally {
    adapter.disconnect();
    for (const ws of wss.clients) ws.terminate();
    await new Promise<void>((r) => wss.close(() => r()));
  }
});
