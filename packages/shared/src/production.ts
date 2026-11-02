import { z } from "zod";
import { engagementSettingsSchema } from "./engagement.ts";
import { giftKeys } from "./index.ts";
export const locales = ["en", "vi", "it"] as const;
export type Locale = (typeof locales)[number];
export const mixSchema = z.object({
  master: z.number().min(0).max(1),
  music: z.number().min(0).max(1),
  ambient: z.number().min(0).max(1),
  sfx: z.number().min(0).max(1),
  voice: z.number().min(0).max(1),
});
export const productionSchema = z.object({
  locale: z.enum(locales),
  thanksEnabled: z.boolean().default(true),
  musicEnabled: z.boolean().default(true),
  musicTrack: z
    .enum(["playlist", "peace", "hope", "evening"])
    .default("playlist"),
  engagement: engagementSettingsSchema.default(() =>
    engagementSettingsSchema.parse({}),
  ),
  guide: z
    .object({
      enabled: z.boolean().default(true),
      opacity: z.number().min(0.6).max(1).default(0.92),
      scale: z.number().min(0.85).max(1.1).default(1),
      position: z.enum(["upper", "compact"]).default("upper"),
      cycle: z.number().min(8).max(12).default(10),
      preview: z.enum(["auto", "join", "social", "gifts"]).default("auto"),
    })
    .default(() => ({
      enabled: true,
      opacity: 0.92,
      scale: 1,
      position: "upper" as const,
      cycle: 10,
      preview: "auto" as const,
    })),
  rate: z.number().min(0.85).max(1.1),
  voiceEnabled: z.boolean(),
  bannerEnabled: z.boolean(),
  readNames: z.boolean(),
  voiceURI: z.object({
    en: z.string().max(300),
    vi: z.string().max(300),
    it: z.string().max(300),
  }),
  provider: z.enum(["browser", "recorded"]),
  mix: mixSchema,
});
export type ProductionSettings = z.infer<typeof productionSchema>;
export const defaultProduction = (): ProductionSettings =>
  productionSchema.parse({
    locale: "en",
    rate: 0.95,
    voiceEnabled: true,
    bannerEnabled: true,
    readNames: false,
    voiceURI: { en: "", vi: "", it: "" },
    provider: "browser",
    mix: { master: 1, music: 0.22, ambient: 0.14, sfx: 0.45, voice: 0.85 },
  });
export const mappingSchema = z
  .record(z.string().regex(/^\d{1,20}$/), z.enum(giftKeys))
  .refine((m) => Object.keys(m).length <= 100, "Maximum 100 gift mappings");
export const sourceConfigSchema = z.object({
  mode: z.enum(["mock", "tikfinity"]),
  endpoint: z
    .string()
    .url()
    .refine((value) => {
      try {
        const u = new URL(value);
        return (
          u.protocol === "ws:" &&
          ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname) &&
          !u.username &&
          !u.password &&
          !u.search &&
          !u.hash
        );
      } catch {
        return false;
      }
    }, "TikFinity must use a loopback ws:// endpoint"),
  mapping: mappingSchema,
});
export type SourceConfig = z.infer<typeof sourceConfigSchema>;
export interface SourceStatus {
  likeReceived: boolean;
  shareReceived: boolean;
  followReceived: boolean;
  unverifiedLikes: number;
  unverifiedShares: number;
  observed: { giftId: string; name: string; coins: number | null }[];
  log: { at: number; event: string }[];
  mode: "mock" | "tikfinity";
  connection: "disconnected" | "connecting" | "connected" | "reconnecting";
  endpoint: string;
  mapping: Record<string, (typeof giftKeys)[number]>;
  received: number;
  ignored: number;
  duplicates: number;
  disconnects: number;
  rejected: number;
  lastAt: number | null;
  lastEvent: string;
  error: string;
  unknown: { giftId: string; name: string; coins: number | null }[];
}
export const defaultSource = (): SourceStatus => ({
  likeReceived: false,
  shareReceived: false,
  followReceived: false,
  unverifiedLikes: 0,
  unverifiedShares: 0,
  observed: [],
  log: [],
  mode: "mock",
  connection: "disconnected",
  endpoint: "ws://127.0.0.1:21213/",
  mapping: {},
  received: 0,
  ignored: 0,
  duplicates: 0,
  disconnects: 0,
  rejected: 0,
  lastAt: null,
  lastEvent: "",
  error: "",
  unknown: [],
});
export function safeDisplayName(value: unknown) {
  return (
    String(value ?? "Guest")
      .normalize("NFKC")
      .replace(/[\p{Cc}\p{Cf}<>]/gu, "")
      .replace(/https?:\/\/\S+|www\.\S+/gi, "")
      .trim()
      .slice(0, 32) || "Guest"
  );
}
// Names are opt-in speech only: conservative whitelist; never feed arbitrary chat into TTS.
export function spokenName(value: string) {
  const n = safeDisplayName(value);
  return /^[\p{L}][\p{L} '\-]{0,23}$/u.test(n) &&
    !/fuck|shit|bitch|địt|đụ|cazzo|merda/i.test(n)
    ? n
    : "";
}
