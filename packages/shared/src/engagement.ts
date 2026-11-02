import { z } from "zod";
import type { GiftKey } from "./index.ts";
export const engagementSettingsSchema = z.object({
  heartGoal: z
    .union([z.literal(250), z.literal(500), z.literal(1000), z.literal(2000)])
    .default(1000),
  shareGoal: z.union([z.literal(5), z.literal(10), z.literal(20)]).default(10),
  heartsEnabled: z.boolean().default(true),
  sharesEnabled: z.boolean().default(true),
  idleEnabled: z.boolean().default(true),
  communityEnabled: z.boolean().default(true),
  promptsEnabled: z.boolean().default(true),
  quiet: z.boolean().default(false),
  cooldown: z.number().int().min(90).max(600).default(90),
  inactivity: z.number().int().min(45).max(120).default(60),
  promptVariant: z.enum(["A", "B"]).default("A"),
  renderLimit: z.number().int().min(100).max(2000).default(1000),
  memoryLimit: z.number().int().min(1000).max(20000).default(5000),
});
export type EngagementSettings = z.infer<typeof engagementSettingsSchema>;
export const defaultEngagement = () => engagementSettingsSchema.parse({});
export const engagementEventSchema = z.object({
  type: z.enum(["like", "share", "follow"]),
  eventId: z.string().min(1).max(100),
  userId: z.string().max(80).default(""),
  username: z.string().max(32).default(""),
  count: z.number().int().min(1).max(10000).default(1),
  timestamp: z.number().finite(),
  source: z.enum(["mock", "tikfinity"]),
});
export type EngagementEvent = z.infer<typeof engagementEventSchema>;
export type PromptKind = "amen" | "like" | "share";
export type NoticeKind = PromptKind | "follow" | "heart" | "community";
export interface EngagementNotice {
  id: string;
  kind: NoticeKind;
  at: number;
  name: string;
  invitation: boolean;
  variant: number;
}
export type ReactionKind = "heart" | "share" | "flock" | "community";
export interface CommunityReaction {
  id: string;
  kind: ReactionKind;
  startedAt: number;
  endsAt: number;
}
export class EngagementPromptScheduler {
  history: number[] = [];
  last = -Infinity;
  turn = 0;
  next(
    now: number,
    settings: EngagementSettings,
    input: {
      lastActivity: number;
      lastShare: number;
      blocked: boolean;
      ready: boolean;
    },
    manual = false,
  ): PromptKind | null {
    this.history = this.history.filter((t) => now - t < 600000);
    if (
      !settings.promptsEnabled ||
      settings.quiet ||
      input.blocked ||
      !input.ready ||
      now - this.last < settings.cooldown * 1000 ||
      this.history.length >= 3
    )
      return null;
    if (!manual && now - input.lastActivity < settings.inactivity * 1000)
      return null;
    const kind: PromptKind =
      now - input.lastShare >= 120000 && this.turn % 3 === 2
        ? "share"
        : this.turn % 2
          ? "like"
          : "amen";
    this.history.push(now);
    this.last = now;
    this.turn++;
    return kind;
  }
}
let communityGeneration = 0;
export class CommunityEngine {
  private generation = ++communityGeneration;
  settings = defaultEngagement();
  hearts = 0;
  shares = 0;
  follows = 0;
  comments = 0;
  amen = 0;
  giftCounts: Partial<Record<GiftKey, number>> = {};
  duplicates = 0;
  rejected = 0;
  heartMilestones = 0;
  shareMilestones = 0;
  reaction: CommunityReaction | null = null;
  notice: EngagementNotice | null = null;
  scheduler = new EngagementPromptScheduler();
  lastActivity = Date.now();
  lastShare = this.lastActivity;
  startedAt = this.lastActivity;
  private lastCommunity = this.lastActivity;
  private serial = 0;
  private pending = new Set<ReactionKind>();
  private seen = new Map<string, number>();
  private lastReaction = new Map<ReactionKind, number>();
  private lastNotice = -Infinity;
  private minuteBuckets = new Map<
    number,
    { hearts: number; shares: number; gifts: number; amen: number }
  >();
  experiments: {
    at: number;
    variant: string;
    kind: PromptKind;
    before: { hearts: number; shares: number; amen: number };
    after: { hearts: number; shares: number; amen: number } | null;
  }[] = [];
  setSettings(settings: EngagementSettings) {
    this.settings = settings;
  }
  record(kind: "comment" | "amen" | "gift", now: number, key?: GiftKey) {
    this.lastActivity = now;
    if (kind === "comment") this.comments++;
    if (kind === "amen") {
      this.amen++;
      this.bucket(now).amen++;
      this.say("amen", now);
    }
    if (kind === "gift") {
      this.bucket(now).gifts++;
      if (key) this.giftCounts[key] = (this.giftCounts[key] ?? 0) + 1;
    }
  }
  private bucket(now: number) {
    const minute = Math.floor(now / 60000);
    for (const k of this.minuteBuckets.keys())
      if (minute - k > 10) this.minuteBuckets.delete(k);
    let b = this.minuteBuckets.get(minute);
    if (!b) {
      b = { hearts: 0, shares: 0, gifts: 0, amen: 0 };
      this.minuteBuckets.set(minute, b);
    }
    return b;
  }
  private say(kind: NoticeKind, now: number, name = "", invitation = false) {
    if (!invitation && now - this.lastNotice < 20000) return;
    this.lastNotice = now;
    this.notice = {
      id: `community-${this.generation}-${++this.serial}`,
      kind,
      at: now,
      name,
      invitation,
      variant: this.serial % 4,
    };
  }
  accept(event: EngagementEvent, now = event.timestamp) {
    if (!engagementEventSchema.safeParse(event).success) {
      this.rejected++;
      return { status: "invalid_engagement" };
    }
    for (const [id, t] of this.seen) if (now - t > 600000) this.seen.delete(id);
    if (this.seen.has(event.eventId)) {
      this.duplicates++;
      return { status: "duplicate" };
    }
    this.seen.set(event.eventId, now);
    while (this.seen.size > 8192)
      this.seen.delete(this.seen.keys().next().value!);
    this.lastActivity = now;
    if (event.type === "like") {
      const before = Math.floor(this.hearts / this.settings.heartGoal);
      this.hearts += event.count;
      this.bucket(now).hearts += event.count;
      const crossed =
        Math.floor(this.hearts / this.settings.heartGoal) - before;
      this.heartMilestones += crossed;
      if (crossed && this.settings.heartsEnabled) this.pending.add("heart");
      if (!crossed) this.say("like", now);
    } else if (event.type === "share") {
      const before = Math.floor(this.shares / this.settings.shareGoal);
      this.shares += event.count;
      this.lastShare = now;
      this.bucket(now).shares += event.count;
      const crossed =
        Math.floor(this.shares / this.settings.shareGoal) - before;
      this.shareMilestones += crossed;
      if (this.settings.sharesEnabled) {
        if (crossed) {
          this.pending.delete("share");
          this.pending.add("flock");
        } else if (!this.pending.has("flock")) this.pending.add("share");
      }
      // A single ephemeral acknowledgement coalesces rapid shares without losing totals.
      this.say("share", now, event.username);
    } else {
      this.follows += event.count;
      this.say("follow", now, event.username);
    }
    return { status: "accepted" };
  }
  tick(
    now: number,
    blocked: boolean,
    ready: boolean,
    speechBusy = false,
    manual = false,
  ) {
    this.bucket(now);
    if (this.reaction && now >= this.reaction.endsAt) this.reaction = null;
    if (
      this.reaction &&
      ((this.reaction.kind === "heart" && !this.settings.heartsEnabled) ||
        (["share", "flock"].includes(this.reaction.kind) &&
          !this.settings.sharesEnabled))
    )
      this.reaction = null;
    if (!this.settings.heartsEnabled) this.pending.delete("heart");
    if (!this.settings.sharesEnabled) {
      this.pending.delete("share");
      this.pending.delete("flock");
    }
    if (
      this.settings.communityEnabled &&
      now - this.lastCommunity >= 300000 &&
      now - this.lastActivity < 300000 &&
      this.amen + this.hearts + this.shares > 0
    )
      this.pending.add("community");
    if (!this.settings.communityEnabled) this.pending.delete("community");
    if (!blocked && !this.reaction) {
      for (const kind of ["flock", "heart", "share", "community"] as const) {
        const cooldown =
          kind === "heart" ? 20000 : kind === "community" ? 300000 : 2000;
        if (
          !this.pending.has(kind) ||
          now - (this.lastReaction.get(kind) ?? -Infinity) < cooldown
        )
          continue;
        this.pending.delete(kind);
        this.lastReaction.set(kind, now);
        this.reaction = {
          id: `reaction-${this.generation}-${++this.serial}`,
          kind,
          startedAt: now,
          endsAt: now + (kind === "share" ? 5000 : 7000),
        };
        if (kind === "community") {
          this.lastCommunity = now;
          this.say("community", now);
        }
        if (kind === "heart") this.say("heart", now);
        break;
      }
    }
    const kind = this.scheduler.next(
      now,
      this.settings,
      {
        lastActivity: this.lastActivity,
        lastShare: this.lastShare,
        blocked: blocked || speechBusy || !!this.reaction,
        ready,
      },
      manual,
    );
    if (kind) {
      this.say(kind, now, "", true);
      this.experiments.push({
        at: now,
        variant: this.settings.promptVariant,
        kind,
        before: { hearts: this.hearts, shares: this.shares, amen: this.amen },
        after: null,
      });
      this.experiments = this.experiments.slice(-20);
    }
    for (const e of this.experiments)
      if (e.after === null && now - e.at >= 60000)
        e.after = {
          hearts: this.hearts - e.before.hearts,
          shares: this.shares - e.before.shares,
          amen: this.amen - e.before.amen,
        };
  }
  snapshot(now: number) {
    const b = this.minuteBuckets.get(Math.floor(now / 60000)) ?? {
      hearts: 0,
      shares: 0,
      gifts: 0,
      amen: 0,
    };
    return {
      hearts: this.hearts,
      shares: this.shares,
      follows: this.follows,
      comments: this.comments,
      amen: this.amen,
      giftCounts: { ...this.giftCounts },
      heartMilestones: this.heartMilestones,
      shareMilestones: this.shareMilestones,
      progress: this.hearts % this.settings.heartGoal,
      goal: this.settings.heartGoal,
      reaction: this.reaction,
      notice: this.notice && now - this.notice.at < 15000 ? this.notice : null,
      pendingEffects: this.pending.size,
      invitations: this.scheduler.history.filter((t) => now - t < 600000)
        .length,
      duplicates: this.duplicates,
      rejected: this.rejected,
      currentMinute: { ...b },
      experiments: this.experiments,
      retention: null,
      uniqueViewers: null,
    };
  }
}
export type CommunitySnapshot = ReturnType<CommunityEngine["snapshot"]>;
