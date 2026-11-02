import { chromium, expect } from "@playwright/test";
import { createChapelServer } from "../apps/server/src/app.ts";
import { GIFTS, giftKeys, type GiftKey } from "../packages/shared/src/index.ts";
import { mkdir, writeFile } from "node:fs/promises";
const runtime = createChapelServer();
await new Promise<void>((resolve) =>
  runtime.server.listen(3116, "127.0.0.1", resolve),
);
let offset = 0;
const originalSnapshot = runtime.engine.snapshot.bind(runtime.engine);
runtime.engine.snapshot = () => originalSnapshot(Date.now() + offset);
const originalGift = runtime.engine.gift.bind(runtime.engine),
  originalComment = runtime.engine.comment.bind(runtime.engine);
runtime.engine.gift = (event, now) =>
  originalGift(event, now ?? Date.now() + offset);
runtime.engine.comment = (event, now) =>
  originalComment(event, now ?? Date.now() + offset);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const base = "http://127.0.0.1:3116",
  directory = "artifacts/queue";
await mkdir(directory, { recursive: true });
try {
  const live = await browser.newPage({ viewport: { width: 540, height: 960 } }),
    control = await browser.newPage({
      viewport: { width: 1280, height: 1000 },
    });
  const errors: string[] = [];
  for (const page of [live, control]) {
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
  }
  await live.goto(base);
  await control.goto(base + "/control");
  const canvas = live.getByTestId("stage-canvas");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await expect(live.getByRole("button")).toHaveCount(0);
  const metric = (name: string) =>
    control
      .locator("dl > div")
      .filter({ has: control.getByText(name, { exact: true }) })
      .locator("dd");
  async function identity(userId: string, username = "Guest") {
    await control.getByLabel("Display name").fill(username);
    await control.getByLabel("Session pseudonym").fill(userId);
  }
  async function reset() {
    offset = 0;
    control.once("dialog", (d) => d.accept());
    await control
      .getByRole("button", { name: "Reset session", exact: false })
      .click();
    await expect(control.getByTestId("viewer-count")).toHaveText("0");
  }
  async function capture(name: string) {
    await live.bringToFront();
    await live.waitForTimeout(800);
    await live.screenshot({ path: `${directory}/${name}.png` });
  }
  async function finishGift(captureName?: string) {
    const active = runtime.engine.active!;
    expect(active).not.toBeNull();
    offset =
      active.startedAt +
      Math.min(900, (active.endsAt - active.startedAt) * 0.5) -
      Date.now();
    await expect(canvas).toHaveAttribute("data-gift", active.event.giftKey);
    if (captureName) await capture(captureName);
    offset = active.returnEndsAt! + 10 - Date.now();
    await live.waitForTimeout(250);
  }
  // Exact 1/2 comments before AMEN never create avatars or gifts.
  await identity("A", "Avery");
  await control.getByRole("button", { name: "1 Male", exact: true }).click();
  await expect(control.getByTestId("viewer-count")).toHaveText("0");
  await control.getByRole("button", { name: "Send AMEN" }).click();
  await control.getByRole("button", { name: "Send AMEN" }).click();
  await expect(control.getByTestId("viewer-count")).toHaveText("1");
  expect(runtime.engine.attendees.get("A")!.gender).toBe("male");
  for (const label of ["2 Female", "1 Male", "2 Female"])
    await control.getByRole("button", { name: label, exact: true }).click();
  await expect
    .poll(
      () =>
        JSON.parse(
          runtime.engine.snapshot().avatarVariantByUser
            ? JSON.stringify(runtime.engine.snapshot().avatarVariantByUser)
            : "{}",
        ).A.gender,
    )
    .toBe("female");
  expect(runtime.engine.attendees.get("A")!.seat).toBeNull();
  await capture("C-gender-waiting");
  await reset();
  await control
    .getByRole("button", { name: "+ 20 visitors", exact: true })
    .click();
  offset = 20000;
  await expect(canvas).toHaveAttribute("data-waiting", "20");
  await expect(canvas).toHaveAttribute("data-inside", "0");
  await expect(canvas).toHaveAttribute("data-visible-waiting", "12");
  await capture("A-20-AMEN-waiting");
  await reset();
  await control
    .getByRole("button", { name: "+ 50 visitors", exact: true })
    .click();
  await expect(metric("Waiting")).toHaveText("50");
  await expect(metric("Inside")).toHaveText("0");
  const ids = [...runtime.engine.attendees.keys()];
  for (let i = 0; i < 5; i++) {
    await identity(ids[i], `Donor ${i + 1}`);
    await control.getByTestId(giftKeys[i]).click();
    await expect(control.getByTestId(giftKeys[i])).toBeEnabled();
  }
  expect(runtime.engine.snapshot().waitingCount).toBe(45);
  const first = runtime.engine.active!;
  offset = first.dispatchedAt! + 4000 - Date.now();
  await expect(canvas).toHaveAttribute("data-walking", "1");
  await capture("B0-walking-from-line");
  const observed = new Set<GiftKey>();
  while (runtime.engine.active) {
    observed.add(runtime.engine.active.event.giftKey);
    await finishGift(
      runtime.engine.active.event.giftKey === "altar_100"
        ? "D-altar-100"
        : undefined,
    );
  }
  await expect(metric("Waiting")).toHaveText("45");
  await expect(metric("Inside")).toHaveText("5");
  await expect(metric("Seated")).toHaveText("5");
  const acceptance = runtime.engine.snapshot();
  expect(acceptance.attendees.length).toBe(50);
  expect(
    new Set(
      acceptance.attendees.filter((a) => a.seat !== null).map((a) => a.seat),
    ).size,
  ).toBe(5);
  await capture("B-50-AMEN-only-5-inside");
  // Same donor, same avatar, with another big gift; wall clock timestamps may be older
  // than our deterministic test offset, so dispatch is observed before advancing again.
  await identity(ids[0], "Donor 1");
  await control.getByTestId("ceremony_500").click();
  observed.add("ceremony_500");
  await finishGift("E-ceremony-500");
  await expect(canvas).toHaveAttribute("data-zoom", "1.0000");
  expect(runtime.engine.attendees.size).toBe(50);
  expect(observed.size).toBe(6);
  await reset();
  control.once("dialog", (d) => d.accept());
  await control
    .getByRole("button", { name: "Fill seats · mock gift replay", exact: true })
    .click();
  await expect(metric("Seated")).toHaveText("48");
  await identity("full-seat-donor", "Standing guest");
  await control.getByTestId("rose_5").click();
  await finishGift("F-full-seats-gift");
  await expect(metric("Inside")).toHaveText("49");
  await expect(metric("Seated")).toHaveText("48");
  expect(runtime.engine.attendees.get("full-seat-donor")!.overflow).toBe(0);
  await reset();
  await control
    .getByRole("button", { name: "+ 100 visitors", exact: true })
    .click();
  const stressIds = [...runtime.engine.attendees.keys()];
  for (let i = 0; i < 20; i++) {
    const response = await fetch(base + "/mock/gift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: stressIds[i],
        username: `Guest ${i}`,
        giftKey: giftKeys[i % 6],
        eventId: `stress-${i}`,
      }),
    });
    expect(response.status).toBe(200);
  }
  let guard = 0;
  while (true) {
    const running = runtime.engine.snapshot().active;
    if (!running) break;
    expect(guard++).toBeLessThan(30);
    offset = running.returnEndsAt! + 10 - Date.now();
    await live.waitForTimeout(120);
  }
  await expect(metric("Inside")).toHaveText("20");
  await expect(metric("Waiting")).toHaveText("80");
  expect(runtime.engine.completed).toBe(20);
  await capture("G-100-AMEN-20-gifts");
  // Real audio graph, not a mocked API: inspect generated signal and fade-to-mute.
  await reset();
  await control.bringToFront();
  await control
    .getByRole("button", { name: "Enable audio in this tab", exact: true })
    .click();
  await control.getByLabel("Mute sound", { exact: true }).click();
  await expect(
    control.getByLabel("Mute sound", { exact: true }),
  ).not.toBeChecked();
  const audio = control.getByTestId("audio-status");
  await expect
    .poll(
      async () => JSON.parse((await audio.getAttribute("data-audio"))!).level,
    )
    .toBeGreaterThan(0.00001);
  const audible = JSON.parse((await audio.getAttribute("data-audio"))!);
  const loopChords = new Set<number>();
  while (true) {
    const sample = JSON.parse((await audio.getAttribute("data-audio"))!);
    loopChords.add(sample.chord);
    if (sample.contextTime >= 49) break;
    await control.waitForTimeout(2000);
  }
  expect([...loopChords].sort()).toEqual([0, 1, 2, 3]);
  const loopEnd = JSON.parse((await audio.getAttribute("data-audio"))!);
  expect(loopEnd.level).toBeGreaterThan(0.00001);
  expect(loopEnd.chord).toBe(0);
  await identity("audio-donor");
  await control.getByTestId("bell_10").click();
  offset = runtime.engine.active!.startedAt + 200 - Date.now();
  await expect
    .poll(
      async () => JSON.parse((await audio.getAttribute("data-audio"))!).voices,
    )
    .toBeGreaterThan(0);
  const sfx = JSON.parse((await audio.getAttribute("data-audio"))!);
  expect(sfx.voices).toBeLessThanOrEqual(24);
  await control.getByLabel("Mute sound", { exact: true }).click();
  await expect(control.getByLabel("Mute sound", { exact: true })).toBeChecked();
  await control.waitForTimeout(1600);
  const muted = JSON.parse((await audio.getAttribute("data-audio"))!);
  expect(muted.level).toBeLessThan(0.00001);
  await control.screenshot({
    path: `${directory}/control.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
  const report = {
    result: "passed",
    acceptance: {
      AMEN: 50,
      gifters: 5,
      waiting: acceptance.waitingCount,
      inside: acceptance.insideCount,
      seated: acceptance.seatedCount,
      npcsExcluded: true,
    },
    stress: { AMEN: 100, gifts: 20, inside: 20, waiting: 80 },
    observedGifts: [...observed],
    audio: {
      audible,
      sfx,
      muted,
      loopSeconds: loopEnd.contextTime,
      loopChords: [...loopChords],
    },
    errors,
    notes:
      "Production UI/HTTP/WebSocket. Deterministic server clock jumps between complete journey boundaries for long gift queues; separate arrival captures show motion. Audio uses a real browser AudioContext with analyser signal; not a subjective speaker-quality review.",
  };
  await writeFile(`${directory}/results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await runtime.close();
}
