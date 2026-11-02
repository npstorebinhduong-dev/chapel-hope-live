import { test } from "node:test";
import assert from "node:assert/strict";
import { ChapelEngine } from "../packages/shared/src/engine.ts";
import {
  GIFTS,
  giftKeys,
  giftSchema,
  isAmen,
  LIMITS,
  attendeePose,
  arrivalPath,
  seatPosition,
  type GiftEvent,
  type GiftKey,
} from "../packages/shared/src/index.ts";
const now = 1_000_000;
let serial = 0;
const gift = (giftKey: GiftKey, userId = "donor"): GiftEvent => ({
  type: "gift",
  eventId: `gift-${++serial}`,
  userId,
  username: "Donor",
  giftKey,
  coinValue: GIFTS[giftKey].coins,
  repeatCount: 1,
  timestamp: now,
});
const comment = (
  userId: string,
  text = "AMEN",
  eventId = `comment-${++serial}`,
  timestamp = now,
) => ({
  type: "comment" as const,
  userId,
  username: "Guest",
  text,
  eventId,
  timestamp,
});

test("AMEN accepts case, whitespace and punctuation, rejecting unrelated text", () => {
  for (const value of ["AMEN", " amen ", "Amen!", " aMeN...?! "])
    assert.equal(isAmen(value), true, value);
  for (const value of [
    "AMEN now",
    "amenity",
    "<b>AMEN</b>",
    "",
    "xAMEN",
    "AMEN\nhello",
  ])
    assert.equal(isAmen(value), false, value);
});
test("six distinct keys, including both five-coin events, validate without price routing", () => {
  assert.equal(giftKeys.length, 6);
  assert.equal(GIFTS.prayer_5.coins, 5);
  assert.equal(GIFTS.rose_5.coins, 5);
  assert.notEqual(GIFTS.prayer_5.label, GIFTS.rose_5.label);
  for (const key of giftKeys)
    assert.equal(
      giftSchema.safeParse({ userId: "u", username: "U", giftKey: key })
        .success,
      true,
    );
  for (const input of [
    { giftKey: "5" },
    { giftKey: "rose_5", repeatCount: 21 },
    { giftKey: "bell_10", repeatCount: 0 },
  ])
    assert.equal(
      giftSchema.safeParse({ userId: "u", username: "U", ...input }).success,
      false,
    );
});
test("repeated joins and duplicate event IDs do not clone attendees; repeat AMEN renews TTL", () => {
  const engine = new ChapelEngine();
  const first = comment("u");
  engine.comment(first);
  assert.equal(engine.comment(first).status, "duplicate");
  engine.comment(comment("u", " amen! ", undefined, now + 1000));
  assert.equal(engine.attendees.size, 1);
  assert.equal(engine.attendees.get("u")!.lastSeen, now + 1000);
  assert.equal(engine.comment(comment("other", "hello")).status, "ignored");
  assert.equal(engine.attendees.size, 1);
});
test("64 seats reserve 16 NPC places, overflow is unique and total visual population bounded", () => {
  const engine = new ChapelEngine();
  for (let i = 0; i < 150; i++) engine.comment(comment(`u${i}`));
  const all = [...engine.attendees.values()];
  assert.equal(all.length, 100);
  const seated = all.filter((a) => a.seat !== null),
    overflow = all.filter((a) => a.seat === null);
  assert.equal(seated.length, 48);
  assert.equal(overflow.length, 52);
  assert.equal(new Set(seated.map((a) => a.seat)).size, 48);
  assert.equal(new Set(overflow.map((a) => a.overflow)).size, 52);
  for (const a of seated) assert.ok(a.seat! >= 16 && a.seat! < 64);
  const small = new ChapelEngine(32);
  for (let i = 0; i < 20; i++) small.comment(comment(`u${i}`));
  assert.equal(
    [...small.attendees.values()].filter((a) => a.seat !== null).length,
    16,
  );
  assert.throws(() => new ChapelEngine(25));
});
test("arrival waypoints approach pews from front and a 100-person burst keeps bodies separated", () => {
  const engine = new ChapelEngine();
  for (let i = 0; i < 100; i++) engine.comment(comment(`u${i}`));
  for (const a of engine.attendees.values())
    if (a.seat !== null) {
      const route = arrivalPath(a),
        seat = seatPosition(a.seat);
      assert.equal(route[2][2], seat[2] - 0.65);
      assert.equal(route[2][0], seat[0]);
    }
  for (let t = now; t < now + 110_000; t += 200) {
    const visible = [...engine.attendees.values()]
      .map((a) => attendeePose(a, t, null))
      .filter((a) => a.visible);
    for (let i = 0; i < visible.length; i++)
      for (let j = i + 1; j < visible.length; j++) {
        const a = visible[i].position,
          b = visible[j].position;
        assert.ok(
          Math.hypot(a[0] - b[0], a[2] - b[2]) >= 0.59,
          `overlap at ${t - now}: ${i},${j} (${a}) (${b})`,
        );
      }
  }
});
test("expired attendees leave through waypoints and release seats", () => {
  const engine = new ChapelEngine();
  engine.comment(comment("u"));
  engine.tick(now + LIMITS.ttl - 1);
  assert.equal(engine.attendees.get("u")!.leaveAt, undefined);
  engine.tick(now + LIMITS.ttl);
  assert.equal(engine.attendees.get("u")!.leaveAt, now + LIMITS.ttl);
  assert.equal(
    attendeePose(engine.attendees.get("u")!, now + LIMITS.ttl + 1000, null)
      .state,
    "leaving",
  );
  engine.tick(now + LIMITS.ttl + 60_000);
  assert.equal(engine.attendees.size, 0);
});
test("every gift works for a new viewer and while the visual congregation is full", () => {
  for (const key of giftKeys) {
    const engine = new ChapelEngine();
    for (let i = 0; i < 100; i++) engine.comment(comment(`u${i}`));
    const event = gift(key, "new-viewer");
    assert.equal(engine.gift(event).status, "accepted");
    assert.equal(engine.active!.event.giftKey, key);
    assert.equal(engine.attendees.size, 100);
    if (key === "candle_1") assert.equal(engine.candles, 1);
    if (key === "rose_5") assert.equal(engine.roses, 1);
    assert.equal(engine.snapshot(now).supporters[0].userId, "new-viewer");
  }
  const engine = new ChapelEngine();
  const event = gift("prayer_5");
  engine.gift(event);
  assert.equal(
    attendeePose(engine.attendees.get("donor")!, now, engine.active).state,
    "kneeling",
  );
});
test("gift queue rejects overflow explicitly, permits retry and deduplicates accepted events", () => {
  const engine = new ChapelEngine();
  const first = gift("bell_10");
  engine.gift(first);
  assert.equal(engine.gift(first).status, "duplicate");
  for (let i = 0; i < 128; i++)
    assert.equal(engine.gift(gift("candle_1")).status, "accepted");
  const retry = gift("rose_5");
  assert.equal(engine.gift(retry).status, "queue_full");
  assert.equal(engine.queue.length, 128);
  engine.tick(now + 10_000);
  assert.equal(engine.gift(retry, now + 10_000).status, "accepted");
  assert.equal(engine.accepted, 130);
});
test("priority has bounded fairness, FIFO ties, and active focus expires back to overview", () => {
  const engine = new ChapelEngine();
  engine.gift(gift("bell_10"));
  const low = gift("candle_1");
  engine.gift(low);
  const highs = Array.from({ length: 8 }, () => gift("ceremony_500"));
  highs.forEach((e) => engine.gift(e));
  const played: string[] = [];
  let t = now;
  while (engine.active) {
    played.push(engine.active.event.eventId);
    t += 10_000;
    engine.tick(t);
  }
  assert.equal(played[1], highs[0].eventId);
  assert.ok(played.indexOf(low.eventId) <= 4);
  assert.equal(played.length, 10);
  assert.equal(engine.completed, 10);
  assert.equal(engine.snapshot(t).active, null);
});
test("burst of 100 comments + 30 gifts completes, preserving each accepted event and bounded offerings", () => {
  const engine = new ChapelEngine();
  for (let i = 0; i < 100; i++) engine.comment(comment(`u${i}`));
  for (let i = 0; i < 30; i++)
    engine.gift({ ...gift(giftKeys[i % 6], `u${i}`), repeatCount: 20 });
  let t = now;
  for (let i = 0; i < 31; i++) {
    t += 8000;
    engine.tick(t);
  }
  assert.equal(engine.completed, 30);
  assert.equal(engine.queue.length, 0);
  assert.equal(engine.active, null);
  assert.ok(engine.candles <= 64);
  assert.ok(engine.roses <= 48);
  assert.equal(engine.snapshot(t).supporters.length, 3);
});
test("reset clears session data, queue, offerings, dedup and focus; settings broadcast separately", () => {
  const engine = new ChapelEngine();
  const event = gift("rose_5");
  engine.gift(event);
  engine.control("muted", false);
  assert.equal(engine.snapshot(now).settings.muted, false);
  engine.control("reset");
  const state = engine.snapshot(now);
  assert.equal(state.active, null);
  assert.equal(state.attendees.length, 0);
  assert.equal(state.supporters.length, 0);
  assert.equal(state.roses, 0);
  assert.equal(state.revision, 1);
  assert.equal(engine.gift(event).status, "accepted");
});

test("adapter requires explicit IDs and only emits completed streaks once", async () => {
  const { GiftAdapter } = await import("../packages/shared/src/adapter.ts");
  const adapter = new GiftAdapter({
    "configured-rose": "rose_5",
    "configured-prayer": "prayer_5",
  });
  const input = {
    platformGiftId: "configured-rose",
    transactionId: "streak-1",
    sessionUserId: "session-user",
    displayName: "Guest",
    cumulativeRepeatCount: 5,
    final: false,
    timestamp: now,
  };
  assert.equal(adapter.normalize(input), null);
  const event = adapter.normalize({ ...input, final: true });
  assert.equal(event?.giftKey, "rose_5");
  assert.equal(event?.repeatCount, 5);
  assert.equal(event?.coinValue, 5);
  assert.equal(adapter.normalize({ ...input, final: true }), null);
  assert.equal(
    adapter.normalize({
      ...input,
      transactionId: "unknown",
      platformGiftId: "5",
      final: true,
    }),
    null,
  );
  assert.equal(
    adapter.normalize({
      ...input,
      transactionId: "prayer",
      platformGiftId: "configured-prayer",
      final: true,
    })?.giftKey,
    "prayer_5",
  );
});

test("100 expired visitors depart without crossing occupied overflow or each other", () => {
  const engine = new ChapelEngine();
  for (let i = 0; i < 100; i++) engine.comment(comment(`u${i}`));
  engine.tick(now + LIMITS.ttl);
  for (let t = now + LIMITS.ttl; t < now + LIMITS.ttl + 150000; t += 200) {
    engine.tick(t);
    const visible = [...engine.attendees.values()]
      .map((a) => attendeePose(a, t, null))
      .filter((a) => a.visible);
    for (let i = 0; i < visible.length; i++)
      for (let j = i + 1; j < visible.length; j++) {
        const a = visible[i].position,
          b = visible[j].position;
        assert.ok(
          Math.hypot(a[0] - b[0], a[2] - b[2]) >= 0.59,
          `exit overlap at ${t - now - LIMITS.ttl}: ${i},${j} (${a}) (${b})`,
        );
      }
  }
  assert.equal(engine.attendees.size, 0);
});
test("AMEN during departure renews the same attendee and retained seat", () => {
  const engine = new ChapelEngine();
  engine.comment(comment("renew"));
  const seat = engine.attendees.get("renew")!.seat;
  engine.tick(now + LIMITS.ttl);
  engine.comment(comment("renew", "AMEN", undefined, now + LIMITS.ttl + 1000));
  assert.equal(engine.attendees.size, 1);
  assert.equal(engine.attendees.get("renew")!.leaveAt, undefined);
  assert.equal(engine.attendees.get("renew")!.seat, seat);
});

test("v1.1 stress: 20/50/100 attendees and 20 simultaneous gifts drain without clones or camera locks", () => {
  for (const count of [20, 50, 100]) {
    const engine = new ChapelEngine();
    for (let i = 0; i < count; i++) {
      engine.comment(comment(`stress-${i}`));
      engine.comment(comment(`stress-${i}`));
    }
    assert.equal(engine.attendees.size, count);
    for (let i = 0; i < 20; i++)
      assert.equal(
        engine.gift(gift(giftKeys[i % 6], `stress-${i % count}`)).status,
        "accepted",
      );
    let clock = now;
    for (let i = 0; i < 22; i++) {
      clock += 8000;
      engine.tick(clock);
    }
    assert.equal(engine.completed, 20);
    assert.equal(engine.queue.length, 0);
    assert.equal(engine.active, null);
    assert.equal(
      new Set(
        [...engine.attendees.values()]
          .filter((a) => a.seat !== null)
          .map((a) => a.seat),
      ).size,
      Math.min(48, count),
    );
  }
});
