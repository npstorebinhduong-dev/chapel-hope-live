# Chapel of Hope LIVE — EU Edition

A runnable, original procedural 3D **virtual chapel** for portrait 9:16 browser capture in OBS or LIVE Studio. Free `AMEN` comments add session visitors. Six optional mock gifts create visual moments. This is a fictional space, not a real parish or church service; gifts never promise blessings, healing or spiritual outcomes.

**Implemented:** local React/Three.js scene, Node mock API/WebSocket server, cross-tab control room, ephemeral congregation, offerings, gift queue, bounded camera focus, synthesized bell, tests and production build. **No TikTok connection, payments, paid assets, external fonts or downloaded artwork.** Humanoids are procedural placeholders, not photorealistic people.

## Run locally (Windows, macOS or Linux)

Install Node.js **24 LTS** (minimum 22.12); use an up-to-date desktop browser with WebGL enabled. From the repository root:

```sh
npm ci
npm run dev
```

- Open `http://127.0.0.1:5173/` for the clean **live view**.
- Open `http://127.0.0.1:5173/control` in a separate tab for the **keeper’s desk**.
- Both services bind to loopback. The Vite proxy forwards `/api` and `/ws` to port **3001**. Vite normally uses **5173**; free that port first (cross-origin checks intentionally only allow the documented local origins).
- Keep the server process running. No credentials, database, Docker, environment variables or internet access are required after dependencies are installed.

Production mode serves both pages and the API from one local server:

```sh
npm run build
npm start
```

Open `http://127.0.0.1:3001/` and `/control`. Set `PORT` to change the production port (PowerShell: `$env:PORT=3100`; cmd: `set PORT=3100`; then `npm start`). HTTP endpoints accept both `/health` and `/api/health` style paths in production; use `/api` through Vite.

## Try the full session

1. Keep the live page and `/control` open together. The control room shows connection status and measured live-renderer FPS.
2. Send AMEN. Repeat it with the same session pseudonym: it renews occupancy without adding a clone. Change the pseudonym to simulate a different person. Names never determine avatar appearance or sensitive characteristics.
3. Send 20/50-visitor bursts. Arrivals use two spaced aisle lanes and front-of-pew branch waypoints; overflow enters along the outer aisles. Departure batches are spaced, and new arrivals wait until outgoing traffic clears. Background NPCs are labeled as simulated and excluded from visitor/supporter counts.
4. Trigger each gift below. Camera focus times out automatically; turn focus off to keep the overview. All effects work without a seat and at full visual capacity. A temporary presentation avatar represents a kneeling/altar donor when their crowd avatar is still entering, the crowd is full, or an aisle is busy.
5. Unmute in `/control`, then click once inside **each tab that should play sound** to unlock its browser audio context. The bell is synthesized locally; no audio files or choir recordings are used. The global mute switch applies to all tabs, but browser audio unlock is per tab.
6. Reset asks for confirmation and clears the entire ephemeral session, including pending gifts. Reloading/reconnecting a tab receives the current server snapshot; restarting the server clears everything.

| Gift key       | Simulation coins | Observable action                                                                                             |
| -------------- | ---------------: | ------------------------------------------------------------------------------------------------------------- |
| `candle_1`     |                1 | Lights a candle at the left offering stand; camera visits it                                                  |
| `prayer_5`     |                5 | Donor kneels; focus follows the reaction                                                                      |
| `rose_5`       |                5 | Adds a white rose at the right offering stand                                                                 |
| `bell_10`      |               10 | Swings the bell, synthesizes a chime, congregation gesture                                                    |
| `altar_100`    |              100 | Donor follows aisle waypoints to a kneeling position in front of the altar, then returns; warm lighting/focus |
| `ceremony_500` |              500 | Collective kneel, warm light, bell, floor halo and donor acknowledgment banner                                |

Both five-coin gifts are dispatched by **giftKey**, never price. Repeat counts are aggregated into one visual sequence; offerings/support use the count. Sound requires browser consent. There are no actual purchases.

## Bounds and behavior

- 64 physical seats: 16 reserved for optional NPCs and 48 viewer seats. NPC toggle hides/shows them without relocating real visitors. `ChapelEngine(capacity)` supports 24–64 seats in multiples of eight; the scene uses 64 by default.
- At most 100 session crowd avatars, with 52 unique rear overflow spots at the default seat count. Extra AMENs return `capacity`, rather than creating overlapping people. Gifts from additional visitors still play and can appear in supporters without a crowd slot.
- Ten minutes of inactivity triggers walking departure and eventual seat release. Pending/active gifts keep their donor present until played. Names and session pseudonyms remain in memory only; no raw comment log, persistent accounts, religion profiles or inference.
- Queue: one active + 128 pending gift sequences. Priority favors larger moments, FIFO within a priority class; every fourth selection serves the oldest queued event. No active event is preempted. Small focus lasts 2.2–2.5 seconds; major moments 6.5–7 seconds. A backlog shortens cosmetics to 65% (minimum 1.2 seconds), preserving every accepted sequence.
- A full queue returns HTTP **429** with `status: "queue_full"`, `eventId` and `retryAfterMs`; that gift was **not accepted**. Retry the same event ID after space opens. The control room displays the failure. Reset and server termination explicitly end pending simulation work; this is not a durable payment/event processor.
- Dedup cache: at most 4,096 IDs for ten minutes, plus active/queued event IDs. Supporter records: bounded to the 256 most recently active donors, displayed top three by simulation coin total. Candles cap at 64; roses at 48 until reset.
- Requests are schema validated, JSON is capped at 8 KB, spam batches at 100, repeats at 20, display names at 32 characters and identifiers at 80. Local operator origins only; 12 WebSocket clients maximum, 1 KB inbound frames, slow outbound clients are disconnected. Run locally with an attended operator, not as a public unauthenticated service.

## API

`GET /health` returns `{ "ok": true, "mode": "mock", "viewers": 0, "queue": 0 }`. `GET /state` returns the current bounded session snapshot. `/ws` sends authoritative `snapshot` messages at 10 Hz and on mutations; clients interpolate deterministic paths between snapshots. Local renderers report FPS once per second for the control room.

```json
// POST /mock/comment
{"userId":"session-guest-1","username":"Guest","text":"AMEN","eventId":"unique-comment-1"}

// POST /mock/gift — coinValue is derived by the server, never trusted from input
{"userId":"session-guest-1","username":"Guest","giftKey":"rose_5","repeatCount":1,"eventId":"unique-gift-1"}

// POST /mock/spam-amen
{"count":50}

// POST /mock/control
{"action":"camera","enabled":false}
```

Control actions: `npcs`, `muted`, `camera` require `enabled`; `reset` clears state. `eventId` is optional for mock POSTs (the server generates one), but adapters should always provide stable unique IDs. Successful gift responses distinguish `accepted` and `duplicate`; comments distinguish `joined`, `ignored`, `duplicate` and `capacity`. Invalid bodies return 400; request-rate or queue limits return 429.

`packages/shared/src/adapter.ts` is a tested **integration boundary**, not a TikTok connection. It accepts an explicitly configured platform-ID → giftKey mapping and only emits final, deduplicated repeat streaks. Real mappings and an actual authorized platform adapter must be separately implemented and verified. Never use coin values as platform identifiers.

## Verification

```sh
npm run typecheck
npm test
npm run build
npm run test:browser
```

`npm test` exercises AMEN parsing, duplicate joins, TTL departure, unique seats/overflow, 100-person arrival/departure separation, all six gifts at capacity, queue overflow/retry, fairness/FIFO/focus restoration, repeat adapters, a 100-comment/30-gift burst, HTTP validation, normalized prices, WebSocket snapshots and reset.

The browser smoke script starts its own built production server on **3101**, then drives both pages with Playwright. It requires Chromium at `/usr/bin/chromium` or a `CHROMIUM_PATH` environment variable pointing at your browser executable. Alternatively install the Playwright browser with `npx playwright install chromium` and set `CHROMIUM_PATH` to that installation’s executable. Browser checks include actual WebGL rendering, six-event playback, offerings, focus expiry, state restore, 100-visitor capacity, cross-tab settings, full-capacity gifts and reset. Screenshots are written to `artifacts/`; CI uploads them. This directory is generated and ignored.

Software rendering in cloud Chromium is a functional check, **not proof of 30 FPS on a streaming PC**. The control room reports actual FPS per connected renderer; background/occluded tabs and software GPUs can be much slower. DPR adapts downward under load. Measure on your capture hardware before production use. Do not treat a clean test run as a verified real TikTok connection.

## Structure and original assets

- `apps/client`: Vite, React, TypeScript, Three.js/R3F, drei, Zustand; `/` presentation and `/control` operator interface. English strings live in `src/strings.ts`; gift labels live in the shared registry, ready for future localization.
- `apps/server`: Express, WebSocket, in-memory mock session; production static serving.
- `packages/shared`: typed contracts, validation, gift registry, seating/path/pose functions, bounded session engine and adapter boundary.
- `tests`: gameplay and local HTTP/WebSocket tests.
- `scripts/browser-smoke.ts`: real-browser functional validation and screenshots.

All geometry, visual patterns and the synthesized chime are original procedural work. No third-party artwork, fonts, models or recordings are downloaded at runtime. `apps/client/src/assets.ts` defines a typed local licensed-GLB manifest. The scene and avatar renderer can load registered local GLBs through `useGLTF`, clone skinned skeletons and preserve procedural fallbacks when no asset is registered. Supply license/credit/scale metadata and place approved files under `apps/client/public/`. This is a replacement hook, not a completed animation retargeting pipeline; rig clips and better seated limb animation remain future work.

## Known limitations and next iteration

Procedural humanoids, simple limb poses and geometric masonry are deliberately a runnable baseline, not photorealism. Entrance paths are tested for a simultaneous 100-person burst; busy-aisle altar gifts use a dedicated front presentation actor, and incoming/outgoing batches are scheduled separately rather than using a dynamic navmesh. The mock server owns the ephemeral session to keep multiple tabs and reconnects consistent; there is no durable replay after server restart. Browser audio cannot be remotely unlocked by another tab.

Next: licensed environment/rigged human GLBs and LOD, animation retargeting, more natural mixed-traffic navigation, hardware FPS profiling at 1080×1920, Italian/Spanish dictionaries, and a separately authorized/verified platform adapter. Keep participation free and retain the explicit virtual disclosure.

Original approved documents: [AGENTS.md](AGENTS.md), [technical specification](docs/TECH_SPEC_V1.md), [Task #01](docs/CODEX_PROMPT_01.md).
