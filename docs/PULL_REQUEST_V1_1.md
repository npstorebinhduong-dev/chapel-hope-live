## Chapel of Hope LIVE v1.1

Upgrades the completed Task #01 implementation with layered Gothic arches and masonry, stained-glass light shafts and floor projections, blended articulated procedural people, and an instanced crowd renderer. The congregation's body parts share two draw calls, with per-avatar visibility rejection and distance-based detail. Low/Balanced/High settings control shadows, resolution, particles and detailed-character budgets; the operator page adds a 100-person burst.

Preserves all six gifts, the distinct five-coin actions, free AMEN participation, seating/overflow, bounded queue/focus, mock API, cross-tab controls and session recovery. Busy-aisle gift presentation no longer moves the original crowd avatar to the front, and camera expiry tolerates stale network snapshots. Lower pew backs and compact overlays improve visibility.

Validation: 16 gameplay/API tests passed, typecheck and production build passed, real-browser gameplay suite passed. Filled 20/50/100-person browser samples measured 5.8/5.6/4.9 FPS using Chromium SwiftShader; the 30 FPS streaming-hardware target remains unverified. Browser stress captures contain no page errors. Tests exercise 20 simultaneous gifts at all three population sizes, FIFO/fairness, capacity, departure/reentry and camera restoration.

Evidence and limitations are in docs/CHANGELOG_V1_1.md and docs/screenshots/v1.1/. The characters remain original procedural fallbacks; no licensed human GLBs are available, no skeletal retargeting is claimed, and foot-lock IK remains future work. docs/ASSET_PIPELINE.md specifies the licensed rig and animation contract. No real TikTok connectivity exists.

This branch includes the completed Task #01 commits because they have not yet been merged into main. Compare against feat/chapel-live-v1 for only the v1.1 changes.
