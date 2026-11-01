# Codex Task #01 — Build runnable Chapel of Hope LIVE v1.0

You are implementing **this repository**, not creating a design-only proposal. Read `AGENTS.md` and `docs/TECH_SPEC_V1.md` in full before editing. Work on a feature branch and propose a pull request when supported.

## Deliverable
A working local **9:16 realistic-leaning 3D chapel browser demo** with AMEN comment participation, functioning seating/pathing, separate control panel, six distinct gift actions, observable reactions and a bounded cinematic camera/event queue. It MUST run without TikTok API tokens or paid assets.

## Stack & repository
- npm workspaces with `apps/client`, `apps/server`, `packages/shared`.
- Vite, React, TypeScript, Three.js, React Three Fiber, drei, Zustand.
- Node.js, Express, WebSocket, TypeScript; shared TS types and gift registry.
- README with Windows-friendly install/run commands and all endpoints.
- Prefer minimal dependencies and fully local, reusable/procedural assets. No dependence on downloaded unlicensed content or hidden external services.

## Tasks, in implementation order
1. Inspect current repository. Preserve existing files and keep every change running.
2. Scaffold client/server/shared with scripts: `npm run dev`, `npm run build`, `npm run typecheck`, `npm test` (or document a narrower initial test command truthfully). Add .gitignore entries only if needed.
3. Implement 9:16 responsive viewport on `/` with a chapel scene seen from the central rear: Gothic nave depth, stained-glass-inspired geometry, columns, altar and crucifix-inspired fictional decoration, red central carpet, wooden pew blocks on each side, candle zone, white rose offering zone, believable warm lighting, subtle particles. Use procedural 3D geometry and original colors/meshes for a working offline baseline; provide typed asset replacement hooks for later realistic GLB humans/environment.
4. Create attendee state machine and configurable seat allocator with deterministic walking waypoints; no clipping through pews/altar, no overlapping seat assignments, no duplicates on repeat AMEN, 10-minute inactivity TTL; NPC background congregants clearly marked internally, not counted as viewers.
5. Implement exact giftKey registry: `candle_1` 1, `prayer_5` 5, `rose_5` 5, `bell_10` 10, `altar_100` 100, `ceremony_500` 500. **Distinct 5-coin effects**. For the first build, offer visually different functional effects with no reliance on external assets (light candle, kneel, add flower, short bell/collective gesture, altar prayer lighting/focus, grand ceremony lighting+crowd+banner). Gifts from users without seats and when all seats are occupied MUST still work.
6. Implement bounded, deduplicated event queue and camera focus with timeout/restore; bursts may shorten cosmetics but must not discard a paid event silently. Avoid camera stuck on one person.
7. Implement server `GET /health`, `POST /mock/comment`, `POST /mock/gift`, `POST /mock/spam-amen`, with validation, bounds and WebSocket broadcast. Send typed and normalized events; treat gift IDs rather than prices as identifiers.
8. Implement `/control` admin simulation page (never overlay in `/`) with: one AMEN, 20/50 AMEN burst, six gift buttons, reset scene, NPC toggle, sound mute, camera focus toggle, queue metrics/FPS. Ensure it can control the live page (shared server-side broadcast) even when opened in another browser tab.
9. Implement streaming overlay: name/title, Type AMEN to join, compact six-gift guide, current activity toast, top-3 supporters, legible labels and a discreet 'Virtual chapel experience' disclosure. Avoid UI overlap with altar.
10. Provide audio hooks and UI unlock/mute; optionally synthesize a brief bell locally with Web Audio. Do not use copyrighted church music or unlicensed audio.
11. Add basic automated tests for giftKey registry (two five-coin keys), AMEN normalization/dedupe, seat capacity and overflow, queue priority/restoration; run build and tests. Fix errors before finishing.
12. Update README showing commands, routes, test controls, known limitations, and concise next steps.

## Quality bar
- Code first, not a plan-only response. Avoid a blank canvas, mock-only HTML or still-image replacement for a 3D scene.
- Smooth and legible on 9:16 portrait capture. Keep at least 30 FPS as a measured objective, not unverified claim.
- Do not infer viewer gender, religion, or other sensitive details from their nickname.
- Report exactly what was implemented vs placeholder, and whether install/build/tests completed successfully.
- Do not claim the project is TikTok-connected until a real adapter exists.

## Completion report
Reply with (1) changed file summary, (2) local run instructions, (3) passed/failed test outputs, (4) screenshots if available, (5) link to PR/branch if opened, (6) targeted v1.1 improvements. 
