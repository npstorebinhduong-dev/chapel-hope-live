import test from "node:test";
import assert from "node:assert/strict";
import { ChapelEngine } from "../packages/shared/src/engine.ts";
import {
  CommunityEngine,
  EngagementPromptScheduler,
  defaultEngagement,
  type EngagementEvent,
} from "../packages/shared/src/engagement.ts";
import {
  defaultProduction,
  productionSchema,
} from "../packages/shared/src/production.ts";
import { TikFinityEventAdapter } from "../apps/server/src/tikfinity.ts";
import { GIFTS, giftKeys } from "../packages/shared/src/index.ts";
import { MusicDirector } from "../apps/client/src/audio/MusicDirector.ts";
import {
  gratitude,
  invitations,
  acknowledgements,
} from "../apps/client/src/voice/engagementLines.ts";
import { VoiceQueue, type VoiceJob } from "../apps/client/src/voice/queue.ts";
const social = (
  id: string,
  type: EngagementEvent["type"],
  count = 1,
  now = 1000,
): EngagementEvent => ({
  eventId: id,
  userId: "test",
  username: "Sofia",
  type,
  count,
  timestamp: now,
  source: "mock",
});
test("1000 hearts, 50 shares, 100 AMEN, 30 gifts: bounded coalescing and gift-only entry", () => {
  const e = new ChapelEngine();
  let now = Date.now();
  for (let i = 0; i < 100; i++)
    e.comment({
      type: "comment",
      source: "mock",
      eventId: `a${i}`,
      userId: `u${i}`,
      username: `Guest ${i}`,
      text: "AMEN",
      timestamp: now,
    });
  for (let i = 0; i < 1000; i++) e.engage(social(`h${i}`, "like", 1, now));
  for (let i = 0; i < 50; i++) e.engage(social(`s${i}`, "share", 1, now));
  assert.equal(e.snapshot(now).insideCount, 0);
  assert.equal(e.community.hearts, 1000);
  assert.equal(e.community.heartMilestones, 1);
  assert.equal(e.community.shareMilestones, 5);
  assert.ok(e.community.snapshot(now).pendingEffects <= 2);
  for (let i = 0; i < 30; i++)
    e.gift(
      {
        type: "gift",
        source: "mock",
        eventId: `g${i}`,
        userId: `u${i % 5}`,
        username: `Guest ${i % 5}`,
        giftKey: giftKeys[i % 6],
        coinValue: GIFTS[giftKeys[i % 6]].coins,
        repeatCount: 1,
        timestamp: now,
      },
      now,
    );
  let guard = 0;
  while (e.active || e.queue.length) {
    assert.ok(guard++ < 100);
    now = e.active?.returnEndsAt ?? now + 100;
    e.tick(now);
  }
  const s = e.snapshot(now);
  assert.equal(s.waitingCount, 95);
  assert.equal(s.insideCount, 5);
  assert.equal(s.completed, 30);
  assert.equal(s.rejected, 0);
  assert.equal(s.community?.hearts, 1000);
  assert.equal(s.community?.shares, 50);
});
test("heart cooldown, share flock, free NPC moment never grant a seat or interrupt gifts", () => {
  const e = new ChapelEngine();
  let now = Date.now();
  e.engage(social("h", "like", 1000, now));
  e.tick(now);
  assert.equal(e.community.snapshot(now).reaction?.kind, "heart");
  assert.equal(e.snapshot(now).totalAttendees, 0);
  e.engage(social("h2", "like", 1000, now + 1));
  e.tick(now + 8000);
  assert.equal(e.community.reaction, null);
  e.tick(now + 20000);
  assert.equal(e.community.snapshot(now).reaction?.kind, "heart");
  e.community = new CommunityEngine();
  e.engage(social("s", "share", 1, now));
  e.tick(now);
  assert.equal(e.community.snapshot(now).reaction?.kind, "share");
  for (let i = 0; i < 9; i++) e.engage(social(`f${i}`, "share", 1, now + 1));
  e.tick(now + 6000);
  assert.equal(e.community.snapshot(now).reaction?.kind, "flock");
  e.community.settings.communityEnabled = true;
  e.community.record("amen", now + 301000);
  e.community.tick(now + 301000, true, true);
  assert.notEqual(e.community.snapshot(now).reaction?.kind, "community");
  e.community.tick(now + 302000, false, true);
  assert.equal(e.community.snapshot(now).reaction?.kind, "community");
  assert.equal(e.snapshot(now + 302000).insideCount, 0);
});
test("prompt scheduler respects readiness, 90-second gap, inactivity, gift blocking and 3/10min", () => {
  const p = new EngagementPromptScheduler(),
    s = defaultEngagement();
  const base = { lastActivity: 0, lastShare: 0, blocked: false, ready: true };
  assert.equal(p.next(59000, s, base), null);
  assert.equal(p.next(60000, s, { ...base, ready: false }), null);
  assert.equal(p.next(60000, s, base), "amen");
  assert.equal(p.next(149999, s, base, true), null);
  assert.equal(p.next(150000, s, { ...base, blocked: true }), null);
  assert.equal(p.next(150000, s, base), "like");
  assert.equal(p.next(240000, s, base), "share");
  assert.equal(p.next(400000, s, base, true), null);
  assert.equal(p.next(660001, s, { ...base, ready: false }), null);
  assert.equal(p.next(660001, { ...s, quiet: true }, base), null);
  assert.ok(p.next(660001, s, base));
});
test("TikFinity like batch/cumulative/reset/replay, unknown counts and share flood remain honest", () => {
  const e = new ChapelEngine(),
    a = new TikFinityEventAdapter((v) =>
      v.type === "gift"
        ? e.gift(v)
        : v.type === "comment"
          ? e.comment(v)
          : e.engage(v),
    );
  a.configure({
    mode: "tikfinity",
    endpoint: "ws://127.0.0.1:21213/",
    mapping: {},
  });
  const send = (event: string, data: object, now = 1000) =>
    a.ingest(JSON.stringify({ event, data }), now);
  send("like", { userId: "x", likeCount: 25, msgId: "a" });
  send("like", { userId: "x", likeCount: 25, msgId: "a" });
  assert.equal(e.community.hearts, 25);
  send("like", { totalLikeCount: 500 });
  send("like", { totalLikeCount: 1000, msgId: "b" });
  send("like", { totalLikeCount: 1000, msgId: "b" });
  assert.equal(e.community.hearts, 525);
  send("like", { totalLikeCount: 0, msgId: "reset" });
  send("like", { totalLikeCount: 1000, msgId: "c" });
  assert.equal(e.community.hearts, 1525);
  send("like", { userId: "x" });
  send("like", { likeCount: -1, msgId: "bad" });
  send("like", { likeCount: 3.5, msgId: "bad2" });
  assert.equal(e.community.hearts, 1525);
  send("share", { userId: "x" });
  send("share", { userId: "x" }, 1100);
  send("share", { userId: "x" }, 11100);
  send("share", {});
  assert.equal(e.community.shares, 2);
  send("follow", { userId: "x", msgId: "follow" });
  send("follow", { userId: "x", msgId: "follow" });
  assert.equal(e.community.follows, 1);
  assert.equal(e.snapshot(11100).insideCount, 0);
  assert.ok(a.status.unverifiedLikes >= 3);
  assert.ok(a.status.likeReceived && a.status.shareReceived);
  assert.ok(!JSON.stringify(a.status).includes('"userId"'));
  a.clearSession();
  assert.equal(a.status.likeReceived, false);
  a.configure({ mode: "mock", endpoint: a.status.endpoint, mapping: {} });
  send("like", { likeCount: 100, msgId: "ignored" });
  assert.equal(e.community.hearts, 1525);
});
test("detailed memory/render caps retain compact identity, gender, count, gift eligibility and TTL", () => {
  const e = new ChapelEngine();
  e.community.settings = {
    ...defaultEngagement(),
    memoryLimit: 1000,
    renderLimit: 100,
  };
  const now = Date.now();
  for (let i = 0; i < 1200; i++)
    e.comment({
      type: "comment",
      source: "mock",
      eventId: `a${i}`,
      userId: `u${i}`,
      username: "Guest",
      text: "AMEN",
      timestamp: now,
    });
  let s = e.snapshot(now + 100);
  assert.equal(s.totalAttendees, 1200);
  assert.equal(s.waitingCount, 1200);
  assert.equal(s.compactWaiting, 200);
  assert.equal(s.attendees.length, 100);
  assert.equal(s.hiddenWaiting, 1100);
  assert.equal(Object.keys(s.avatarVariantByUser!).length, 100);
  e.comment({
    type: "comment",
    source: "mock",
    eventId: "gender",
    userId: "u1199",
    username: "Guest",
    text: "2",
    timestamp: now + 100,
  });
  e.comment({
    type: "comment",
    source: "mock",
    eventId: "repeat",
    userId: "u1199",
    username: "Guest",
    text: "AMEN",
    timestamp: now + 100,
  });
  assert.equal(e.snapshot(now + 100).totalAttendees, 1200);
  e.gift({
    type: "gift",
    source: "mock",
    eventId: "gift",
    userId: "u1199",
    username: "Guest",
    giftKey: "candle_1",
    coinValue: 1,
    repeatCount: 1,
    timestamp: now + 100,
  });
  assert.equal(e.attendees.get("u1199")?.gender, "female");
  e.tick(e.active!.returnEndsAt!);
  s = e.snapshot(e.active?.returnEndsAt ?? now + 90000);
  assert.equal(s.insideCount, 1);
  assert.equal(s.waitingCount, 1199);
  assert.equal(s.totalAttendees, 1200);
  e.tick(now + 700000);
  e.tick(now + 702000);
  assert.equal(e.snapshot(now + 702000).waitingCount, 0);
  e.control("reset");
  assert.equal(e.snapshot(now + 702000).totalAttendees, 0);
});
test("three original music scores change only at a bar boundary and playlist cycles", () => {
  const m = new MusicDirector();
  const first = m.sample(0);
  assert.equal(first.track, "peace");
  assert.notEqual(first.melody, m.sample(1.5).melody);
  m.requested = "evening";
  assert.equal(m.sample(5.9).track, "peace");
  assert.equal(m.sample(6).track, "evening");
  m.requested = "playlist";
  assert.equal(m.sample(48).track, "hope");
  assert.equal(m.sample(96).track, "evening");
  assert.equal(m.sample(144).track, "peace");
  assert.notDeepEqual(m.sample(0).frequencies, m.sample(6).frequencies);
});
test("EN/VI/IT gratitude and invitations are distinct and old operator config migrates", () => {
  for (const lang of ["en", "vi", "it"] as const) {
    for (const k of giftKeys) assert.equal(new Set(gratitude[lang][k]).size, 2);
    for (const k of ["amen", "like", "share"] as const)
      assert.ok(new Set(invitations[lang][k]).size >= 4);
    for (const k of ["amen", "like", "share", "follow"] as const)
      assert.ok(acknowledgements[lang][k].length >= 2);
  }
  const old: any = defaultProduction();
  delete old.guide;
  delete old.engagement;
  delete old.musicTrack;
  assert.equal(productionSchema.parse(old).musicTrack, "playlist");
});
test("gift preempts invitation without overlapping providers; late completion cannot reset gift", async () => {
  let resolveOld: (v: any) => void = () => {};
  let cancelled = 0;
  const ducks: boolean[] = [];
  const q = new VoiceQueue(
    () => {},
    (v) => ducks.push(v),
    () => {},
  );
  const base: VoiceJob = {
    id: "cta",
    text: "Invitation",
    name: "",
    locale: "en",
    voiceURI: "",
    rate: 1,
    volume: 1,
    clipKey: "invite-amen-0",
    created: Date.now(),
    expires: Date.now() + 10000,
    priority: -2,
    enabled: true,
    provider: {
      available: () => true,
      cancel: () => {
        cancelled++;
        resolveOld("ended");
      },
      play: (_j, on) => {
        on();
        return new Promise((r) => {
          resolveOld = r;
        });
      },
    },
  };
  q.enqueue(base);
  q.enqueue({ ...base, id: "gift", priority: 3 });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(cancelled, 1);
  assert.equal(q.active?.id, "gift");
  assert.ok(!ducks.includes(false));
  q.stop();
  assert.equal(ducks.at(-1), false);
});
test("audio operator commands are validated, ephemeral, and contain no viewer identity", async () => {
  const { createChapelServer } = await import("../apps/server/src/app.ts");
  const r = createChapelServer();
  await new Promise<void>((resolve) =>
    r.server.listen(0, "127.0.0.1", resolve),
  );
  const base = `http://127.0.0.1:${(r.server.address() as any).port}`;
  try {
    const send = (body: unknown) =>
      fetch(base + "/api/audio/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    assert.equal((await send({ action: "sample", locale: "xx" })).status, 400);
    assert.equal(
      (await send({ action: "sample", locale: "vi", userId: "must-not-save" }))
        .status,
      200,
    );
    const state = await (await fetch(base + "/api/state")).json();
    assert.equal(state.audioCommand.locale, "vi");
    assert.equal(state.audioCommand.action, "sample");
    assert.ok(!JSON.stringify(state.audioCommand).includes("must-not-save"));
    assert.ok(Date.now() - state.audioCommand.at < 2000);
  } finally {
    await r.close();
  }
});
