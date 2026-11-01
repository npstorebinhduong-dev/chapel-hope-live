# AGENTS.md — Chapel of Hope LIVE

These instructions apply to all work in this repository.

## Product contract
- Build a locally runnable vertical 9:16, realistic-3D European chapel experience for TikTok LIVE-style interaction.
- This is a **fictional, explicitly virtual** space, not a real parish or a church service.
- Comment **AMEN** joins the chapel for free. Never require gifts for access or imply gifts guarantee blessings, healing, or divine outcomes.
- Keep exactly SIX gift actions with distinct identifiers: `candle_1`, `prayer_5`, `rose_5`, `bell_10`, `altar_100`, `ceremony_500`. Both 5-coin actions are different events. Do not route by coin value alone.
- Optimize for a high-quality, busy scene without overlapping avatars, unreadable labels, camera locks, or excessive rendering load.
- English first; externalize strings for future Italian and Spanish translations.

## Technical direction
- npm workspaces monorepo; `apps/client` (Vite, React, TypeScript, Three.js, @react-three/fiber, @react-three/drei, Zustand); `apps/server` (Node, Express, TypeScript, WebSocket); `packages/shared` for contracts.
- Deliver real working code, not only diagrams or pseudocode. Mock mode must run offline without TikTok credentials.
- Use original procedural or properly licensed local assets only. Do not pull random 3D models, artwork, sound recordings, or photos from the web.
- Avoid dependence on a GPU-heavy postprocessing stack for the first runnable build; progressive enhancement and fallbacks are required.
- Keep OBS/LIVE overlay and admin/control panel separate (`/` live view, `/control` local testing). No debug controls on stream view.
- Make every event and queue bounded, with cleanup and repeat/dedup protections.
- Do not state or pretend that a real TikTok API connection exists until implemented and tested.
- Do not store religion-related profiles or infer a viewer's religion from typing AMEN. Use session-level pseudonymous IDs; no persistent personal data for v1.

## Engineering
- Always preserve a runnable project; prefer incremental improvements and small, reviewable changes.
- Document the installation, commands and feature state in README.
- Add tests for parsing AMEN, seating, duplicate joins, event/gift routing and gift queue.
- Run typecheck, tests, and build when possible. Report the actual results and any remaining blockers.
- If realistic GLB character assets are unavailable, implement clean fallback placeholder humanoids and an asset-integration interface; do not label primitive people as photorealistic.
- Core spec: `docs/TECH_SPEC_V1.md`. Initial implementation instruction: `docs/CODEX_PROMPT_01.md`.
