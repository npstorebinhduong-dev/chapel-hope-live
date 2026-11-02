import {
  alongPath,
  pathLength,
  destination,
  type Attendee,
  type ActiveGift,
  type AttendeeState,
  type GiftKey,
  type Vec3,
} from "./index.ts";
export const WALK_SPEED = 2.4;
export const walkDuration = (path: Vec3[]) =>
  Math.max(450, (pathLength(path) / WALK_SPEED) * 1000 + 400);
const smooth = (t: number) => {
  const p = Math.max(0, Math.min(1, t));
  return p * p * (3 - 2 * p);
};
// Ease only acceleration/deceleration, maintaining a steady middle walk speed.
export function easedAlongPath(path: Vec3[], progress: number): Vec3 {
  const p = Math.max(0, Math.min(1, progress)),
    edge = 0.08;
  const integral =
    p < edge
      ? (p * p) / (2 * edge)
      : p > 1 - edge
        ? 1 - edge - (1 - p) ** 2 / (2 * edge)
        : p - edge / 2;
  return alongPath(path, integral / (1 - edge));
}
export function waitingPosition(slot: number): Vec3 {
  const row = Math.floor(slot / 6),
    col = row % 2 ? 5 - (slot % 6) : slot % 6;
  return [[-4.5, -3, -1.5, 1.5, 3, 4.5][col]!, 0, 18 + row * 2.4];
}
export function waitingPose(a: Attendee, now: number): Vec3 {
  const motion = a.queueMotion;
  if (!motion || now >= motion.endAt)
    return waitingPosition(a.waitingSlot ?? 0);
  const t = smooth((now - motion.startAt) / (motion.endAt - motion.startAt));
  return motion.from.map(
    (value, i) => value + (motion.to[i] - value) * t,
  ) as Vec3;
}
export function queueExitPath(start: Vec3): Vec3[] {
  const lane = Math.sign(start[0] || 1) * 0.55;
  return [
    start,
    [start[0], 0, start[2] + 1],
    [lane, 0, start[2] + 1],
    [lane, 0, 16],
  ];
}
export function giftApproach(a: Attendee, key: GiftKey, now: number): Vec3[] {
  const zone: Vec3 = [
    key === "candle_1" ? -3.5 : key === "rose_5" ? 3.5 : 0,
    0,
    -9,
  ];
  if (a.waitingSlot !== null && a.waitingSlot !== undefined) {
    // Logical overflow enters from below the visible foyer, never materializes at altar.
    const start =
      a.waitingSlot < 12
        ? waitingPose(a, now)
        : waitingPosition(12 + (a.waitingSlot % 6));
    const exit = queueExitPath(start),
      lane = exit.at(-1)![0];
    return [...exit, [lane, 0, -9], zone];
  }
  const start = destination(a),
    lane = Math.sign(start[0] || 1) * 0.55;
  const branch = a.seat === null ? start[2] + 0.625 : start[2] - 0.65;
  return [start, [start[0], 0, branch], [lane, 0, branch], [lane, 0, -9], zone];
}
export function giftReturn(a: Attendee, start: Vec3): Vec3[] {
  const end = destination(a),
    lane = Math.sign(end[0] || 1) * 0.55;
  const branch = a.seat === null ? end[2] + 0.625 : end[2] - 0.65;
  return [
    start,
    [lane, 0, -9],
    [lane, 0, branch],
    [end[0], 0, branch],
    [end[0], 0, end[2]],
  ];
}
export function attendeePose(
  a: Attendee,
  now: number,
  active: ActiveGift | null,
): { position: Vec3; state: AttendeeState; visible: boolean } {
  const journey = a.journey;
  if (journey) {
    if (now < journey.startAt)
      return {
        position: journey.approach[0],
        state: journey.kind === "gift" ? "called_by_gift" : "praying_idle",
        visible: true,
      };
    if (now < journey.actionAt)
      return {
        position: easedAlongPath(
          journey.approach,
          (now - journey.startAt) / (journey.actionAt - journey.startAt),
        ),
        state:
          journey.kind === "leave"
            ? "leaving"
            : a.admission === "invited"
              ? "walking_from_queue"
              : "walking_in_aisle",
        visible: true,
      };
    if (now < journey.actionUntil)
      return {
        position: journey.approach.at(-1)!,
        state: ["prayer_5", "altar_100", "ceremony_500"].includes(
          journey.giftKey ?? "",
        )
          ? "kneeling"
          : "gift_reacting",
        visible: true,
      };
    if (now < journey.endAt)
      return {
        position: easedAlongPath(
          journey.departure,
          (now - journey.actionUntil) /
            Math.max(1, journey.endAt - journey.actionUntil),
        ),
        state: journey.kind === "leave" ? "leaving" : "returning",
        visible: true,
      };
    return {
      position: journey.departure.at(-1)!,
      state: a.seat === null ? "inside_standing_wait" : "seated",
      visible: journey.kind !== "leave",
    };
  }
  if (a.waitingSlot !== null && a.waitingSlot !== undefined)
    return {
      position: waitingPose(a, now),
      state:
        a.leaveAt !== undefined
          ? "leaving"
          : a.admission === "invited"
            ? "called_by_gift"
            : "waiting",
      visible: a.waitingSlot < 12,
    };
  const effect = active && now >= active.startedAt && now < active.endsAt;
  return {
    position: destination(a),
    state:
      effect && active.event.giftKey === "ceremony_500"
        ? "kneeling"
        : a.seat === null
          ? "inside_standing_wait"
          : "seated",
    visible: a.overflow === null || a.overflow < 8,
  };
}
