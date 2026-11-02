import { chromium, expect } from "@playwright/test";
import { createChapelServer } from "../apps/server/src/app.ts";
import { GIFTS, type GiftKey } from "../packages/shared/src/index.ts";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
const runtime = createChapelServer();
await new Promise<void>((resolve) =>
  runtime.server.listen(3114, "127.0.0.1", resolve),
);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: [
    "--no-sandbox",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--disable-background-timer-throttling",
  ],
});
const originalSnapshot = runtime.engine.snapshot.bind(runtime.engine);
let frozen: number | null = null;
runtime.engine.snapshot = (now = Date.now()) => originalSnapshot(frozen ?? now);
try {
  const page = await browser.newPage({
    viewport: { width: 540, height: 960 },
    deviceScaleFactor: 1,
  });
  let pauseSnapshots = false;
  await page.routeWebSocket("**/ws", (socket) => {
    const upstream = socket.connectToServer();
    upstream.onMessage((message) => {
      if (!pauseSnapshots) socket.send(message);
    });
    socket.onMessage((message) => upstream.send(message));
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("http://127.0.0.1:3114/");
  await expect(page.locator("canvas")).toHaveAttribute("data-ready", "true");
  await mkdir("artifacts/stage", { recursive: true });
  const samples = [];
  for (const count of [0, 20, 50, 100]) {
    runtime.engine.control("reset");
    const old = Date.now() - 120000;
    for (let i = 0; i < count; i++)
      runtime.engine.comment({
        type: "comment",
        userId: `viewer-${i}`,
        username: `Guest ${i + 1}`,
        eventId: `join-${i}`,
        text: "AMEN",
        timestamp: old,
      });
    await page.waitForTimeout(1800);
    const before = await page.locator("canvas").getAttribute("data-frames");
    const start = Date.now();
    const fps = await page.evaluate<number>(
      `new Promise(resolve=>{let n=0;const t=performance.now();function frame(){n++;if(performance.now()-t>=4000)resolve(n*1000/(performance.now()-t));else requestAnimationFrame(frame);}requestAnimationFrame(frame);})`,
    );
    const after = await page.locator("canvas").getAttribute("data-frames");
    samples.push({
      attendees: count,
      rafFps: Number(fps.toFixed(1)),
      renderFps: Number(
        (
          ((Number(after) - Number(before)) * 1000) /
          (Date.now() - start)
        ).toFixed(1),
      ),
    });
    await page.screenshot({ path: `artifacts/stage/crowd-${count}.png` });
    if (count === 0)
      await page.screenshot({ path: "artifacts/stage/E-priest-and-altar.png" });
    if (count === 50)
      await page.screenshot({ path: "artifacts/stage/A-50-attendees.png" });
  }
  runtime.engine.control("reset");
  for (let i = 0; i < 50; i++)
    runtime.engine.comment({
      type: "comment",
      userId: `viewer-${i}`,
      username: `Guest ${i + 1}`,
      eventId: `join-${i}`,
      text: "AMEN",
      timestamp: Date.now() - 120000,
    });
  const captures: [GiftKey, string][] = [
    ["candle_1", "B-candles"],
    ["prayer_5", "B1-prayer"],
    ["rose_5", "B2-flowers"],
    ["bell_10", "B3-bell"],
    ["altar_100", "C-altar-100"],
    ["ceremony_500", "D-ceremony-500"],
  ];
  let base = Date.now();
  for (const [key, name] of captures) {
    base += 20000;
    runtime.engine.tick(base);
    runtime.engine.gift(
      {
        type: "gift",
        giftKey: key,
        eventId: key,
        userId: "viewer-0",
        username: "Guest 1",
        coinValue: GIFTS[key].coins,
        repeatCount: 1,
        timestamp: base,
      },
      base,
    );
    // Pause only the snapshot clock at an actual mid-effect state; no image editing or render overrides.
    frozen = base + GIFTS[key].duration * 0.45;
    await page.waitForTimeout(2200);
    await expect(page.getByTestId("activity")).toContainText(GIFTS[key].label);
    await expect(page.locator("canvas")).toHaveAttribute("data-gift", key);
    await page.screenshot({ path: `artifacts/stage/${name}.png` });
    expect(runtime.engine.active?.event.giftKey).toBe(key);
  }
  frozen = null;
  runtime.engine.tick(base + 10000);
  // Exercise a real moving attendee, then a lost/stalled stream during focus.
  runtime.engine.control("reset");
  runtime.engine.comment({
    type: "comment",
    userId: "walker",
    username: "Guest",
    eventId: "walker",
    text: "AMEN",
    timestamp: Date.now() - 3000,
  });
  await page.waitForTimeout(1400);
  await expect(page.locator("canvas")).toHaveAttribute("data-walking", "1");
  await page.screenshot({ path: "artifacts/stage/G-arrival.png" });
  const moment = Date.now();
  runtime.engine.gift(
    {
      type: "gift",
      giftKey: "altar_100",
      eventId: "stale-focus",
      userId: "walker",
      username: "Guest",
      coinValue: 100,
      repeatCount: 1,
      timestamp: moment,
    },
    moment,
  );
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-gift",
    "altar_100",
  );
  pauseSnapshots = true;
  await page.waitForTimeout(GIFTS.altar_100.duration + 300);
  await expect(page.locator("canvas")).toHaveAttribute("data-gift", "");
  await expect(page.locator("canvas")).toHaveAttribute("data-zoom", "1.0000");
  pauseSnapshots = false;
  const qualitySamples = [];
  runtime.engine.control("reset");
  for (let i = 0; i < 100; i++)
    runtime.engine.comment({
      type: "comment",
      userId: `stress-${i}`,
      username: `Guest ${i}`,
      eventId: `stress-${i}`,
      text: "AMEN",
      timestamp: Date.now() - 120000,
    });
  await page.setViewportSize({ width: 1080, height: 1920 });
  for (const quality of ["low", "balanced", "high"]) {
    await page.evaluate(
      (q) => localStorage.setItem("chapel-quality", q),
      quality,
    );
    await page.reload();
    await expect(page.locator("canvas")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("canvas")).toHaveAttribute(
      "data-quality",
      quality,
    );
    await page.waitForTimeout(1800);
    const n = Number(await page.locator("canvas").getAttribute("data-frames")),
      t = Date.now();
    await page.waitForTimeout(4000);
    const end = Number(
      await page.locator("canvas").getAttribute("data-frames"),
    );
    qualitySamples.push({
      quality,
      attendees: 100,
      viewport: "1080x1920",
      renderFps: Number((((end - n) * 1000) / (Date.now() - t)).toFixed(1)),
    });
  }
  await page.screenshot({ path: "artifacts/stage/F-100-high-1080.png" });
  await page.setViewportSize({ width: 540, height: 960 });
  await page.goto("http://127.0.0.1:3114/control");
  await expect(page.getByTestId("viewer-count")).toHaveText("100");
  await page.screenshot({
    path: "artifacts/stage/control.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
  const report = {
    viewport: "540x960",
    quality: "Balanced",
    renderer: "Chromium Canvas2D / headless cloud",
    hardware: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      cpu: os.cpus()[0]?.model,
    },
    samples,
    qualitySamples,
    errors,
    staleStreamFocusRecovery: "passed",
    walkingSprite: "passed",
    notes:
      "FPS sampled with real-time animation. Arrival clocks advanced 120s to populate seating. Gift screenshots pause the server snapshot clock at 45% of the real effect duration for reproducible capture.",
  };
  await writeFile(
    "artifacts/stage/results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await runtime.close();
}
