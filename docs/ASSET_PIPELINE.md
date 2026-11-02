# Licensed character and environment pipeline

v1.1 ships original procedural architecture and articulated, instanced humanoid fallbacks. They are not photoreal people. No compatible licensed character files or animation clips are present in this repository.

## Asset contract

Register approved local files in `apps/client/src/assets.ts`, including source credit, license and scale. Keep the license text beside each asset under `apps/client/public/assets/`. Use GLB with embedded textures; do not depend on remote URLs. Environment GLBs can replace the procedural base through the existing `useGLTF` scene loader. Character registration is a typed integration boundary; the v1.1 instanced crowd does not automatically retarget arbitrary GLB rigs.

Characters should face local -Z, use Y-up and meters, stand approximately 1.65–1.85 m tall, and put the origin between the feet. Bind a consistent neutral skeleton, apply transforms, and export normalized skin weights. Keep joint names stable across all clothing variants. Supply clips named Idle, Walk, SitDown, Seated, StandUp, KneelDown, Kneeling and Rise. Walking clips should be in-place; deterministic aisle paths own root translation. Cross-fade clips over 0.2–0.4 seconds; clamp one-shot transitions and never restart a clip on each snapshot.

Target 5–10k triangles per detailed person, 1–2k distant LOD, no more than two opaque materials, 1K shared texture atlases and no transparent hair cards for the lowest tier. Share geometry/materials and clone skeleton state only for detailed actors. Retain the instanced procedural fallback for background viewers and failed asset loads. Respect the quality tier's detailed-character budget.

Bake neither dramatic exposure nor directional shadows into textures. Test under warm key light and cool stained glass, with physically plausible roughness and skin tones. Do not attach personal or religion-related metadata to appearances. Outfit selection remains a deterministic session-ID variation.

## Acceptance before enabling licensed characters

Check license redistribution/derivative permissions and credit requirements; verify dimensions, seated hip height (~0.72 m), feet on the floor, knee placement in front of the pew, root-motion removal, joint blend continuity and the six gift actions. Stress-test 100 attendees with 20 gifts at all tiers, record actual renderer FPS, and compare browser snapshots. Skeleton retargeting and photoreal character art remain v1.2 work, not capabilities claimed for the procedural fallback.
