## What changes

Turns the documentation-only repository into a runnable local virtual chapel demo with a portrait Three.js/R3F scene, procedural architecture and placeholder humanoids, a separate `/control` operator page, and an Express/WebSocket mock server. Free AMEN events create deduplicated session visitors with bounded seating, overflow, spaced arrival/departure paths and inactivity cleanup.

All six gift keys have distinct observable effects, including the two five-coin actions. The bounded gift queue provides explicit overflow/retry responses, priority with fairness, repeat/dedup protections, and automatic focus restoration. Controls broadcast across tabs; offerings, supporters and session state survive browser reconnects while the server remains running. Audio is locally synthesized and gated by per-tab browser consent and global mute. No TikTok credentials, payments, external assets or persistent viewer profiles are involved.

Includes npm workspaces, frozen lockfile, production serving, typed local licensed-GLB replacement hooks, an unconnected platform-adapter boundary, CI, setup instructions and validation screenshots. Approved specification documents remain unchanged; this branch includes the latest main documentation commit.

## Validation

- Clean `npm ci`, typecheck, client/server production build and patch whitespace check passed.
- `npm test`: **15 passed, 0 failed, 0 skipped**, including 100-person arrival/departure separation, TTL renewal, gift routing at capacity, queue fairness/retry, a 100-comment/30-gift burst, adapter streak dedup, and actual HTTP/WebSocket behavior.
- `npm run test:browser`: passed actual production WebGL rendering, both routes, AMEN dedup, all six effects, offerings, focus expiry, reload recovery, 100-visitor capacity, full-capacity gifts, cross-tab settings and reset; no page/console errors.
- Documented development startup verified with HTTP and WebSocket requests through Vite.
- Screenshots and exact evidence: `docs/VALIDATION_TASK01.md` and `docs/screenshots/`.

## Limits and follow-up

Cloud Chromium SwiftShader reported approximately **1 FPS**, so the 30 FPS streaming-hardware target remains unverified. Humanoids are procedural placeholders and GLB rig animation retargeting remains future work. Busy-aisle altar moments use a dedicated presentation actor; navigation is deterministic and scheduled rather than a general dynamic navmesh. Session state is ephemeral and reset/server restart ends pending simulation work. No real TikTok connection is claimed.

Next: licensed environment/rigged-avatar GLBs and LOD, more natural mixed-traffic navigation, hardware performance profiling at capture resolution, Italian/Spanish dictionaries, and a separately verified platform adapter.
