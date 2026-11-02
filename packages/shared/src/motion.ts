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
  return alongPath(roundedPath(path), integral / (1 - edge));
}
// Round only a small radius inside the existing aisle/row corridor. Cache by
// journey path identity; arc-length sampling keeps stride speed even at turns.
const rounded = new WeakMap<Vec3[], Vec3[]>();
export function roundedPath(path: Vec3[]): Vec3[] {
  const cached = rounded.get(path);
  if (cached) return cached;
  const result: Vec3[] = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const a = path[i - 1],
      b = path[i],
      c = path[i + 1];
    const before = Math.hypot(b[0] - a[0], b[2] - a[2]);
    const after = Math.hypot(c[0] - b[0], c[2] - b[2]);
    const radius = Math.min(0.12, before * 0.2, after * 0.2);
    if (radius < 0.001) {
      result.push(b);
      continue;
    }
    const start: Vec3 = [
      b[0] + ((a[0] - b[0]) * radius) / before,
      0,
      b[2] + ((a[2] - b[2]) * radius) / before,
    ];
    const end: Vec3 = [
      b[0] + ((c[0] - b[0]) * radius) / after,
      0,
      b[2] + ((c[2] - b[2]) * radius) / after,
    ];
    result.push(start);
    for (let j = 1; j <= 8; j++) {
      const t = j / 8,
        u = 1 - t;
      result.push([
        u * u * start[0] + 2 * u * t * b[0] + t * t * end[0],
        0,
        u * u * start[2] + 2 * u * t * b[2] + t * t * end[2],
      ]);
    }
  }
  result.push(path.at(-1)!);
  rounded.set(path, result);
  return result;
}
/** Dense foyer, not a fixed set of visible slots. Every viewer has a distinct
 * position in the bottom band; a narrow central exit remains clear. */
export function waitingPosition(slot: number, count = 1): Vec3 {
  const columns = Math.max(
    6,
    Math.min(24, Math.ceil(Math.sqrt(Math.max(1, count) * 2))),
  );
  const half = Math.ceil(columns / 2),
    row = Math.floor(slot / (half * 2));
  const col = slot % (half * 2),
    side = col < half ? -1 : 1;
  const within = col % half;
  const rows = Math.max(1, Math.ceil(count / (half * 2)));
  const depth = rows === 1 ? 0 : row / Math.max(1, rows - 1);
  // Break repeated vertical columns while keeping deterministic, stable targets.
  const spacing = 3.4 / Math.max(1, half - 1);
  const jitter = Math.sin(slot * 12.9898 + row * 4.31) * 0.2;
  const stagger = (row % 2 ? 0.38 : -0.12) + jitter;
  return [
    side * Math.max(0.85, Math.min(4.55, 0.95 + (within + stagger) * spacing)),
    0,
    20.15 - depth * 2.1 + Math.sin(slot * 2.399) * 0.035,
  ];
}
export function waitingPose(a: Attendee, now: number): Vec3 {
  const motion = a.queueMotion;
  if (!motion || now >= motion.endAt)
    return a.waitingTarget ?? waitingPosition(a.waitingSlot ?? 0);
  const t = smooth((now - motion.startAt) / (motion.endAt - motion.startAt));
  return motion.from.map(
    (value, i) => value + (motion.to[i] - value) * t,
  ) as Vec3;
}
export function queueExitPath(start: Vec3): Vec3[] {
  const lane = Math.sign(start[0] || 1) * 0.55;
  return [start, [start[0], 0, 17.2], [lane, 0, 17.2], [lane, 0, 16]];
}
export function giftApproach(a: Attendee, key: GiftKey, now: number): Vec3[] {
  const zone: Vec3 = [
    key === "candle_1" ? -5.5 : key === "rose_5" ? 5.3 : 0,
    0,
    -9,
  ];
  if (a.waitingSlot !== null && a.waitingSlot !== undefined) {
    const start = waitingPose(a, now);
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
    if (now < (journey.departAt ?? journey.actionUntil))
      return {
        position: journey.approach.at(-1)!,
        state: "praying_idle",
        visible: true,
      };
    if (now < journey.endAt)
      return {
        position: easedAlongPath(
          journey.departure,
          (now - (journey.departAt ?? journey.actionUntil)) /
            Math.max(
              1,
              journey.endAt - (journey.departAt ?? journey.actionUntil),
            ),
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
      visible: true,
    };
  const effect = active && now >= active.startedAt && now < active.endsAt;
  return {
    position: destination(a),
    state:
      effect &&
      (active.event.giftKey === "ceremony_500" ||
        (active.event.giftKey === "bell_10" &&
          a.seat !== null &&
          a.seat < 32 &&
          now > active.startedAt + (a.variant % 4) * 100))
        ? "kneeling"
        : a.seat === null
          ? "inside_standing_wait"
          : "seated",
    visible: a.overflow === null || a.overflow < 8,
  };
}

/** Shared animation/audio gate: no stepping while idle or during the gift pose. */
export function isAttendeeMoving(a: Attendee, now: number): boolean {
  const j = a.journey;
  if (j) {
    if (now >= j.startAt && now < j.actionAt)
      return pathLength(j.approach) > 0.01;
    if (now >= (j.departAt ?? j.actionUntil) && now < j.endAt)
      return pathLength(j.departure) > 0.01;
    return false;
  }
  const q = a.queueMotion;
  return (
    !!q &&
    now >= q.startAt &&
    now < q.endAt &&
    Math.hypot(q.from[0] - q.to[0], q.from[2] - q.to[2]) > 0.01
  );
}
