import type { ActiveGift, GiftKey } from "@chapel/shared";
const ease = (n: number) => {
  const t = Math.max(0, Math.min(1, n));
  return t * t * (3 - 2 * t);
};
const zoomByGift: Record<GiftKey, number> = {
  candle_1: 0.065,
  prayer_5: 0.1,
  rose_5: 0.075,
  bell_10: 0.095,
  altar_100: 0.24,
  ceremony_500: 0.28,
};
export type StageCamera = { zoom: number; x: number; y: number; focus: string };
export const overviewCamera = (): StageCamera => ({
  zoom: 1,
  x: 0,
  y: 0,
  focus: "",
});
/** Uses the engine's fair gift scheduler, not a second queue which can drift.
 * A wall-clock deadline releases focus even when snapshots stop arriving.
 * Bottom-anchored framing keeps the entire foyer visible at every zoom. */
export function cameraTarget(
  active: ActiveGift | null | undefined,
  now: number,
  enabled: boolean,
  donorX = 0.5,
): StageCamera {
  if (
    !enabled ||
    !active ||
    now < active.startedAt - 2400 ||
    now >= active.endsAt + 1400
  )
    return overviewCamera();
  const acquire = ease((now - active.startedAt + 2400) / 3200);
  const release = 1 - ease((now - active.endsAt + 500) / 1900);
  const ceremony = active.event.giftKey === "ceremony_500";
  // Grand ceremony starts close, then opens out to the congregation and priest.
  const reveal = ceremony
    ? 1 - 0.44 * ease((now - active.startedAt - 3500) / 4500)
    : 1;
  const zoom =
    1 + zoomByGift[active.event.giftKey] * acquire * release * reveal;
  const x = Math.max(1 - zoom, Math.min(0, 0.5 - donorX * zoom));
  return { zoom, x, y: 1 - zoom, focus: active.event.userId };
}
export function smoothCamera(
  current: StageCamera,
  target: StageCamera,
  dt: number,
): StageCamera {
  const blend = 1 - Math.exp(-Math.min(0.08, Math.max(0, dt)) * 5);
  const mix = (a: number, b: number) =>
    Math.abs(a - b) < 0.00002 ? b : a + (b - a) * blend;
  return {
    zoom: mix(current.zoom, target.zoom),
    x: mix(current.x, target.x),
    y: mix(current.y, target.y),
    focus: target.focus,
  };
}
