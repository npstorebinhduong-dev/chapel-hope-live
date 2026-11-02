import { ChapelEngine } from "./engine.ts";
import { GIFTS } from "./index.ts";
/** Explicit operator-only mock replay. Every seeded attendee has a valid gift.
 * Refresh the simulated interactions during replay, then translate to wall time. */
export function fillGiftedSeats(engine: ChapelEngine, now = Date.now()) {
  engine.control("reset");
  let clock = 1000;
  for (let i = 0; i < engine.capacity - 16; i++) {
    for (const a of engine.attendees.values()) a.lastSeen = clock;
    engine.gift(
      {
        type: "gift",
        source: "mock",
        giftKey: "prayer_5",
        eventId: `fixture-gift-${i}`,
        userId: `fixture-${i}`,
        username: `Mock donor ${i + 1}`,
        coinValue: GIFTS.prayer_5.coins,
        repeatCount: 1,
        timestamp: clock,
      },
      clock,
    );
    clock = engine.active!.returnEndsAt!;
    engine.tick(clock);
  }
  const offset = now - clock;
  for (const a of engine.attendees.values()) {
    a.joinedAt += offset;
    a.walkAt += offset;
    a.lastSeen = now;
  }
  engine.toast = {
    text: "Mock replay: seats filled by gift events",
    until: now + 3500,
  };
  return { status: "completed", joined: engine.attendees.size };
}

export function fillAcceptance(engine: ChapelEngine, now = Date.now()) {
  engine.control("reset");
  for (let i = 0; i < 50; i++)
    engine.comment({
      type: "comment",
      source: "mock",
      eventId: `accept-${now}-${i}`,
      userId: `accept-${i}`,
      username: `Guest ${i + 1}`,
      text: "AMEN",
      timestamp: now,
    });
  const keys = [
    "candle_1",
    "prayer_5",
    "rose_5",
    "bell_10",
    "altar_100",
  ] as const;
  keys.forEach((giftKey, i) =>
    engine.gift({
      type: "gift",
      source: "mock",
      eventId: `accept-gift-${now}-${i}`,
      userId: `accept-${i}`,
      username: `Guest ${i + 1}`,
      giftKey,
      coinValue: GIFTS[giftKey].coins,
      repeatCount: 1,
      timestamp: now,
    }),
  );

  return { status: "accepted" };
}
