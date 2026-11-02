import { randomUUID } from "node:crypto";
import {
  GIFTS,
  LIMITS,
  parseComment,
  giftSchema,
  waitingPosition,
  waitingPose,
  queueExitPath,
  giftApproach,
  giftReturn,
  walkDuration,
  departurePath,
  destination,
  attendeePose,
  type Vec3,
  type AvatarGender,
  type Attendee,
  type CommentEvent,
  type GiftEvent,
  type Snapshot,
} from "./index.ts";

/** One authoritative state owner. Comments cannot allocate seats or dispatch journeys. */
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
  ignoredDuplicates = 0;
  toast: Snapshot["toast"] = null;
  private seen = new Map<string, number>();
  private preferences = new Map<string, { gender: AvatarGender; at: number }>();
  private supporters = new Map<
    string,
    { userId: string; username: string; coins: number }
  >();
  private priorityStreak = 0;
  private compactAt = Infinity;
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
    for (const [id, at] of this.seen)
      if (now - at > LIMITS.ttl) this.seen.delete(id);
    for (const [id, p] of this.preferences)
      if (now - p.at > LIMITS.ttl) this.preferences.delete(id);
  }
  private duplicate(id: string, now: number) {
    this.prune(now);
    const duplicate =
      this.seen.has(id) ||
      this.active?.event.eventId === id ||
      this.queue.some((e) => e.eventId === id);
    if (duplicate) this.ignoredDuplicates++;
    return duplicate;
  }
  private remember(id: string, now: number) {
    this.seen.set(id, now);
    while (this.seen.size > LIMITS.dedup)
      this.seen.delete(this.seen.keys().next().value!);
  }
  private setGender(a: Attendee, gender: AvatarGender) {
    a.gender = gender;
    a.variant =
      Math.floor(a.variant / 4) * 4 +
      (a.variant % 4 >= 2 ? 2 : 0) +
      (gender === "female" ? 1 : 0);
    delete a.pendingGender;
  }
  join(
    userId: string,
    username: string,
    now: number,
    temporary = false,
  ): Attendee | null {
    const existing = this.attendees.get(userId);
    if (existing) {
      existing.lastSeen = now;
      existing.username = username;
      if (existing.leaveAt !== undefined) {
        if (existing.journey?.kind === "leave") {
          const current = attendeePose(existing, now, null).position,
            path = existing.journey.approach;
          let segment = 1,
            best = Infinity;
          for (let i = 1; i < path.length; i++) {
            const a = path[i - 1],
              b = path[i],
              dx = b[0] - a[0],
              dz = b[2] - a[2];
            const t = Math.max(
              0,
              Math.min(
                1,
                ((current[0] - a[0]) * dx + (current[2] - a[2]) * dz) /
                  Math.max(0.0001, dx * dx + dz * dz),
              ),
            );
            const distance = Math.hypot(
              current[0] - a[0] - t * dx,
              current[2] - a[2] - t * dz,
            );
            if (distance < best) {
              best = distance;
              segment = i;
            }
          }
          const back: Vec3[] = [current, ...path.slice(0, segment).reverse()];
          const endAt = now + walkDuration(back);
          existing.journey = {
            kind: "seat",
            approach: back,
            departure: [back.at(-1)!],
            startAt: now,
            actionAt: endAt,
            actionUntil: endAt,
            endAt,
          };
        }
        delete existing.leaveAt;
      }
      return existing;
    }
    if (this.attendees.size >= LIMITS.viewers + (temporary ? 1 : 0))
      return null;
    const slots = [...this.attendees.values()]
      .filter((a) => a.waitingSlot != null)
      .map((a) => a.waitingSlot!);
    // Default appearance depends only on join order; never infer real gender from a name/id.
    const variant = this.revision++ % 12;
    const gender =
      this.preferences.get(userId)?.gender ?? (variant % 2 ? "female" : "male");
    const a: Attendee = {
      userId,
      username,
      seat: null,
      overflow: null,
      joinedAt: now,
      lastSeen: now,
      walkAt: now,
      variant,
      gender,
      admission: "waiting",
      waitingSlot: slots.length ? Math.max(...slots) + 1 : 0,
      transient: temporary,
    };
    this.setGender(a, gender);
    this.attendees.set(userId, a);
    return a;
  }
  private allocate(a: Attendee) {
    if (a.seat !== null || a.overflow !== null) return;
    const occupied = new Set([...this.attendees.values()].map((p) => p.seat));
    if (!a.transient)
      for (let seat = LIMITS.npc; seat < this.capacity; seat++)
        if (!occupied.has(seat)) {
          a.seat = seat;
          return;
        }
    const standing = new Set(
      [...this.attendees.values()].map((p) => p.overflow),
    );
    let slot = 0;
    while (standing.has(slot)) slot++;
    a.overflow = slot;
  }
  private compact(now: number) {
    const line = [...this.attendees.values()]
      .filter((a) => a.waitingSlot != null)
      .sort((a, b) => a.waitingSlot! - b.waitingSlot!);
    line.forEach((a, slot) => {
      if (a.waitingSlot === slot) return;
      a.queueMotion = {
        from: waitingPose(a, now),
        to: waitingPosition(slot),
        startAt: now,
        endAt: now + 1200,
      };
      a.waitingSlot = slot;
    });
    this.compactAt = Infinity;
  }
  comment(event: CommentEvent, now = event.timestamp) {
    if (event.type !== "comment") return { status: "ignored" as const };
    if (this.duplicate(event.eventId, now))
      return { status: "duplicate" as const };
    this.remember(event.eventId, now);
    const kind = parseComment(event.text);
    if (kind === "other") return { status: "ignored" as const };
    if (kind !== "amen") {
      this.preferences.delete(event.userId);
      this.preferences.set(event.userId, { gender: kind, at: now });
      while (this.preferences.size > LIMITS.preferences)
        this.preferences.delete(this.preferences.keys().next().value!);
      const a = this.attendees.get(event.userId);
      if (a) {
        a.lastSeen = now;
        a.username = event.username;
        if (a.journey) a.pendingGender = kind;
        else this.setGender(a, kind);
      }
      return { status: "appearance_updated" as const };
    }
    const a = this.join(event.userId, event.username, now);
    if (!a) return { status: "capacity" as const };
    this.toast = {
      text: `${event.username} · ${a.admission === "waiting" ? "joined the waiting line" : "AMEN received"}`,
      until: now + 3000,
    };
    return { status: "joined" as const };
  }
  gift(event: GiftEvent, now = event.timestamp) {
    if (event.type !== "gift" || !giftSchema.safeParse(event).success)
      return { status: "invalid_gift" as const };
    if (this.duplicate(event.eventId, now))
      return { status: "duplicate" as const };
    if (this.queue.length >= LIMITS.queue) {
      this.rejected++;
      return { status: "queue_full" as const };
    }
    this.remember(event.eventId, now);
    const normalized = { ...event, coinValue: GIFTS[event.giftKey].coins };
    const a = this.join(event.userId, event.username, now);
    if (a?.admission === "waiting") {
      a.admission = "invited";
      this.allocate(a);
    }
    this.queue.push(normalized);
    this.accepted++;
    const prior = this.supporters.get(event.userId);
    this.supporters.delete(event.userId);
    this.supporters.set(event.userId, {
      userId: event.userId,
      username: event.username,
      coins: (prior?.coins ?? 0) + normalized.coinValue * event.repeatCount,
    });
    while (this.supporters.size > LIMITS.supporters)
      this.supporters.delete(this.supporters.keys().next().value!);
    this.tick(now);
    return { status: "accepted" as const };
  }
  private dispatch(now: number) {
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
    const [event] = this.queue.splice(index, 1);
    let a = this.attendees.get(event.userId);
    if (!a)
      a = this.join(
        event.userId,
        event.username,
        now,
        this.attendees.size >= LIMITS.viewers,
      )!;
    if (!a) {
      this.queue.unshift(event);
      return;
    }
    if (a.admission === "waiting") a.admission = "invited";
    this.allocate(a);
    const approach = giftApproach(a, event.giftKey, now),
      departure = giftReturn(a, approach.at(-1)!);
    const startAt = now + 500,
      actionAt = startAt + walkDuration(approach);
    const duration = Math.max(
      1200,
      GIFTS[event.giftKey].duration * (this.queue.length > 12 ? 0.65 : 1),
    );
    const actionUntil = actionAt + duration,
      endAt = actionUntil + walkDuration(departure);
    const entryAt =
      a.waitingSlot != null
        ? startAt + walkDuration(queueExitPath(approach[0]))
        : startAt;
    if (a.waitingSlot != null) {
      this.compactAt = startAt + walkDuration(queueExitPath(approach[0]));
      a.waitingSlot = null;
      delete a.queueMotion;
    }
    a.journey = {
      kind: "gift",
      approach,
      departure,
      startAt,
      entryAt,
      actionAt,
      actionUntil,
      endAt,
      giftKey: event.giftKey,
    };
    a.walkAt = startAt;
    this.active = {
      event,
      dispatchedAt: now,
      startedAt: actionAt,
      endsAt: actionUntil,
      returnEndsAt: endAt,
    };
    this.toast = {
      text: `${a.username} · entering for ${GIFTS[event.giftKey].short}`,
      until: actionAt,
    };
  }
  tick(now = Date.now()) {
    this.prune(now);
    if (now >= this.compactAt) this.compact(now);
    if (this.active) {
      const a = this.attendees.get(this.active.event.userId);
      if (a?.journey && now >= (a.journey.entryAt ?? a.journey.startAt))
        a.admission = "inside";
      if (now >= this.active.startedAt && !this.active.effectApplied) {
        const e = this.active.event;
        if (e.giftKey === "candle_1")
          this.candles = Math.min(64, this.candles + e.repeatCount);
        if (e.giftKey === "rose_5")
          this.roses = Math.min(48, this.roses + e.repeatCount);
        this.active.effectApplied = true;
        this.toast = {
          text: `${e.username} · ${GIFTS[e.giftKey].label}`,
          until: this.active.endsAt,
        };
      }
      if (now >= (this.active.returnEndsAt ?? this.active.endsAt)) {
        if (a) {
          delete a.journey;
          a.lastSeen = now;
          if (a.pendingGender) this.setGender(a, a.pendingGender);
          if (a.transient) a.leaveAt = now;
        }
        this.completed++;
        this.active = null;
      }
    }
    for (const [id, a] of this.attendees) {
      if (a.journey?.kind !== "gift" && a.journey && now >= a.journey.endAt) {
        if (a.journey.kind === "leave") {
          this.attendees.delete(id);
          continue;
        }
        delete a.journey;
        if (a.pendingGender) this.setGender(a, a.pendingGender);
      }
      const protectedByGift =
        this.active?.event.userId === id ||
        this.queue.some((e) => e.userId === id);
      if (protectedByGift || a.journey) continue;
      if (
        (a.waitingSlot != null || a.transient) &&
        (a.leaveAt !== undefined || now >= a.lastSeen + LIMITS.ttl)
      ) {
        a.leaveAt ??= now;
        if (now - a.leaveAt >= 1200) {
          this.attendees.delete(id);
          this.compactAt = Math.min(this.compactAt, now);
        }
      } else if (
        a.admission === "inside" &&
        now >= a.lastSeen + LIMITS.ttl &&
        !this.queue.length &&
        !this.moving()
      ) {
        const path = departurePath(a),
          endAt = now + walkDuration(path);
        a.leaveAt = now;
        a.journey = {
          kind: "leave",
          approach: path,
          departure: [path.at(-1)!],
          startAt: now,
          actionAt: endAt,
          actionUntil: endAt,
          endAt,
        };
      }
    }
    if (!this.moving() && this.queue.length) this.dispatch(now);
    if (!this.moving() && !this.queue.length) this.promoteStanding(now);
  }
  private moving() {
    return !!this.active || [...this.attendees.values()].some((a) => a.journey);
  }
  private promoteStanding(now: number) {
    const a = [...this.attendees.values()].find(
      (p) =>
        p.admission === "inside" &&
        p.seat === null &&
        p.leaveAt === undefined &&
        !p.transient,
    );
    if (!a) return;
    const occupied = new Set([...this.attendees.values()].map((p) => p.seat));
    let seat: number | null = null;
    for (let i = LIMITS.npc; i < this.capacity; i++)
      if (!occupied.has(i)) {
        seat = i;
        break;
      }
    if (seat === null) return;
    const start = destination(a);
    a.seat = seat;
    // Seat reservation and standing slot release happen in this same tick.
    a.overflow = null;
    const target = destination(a),
      lane = Math.sign(target[0]) * 0.55;
    const path = [
      start,
      [start[0], 0, start[2] + 0.625],
      [lane, 0, start[2] + 0.625],
      [lane, 0, target[2] - 0.65],
      [target[0], 0, target[2] - 0.65],
      target,
    ] as import("./index.ts").Vec3[];
    const endAt = now + walkDuration(path);
    a.journey = {
      kind: "seat",
      approach: path,
      departure: [target],
      startAt: now,
      actionAt: endAt,
      actionUntil: endAt,
      endAt,
    };
  }
  control(action: "reset" | "npcs" | "muted" | "camera", enabled?: boolean) {
    if (action !== "reset") {
      this.settings[action] = enabled!;
      return;
    }
    this.attendees.clear();
    this.queue = [];
    this.active = null;
    this.seen.clear();
    this.preferences.clear();
    this.supporters.clear();
    this.priorityStreak = 0;
    this.compactAt = Infinity;
    this.candles =
      this.roses =
      this.accepted =
      this.completed =
      this.rejected =
      this.ignoredDuplicates =
        0;
    this.toast = null;
    this.revision++;
  }
  snapshot(now = Date.now()): Snapshot {
    this.tick(now);
    const attendees = [...this.attendees.values()];
    return {
      now,
      revision: this.revision,
      attendees,
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
      waitingCount: attendees.filter((a) => a.admission === "waiting").length,
      enteringCount: attendees.filter((a) => a.admission === "invited").length,
      insideCount: attendees.filter((a) => a.admission === "inside").length,
      seatedCount: attendees.filter(
        (a) => a.admission === "inside" && a.seat !== null && !a.journey,
      ).length,
      giftPending: this.queue.length + (this.active ? 1 : 0),
      giftProcessed: this.completed,
      ignoredDuplicates: this.ignoredDuplicates,
      avatarVariantByUser: Object.fromEntries(
        attendees.map((a) => [
          a.userId,
          { gender: a.gender!, variant: a.variant },
        ]),
      ),
    };
  }
}
export const newEventId = () => randomUUID();
