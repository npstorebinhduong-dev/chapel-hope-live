import { chromium, expect } from "@playwright/test";
import { createChapelServer } from "../apps/server/src/app.ts";
import { GIFTS, giftKeys, attendeePose } from "../packages/shared/src/index.ts";
import { fillGiftedSeats } from "../packages/shared/src/fixtures.ts";
import { mkdir, writeFile } from "node:fs/promises";
const runtime = createChapelServer();
await new Promise<void>((r) => runtime.server.listen(3127, "127.0.0.1", r));
let offset = 0,
  closed = false;
const current = () => runtime.engine.active;
const snapshot = runtime.engine.snapshot.bind(runtime.engine);
runtime.engine.snapshot = () => snapshot(Date.now() + offset);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const dir = "docs/screenshots/live-v17";
await mkdir(dir, { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1920 },
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:3127/");
  const canvas = page.getByTestId("stage-canvas");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await expect(page.getByRole("button")).toHaveCount(0);
  const read = () => canvas.evaluate((el) => ({ ...el.dataset }));
  const capture = async (name: string) =>
    page.screenshot({ path: `${dir}/${name}.png` });
  const reset = () => {
    offset = 0;
    runtime.engine.control("reset");
  };
  const join = (count: number) => {
    const now = Date.now() + offset;
    for (let i = 0; i < count; i++)
      runtime.engine.comment({
        type: "comment",
        eventId: `amen-${i}`,
        userId: `u${i}`,
        username: `Guest ${i + 1}`,
        text: "AMEN",
        timestamp: now,
      });
  };
  const gift = (
    key: (typeof giftKeys)[number],
    user = "u0",
    eventId = `gift-${Date.now()}`,
  ) => {
    const now = Date.now() + offset;
    return runtime.engine.gift(
      {
        type: "gift",
        eventId,
        userId: user,
        username: `Donor ${user}`,
        giftKey: key,
        coinValue: GIFTS[key].coins,
        repeatCount: 1,
        timestamp: now,
      },
      now,
    );
  };
  const metrics: object[] = [];
  for (const count of [20, 50, 100, 1000]) {
    reset();
    join(count);
    await expect(canvas).toHaveAttribute("data-visible-waiting", String(count));
    await page.waitForTimeout(2200);
    const before = await read();
    await page.waitForTimeout(2500);
    const after = await read();
    await expect(page.locator(".status-dot")).not.toHaveClass(/disconnected/);
    metrics.push({
      count,
      drawFps: (Number(after.frames) - Number(before.frames)) / 2.5,
      actors: after.actors,
      canvas: await canvas.evaluate((c: HTMLCanvasElement) => [
        c.width,
        c.height,
      ]),
    });
    await capture(`crowd-${count}`);
    expect(runtime.engine.snapshot().insideCount).toBe(0);
  }
  // Real-time idle, no engine clock acceleration. Track visible vector doves,
  // ongoing repaints and changing pixel hashes at the candle/light/crowd regions.
  reset();
  join(100);
  await page.waitForTimeout(1800);
  const idleStart = performance.now(),
    idle: object[] = [],
    hashes = new Set<string>();
  let capturedBird = false;
  while (performance.now() - idleStart < 60000) {
    const d = await read();
    const hash = await canvas.evaluate((c: HTMLCanvasElement) => {
      const context = c.getContext("2d")!;
      const p = context.getImageData(
        0,
        Math.floor(c.height * 0.35),
        c.width,
        Math.floor(c.height * 0.63),
      ).data;
      let h = 2166136261;
      for (let i = 0; i < p.length; i += 41) h = Math.imul(h ^ p[i], 16777619);
      return String(h >>> 0);
    });
    hashes.add(hash);
    idle.push({
      at: Math.round(performance.now() - idleStart),
      birds: d.birds,
      frames: d.frames,
    });
    if (Number(d.birds) > 0 && !capturedBird) {
      await capture("idle-doves");
      capturedBird = true;
    }
    await page.waitForTimeout(2000);
  }
  expect(capturedBird).toBe(true);
  expect(hashes.size).toBeGreaterThan(20);
  // One entire arrival/ritual/rise/return at real time. The other effects use
  // clock jumps only between phases to keep the six-gift regression practical.
  reset();
  join(50);
  await page.waitForTimeout(1800);
  gift("candle_1", "u49");
  const moving = runtime.engine.attendees.get("u49")!;
  const walking: object[] = [];
  const started = performance.now();
  let last = attendeePose(moving, Date.now(), current()).position;
  let maxStep = 0,
    maxSpeed = 0,
    sampleAt = Date.now();
  while (current()) {
    const now = Date.now(),
      p = attendeePose(moving, now, current()).position;
    const step = Math.hypot(p[0] - last[0], p[2] - last[2]);
    maxStep = Math.max(maxStep, step);
    if (now > sampleAt)
      maxSpeed = Math.max(maxSpeed, step / ((now - sampleAt) / 1000));
    sampleAt = now;
    last = p;
    const d = await read();
    walking.push({
      at: Math.round(performance.now() - started),
      state: attendeePose(moving, now, current()).state,
      zoom: d.zoom,
      walking: d.walking,
    });
    if (walking.length === 30) await capture("leaving-crowd");
    await page.waitForTimeout(100);
  }
  expect(maxSpeed).toBeLessThan(3.2);
  expect(runtime.engine.completed).toBe(1);
  const gifts: object[] = [];
  for (const key of giftKeys) {
    gift(key, "u0");
    const a = current()!;
    offset =
      a.startedAt + Math.min(1100, (a.endsAt - a.startedAt) * 0.5) - Date.now();
    await expect(canvas).toHaveAttribute("data-gift", key);
    await page.waitForTimeout(750);
    const d = await read();
    expect(Number(d.zoom)).toBeGreaterThan(1.025);
    expect(d.cameraFocus).toBe("u0");
    await capture(key);
    gifts.push({
      key,
      zoom: d.zoom,
      focus: d.cameraFocus,
      candles: d.candles,
      roses: d.roses,
    });
    offset = a.returnEndsAt! + 10 - Date.now();
    await expect(canvas).toHaveAttribute("data-zoom", "1.0000");
  }
  // Re-test exact acceptance with density layout and new movement boundaries.
  reset();
  join(50);
  for (let i = 0; i < 5; i++) gift(giftKeys[i], `u${i}`, `accept-${i}`);
  let guard = 0;
  while (current()) {
    expect(guard++).toBeLessThan(10);
    offset = current()!.returnEndsAt! + 10 - Date.now();
    await page.waitForTimeout(200);
  }
  await expect(canvas).toHaveAttribute("data-waiting", "45");
  await expect(canvas).toHaveAttribute("data-inside", "5");
  await page.waitForTimeout(1500);
  await capture("50-amen-5-gifts");
  const acceptance = {
    waiting: runtime.engine.snapshot().waitingCount,
    inside: runtime.engine.snapshot().insideCount,
    seated: runtime.engine.snapshot().seatedCount,
  };
  // Thirty mixed gifts: each action receives its own focus, including small gifts.
  reset();
  join(100);
  for (let i = 0; i < 30; i++) gift(giftKeys[i % 6], `u${i}`, `burst-${i}`);
  const focused: string[] = [];
  while (current()) {
    const a = current()!;
    offset = a.startedAt + 200 - Date.now();
    await expect(canvas).toHaveAttribute("data-camera-focus", a.event.userId);
    focused.push(a.event.eventId);
    offset = a.returnEndsAt! + 10 - Date.now();
    await page.waitForTimeout(160);
  }
  expect(new Set(focused).size).toBe(30);
  expect(runtime.engine.completed).toBe(30);
  await expect(canvas).toHaveAttribute("data-zoom", "1.0000");
  // Full pews and all eight standing places occupied: further donor performs
  // a real ritual then departs. No duplicate seated avatar or fake presenter.
  reset();
  fillGiftedSeats(runtime.engine);
  gift("ceremony_500", "full-seat");
  let a = current()!;
  offset = a.startedAt + 2000 - Date.now();
  await expect(canvas).toHaveAttribute("data-gift", "ceremony_500");
  await page.waitForTimeout(700);
  await capture("full-seats-ceremony");
  offset = a.returnEndsAt! + 10 - Date.now();
  await page.waitForTimeout(200);
  expect(runtime.engine.attendees.get("full-seat")!.overflow).toBe(0);
  // Socket interruption is tested on a fresh page to observe only wall-clock
  // camera expiry without reconnecting snapshots, not artificially clearing state.
  gift("candle_1", "full-seat");
  a = current()!;
  offset = a.startedAt + 300 - Date.now();
  await expect(canvas).toHaveAttribute("data-camera-focus", "full-seat");
  await page.route("**/ws", (r) => r.abort());
  // close server prevents reconnects while CSS camera returns on its deadline.
  await runtime.close();
  closed = true;
  await expect(canvas).toHaveAttribute("data-zoom", "1.0000", {
    timeout: 10000,
  });
  expect(errors).toEqual([]);
  const report = {
    result: "passed",
    metrics,
    idleSeconds: (idle.at(-1) as { at: number }).at / 1000,
    idleSamples: idle,
    uniqueIdlePixelHashes: hashes.size,
    realTimeJourneySeconds: (walking.at(-1) as { at: number }).at / 1000,
    maxRootStepPerSample: maxStep,
    maxRootSpeed: maxSpeed,
    walking,
    gifts,
    acceptance,
    burst: {
      accepted: 30,
      focused: focused.length,
      uniqueFocus: new Set(focused).size,
    },
    errors,
    notes:
      "Linux Chromium production build. 60s idle and one whole journey in real time; six effects, full seats and 30 gifts use clock jumps between phases. Not Windows/OBS/TikTok LIVE verification.",
  };
  await writeFile(`${dir}/results.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        result: report.result,
        metrics,
        acceptance,
        burst: report.burst,
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
  if (!closed) await runtime.close();
}
