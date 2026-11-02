import { create } from "zustand";
import { ChapelEngine } from "../../../../packages/shared/src/engine";
import {
  GIFTS,
  commentSchema,
  giftSchema,
  controlSchema,
  type Snapshot,
} from "@chapel/shared";
import { en } from "../strings";

// Only bundled by build-preview: the normal app continues using HTTP/WebSocket.
const engine = new ChapelEngine();
let timer: ReturnType<typeof setInterval> | undefined;
let initialized = false;
export const useSession = create<{
  snapshot: Snapshot | null;
  connected: boolean;
  receivedAt: number;
  fps: number[];
  set: (snapshot: Snapshot, fps: number[]) => void;
}>((set) => ({
  snapshot: null,
  connected: false,
  receivedAt: 0,
  fps: [],
  set: (snapshot, fps) =>
    set({ snapshot, fps, connected: true, receivedAt: performance.now() }),
}));
function publish() {
  useSession.getState().set(engine.snapshot(), useSession.getState().fps);
}
export function connectSession() {
  if (!initialized) {
    initialized = true;
    // Populate the review scene immediately; subsequent joins walk in normally.
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
