import { engagementEventSchema } from "../../../../packages/shared/src/engagement";
import { create } from "zustand";
import { ChapelEngine } from "../../../../packages/shared/src/engine";
import {
  GIFTS,
  commentSchema,
  giftSchema,
  controlSchema,
  type Snapshot,
} from "@chapel/shared";
import {
  fillGiftedSeats,
  fillAcceptance,
} from "../../../../packages/shared/src/fixtures";
import { en } from "../strings";

import {
  defaultProduction,
  defaultSource,
  productionSchema,
} from "../../../../packages/shared/src/production";
let production = defaultProduction();
let audioCommand: import("@chapel/shared").AudioCommand | null = null;
// Only bundled by build-preview: the normal app continues using HTTP/WebSocket.
const engine = new ChapelEngine();
let timer: ReturnType<typeof setInterval> | undefined;
let initialized = false;
export const useSession = create<{
  snapshot: Snapshot | null;
  liveReports: import("../store").LiveReport[];
  connected: boolean;
  receivedAt: number;
  fps: number[];
  set: (snapshot: Snapshot, fps: number[]) => void;
}>((set) => ({
  snapshot: null,
  liveReports: [],
  connected: false,
  receivedAt: 0,
  fps: [],
  set: (snapshot, fps) =>
    set({ snapshot, fps, connected: true, receivedAt: performance.now() }),
}));
function publish() {
  engine.community.setSettings(production.engagement);
  const frame = document.querySelector<HTMLElement>(
    '[data-testid="live-frame"]',
  );
  const audio = JSON.parse(frame?.dataset.audio ?? "{}");
  engine.engagementReady = audio.running && !engine.settings.muted;
  engine.speechBusy = frame?.dataset.voiceStatus === "speaking";
  useSession
    .getState()
    .set(
      {
        ...engine.snapshot(),
        production,
        audioCommand,
        source: defaultSource(),
      },
      useSession.getState().fps,
    );
}
export function connectSession() {
  if (!initialized) {
    initialized = true;
    // AMEN fixture contains ONLY waiting attendees; gifts are required for entry.
    for (let i = 0; i < 50; i++)
      engine.comment({
        type: "comment",
        eventId: `preview-${i}`,
        userId: `preview-${i}`,
        username: `Guest ${i + 1}`,
        text: "AMEN",
        timestamp: Date.now() - 120000,
      });
  }
  publish();
  clearInterval(timer);
  timer = setInterval(publish, 100);
  return () => {
    clearInterval(timer);
    useSession.setState({ connected: false });
  };
}
export const renderClock = () => {
  const s = useSession.getState();
  return s.snapshot
    ? s.snapshot.now + Math.min(performance.now() - s.receivedAt, 300)
    : Date.now();
};
export const sendMetrics = (fps: number, _renderer = "Canvas2D") =>
  useSession.setState({ fps: [fps] });
export async function post(
  endpoint: string,
  data: unknown,
): Promise<{ status?: string; joined?: number }> {
  const timestamp = Date.now();
  if (endpoint === "audio/command") {
    audioCommand = {
      ...(data as import("@chapel/shared").AudioCommand),
      id: crypto.randomUUID(),
      at: timestamp,
    };
    publish();
    return { status: "accepted" };
  }
  if (endpoint === "production") {
    production = productionSchema.parse(data);
    publish();
    return { status: "accepted" };
  }
  if (endpoint.startsWith("source"))
    throw new Error(
      "TikFinity requires the Windows production launcher; this HTML is Mock only.",
    );
  if (endpoint === "mock/engagement") {
    const parsed = engagementEventSchema.parse({
      ...(data as object),
      eventId: crypto.randomUUID(),
      timestamp,
      source: "mock",
    });
    const result = engine.engage(parsed);
    publish();
    return result;
  }
  if (endpoint === "mock/inactivity") {
    const seconds = (data as { seconds: number }).seconds;
    if (![60, 120].includes(seconds)) throw Error("invalid_inactivity");
    engine.community.lastActivity = timestamp - seconds * 1000;
    engine.community.lastShare = engine.community.lastActivity;
    publish();
    return { status: "accepted" };
  }
  if (endpoint === "engagement/invite") {
    engine.community.tick(
      timestamp,
      !!engine.active || !!engine.queue.length,
      engine.engagementReady,
      engine.speechBusy,
      true,
    );
    publish();
    return { status: "accepted" };
  }
  if (endpoint === "mock/acceptance") {
    const result = fillAcceptance(engine);
    publish();
    return result;
  }
  if (endpoint === "mock/full-seat") {
    const result = fillGiftedSeats(engine);
    publish();
    return result;
  }
  if (endpoint === "mock/comment") {
    const input = commentSchema.parse(data);
    const result = engine.comment({
      ...input,
      type: "comment",
      eventId: input.eventId ?? crypto.randomUUID(),
      timestamp,
    });
    publish();
    return result;
  }
  if (endpoint === "mock/gift") {
    const input = giftSchema.parse(data);
    const result = engine.gift({
      ...input,
      type: "gift",
      eventId: input.eventId ?? crypto.randomUUID(),
      coinValue: GIFTS[input.giftKey].coins,
      timestamp,
    });
    publish();
    if (result.status === "queue_full") throw new Error(en.queueFull);
    return result;
  }
  if (endpoint === "mock/control") {
    const input = controlSchema.parse(data);
    engine.control(
      input.action,
      "enabled" in input ? input.enabled : undefined,
    );
    publish();
    return { status: "accepted" };
  }
  if (endpoint === "mock/spam-amen") {
    const count = (data as { count?: number } | null)?.count;
    if (!Number.isInteger(count) || !count || count < 1 || count > 100)
      throw new Error("count_must_be_1_to_100");
    const batch = crypto.randomUUID();
    let joined = 0;
    for (let i = 0; i < count; i++) {
      const result = engine.comment({
        type: "comment",
        eventId: `${batch}-${i}`,
        userId: `${batch}-${i}`,
        username: `Guest ${engine.attendees.size + 1}`,
        text: "AMEN",
        timestamp,
      });
      if (result.status === "joined") joined++;
    }
    publish();
    return { status: "completed", joined };
  }
  throw new Error("Unknown offline preview action");
}
