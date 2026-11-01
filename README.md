# Chapel of Hope LIVE — EU Edition

An interactive **virtual European chapel** for portrait (9:16) livestreams. Planned visual direction: realistic 3D, a lively congregation and optional visual prayer-themed actions.

> **Status:** Technical specification and Codex task are ready. Game application code has **not been generated yet**.

## Locked gameplay
- Free comment **AMEN**: join as a 3D attendee, find a seat, sit / pray.
- Six gift actions:
  - **1 coin:** Light a Candle (`candle_1`)
  - **5 coins:** Kneel & Pray (`prayer_5`)
  - **5 coins:** Offer a White Rose (`rose_5`)
  - **10 coins:** Ring the Bell (`bell_10`)
  - **100 coins:** Special Prayer at Altar (`altar_100`)
  - **500 coins:** Grand Ceremony Moment (`ceremony_500`)

## Start with Codex
1. Open this repository in **Codex** (select `npstorebinhduong-dev/chapel-hope-live` and branch `main`).
2. Ask Codex: **"Read AGENTS.md, docs/TECH_SPEC_V1.md and docs/CODEX_PROMPT_01.md; implement Codex Task #01 fully and open a pull request."**
3. Review the PR, verify build and tests, then merge to `main`.
4. Follow the generated app's setup commands to run the local 9:16 stream view and the `/control` simulation panel.

## Project documents
- [AGENTS.md](AGENTS.md) — enduring Codex engineering and product rules.
- [Technical specification v1.0](docs/TECH_SPEC_V1.md) — goals, architecture, states, gift mapping, performance and acceptance criteria.
- [Codex prompt #01](docs/CODEX_PROMPT_01.md) — exact implementation brief for the first working build.

## Guiding principles
- Participation is free. Gifts trigger optional visual experiences, not promised spiritual outcomes.
- Use original or properly licensed media; do not impersonate a real parish or church.
- Mock events first; actual TikTok gift IDs and integrations are future, separate tasks.
- Keep controls off the livestream capture view.
