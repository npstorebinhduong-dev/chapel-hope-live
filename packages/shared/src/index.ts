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
    duration: 9500,
    priority: 2,
  },
  ceremony_500: {
    coins: 500,
    label: "Grand Ceremony Moment",
    short: "Grand Ceremony",
    icon: "✦",
    duration: 11000,
    priority: 3,
  },
} as const;
export type GiftKey = keyof typeof GIFTS;
export const giftKeys = Object.keys(GIFTS) as GiftKey[];
export type CommentEvent = {
  source?: "mock" | "tikfinity";
  type: "comment";
  eventId: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
};
export type GiftEvent = {
  source?: "mock" | "tikfinity";
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
export type AvatarGender = "male" | "female";
export const parseComment = (text: string): "amen" | AvatarGender | "other" => {
  const value = text.trim();
  return value === "1"
    ? "male"
    : value === "2"
      ? "female"
      : isAmen(value)
        ? "amen"
        : "other";
};
export const isAmen = (text: string) => /^amen[.!?]*$/i.test(text.trim());
export const LIMITS = {
  insideStanding: 8,
  seats: 64,
  npc: 16,
  queue: 128,
  dedup: 4096,
  ttl: 600_000,
  supporters: 256,
  preferences: 256,
} as const;
export type Vec3 = [number, number, number];
export type AttendeeState =
  | "waiting"
  | "called_by_gift"
  | "walking_from_queue"
  | "walking_in_aisle"
  | "returning"
  | "inside_standing_wait"
  | "spawning"
  | "walking_to_seat"
  | "seated"
  | "praying_idle"
  | "kneeling"
  | "gift_reacting"
  | "leaving";
export interface Journey {
  kind: "gift" | "seat" | "leave";
  approach: Vec3[];
  departure: Vec3[];
  startAt: number;
  entryAt?: number;
  actionAt: number;
  actionUntil: number;
  departAt?: number;
  endAt: number;
  giftKey?: GiftKey;
}
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
  admission?: "waiting" | "invited" | "inside";
  gender?: AvatarGender;
  pendingGender?: AvatarGender;
  waitingSlot?: number | null;
  waitingTarget?: Vec3;
  queueMotion?: { from: Vec3; to: Vec3; startAt: number; endAt: number };
  journey?: Journey;
  transient?: boolean;
}
export interface ActiveGift {
  presentation?: boolean;
  event: GiftEvent;
  startedAt: number;
  endsAt: number;
  dispatchedAt?: number;
  returnEndsAt?: number;
  effectApplied?: boolean;
}
export interface AudioCommand {
  id: string;
  at: number;
  action: "stopVoice" | "resumeVoice" | "testAll" | "stopAll" | "sample";
  locale?: "en" | "vi" | "it";
}
export interface Snapshot {
  audioCommand?: AudioCommand | null;
  community?: import("./engagement.ts").CommunitySnapshot;
  totalAttendees?: number;
  compactWaiting?: number;
  capacityRefusals?: number;
  hiddenWaiting?: number;
  production?: import("./production.ts").ProductionSettings;
  source?: import("./production.ts").SourceStatus;
  now: number;
  revision: number;
  attendees: Attendee[];
  active: ActiveGift | null;
  queueLength: number;
  waitingCount: number;
  insideCount: number;
  enteringCount: number;
  seatedCount: number;
  giftPending: number;
  giftProcessed: number;
  ignoredDuplicates: number;
  avatarVariantByUser: Record<
    string,
    { gender: AvatarGender; variant: number }
  >;
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
    (col % 2 === 0 ? -1 : 1) * (2 + Math.floor(col / 2) * 0.86),
    0,
    7.8 + Math.floor(index / 8) * 1.25,
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
export {
  attendeePose,
  isAttendeeMoving,
  waitingPosition,
  waitingPose,
  walkDuration,
  giftApproach,
  giftReturn,
  queueExitPath,
  easedAlongPath,
  WALK_SPEED,
} from "./motion.ts";
