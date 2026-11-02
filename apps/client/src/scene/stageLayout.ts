import type { ActiveGift } from "@chapel/shared";

// Calibrated against the original 941 × 1672 architectural plate. Normalized
// coordinates make the stage, actors and offerings share one 9:16 projection.
export const PEW_RAILS = [0.584, 0.602, 0.624, 0.653, 0.69, 0.734, 0.785, 0.84];
export function projectStage(x: number, z: number) {
  if (z >= 5.1) {
    const t = Math.max(0, Math.min(1, (z - 5.1) / 12.9));
    return {
      x: 0.5 + x * (0.095 - 0.01 * t),
      y: z < 18 ? 0.862 + 0.048 * t : 0.91 + (z - 18) * 0.033,
      height:
        z < 18 ? 0.143 - 0.068 * t : 0.075 + Math.min(0.045, (z - 18) * 0.014),
    };
  }
  const row = (z + 6.8) / 1.7;
  const index = Math.max(0, Math.min(6, Math.floor(row)));
  const fraction = Math.max(0, Math.min(1, row - index));
  const y =
    row < 0
      ? 0.606 + row * 0.018
      : row > 7
        ? 0.862 + (row - 7) * 0.034
        : PEW_RAILS[index]! * (1 - fraction) +
          PEW_RAILS[index + 1]! * fraction +
          0.022;
  const scale = 0.073 + Math.max(-1, Math.min(11, row)) * 0.01;
  return {
    x: 0.5 + x * (0.06 + Math.max(-1, Math.min(10, row)) * 0.005),
    y,
    height: scale,
  };
}
export function stageEffect(
  active: ActiveGift | null | undefined,
  now: number,
) {
  if (!active || now < active.startedAt || now >= active.endsAt)
    return { key: null, strength: 0 };
  const t = (now - active.startedAt) / (active.endsAt - active.startedAt);
  const strength = Math.min(1, t * 6, (1 - t) * 6);
  const key = active.event.giftKey;
  return { key, strength };
}
// Artist-generated atlas is deliberately described by measured source rectangles,
// not assumed to be an exact regular grid. Walking cells are smaller in the source.
export const SPRITE_COLUMNS = [175, 420, 630, 845, 1060];
export const SPRITE_WIDTHS = [155, 160, 170, 165, 190];
export const SPRITE_ROWS = [0, 357, 634, 865];
export const SPRITE_HEIGHTS = [357, 277, 231, 257];
