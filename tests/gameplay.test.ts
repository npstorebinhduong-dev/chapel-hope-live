import { test } from "node:test";
import assert from "node:assert/strict";
import { ChapelEngine } from "../packages/shared/src/engine.ts";
import {
  GIFTS,
  giftKeys,
  giftSchema,
  isAmen,
  parseComment,
  LIMITS,
  attendeePose,
  isAttendeeMoving,
  waitingPosition,
  type GiftEvent,
  type GiftKey,
} from "../packages/shared/src/index.ts";
const now = 1_000_000;
let serial = 0;
const gift = (
  giftKey: GiftKey,
  userId = "donor",
  timestamp = now,
): GiftEvent => ({
  type: "gift",
  eventId: `g-${++serial}`,
  userId,
  username: "Guest",
  giftKey,
  coinValue: GIFTS[giftKey].coins,
  repeatCount: 1,
  timestamp,
});
const comment = (userId: string, text = "AMEN", timestamp = now) => ({
  type: "comment" as const,
  eventId: `c-${++serial}`,
  userId,
  username: "Guest",
  text,
  timestamp,
});
function drain(e: ChapelEngine, start = now) {
  let t = start,
    turns = 0;
  while (e.active || e.queue.length) {
    assert.ok(turns++ < 2000, "queue must drain");
    t = e.active ? e.active.returnEndsAt! : t + 2000;
    e.tick(t);
  }
  return t;
}
function populate(e: ChapelEngine, count: number) {
  for (let i = 0; i < count; i++) e.comment(comment(`u${i}`));
}

test("parser separates AMEN, exact 1/2 and unrelated text; text never routes as gifts", () => {
  for (const s of ["AMEN", " amen! ", "Amen...?!"]) {
    assert.equal(isAmen(s), true);
    assert.equal(parseComment(s), "amen");
  }
  assert.equal(parseComment(" 1 "), "male");
  assert.equal(parseComment("2"), "female");
  const e = new ChapelEngine();
  for (const s of [
    "12",
    "10",
    "1 xu",
    "2!",
    "gift",
    "rose",
    "quà",
    "<b>AMEN</b>",
    "AMEN now",
    "amenity",
    "",
  ]) {
    assert.equal(parseComment(s), "other");
    e.comment(comment("u", s));
  }
  assert.equal(e.attendees.size, 0);
  assert.equal(e.accepted, 0);
});
test("AMEN duplicates and three repeats keep one waiting avatar, no seat, renewing TTL", () => {
  const e = new ChapelEngine(),
    c = comment("u");
  e.comment(c);
  assert.equal(e.comment(c).status, "duplicate");
  e.comment(comment("u", "AMEN", now + 1000));
  e.comment(comment("u", "AMEN", now + 2000));
  const a = e.attendees.get("u")!;
  assert.equal(e.attendees.size, 1);
  assert.equal(a.seat, null);
  assert.equal(a.overflow, null);
  assert.equal(a.admission, "waiting");
  assert.equal(a.lastSeen, now + 2000);
  e.tick(now + 20000);
  assert.equal(a.admission, "waiting");
  assert.equal(a.seat, null);
  assert.equal(attendeePose(a, now + 20000, e.active).state, "waiting");
});
test("gender before AMEN stores preference only; rapid gender changes preserve identity/position", () => {
  const e = new ChapelEngine();
  e.comment(comment("a", "1"));
  e.comment(comment("b", "2"));
  assert.equal(e.attendees.size, 0);
  assert.equal(e.accepted, 0);
  e.comment(comment("a"));
  e.comment(comment("b"));
  const a = e.attendees.get("a")!,
    b = e.attendees.get("b")!,
    position = attendeePose(a, now, null).position;
  assert.equal(a.gender, "male");
  assert.equal(b.gender, "female");
  for (const text of ["2", "1", "2", "1"]) e.comment(comment("a", text));
  assert.equal(e.attendees.get("a"), a);
  assert.equal(a.gender, "male");
  assert.equal(a.variant % 2, 0);
  assert.equal(b.variant % 2, 1);
  assert.deepEqual(attendeePose(a, now, null).position, position);
  assert.equal(a.seat, null);
  assert.equal(e.attendees.size, 2);
});
test("session preferences expire and reset; nickname never determines appearance choice", () => {
  const e = new ChapelEngine();
  e.comment(comment("x", "2"));
  e.tick(now + LIMITS.ttl + 1);
  e.comment(comment("x", "AMEN", now + LIMITS.ttl + 1));
  assert.equal(e.attendees.get("x")!.gender, "male");
  e.control("reset");
  e.comment(comment("x", "1"));
  e.control("reset");
  assert.equal(e.attendees.size, 0);
});
test("50 AMEN + exactly 5 gifters yields 45 waiting and 5 inside, excluding NPCs", () => {
  const e = new ChapelEngine();
  populate(e, 50);
  assert.equal(e.snapshot(now + 20000).waitingCount, 50);
  assert.equal(e.snapshot(now + 20000).insideCount, 0);
  assert.ok([...e.attendees.values()].every((a) => a.seat === null));
  for (let i = 0; i < 5; i++) e.gift(gift(giftKeys[i], `u${i}`, now + 21000));
  const t = drain(e, now + 21000),
    s = e.snapshot(t);
  assert.equal(s.waitingCount, 45);
  assert.equal(s.insideCount, 5);
  assert.equal(s.seatedCount, 5);
  assert.equal(s.enteringCount, 0);
  assert.equal(s.completed, 5);
  assert.equal(
    new Set(s.attendees.filter((a) => a.seat !== null).map((a) => a.seat)).size,
    5,
  );
  for (let i = 5; i < 50; i++) {
    assert.equal(e.attendees.get(`u${i}`)!.admission, "waiting");
    assert.equal(e.attendees.get(`u${i}`)!.seat, null);
  }
});
test("FX/offerings/camera start only after the same avatar reaches its gift zone", () => {
  for (const key of giftKeys) {
    const e = new ChapelEngine();
    e.gift(gift(key));
    const a = e.attendees.get("donor")!,
      active = e.active!;
    assert.equal(e.attendees.size, 1);
    assert.equal(a.admission, "invited");
    assert.ok(active.startedAt > now + 5000);
    assert.deepEqual(attendeePose(a, now, active).position, waitingPosition(0));
    e.tick(active.startedAt - 1);
    assert.equal(e.candles, 0);
    assert.equal(e.roses, 0);
    e.tick(active.startedAt);
    assert.deepEqual(
      attendeePose(a, active.startedAt, active).position,
      a.journey!.approach.at(-1),
    );
    assert.equal(e.candles, key === "candle_1" ? 1 : 0);
    assert.equal(e.roses, key === "rose_5" ? 1 : 0);
    const t = drain(e);
    assert.equal(e.snapshot(t).insideCount, 1);
    assert.equal(e.attendees.get("donor"), a);
    assert.equal(a.seat, 16);
  }
});
test("returning gifts preserve one avatar and seat; gender changes defer safely during a journey", () => {
  const e = new ChapelEngine();
  e.gift(gift("candle_1"));
  let t = drain(e);
  const a = e.attendees.get("donor")!,
    seat = a.seat;
  for (const key of ["altar_100", "ceremony_500"] as const) {
    e.gift(gift(key, "donor", t + 1));
    e.comment(comment("donor", "2", t + 2));
    assert.equal(a.pendingGender, "female");
    assert.equal(a.seat, seat);
    t = drain(e, t + 2);
    assert.equal(a.gender, "female");
    assert.equal(a.seat, seat);
    assert.equal(e.attendees.size, 1);
    assert.equal(e.active, null);
  }
});
test("full seats still play gifts at standing positions; only previously gifted people can inherit a vacancy", () => {
  const e = new ChapelEngine(24);
  populate(e, 20);
  for (let i = 0; i < 10; i++) e.gift(gift("prayer_5", `u${i}`));
  let t = drain(e);
  const s = e.snapshot(t);
  assert.equal(s.insideCount, 10);
  assert.equal(s.waitingCount, 10);
  assert.equal(s.seatedCount, 8);
  assert.equal(
    new Set(s.attendees.filter((a) => a.seat !== null).map((a) => a.seat)).size,
    8,
  );
  assert.equal(e.attendees.get("u8")!.overflow, 0);
  assert.equal(e.attendees.get("u9")!.overflow, 1);
  const before = s.completed;
  e.gift(gift("rose_5", "u8", t + 1));
  t = drain(e, t + 1);
  assert.equal(e.completed, before + 1);
  assert.equal(e.roses, 1);
  // Simulate one already-expired seated guest; real departure releases the seat.
  e.attendees.get("u0")!.lastSeen = t - LIMITS.ttl;
  e.tick(t);
  const exit = e.attendees.get("u0")!.journey!;
  e.tick(exit.endAt);
  const promoted = e.attendees.get("u8")!;
  assert.equal(promoted.seat, 16);
  e.tick(promoted.journey!.endAt);
  assert.equal(e.snapshot(exit.endAt + 30000).waitingCount, 10);
  assert.equal(e.attendees.get("u10")!.seat, null);
});
test("full viewer cap keeps accepted out-of-line gift with at most one temporary real donor avatar", () => {
  const e = new ChapelEngine();
  populate(e, 100);
  e.gift(gift("rose_5", "outside"));
  assert.equal(e.attendees.size, 101);
  assert.equal(e.attendees.get("outside")!.transient, true);
  const t = drain(e);
  assert.equal(e.roses, 1);
  e.tick(t + 1300);
  assert.equal(e.attendees.size, 100);
  assert.equal(e.snapshot(t + 1300).waitingCount, 100);
});
test("dedupe is checked before invitation; queue-full events do not allocate seats or invite anyone", () => {
  const e = new ChapelEngine();
  populate(e, 2);
  const first = gift("bell_10", "u0");
  e.gift(first);
  assert.equal(e.gift(first).status, "duplicate");
  for (let i = 0; i < LIMITS.queue; i++)
    assert.equal(e.gift(gift("candle_1", "u0")).status, "accepted");
  const retry = gift("rose_5", "u1");
  assert.equal(e.gift(retry).status, "queue_full");
  assert.equal(e.attendees.get("u1")!.admission, "waiting");
  assert.equal(e.attendees.get("u1")!.seat, null);
  const t = e.active!.returnEndsAt!;
  e.tick(t);
  assert.equal(e.gift(retry, t).status, "accepted");
  assert.equal(e.gift(retry, t).status, "duplicate");
});
test("event runtime guard rejects text disguised as gift and normalizes coin values", () => {
  const e = new ChapelEngine();
  assert.equal(
    e.gift({ ...gift("candle_1"), type: "comment" } as unknown as GiftEvent)
      .status,
    "invalid_gift",
  );
  assert.equal(
    e.gift({ ...gift("candle_1"), giftKey: "1" } as unknown as GiftEvent)
      .status,
    "invalid_gift",
  );
  e.gift({ ...gift("prayer_5"), coinValue: 999 });
  assert.equal(e.active!.event.coinValue, 5);
  assert.equal(e.snapshot(now).supporters[0].coins, 5);
});
test("six keys and repeat limits remain distinct, including two five-coin gifts", () => {
  assert.equal(giftKeys.length, 6);
  assert.notEqual(GIFTS.prayer_5.label, GIFTS.rose_5.label);
  for (const giftKey of giftKeys)
    assert.ok(
      giftSchema.safeParse({ userId: "u", username: "U", giftKey }).success,
    );
  assert.equal(
    giftSchema.safeParse({
      userId: "u",
      username: "U",
      giftKey: "rose_5",
      repeatCount: 21,
    }).success,
    false,
  );
});
test("FIFO ties and bounded priority fairness survive travel and return phases", () => {
  const e = new ChapelEngine();
  e.gift(gift("bell_10"));
  const low = gift("candle_1");
  e.gift(low);
  const highs = Array.from({ length: 8 }, () => gift("ceremony_500"));
  highs.forEach((g) => e.gift(g));
  const order: string[] = [];
  let t = now;
  while (e.active) {
    order.push(e.active.event.eventId);
    t = e.active.returnEndsAt!;
    e.tick(t);
  }
  assert.equal(order[1], highs[0].eventId);
  assert.ok(order.indexOf(low.eventId) <= 4);
  assert.equal(e.completed, 10);
  assert.equal(e.snapshot(t).active, null);
});
test("100 AMEN + 20 gifts drains without dropping gifts or inviting unrelated waiting people", () => {
  const e = new ChapelEngine();
  populate(e, 100);
  for (let i = 0; i < 20; i++)
    e.gift({ ...gift(giftKeys[i % 6], `u${i}`), repeatCount: 20 });
  const t = drain(e),
    s = e.snapshot(t);
  assert.equal(s.completed, 20);
  assert.equal(s.queueLength, 0);
  assert.equal(s.insideCount, 20);
  assert.equal(s.waitingCount, 80);
  assert.equal(
    new Set(s.attendees.filter((a) => a.seat !== null).map((a) => a.seat)).size,
    20,
  );
  assert.ok(s.candles <= 64 && s.roses <= 48);
  assert.equal(s.supporters.length, 3);
});
test("queue render limit, serpentine spacing and smooth reflow are bounded at 100 comments", () => {
  const e = new ChapelEngine();
  populate(e, 100);
  assert.equal(e.comment(comment("overflow")).status, "capacity");
  const poses = [...e.attendees.values()]
    .map((a) => attendeePose(a, now, null))
    .filter((p) => p.visible);
  assert.equal(poses.length, 12);
  for (let i = 0; i < poses.length; i++)
    for (let j = i + 1; j < poses.length; j++)
      assert.ok(
        Math.hypot(
          poses[i].position[0] - poses[j].position[0],
          poses[i].position[2] - poses[j].position[2],
        ) >= 1.4,
      );
  e.gift(gift("candle_1", "u3"));
  const start = now;
  let last = new Map<string, number[]>();
  for (let t = start; t < e.active!.startedAt; t += 50) {
    e.tick(t);
    const line = [...e.attendees.values()].filter(
      (a) => a.waitingSlot != null && a.waitingSlot < 12,
    );
    for (const a of line) {
      const p = attendeePose(a, t, e.active).position,
        old = last.get(a.userId);
      if (old)
        assert.ok(
          Math.hypot(p[0] - old[0], p[2] - old[2]) < 0.5,
          "reflow cannot teleport",
        );
      last.set(a.userId, p);
    }
  }
});
test("one moving donor stays on aisle/row branches and never jumps across journey boundaries", () => {
  const e = new ChapelEngine();
  populate(e, 20);
  e.gift(gift("altar_100", "u9"));
  const a = e.attendees.get("u9")!,
    j = a.journey!;
  let previous = attendeePose(a, now, e.active).position;
  for (let t = now; t < j.endAt; t += 40) {
    e.tick(t);
    const p = attendeePose(a, t, e.active).position;
    assert.ok(
      Math.hypot(p[0] - previous[0], p[2] - previous[2]) < 0.2,
      "root velocity bounded",
    );
    // In pew depth a walker is in the centre aisle, or in a reserved front-of-row gap.
    if (p[2] >= -6.8 && p[2] <= 5.1 && Math.abs(p[0]) > 1)
      assert.ok(
        Math.abs(p[2] - (-6.8 + Math.floor(a.seat! / 8) * 1.7 - 0.65)) < 0.02 ||
          Math.abs(Math.abs(p[0]) - 2) < 0.01,
        `route crosses pew at ${p}`,
      );
    previous = p;
  }
  for (const boundary of [j.startAt, j.actionAt, j.actionUntil, j.endAt]) {
    const p = attendeePose(a, boundary - 0.001, e.active).position,
      q = attendeePose(a, boundary + 0.001, e.active).position;
    assert.ok(Math.hypot(p[0] - q[0], p[2] - q[2]) < 0.001);
  }
});
test("waiting TTL fades out without ever getting a seat; repeated AMEN cancels waiting departure", () => {
  const e = new ChapelEngine();
  e.comment(comment("u"));
  e.tick(now + LIMITS.ttl);
  assert.equal(e.attendees.get("u")!.seat, null);
  e.comment(comment("u", "AMEN", now + LIMITS.ttl + 500));
  assert.equal(e.attendees.get("u")!.leaveAt, undefined);
  e.tick(now + 2 * LIMITS.ttl + 501);
  e.tick(now + 2 * LIMITS.ttl + 1800);
  assert.equal(e.attendees.size, 0);
});
test("reset clears waiting, preferences, seats, counters, queue and offerings", () => {
  const e = new ChapelEngine();
  e.comment(comment("u", "2"));
  e.gift(gift("rose_5", "u"));
  e.control("muted", false);
  e.control("reset");
  const s = e.snapshot(now);
  assert.equal(s.attendees.length, 0);
  assert.equal(s.giftPending, 0);
  assert.equal(s.active, null);
  assert.equal(s.supporters.length, 0);
  assert.equal(s.settings.muted, false);
});
test("adapter uses explicit platform IDs and deduplicates final repeat streaks", async () => {
  const { GiftAdapter } = await import("../packages/shared/src/adapter.ts");
  const a = new GiftAdapter({ r: "rose_5", p: "prayer_5" });
  const x = {
    platformGiftId: "r",
    transactionId: "streak",
    sessionUserId: "u",
    displayName: "Guest",
    cumulativeRepeatCount: 5,
    final: false,
    timestamp: now,
  };
  assert.equal(a.normalize(x), null);
  assert.equal(a.normalize({ ...x, final: true })?.repeatCount, 5);
  assert.equal(a.normalize({ ...x, final: true }), null);
  assert.equal(
    a.normalize({
      ...x,
      transactionId: "unknown",
      platformGiftId: "5",
      final: true,
    }),
    null,
  );
});

test("renewing an inside attendee during departure reverses smoothly without cloning or losing the seat", () => {
  const e = new ChapelEngine();
  e.gift(gift("candle_1"));
  const done = drain(e),
    a = e.attendees.get("donor")!,
    seat = a.seat;
  e.tick(done + LIMITS.ttl);
  const time = done + LIMITS.ttl + 1200,
    before = attendeePose(a, time, null).position;
  e.comment(comment("donor", "AMEN", time));
  assert.equal(a.leaveAt, undefined);
  assert.equal(a.seat, seat);
  assert.equal(e.attendees.size, 1);
  assert.deepEqual(attendeePose(a, time, null).position, before);
  e.tick(a.journey!.endAt);
  assert.equal(a.admission, "inside");
  assert.equal(a.seat, seat);
});
test("donor and visible waiting avatars retain physical separation during exit, reflow and return", () => {
  const e = new ChapelEngine();
  populate(e, 20);
  e.gift(gift("rose_5", "u8"));
  const end = e.active!.returnEndsAt!;
  for (let t = now; t < end; t += 80) {
    e.tick(t);
    const list = [...e.attendees.values()]
      .map((a) => ({ id: a.userId, ...attendeePose(a, t, e.active) }))
      .filter((p) => p.visible);
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i].position,
          b = list[j].position;
        assert.ok(
          Math.hypot(a[0] - b[0], a[2] - b[2]) >= 0.55,
          `overlap ${list[i].id}/${list[j].id} at ${t - now}`,
        );
      }
  }
});

test("walking animation/audio follows line reflow and pauses during gift actions", () => {
  const e = new ChapelEngine();
  populate(e, 20);
  const waiter = e.attendees.get("u1")!;
  assert.equal(isAttendeeMoving(waiter, now), false);
  e.gift(gift("candle_1", "u0"));
  const donor = e.attendees.get("u0")!,
    j = donor.journey!;
  assert.equal(isAttendeeMoving(donor, j.startAt - 1), false);
  assert.equal(isAttendeeMoving(donor, j.startAt + 100), true);
  assert.equal(isAttendeeMoving(donor, j.actionAt + 100), false);
  assert.equal(isAttendeeMoving(donor, j.actionUntil + 100), true);
  e.tick(j.entryAt! + 1);
  assert.equal(waiter.admission, "waiting");
  assert.equal(isAttendeeMoving(waiter, j.entryAt! + 100), true);
  assert.equal(isAttendeeMoving(waiter, j.entryAt! + 1500), false);
});
