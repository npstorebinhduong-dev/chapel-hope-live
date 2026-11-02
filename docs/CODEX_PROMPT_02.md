# Codex Task #02 — Chapel of Hope LIVE v1.1: Realistic 3D + Smooth Congregation

**Run only after Task #01 has finished and the PR is merged into `main` (or work on the completed Task #01 branch without parallel conflicting sessions).** Read `AGENTS.md`, `docs/TECH_SPEC_V1.md` and inspect the actual implementation. This task is an **upgrade of working code**, not a replacement or a plan-only document.

## Primary objective
Transform the baseline 9:16 scene into a visually convincing, gracefully animated European cathedral chapel with a lively congregation. Keep the six established gift keys and AMEN gameplay functionally correct. Prioritize readability on phones, visual depth and livestream smoothness.

## 1. Environment art pass
- Strengthen European Gothic architecture: tall vaulted ceiling, balanced nave, slim columns, pointed arches, layered wall panels, stained glass with original procedural colored patterns, wood pews, altar focal point and red central carpet.
- Make a photoreal-inspired visual composition from **original procedural shaders/meshes** and properly licensed assets when already available. No random asset scraping or unlicensed photos/models.
- Implement convincing warm global ambience and several directional sunlight shafts through the windows; use cheap layered transparent geometry or shader approximations if true volumetric effects are too costly. No exaggerated blinking, exposure jumps, or fake continuous bloom.
- Add subtle candle flames and soft smoke/dust motion; gentle ambient scene activity even with no gifts.
- Composition: recognizable altar and crucifix-like chapel ornamentation above center, with clear unobstructed aisle, visual depth from back to front. Never put attendees on top of altar, over candles or through pews.
- Preserve modest treatment of Catholic iconography. The church is explicitly a fictional virtual experience, not a real parish livestream.

## 2. Character system & realism
- Preserve the unique attendee-per-viewer behavior, NPC distinctions and seat allocator.
- Improve natural proportions and appearance: 8–12 visually distinct hair/outfit variations, warm muted European everyday clothing, consistent scale, natural standing and sitting poses. Don't infer demographics/religion/gender from username; choose neutral/random defaults or allow viewer choice later.
- If realistic licensed GLB avatars plus compatible animations exist in repo, integrate via a typed asset loader. Otherwise implement a noticeably improved procedural 3D fallback and provide a clear `ASSET_PIPELINE.md` specifying GLB skinning, animation clips, size, lighting and licensing requirements. **Never describe primitive fallback avatars as photoreal human models.**
- Make movement smooth using delta-time animation, easing, root transforms and cross-fades where skeletal clips exist. No teleporting, body spinning in place, foot sliding more than necessary, clipping or bright flicker when animation states switch.
- State transitions: spawn → aisle path → seated/praying idle → stand → gift action / kneel → return to seat → leave.
- Individualized idle gestures should be subtle (breathing, head tilt, hand pose) with staggered phase and reduced CPU cost for background crowd.
- Keep names readable only for near/focused viewers, avoid tags piling up.

## 3. Crowd density / layout
- Ensure two pew banks, center aisle, 48–64 visually assigned seated positions with nonoverlap and controlled overflow/waiting area.
- Support 20/50/100 mock AMEN bursts and 20 simultaneous gift events without freezing; no duplicate usernames from same stable viewer ID.
- Real attendees count only actual mock/received participants. Background NPCs should never appear as real comments, donors, or supporter leaderboard entries.
- Use instancing for repeated architecture, share materials/geometry, viewport-based culling and low-detail distant humanoids. Implement `Low / Balanced / High` quality settings for shadow count, resolution scale, particle budget, max detailed characters.
- Keep graceful cap and communicate current visual and logical capacities.

## 4. Cinematic focus and event queue
- Preserve six gift keys exactly:
  `candle_1` (1), `prayer_5` (5), `rose_5` (5), `bell_10` (10), `altar_100` (100), `ceremony_500` (500).
- The **two five-coin actions must remain different**. No automatic rewriting to different gift map.
- Preserve functioning six gift effects, including when seats are full or gift arrives before AMEN.
- At 100 and 500, gently ease camera to a safe view of the acting attendee and restore the stable full scene within a bounded time. Queued gifts must not pin camera to one user or silently disappear.
- Keep sound quiet/respectful and licensed/original, with toggle. No flashing overlays or excessive simulated religious claims.

## 5. UX / scene visual hierarchy
- The LIVE route `/` must stay clean, full-bleed 9:16 with hero altar center, people on two sides, compact title and compact gift guide. No admin controls on stream.
- Keep local `/control`: controls for 1 AMEN, 20/50/100 burst, 6 gifts, environment settings, sound, NPC toggling and basic performance/crowd stats.
- Avoid text/sponsor overlays covering candles, faces, altar or TikTok app controls.
- Keep 'Virtual chapel experience' disclosure and full free participation.

## 6. Test and deliver
1. Preserve `npm install`, `npm run dev`, `npm run build`, `npm run typecheck`, `npm test` or document any honest exceptions.
2. Implement automated checks: stable seat assignment/overflow, repeated AMEN renewal without cloning, six gift keys, separate 5-coin effects, camera restore after multiple gifts, leaving/reentry, control route vs clean live view.
3. Test stress scenarios: 20 / 50 / 100 AMEN and 20 gifts; identify real performance outcomes or explicitly mark FPS unmeasured.
4. If browser/screenshot testing is available, capture portrait viewport screenshot of overview (filled congregation) and 100/500 effect state, and document where to find them. Don't fabricate results.
5. Update README and `docs/CHANGELOG_V1_1.md` with implemented changes, asset limitations, test results, and next v1.2 priorities.
6. Work on a feature branch and open a PR if environment supports it. Report exact completed files and commands, not promises.

## Acceptance gates
- First task's real game functions are intact.
- Scene is demonstrably more layered and church-like rather than just a lighting color change.
- Attendees naturally walk, turn, sit, stand and pray without flashes or seat intersection.
- 100-user burst degrades gracefully; gift interactions remain processable.
- 9:16 streaming presentation remains readable and uncluttered.
- No unlicensed asset downloads and no fictitious TikTok connectivity.
