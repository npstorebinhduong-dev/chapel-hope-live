import { create } from "zustand";
import { en } from "./strings";
import type { Snapshot } from "@chapel/shared";
interface State {
  snapshot: Snapshot | null;
  connected: boolean;
  receivedAt: number;
  fps: number[];
  set: (snapshot: Snapshot, fps: number[]) => void;
}
export const useSession = create<State>((set) => ({
  snapshot: null,
  connected: false,
  receivedAt: 0,
  fps: [],
  set: (snapshot, fps) =>
    set({ snapshot, fps, receivedAt: performance.now(), connected: true }),
}));
let socket: WebSocket | null = null;
let retry: ReturnType<typeof setTimeout> | undefined;
let stopped = false;
export function connectSession() {
  stopped = false;
  const connect = () => {
    if (stopped) return;
    socket = new WebSocket(
      `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws`,
    );
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "snapshot")
          useSession.getState().set(
            message.snapshot,
            (message.metrics ?? []).map((m: { fps: number }) => m.fps),
          );
      } catch {
        /* Malformed frames leave last valid state in place. */
      }
    };
    socket.onclose = () => {
      useSession.setState({ connected: false });
      if (!stopped) retry = setTimeout(connect, 1200);
    };
    socket.onerror = () => socket?.close();
  };
  connect();
  return () => {
    stopped = true;
    clearTimeout(retry);
    socket?.close();
  };
}
export const renderClock = () => {
  const s = useSession.getState();
  return s.snapshot
    ? s.snapshot.now +
        (s.connected ? Math.min(performance.now() - s.receivedAt, 300) : 0)
    : Date.now();
};
export const sendMetrics = (fps: number) => {
  if (socket?.readyState === WebSocket.OPEN)
    socket.send(JSON.stringify({ type: "metrics", fps, renderer: "WebGL" }));
};
export async function post(endpoint: string, data: unknown) {
  const response = await fetch(`/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(
      body.status === "queue_full"
        ? en.queueFull
        : (body.error ?? `HTTP ${response.status}`),
    );
  return body as { status?: string; joined?: number };
}
