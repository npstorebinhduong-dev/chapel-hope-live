# Chapel of Hope LIVE v1.1

Built on the completed Task #01 branch (`3fff988`), preserving its six gift keys, AMEN deduplication, seating/overflow, queue fairness, mock server, audio, reset and reconnect behavior.

## Implemented

- Layered pointed Gothic wall arches, clustered column shafts and an altar arch; original analytic masonry shader, colored window light on the floor and transparent sunlight shafts. Ambient candle motion and dust remain bounded. Gift lighting now eases instead of jumping in intensity.
- Articulated procedural bodies with proportioned torsos, heads, hair, thighs, calves, shoes and hands; twelve neutral clothing variations. Legs remain visible in sitting/kneeling poses; joint positions blend with delta time, walking turns follow path direction, and staggered breathing avoids synchronized movement.
- Shared instanced body geometry renders the congregation in two draw calls. Per-avatar frustum rejection, distance-selected detail and bounded instance storage support 100 visitors plus 16 distinct NPCs. Quality settings cap detailed characters, shadows, DPR and particle count: Low 8/0/.65/12; Balanced 24/1/1/32; High 48/1/1.5/64. A focused actor may add one detailed character. Settings sync across same-origin tabs using browser storage.
- Busy-aisle altar presentation uses a separate temporary actor, leaving the crowd avatar on its existing path rather than teleporting it. Existing arrival/departure separation and unique seat assignments remain intact.
- Camera focus expiry uses elapsed local time even if the last snapshot becomes stale. Smaller title/guide and relocated ceremony acknowledgment clear more of the central view.
- `/control` adds a 100-person burst, three quality tiers and explicit visual/logical capacities. The live view has no admin controls.

## Verification

`npm test`: 16 passed, zero failures/skips. Includes 20/50/100 AMEN stress with 20 queued gifts, arrival/departure separation, no duplicate attendees, distinct five-coin actions, complete gift draining and focus restoration. `npm run typecheck`, production build and existing real-browser gameplay suite passed. Zod's third-party comment annotations produce harmless build warnings.

`node --import tsx scripts/stress-browser.ts` measures filled scenes with Chromium SwiftShader, saves `artifacts/v1.1/performance.json`, and captures 20/50/100-person overviews plus altar/ceremony states. Arrival clocks are advanced 120 seconds in this harness so it measures the populated scene; this does not replace the separately tested arrival simulation. The browser suite remains a functional check; software GPU results are not a hardware streaming benchmark.

## Limits / v1.2

The characters remain procedural fallbacks. There are no licensed human GLBs in the repository and no claimed skeletal retargeting or photoreal humans. The analytic walking cycle is not foot-lock IK; some sliding can remain at turns and low frame rates. Static sunlight geometry approximates volumetrics. Paths use scheduled lanes rather than general dynamic navigation. Hardware 30 FPS at 1080×1920 remains unverified. No TikTok API connection exists.

Next: licensed rigged people and clip retargeting following [ASSET_PIPELINE.md](ASSET_PIPELINE.md), foot IK and turn-in-place clips, GPU profiling on capture hardware, and localization.

Final software-GPU samples: **20 attendees 5.8 FPS; 50 attendees 5.6 FPS; 100 attendees 4.9 FPS**. No browser page errors. These are foreground filled-scene measurements; the earlier multi-tab gameplay smoke run reported 1 FPS and is not directly comparable.

Saved evidence: [100-person overview](screenshots/v1.1/congregation-100.png), [altar moment](screenshots/v1.1/altar_100.png), [ceremony](screenshots/v1.1/ceremony_500.png), [control room](screenshots/v1.1/control.png), [measurement JSON](screenshots/v1.1/performance.json).
