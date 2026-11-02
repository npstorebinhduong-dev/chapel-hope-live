import type { AttendeeState } from "@chapel/shared";
/** Only register locally bundled, properly licensed assets. Procedural fallbacks are always available. */
export interface LicensedAsset {
  url: `/${string}.glb`;
  credit: string;
  license: string;
  scale: number;
  animations?: Partial<Record<AttendeeState, string>>;
  forwardRotation?: number;
}
export interface ChapelAssets {
  environment?: LicensedAsset;
  humanoid?: LicensedAsset;
}
export const assets: ChapelAssets = {};
// Asset replacement boundary: use this manifest when adding a rigged GLB renderer.
// Do not use unreviewed remote URLs. Current rendering deliberately uses original procedural meshes.
