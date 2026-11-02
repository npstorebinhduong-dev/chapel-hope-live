import { randomUUID } from "node:crypto";
import {
  GIFTS,
  LIMITS,
  arrivalPath,
  departurePath,
  pathLength,
  isAmen,
  type Attendee,
  type CommentEvent,
  type GiftEvent,
  type Snapshot,
} from "./index.ts";

/** Ephemeral mock session. No disk storage, account identifiers or religious profiles. */
export class ChapelEngine {
  attendees = new Map<string, Attendee>();
  queue: GiftEvent[] = [];
  active: Snapshot["active"] = null;
  settings = { npcs: true, muted: true, camera: true };
  candles = 0;
  roses = 0;
  accepted = 0;
  completed = 0;
  rejected = 0;
  revision = 0;
  toast: Snapshot["toast"] = null;
  private seen = new Map<string, number>();
  private supporters = new Map<
    string,
    { userId: string; username: string; coins: number }
  >();
  private lastWalk = [0, 0];
  private priorityStreak = 0;
  private lastDeparture = 0;
  constructor(readonly capacity: number = LIMITS.seats) {
    if (
      !Number.isInteger(capacity) ||
      capacity < 24 ||
      capacity > 64 ||
      capacity % 8
    )
      throw new Error("Seat capacity must be a multiple of 8, from 24 to 64");
  }
  private prune(now: number) {
    for (const [id, time] of this.seen)
      if (now - time > LIMITS.ttl) this.seen.delete(id);
  }
  private duplicate(id: string, now: number) {
    this.prune(now);
    return (
      this.seen.has(id) ||
      this.active?.event.eventId === id ||
      this.queue.some((event) => event.eventId === id)
    );
  }
  private remember(id: string, now: number) {
    this.seen.set(id, now);
    while (this.seen.size > LIMITS.dedup)
      this.seen.delete(this.seen.keys().next().value!);
  }
  join(userId: string, username: string, now: number): Attendee | null {
    const existing = this.attendees.get(userId);
    if (existing) {
      existing.lastSeen = now;
      existing.username = username;
      if (existing.leaveAt !== undefined) {
        delete existing.leaveAt;
        existing.walkAt =
          now - (pathLength(arrivalPath(existing)) / 2.4) * 1000;
      }
      return existing;
    }
    if (this.attendees.size >= LIMITS.viewers) return null;
    const used = new Set([...this.attendees.values()].map((a) => a.seat));
    let seat: number | null = null;
    for (let i = LIMITS.npc; i < this.capacity; i++)
      if (!used.has(i)) {
        seat = i;
        break;
      }
    const taken = new Set([...this.attendees.values()].map((a) => a.overflow));
    let overflow: number | null = null;
    if (seat === null) {
      overflow = 0;
      while (taken.has(overflow)) overflow++;
    }
    const side =
      seat === null ? (overflow! % 2 === 0 ? 0 : 1) : seat % 8 < 4 ? 0 : 1;
    const exitingUntil = Math.max(
      now,
      ...[...this.attendees.values()]
        .filter((a) => a.leaveAt !== undefined)
        .map((a) => a.leaveAt! + (pathLength(departurePath(a)) / 2.4) * 1000),
    );
    const walkAt = Math.max(
      now,
      this.lastWalk[side] + 850,
      exitingUntil,
      this.active?.event.giftKey === "altar_100" ? this.active.endsAt : now,
    );
    this.lastWalk[side] = walkAt;
    const attendee: Attendee = {
      userId,
      username,
      seat,
      overflow,
      joinedAt: now,
      lastSeen: now,
      walkAt,
      variant:
        [...userId].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0) % 12,
    };
    this.attendees.set(userId, attendee);
    return attendee;
  }
  comment(event: CommentEvent, now = event.timestamp) {
    if (this.duplicate(event.eventId, now))
      return { status: "duplicate" as const };
    this.remember(event.eventId, now);
    if (!isAmen(event.text)) return { status: "ignored" as const };
    const attendee = this.join(event.userId, event.username, now);
    if (!attendee) {
      this.toast = {
        text: "The visual congregation is full. Free participation remains welcome.",
        until: now + 4000,
      };
      return { status: "capacity" as const };
    }
    this.toast = {
      text: `${event.username} joined with AMEN`,
      until: now + 3500,
    };
    return { status: "joined" as const };
  }
  gift(event: GiftEvent, now = event.timestamp) {
    if (this.duplicate(event.eventId, now))
      return { status: "duplicate" as const };
    if (this.queue.length >= LIMITS.queue) {
      this.rejected++;
      return { status: "queue_full" as const };
    }
    this.remember(event.eventId, now);
    this.join(event.userId, event.username, now);
    this.queue.push(event);
    this.accepted++;
    const prior = this.supporters.get(event.userId);
    this.supporters.delete(event.userId);
    this.supporters.set(event.userId, {
      userId: event.userId,
      username: event.username,
      coins: (prior?.coins ?? 0) + event.coinValue * event.repeatCount,
    });
    while (this.supporters.size > LIMITS.supporters)
      this.supporters.delete(this.supporters.keys().next().value!);
    this.tick(now);
    return { status: "accepted" as const };
  }
  tick(now = Date.now()) {
    if (this.active && now >= this.active.endsAt) {
      this.completed++;
      this.active = null;
    }
    if (!this.active && this.queue.length) {
      // At most three priority selections before the oldest event gets its turn.
      let index = 0;
      if (this.priorityStreak < 3) {
        for (let i = 1; i < this.queue.length; i++)
          if (
            GIFTS[this.queue[i].giftKey].priority >
            GIFTS[this.queue[index].giftKey].priority
          )
            index = i;
        this.priorityStreak++;
      } else this.priorityStreak = 0;
      const [event] = this.queue.splice(index, 1),
        definition = GIFTS[event.giftKey];
      const duration =
        this.queue.length > 12
          ? Math.max(1200, definition.duration * 0.65)
          : definition.duration;
      const donor = this.attendees.get(event.userId);
      const presentation =
        event.giftKey === "altar_100" &&
        (!donor ||
          donor.seat === null ||
          [...this.attendees.values()].some(
            (a) =>
              a.leaveAt !== undefined ||
              now < a.walkAt + (pathLength(arrivalPath(a)) / 2.4) * 1000,
          ));
      this.active = {
        event,
        startedAt: now,
        endsAt: now + duration,
        presentation,
      };
      if (event.giftKey === "candle_1")
        this.candles = Math.min(64, this.candles + event.repeatCount);
      if (event.giftKey === "rose_5")
        this.roses = Math.min(48, this.roses + event.repeatCount);
      this.toast = {
        text: `${event.username} · ${definition.label}${event.repeatCount > 1 ? ` ×${event.repeatCount}` : ""}`,
        until: now + duration,
      };
    }
    for (const [id, a] of this.attendees) {
      const protectedByGift =
        this.active?.event.userId === id ||
        this.queue.some((e) => e.userId === id);
      if (
        a.leaveAt === undefined &&
        now - a.lastSeen >= LIMITS.ttl &&
        !protectedByGift
      ) {
        const arrivalsUntil = Math.max(
          now,
          ...[...this.attendees.values()].map(
            (other) =>
              other.walkAt + (pathLength(arrivalPath(other)) / 2.4) * 1000,
          ),
        );
        a.leaveAt = Math.max(
          now,
          arrivalsUntil,
          this.lastDeparture + 900,
          this.active?.event.giftKey === "altar_100" ? this.active.endsAt : now,
        );
        this.lastDeparture = a.leaveAt;
      }
      if (
        a.leaveAt &&
        now - a.leaveAt >= (pathLength(departurePath(a)) / 2.4) * 1000
      )
        this.attendees.delete(id);
    }
    this.prune(now);
  }
  control(action: "reset" | "npcs" | "muted" | "camera", enabled?: boolean) {
    if (action === "reset") {
      this.attendees.clear();
      this.queue = [];
      this.active = null;
      this.seen.clear();
      this.supporters.clear();
      this.lastWalk = [0, 0];
      this.lastDeparture = 0;
      this.priorityStreak = 0;
      this.candles = 0;
      this.roses = 0;
      this.accepted = 0;
      this.completed = 0;
      this.rejected = 0;
      this.toast = null;
      this.revision++;
    } else this.settings[action] = enabled!;
  }
  snapshot(now = Date.now()): Snapshot {
    this.tick(now);
    return {
      now,
      revision: this.revision,
      attendees: [...this.attendees.values()],
      active: this.active,
      queueLength: this.queue.length,
      accepted: this.accepted,
      completed: this.completed,
      rejected: this.rejected,
      candles: this.candles,
      roses: this.roses,
      settings: { ...this.settings },
      toast: this.toast && this.toast.until > now ? this.toast : null,
      supporters: [...this.supporters.values()]
        .sort((a, b) => b.coins - a.coins)
        .slice(0, 3),
    };
  }
}
export const newEventId = () => randomUUID();
