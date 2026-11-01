# Chapel of Hope LIVE — Technical Specification v1.0
Status: APPROVED DESIGN / IMPLEMENTATION PENDING
Market: EU (English-first, expandable to Italian & Spanish)
Platform: desktop browser captured in TikTok LIVE Studio or OBS
Format: portrait 9:16; target output 1080 × 1920, adaptive render resolution

## 1. Experience
A stylized but architecturally realistic 3D European Catholic-style chapel with center aisle, carved wooden pews, altar, candle and flower zones, colored stained-glass windows, warm rays and subtle motion. The viewer's free comment **AMEN** causes a named avatar to enter, walk to an assigned seat and sit/pray. Gifts cause **optional visual actions**, not privileged spiritual outcomes. Label visibly as a simulated/virtual experience. Do not impersonate a real parish, priest, or religious service.

The visual goal is realistic 3D. Use a modular environment and an asset swap pipeline for licensed GLB humanoids; the first runnable milestone can use procedural geometry with graceful placeholders, clearly marked as temporary.

## 2. Six exact gift action IDs
| ID | Coins | Action | On-screen feedback |
|---|---:|---|---|
| `candle_1` | 1 | Light a Candle | Attendee approaches candle zone or camera shows candle, candle is lit and remains visible until session rotation |
| `prayer_5` | 5 | Kneel & Pray | Person kneels/crosses hands for a short sequence |
| `rose_5` | 5 | Offer a White Rose | A rose is placed in flower zone |
| `bell_10` | 10 | Ring the Bell | Bell sound + brief collective prayer gesture |
| `altar_100` | 100 | Special Prayer at Altar | Person moves to designated spot in front of, not on, altar; cinematic camera + warm rays |
| `ceremony_500` | 500 | Grand Ceremony Moment | Bell, optional licensed/original choir, synchronized congregation gesture, cinematic lighting and donor acknowledgment |

**Important:** `prayer_5` and `rose_5` must be distinguished by `giftKey` or real platform gift ID, never `coinValue` alone. Actual TikTok gift names, prices and platform IDs may vary by market; mapping must be configurable and verified when TikTok integration is introduced. Internal display labels are not claims of official TikTok gift names.

## 3. Audience and attendee behavior
- Free `AMEN` (case-insensitive, trim whitespace; optionally punctuation) produces one attendee per unique session viewer ID. Repeated AMEN renews occupancy, it must not create clones.
- Viewer avatar enters from rear, follows center aisle and assigned branch path, sits/prays. Automatically leave after 10 minutes of inactivity. New gifts can create/renew an attendee even if they have no seat.
- NPC congregation: 12–20 visibly identifiable background attendees; not counted as real viewers, supporters, or genuine participation.
- Live attendee visual seating: 48–64 slots (configurable), with overflow standing/waiting zone; never exceed capacity or overlap seats.
- Avatar states: `spawning`, `walking_to_seat`, `seated`, `praying_idle`, `kneeling`, `gift_reacting`, `leaving`.
- Distinct default clothing and hair variants, no gender inference from names. Optional viewer-selectable appearance later.
- Prevent collisions/intersections with pews, the altar and other people. Use deterministic paths initially, not expensive dynamic navmesh.

## 4. Camera and presentation
- Centered rear-of-nave establishing shot, altar framed above congregation, long center aisle; accessible fit inside 9:16.
- Fixed overview most of the time; gift-specific focus is capped (e.g. 1–2.5 seconds small gifts; 4–7 seconds major gifts) and MUST return to overview.
- Large gifts not lost when bursts occur: use priority queue but preserve fairness (bounded preemption; FIFO within class), no starvation or camera deadlock.
- Labels over near/focused avatars only with collision suppression / minimum font size.
- Streaming display route `/` is clean; local admin route `/control` houses controls.

## 5. Event contracts
Use shared TypeScript contracts in `packages/shared`:
```ts
type GiftKey = 'candle_1' | 'prayer_5' | 'rose_5' | 'bell_10' | 'altar_100' | 'ceremony_500';
type CommentEvent = { type: 'comment'; eventId: string; userId: string; username: string; text: string; timestamp: number };
type GiftEvent = { type: 'gift'; eventId: string; userId: string; username: string; giftKey: GiftKey; coinValue: number; repeatCount: number; timestamp: number };
```
- Schema validation on server; `eventId` deduplication and bounded queue. No raw text-to-HTML injection.
- Separate adapter for platform-specific gift identifiers and repeat streak handling. No TikTok credentials needed for v1.
- Test endpoints: `POST /mock/comment`, `POST /mock/gift`, `POST /mock/spam-amen`, plus `GET /health`. Broadcast via WebSocket to client(s). Validate payload and cap spam counts.
- Reconnection should not duplicate attendees; session state remains authoritative in client game state for the demo.

## 6. Architecture and layout
```text
chapel-hope-live/
  AGENTS.md
  apps/
    client/         React + TS + Vite + Three/R3F + Zustand
    server/         Express + TS + WebSocket mock API
  packages/
    shared/         types, gift registry, validation/contracts
  docs/
    TECH_SPEC_V1.md
    CODEX_PROMPT_01.md
  README.md
```
Front-end modules: chapel scene/environment/light/camera; attendees, seating, routing and animation; events and gift sequences; live HUD / top supporters / toast; local admin panel. Use local assets where licensed; do not require external cloud calls to render a demo.

## 7. UI and localization
- Header: `CHAPEL OF HOPE`, `Type AMEN to join`.
- On-screen gift list: 1 Candle, 5 Prayer, 5 White Rose, 10 Bell, 100 Special Prayer, 500 Grand Ceremony.
- Nonintrusive toast on action and top 3 supporters, sourced only from actual simulation events.
- Preserve central view for chapel; avoid overlapping platform TikTok HUD/tap targets.
- English copy in a string dictionary, not scattered hardcoded text. Enable future IT/ES dictionaries.
- Sound must unlock via user interaction where browsers require it, with mute toggles. Original or cleared audio only.

## 8. Performance and stability
- Target 30 FPS stable on mainstream Windows streaming PCs; 45–60 FPS desirable when lightly loaded. Measure, do not guarantee.
- Capture layout 1080x1920 while 3D pixel ratio and optional internal resolution scale adapt to GPU. Throttle background effects, cap active models and particles.
- Prefer reusable GLBs, instance repeated props, memoized geometry/materials, texture compression and LOD when needed.
- No full-screen flashes, camera shake spam, endless spawning or memory leaks.
- In worst-case tests, 100 attendees / burst of 100 comments + 30 gift events should preserve responsiveness through graceful caps/queues.

## 9. Acceptance criteria for first implementation
1. `npm install` and documented `npm run dev` launch frontend and mock server.
2. 9:16 chapel with aisle, two pew banks, visible altar, candle/flower zones and lighting, not blank/placeholder-only page.
3. `/control` can trigger AMEN, spawn 20/50 people, trigger each of the six unique gift keys, clear/reset and mute; `/` stays clean.
4. Typing AMEN produces correct avatar lifecycle/seat assignment, deduplicated by viewer ID; capacity overflow does not clip/overlap.
5. Six gift actions produce **different observable results**; event queue handles bursts; camera restores overview.
6. Gift actions work for a new viewer and while seats are full.
7. No real TikTok integration claimed; mock browser demo works without credentials, paid assets or external services.
8. Typecheck/build/tests pass, or limitations disclosed accurately.

## 10. Later phases
v1.1: environment GLB assets, better light and animation rigs.
v1.2: licensed realistic human GLBs, LOD, movement blends, strong crowd density.
v1.3: localization IT/ES and natural voice lines.
v2.0: platform-specific LIVE event adapter, verified gift IDs, moderation / operator workflow, live production tests.

## 11. Trust, safety and compliance
- Virtual event disclosure; no promise of blessings/health benefits for gifts; free participation fully functional.
- Do not record/profiling religious beliefs. Treat AMEN as an in-session interaction, not identity evidence; no persistent personal data in v1.
- No third-party audio or copyrighted prayers/songs without rights, and avoid unauthorized likeness/branding.
- Provide an attended stream workflow: simulated crowd is labeled as background NPCs; avoid fake live chat/social proof or unstaffed unattended broadcasts.
- Check applicable TikTok terms and local EU privacy obligations before production launch.
