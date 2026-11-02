import { z } from "zod";

export const GIFTS = {
  candle_1: {
    coins: 1,
    label: "Light a Candle",
    short: "Candle",
    icon: "♧",
    duration: 2200,
    priority: 0,
  },
  prayer_5: {
    coins: 5,
    label: "Kneel & Pray",
    short: "Prayer",
    icon: "♧",
    duration: 2500,
    priority: 0,
  },
  rose_5: {
    coins: 5,
    label: "Offer a White Rose",
    short: "White Rose",
    icon: "❀",
    duration: 2200,
    priority: 0,
  },
  bell_10: {
    coins: 10,
    label: "Ring the Bell",
    short: "Bell",
    icon: "♧",
    duration: 2500,
    priority: 1,
  },
  altar_100: {
    coins: 100,
    label: "Special Prayer at Altar",
    short: "Altar Prayer",
    icon: "✧",
    duration: 6500,
    priority: 2,
  },
  ceremony_500: {
    coins: 500,
    label: "Grand Ceremony Moment",
    short: "Grand Ceremony",
    icon: "✦",
    duration: 7000,
    priority: 3,
  },
} as const;
export type GiftKey = keyof typeof GIFTS;
export const giftKeys = Object.keys(GIFTS) as GiftKey[];
export type CommentEvent = {
  type: "comment";
  eventId: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
};
export type GiftEvent = {
  type: "gift";
  eventId: string;
  userId: string;
  username: string;
  giftKey: GiftKey;
  coinValue: number;
  repeatCount: number;
  timestamp: number;
};
const id = z.string().trim().min(1).max(80);
export const identitySchema = z.object({
  userId: id,
  username: z.string().trim().min(1).max(32),
  eventId: id.optional(),
});
export const commentSchema = identitySchema.extend({
  text: z.string().max(200),
});
export const giftSchema = identitySchema.extend({
  giftKey: z.enum(giftKeys),
  repeatCount: z.number().int().min(1).max(20).default(1),
});
export const controlSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("reset") }),
  z.object({
    action: z.enum(["npcs", "muted", "camera"]),
    enabled: z.boolean(),
  }),
]);
export const isAmen = (text: string) => /^amen[.!?]*$/i.test(text.trim());
export const LIMITS = {
  viewers: 100,
  seats: 64,
  npc: 16,
  queue: 128,
  dedup: 4096,
  ttl: 600_000,
  supporters: 256,
} as const;
export type Vec3 = [number, number, number];
export type AttendeeState =
  | "spawning"
  | "walking_to_seat"
  | "seated"
  | "praying_idle"
  | "kneeling"
  | "gift_reacting"
  | "leaving";
export interface Attendee {
  userId: string;
  username: string;
  seat: number | null;
  overflow: number | null;
  joinedAt: number;
  lastSeen: number;
  walkAt: number;
  leaveAt?: number;
  variant: number;
}
export interface ActiveGift {
  presentation?: boolean;
  event: GiftEvent;
  startedAt: number;
  endsAt: number;
}
export interface Snapshot {
  now: number;
  revision: number;
  attendees: Attendee[];
  active: ActiveGift | null;
  queueLength: number;
  accepted: number;
  completed: number;
  rejected: number;
  candles: number;
  roses: number;
  supporters: { userId: string; username: string; coins: number }[];
  settings: { npcs: boolean; muted: boolean; camera: boolean };
  toast: { text: string; until: number } | null;
}
export const seatPosition = (seat: number): Vec3 => {
  const row = Math.floor(seat / 8),
    side = seat % 8 < 4 ? -1 : 1,
    col = seat % 4;
  return [side * (2 + col * 0.86), 0.68, -6.8 + row * 1.7];
};
export const overflowPosition = (index: number): Vec3 => {
  const col = index % 8;
  return [
    (col % 2 === 0 ? -1 : 1) * (0.625 + Math.floor(col / 2) * 1.25),
    0,
    8.2 + Math.floor(index / 8) * 1.25,
  ];
};
export const destination = (a: Attendee): Vec3 =>
  a.seat === null ? overflowPosition(a.overflow ?? 0) : seatPosition(a.seat);
export function arrivalPath(a: Attendee): Vec3[] {
  const end = destination(a);
  if (a.seat === null) {
    const lane = Math.sign(end[0]) * 5.8;
    return [
      [lane, 0, 17.3],
      [lane, 0, end[2] + 0.625],
      [end[0], 0, end[2] + 0.625],
      [end[0], 0, end[2]],
    ];
  }
  const lane = Math.sign(end[0]) * 0.75;
  return [
    [lane, 0, 14],
    [lane, 0, end[2] - 0.65],
    [end[0], 0, end[2] - 0.65],
    [end[0], 0, end[2]],
  ];
}
export function departurePath(a: Attendee): Vec3[] {
  const end = destination(a),
    lane = Math.sign(end[0]) * 5.8;
  if (a.seat === null) return [...arrivalPath(a)].reverse();
  return [
    [end[0], 0, end[2]],
    [end[0], 0, end[2] - 0.65],
    [lane, 0, end[2] - 0.65],
    [lane, 0, 17.3],
  ];
}
export function pathLength(points: Vec3[]): number {
  return points
    .slice(1)
    .reduce(
      (n, p, i) => n + Math.hypot(p[0] - points[i][0], p[2] - points[i][2]),
      0,
    );
}
export function alongPath(points: Vec3[], progress: number): Vec3 {
  let distance = Math.max(0, Math.min(1, progress)) * pathLength(points);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      len = Math.hypot(b[0] - a[0], b[2] - a[2]);
    if (distance <= len)
      return [
        a[0] + ((b[0] - a[0]) * distance) / Math.max(0.001, len),
        0,
        a[2] + ((b[2] - a[2]) * distance) / Math.max(0.001, len),
      ];
    distance -= len;
  }
  return [...points.at(-1)!];
}
export function attendeePose(
  a: Attendee,
  now: number,
  active: ActiveGift | null,
): { position: Vec3; state: AttendeeState; visible: boolean } {
  const route = arrivalPath(a),
    duration = (pathLength(route) / 2.4) * 1000;
  if (a.leaveAt !== undefined && now >= a.leaveAt) {
    const exit = departurePath(a);
    const p = (now - a.leaveAt) / ((pathLength(exit) / 2.4) * 1000);
    return {
      position: alongPath(exit, p),
      state: "leaving",
      visible: p < 1 && p >= 0,
    };
  }
  if (
    active?.event.userId === a.userId &&
    (active.event.giftKey === "prayer_5" ||
      active.event.giftKey === "altar_100") &&
    (now < a.walkAt + duration || a.seat === null || active.presentation)
  ) {
    const p = (now - active.startedAt) / (active.endsAt - active.startedAt);
    const altar = active.event.giftKey === "altar_100";
    const travel = altar
      ? p < 0.2
        ? p / 0.2
        : p > 0.8
          ? (1 - p) / 0.2
          : 1
      : 1;
    return {
      position: [0, 0, -6.8 - travel * 2.2],
      state: altar && (p < 0.2 || p > 0.8) ? "gift_reacting" : "kneeling",
      visible: true,
    };
  }
  if (now < a.walkAt)
    return { position: route[0], state: "spawning", visible: false };
  const walk = (now - a.walkAt) / duration;
  if (walk < 1)
    return {
      position: alongPath(route, walk),
      state: "walking_to_seat",
      visible: true,
    };
  let position = destination(a),
    state: AttendeeState = a.seat === null ? "praying_idle" : "seated";
  if (active) {
    const key = active.event.giftKey,
      selected = active.event.userId === a.userId;
    if (selected && key === "altar_100") {
      const end = destination(a),
        lane = 0;
      const altarRoute: Vec3[] =
        a.seat === null
          ? [
              [end[0], 0, end[2]],
              [lane, 0, 7.8],
              [lane, 0, -9],
              [0, 0, -9],
            ]
          : [
              [end[0], 0, end[2]],
              [end[0], 0, end[2] - 0.65],
              [lane, 0, end[2] - 0.65],
              [lane, 0, -9],
              [0, 0, -9],
            ];
      const p = (now - active.startedAt) / (active.endsAt - active.startedAt);
      position = alongPath(
        altarRoute,
        p < 0.35 ? p / 0.35 : p > 0.65 ? (1 - p) / 0.35 : 1,
      );
      state = p >= 0.35 && p <= 0.65 ? "kneeling" : "gift_reacting";
    } else if ((selected && key === "prayer_5") || key === "ceremony_500")
      state = "kneeling";
    else if (key === "bell_10" || selected) state = "gift_reacting";
  }
  return { position, state, visible: true };
}
