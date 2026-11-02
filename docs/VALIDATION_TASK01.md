# Task #01 validation

Validated in the Codex cloud environment on 2026-11-02 with Node 24.19.0, npm 11.9.0 and installed Chromium using SwiftShader.

- Clean `npm ci --no-audit --no-fund`: passed.
- `npm run typecheck`: passed.
- `npm test`: **15 passed, 0 failed, 0 skipped**.
- `npm run build`: passed for client and server. Vite emitted harmless third-party Zod comment-annotation warnings; no build errors.
- `npm run test:browser`: passed. Verified production pages, actual WebGL canvas, live/control separation, AMEN dedup, all six gift sequences, persistent candles/roses, focus timeout, reload snapshot, 100-visitor cap, a new donor’s gift at capacity, broadcast settings and reset. No page/console errors in the final run.
- `npm run dev`: both services started. HTTP requests through Vite to `/`, `/control` and `/api/health` passed; the Vite WebSocket proxy delivered a session snapshot.
- `git diff --check`: passed.

Gameplay tests sample pairwise body separation during a simultaneous 100-person arrival and departure batch. They also check TTL renewal, distinct five-coin actions, explicit queue overflow/retry, FIFO ties, bounded priority fairness, focus restoration, and completion of a 100-comment/30-gift burst. Integration tests exercise actual HTTP and WebSocket connections rather than mock transport stubs.

Screenshots from the production browser run:

- [Chapel overview](screenshots/chapel-overview.png)
- [Control room](screenshots/control-room.png)

The browser run also generates ceremony and burst screenshots under ignored `artifacts/`; CI uploads that directory. Re-run the smoke command to regenerate them.

**Performance limit:** the cloud software renderer reported approximately **1 FPS** during the multi-tab run. This confirms functional rendering only and does not demonstrate the 30 FPS target. Measure with a hardware GPU on the intended streaming PC at capture resolution. Procedural avatars remain placeholders; GLB loading hooks do not constitute completed rig-animation retargeting. No real TikTok API or payment behavior was tested or implemented.
