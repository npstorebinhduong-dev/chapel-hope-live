import type { EngagementEvent } from "../../../packages/shared/src/engagement.ts";
import { createHash } from "node:crypto";
import { WebSocket } from "ws";
import { GIFTS, type CommentEvent, type GiftEvent } from "@chapel/shared";
import {
  defaultSource,
  safeDisplayName,
  sourceConfigSchema,
  type SourceConfig,
  type SourceStatus,
} from "../../../packages/shared/src/production.ts";
const hash = (s: string) =>
  createHash("sha256").update(s).digest("hex").slice(0, 40);
const scalar = (v: unknown): string =>
  typeof v === "string" || (typeof v === "number" && Number.isSafeInteger(v))
    ? String(v)
    : "";
/** Local Desktop Event API. No TikTok login, scraping or coin-based routing. */
export class TikFinityEventAdapter {
  status: SourceStatus = defaultSource();
  private socket: WebSocket | null = null;
  private retry: ReturnType<typeof setTimeout> | undefined;
  private heartbeat: ReturnType<typeof setInterval> | undefined;
  private attempt = 0;
  private generation = 0;
  private alive = true;
  private seen = new Map<string, number>();
  private likeTotals = new Map<string, number>();
  private socialRecent = new Map<string, number>();
  constructor(
    private receive: (e: CommentEvent | GiftEvent | EngagementEvent) => {
      status: string;
    },
    private changed: () => void = () => {},
    private retryBase = 1000,
  ) {}
  configure(config: SourceConfig) {
    sourceConfigSchema.parse(config);
    if (
      config.mode === this.status.mode &&
      config.endpoint === this.status.endpoint
    ) {
      this.status.mapping = config.mapping;
      this.status.unknown = this.status.unknown.filter(
        (g) => !config.mapping[g.giftId],
      );
      this.changed();
      return;
    }
    this.disconnect();
    this.status = {
      ...this.status,
      ...config,
      connection: "disconnected",
      error: "",
    };
    this.changed();
  }
  connect() {
    if (this.status.mode !== "tikfinity" || this.socket || this.retry) return;
    const generation = this.generation;
    this.status.connection = this.attempt ? "reconnecting" : "connecting";
    this.changed();
    const ws = (this.socket = new WebSocket(this.status.endpoint, {
      handshakeTimeout: 5000,
      maxPayload: 65536,
    }));
    this.alive = true;
    ws.on("open", () => {
      if (generation !== this.generation) return;
      this.attempt = 0;
      this.status.connection = "connected";
      this.log("socket connected");
      this.status.error = "";
      this.changed();
      this.heartbeat = setInterval(() => {
        if (!this.alive) {
          ws.terminate();
          return;
        }
        this.alive = false;
        ws.ping();
      }, 15000);
    });
    ws.on("pong", () => {
      this.alive = true;
    });
    ws.on("message", (raw) => {
      if (generation === this.generation) {
        this.alive = true;
        this.ingest(raw.toString());
      }
    });
    ws.on("error", () => {
      this.status.error =
        "TikFinity socket unavailable. Start Desktop on this PC and retry.";
      this.changed();
    });
    ws.on("close", () => {
      clearInterval(this.heartbeat);
      if (generation !== this.generation) return;
      this.socket = null;
      this.status.disconnects++;
      this.log("socket disconnected; reconnect scheduled");
      this.status.connection = "reconnecting";
      this.changed();
      const delay = Math.min(
        30000,
        this.retryBase * 2 ** Math.min(this.attempt++, 5),
      );
      this.retry = setTimeout(() => {
        this.retry = undefined;
        this.connect();
      }, delay);
    });
  }
  disconnect() {
    this.generation++;
    clearTimeout(this.retry);
    this.retry = undefined;
    clearInterval(this.heartbeat);
    const ws = this.socket;
    this.socket = null;
    ws?.terminate();
    this.status.connection = "disconnected";
    this.attempt = 0;
    this.changed();
  }
  clearSession() {
    this.seen.clear();
    this.likeTotals.clear();
    this.socialRecent.clear();
    this.status = {
      ...defaultSource(),
      mode: this.status.mode,
      endpoint: this.status.endpoint,
      mapping: this.status.mapping,
      connection: this.status.connection,
    };
  }
  private log(event: string, at = Date.now()) {
    this.status.log.push({ at, event });
    this.status.log = this.status.log.slice(-40);
  }
  private likeEpoch = 0;
  private social(
    kind: "like" | "share" | "follow",
    d: any,
    wrapperId: unknown,
    now: number,
    ignore: (reason: string) => void,
  ) {
    const rawUser = scalar(
      d.userId ?? d.user?.userId ?? d.uniqueId ?? d.user?.uniqueId,
    );
    const tx = scalar(
      d.msgId ?? d.msg_id ?? d.eventId ?? wrapperId ?? d.createTime,
    );
    const total = d.totalLikeCount ?? d.totalLikes;
    const batch = d.likeCount ?? d.count;
    if (rawUser.length > 200 || tx.length > 200)
      return ignore("Invalid engagement identity");
    const transactionKey = tx
      ? `social-tx:${kind}:${hash(rawUser + ":" + tx)}`
      : "";
    if (transactionKey && this.seen.has(transactionKey)) {
      this.status.duplicates++;
      return ignore("SOCIAL DUPLICATE");
    }
    let count = 1,
      identity = tx;
    if (kind === "like") {
      if (total !== undefined) {
        if (!Number.isSafeInteger(total) || total < 0) {
          this.status.unverifiedLikes++;
          return ignore("LIKE COUNT UNVERIFIED");
        }
        const scope = "room"; // totalLikeCount is the room cumulative counter, not viewer count.
        const previous = this.likeTotals.get(scope);
        this.likeTotals.set(scope, total);
        if (previous === undefined) return ignore("LIKE BASELINE RECORDED");
        if (total < previous) {
          this.likeEpoch++;
          this.status.unverifiedLikes++;
          return ignore("LIKE COUNTER RESET");
        }
        count = total - previous;
        identity = `total:${this.likeEpoch}:${total}`;
        if (count === 0) {
          this.status.duplicates++;
          return ignore("LIKE DUPLICATE");
        }
      } else {
        if (!Number.isSafeInteger(batch) || batch < 1 || !tx) {
          this.status.unverifiedLikes++;
          return ignore("LIKE COUNT UNVERIFIED");
        }
        count = batch;
      }
      if (count > 10000) {
        this.status.unverifiedLikes++;
        return ignore("LIKE JUMP UNVERIFIED");
      }
    } else {
      if (!rawUser) {
        this.status.unverifiedShares++;
        return ignore("SHARE/FOLLOW ID UNVERIFIED");
      }
      if (!identity) {
        const key = kind + ":" + hash(rawUser),
          last = this.socialRecent.get(key);
        if (last !== undefined && now - last < 10000) {
          this.status.duplicates++;
          return ignore("SOCIAL DUPLICATE WINDOW");
        }
        this.socialRecent.set(key, now);
        while (this.socialRecent.size > 2048)
          this.socialRecent.delete(this.socialRecent.keys().next().value!);
        identity = `window:${now}`;
      }
      if (
        d.count !== undefined &&
        (!Number.isSafeInteger(d.count) || d.count !== 1)
      )
        return ignore("SOCIAL COUNT UNVERIFIED");
    }
    const eventId =
      `tf-${kind}-` +
      hash(
        `${kind === "like" && total !== undefined ? "room" : rawUser}:${identity}`,
      );
    for (const [id, t] of this.seen) if (now - t > 600000) this.seen.delete(id);
    if (this.seen.has(eventId)) {
      this.status.duplicates++;
      return ignore("SOCIAL DUPLICATE");
    }
    const result = this.receive({
      type: kind,
      eventId,
      userId: rawUser ? "tf-" + hash(rawUser) : "",
      username: safeDisplayName(d.nickname ?? d.user?.nickname ?? ""),
      source: "tikfinity",
      count,
      timestamp: now,
    });
    if (result.status === "accepted") {
      if (transactionKey) this.seen.set(transactionKey, now);
      this.seen.set(eventId, now);
      while (this.seen.size > 4096)
        this.seen.delete(this.seen.keys().next().value!);
      if (kind === "like") this.status.likeReceived = true;
      if (kind === "share") this.status.shareReceived = true;
      if (kind === "follow") this.status.followReceived = true;
    }
    this.status.lastEvent = `${kind} +${count} · ${result.status}`;
    this.log(this.status.lastEvent, now);
    this.changed();
  }
  ingest(raw: string, now = Date.now()) {
    if (this.status.mode !== "tikfinity") return;
    this.status.received++;
    this.status.lastAt = now;
    const ignore = (reason: string) => {
      this.status.ignored++;
      this.status.lastEvent = reason;
      this.log(reason, now);
      this.changed();
    };
    let m: any;
    try {
      if (raw.length > 65536) throw Error();
      m = JSON.parse(raw);
    } catch {
      return ignore("Malformed JSON");
    }
    if (
      !m ||
      !["chat", "gift", "like", "share", "follow"].includes(
        String(m.event).toLowerCase(),
      ) ||
      !m.data ||
      typeof m.data !== "object"
    )
      return ignore("Unsupported event");
    m.event = String(m.event).toLowerCase();
    if (["like", "share", "follow"].includes(m.event))
      return this.social(m.event, m.data, m.id, now, ignore);
    const d = m.data,
      rawUser = scalar(
        d.userId || d.user?.userId || d.uniqueId || d.user?.uniqueId,
      );
    if (!rawUser || rawUser.length > 200)
      return ignore("Missing stable sender ID");
    const userId = "tf-" + hash(rawUser),
      username = safeDisplayName(d.nickname ?? d.user?.nickname ?? d.uniqueId);
    if (m.event === "chat") {
      if (typeof d.comment !== "string" || d.comment.length > 200)
        return ignore("Invalid chat");
      const eventId =
        "tf-chat-" +
        hash(
          scalar(d.msgId || d.msg_id || m.id) ||
            `${rawUser}:${now}:${d.comment}`,
        );
      this.receive({
        type: "comment",
        source: "tikfinity",
        userId,
        username,
        eventId,
        text: d.comment,
        timestamp: now,
      });
      this.status.lastEvent =
        "chat · " +
        (["AMEN", "1", "2"].includes(d.comment.trim().toUpperCase())
          ? d.comment.trim().toUpperCase()
          : "other");
      this.log(this.status.lastEvent, now);
      this.changed();
      return;
    }
    const giftId = scalar(d.giftId ?? d.gift?.giftId ?? d.gift?.id);
    if (!/^\d{1,20}$/.test(giftId)) return ignore("Missing gift ID");
    const metadata = {
      giftId,
      name: safeDisplayName(d.giftName ?? d.gift?.name),
      coins: Number.isFinite(d.diamondCount) ? d.diamondCount : null,
    };
    this.status.observed = this.status.observed.filter(
      (g) => g.giftId !== giftId,
    );
    this.status.observed.push(metadata);
    this.status.observed = this.status.observed.slice(-30);
    const key = this.status.mapping[giftId];
    if (!key) {
      this.status.unknown = this.status.unknown.filter(
        (g) => g.giftId !== giftId,
      );
      this.status.unknown.push({
        giftId,
        name: safeDisplayName(d.giftName ?? d.gift?.name),
        coins: Number.isFinite(d.diamondCount) ? d.diamondCount : null,
      });
      this.status.unknown = this.status.unknown.slice(-20);
      return ignore(`Unknown Gift · ${giftId}`);
    }
    const isStreak = Number(d.giftType ?? d.gift?.giftType) === 1;
    if (
      (isStreak && d.repeatEnd !== true && d.repeatEnd !== 1) ||
      d.repeatEnd === false ||
      d.repeatEnd === 0
    )
      return ignore(`gift ${giftId} · streak progress`);
    const count = d.repeatCount ?? 1;
    if (!Number.isSafeInteger(count) || count < 1)
      return ignore("Invalid repeat count");
    // groupId identifies a streak; msgId identifies a single transaction. No guessed identity.
    const transaction =
      scalar((isStreak && d.groupId) || d.msgId || d.msg_id || m.id) ||
      (d.createTime ? `${giftId}:${scalar(d.createTime)}` : "");
    if (!transaction || transaction.length > 200)
      return ignore("Gift missing transaction ID; inspect Desktop payload");
    const eventId = "tf-gift-" + hash(`${rawUser}:${giftId}:${transaction}`);
    for (const [id, t] of this.seen) if (now - t > 600000) this.seen.delete(id);
    if (this.seen.has(eventId)) {
      this.status.duplicates++;
      return ignore(`gift ${giftId} · duplicate`);
    }
    const result = this.receive({
      type: "gift",
      source: "tikfinity",
      eventId,
      userId,
      username,
      giftKey: key,
      coinValue: GIFTS[key].coins,
      repeatCount: Math.min(20, count),
      timestamp: now,
    });
    if (result.status === "queue_full") {
      this.status.rejected++;
      this.status.error =
        "Gift queue full: event not accepted; replay with same transaction ID after draining.";
    } else {
      this.seen.set(eventId, now);
      while (this.seen.size > 4096)
        this.seen.delete(this.seen.keys().next().value!);
    }
    this.status.lastEvent = `gift ${giftId} → ${key} ×${Math.min(20, count)} · ${result.status}${count > 20 ? " (repeat capped at 20)" : ""}`;
    this.log(this.status.lastEvent, now);
    this.changed();
  }
}
