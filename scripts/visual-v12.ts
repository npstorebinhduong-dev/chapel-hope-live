import { chromium, expect } from "@playwright/test";
import { createChapelServer } from "../apps/server/src/app.ts";
import { GIFTS, type GiftKey } from "../packages/shared/src/index.ts";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
const runtime = createChapelServer();
await new Promise<void>((resolve) =>
  runtime.server.listen(3112, "127.0.0.1", resolve),
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
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("http://127.0.0.1:3112/");
  await expect(page.locator("canvas")).toBeVisible();
  await mkdir("artifacts/v1.2", { recursive: true });
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
    const fps = await page.evaluate<number>(
      `new Promise(resolve=>{let n=0;const t=performance.now();function frame(){n++;if(performance.now()-t>=4000)resolve(n*1000/(performance.now()-t));else requestAnimationFrame(frame);}requestAnimationFrame(frame);})`,
    );
    samples.push({ attendees: count, fps: Number(fps.toFixed(1)) });
    if (count === 50)
      await page.screenshot({ path: "artifacts/v1.2/A-50-attendees.png" });
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
    ["rose_5", "B2-flowers"],
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
    await page.screenshot({ path: `artifacts/v1.2/${name}.png` });
    expect(runtime.engine.active?.event.giftKey).toBe(key);
  }
  frozen = null;
  runtime.engine.tick(base + 10000);
  await page.goto("http://127.0.0.1:3112/control");
  await expect(page.getByTestId("viewer-count")).toHaveText("50");
  await page.screenshot({ path: "artifacts/v1.2/control.png", fullPage: true });
  expect(errors).toEqual([]);
  const report = {
    viewport: "540x960",
    quality: "Balanced",
    renderer: "Chromium / SwiftShader software GPU",
    hardware: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      cpu: os.cpus()[0]?.model,
    },
    samples,
    errors,
    notes:
      "FPS sampled with real-time animation. Arrival clocks advanced 120s to populate seating. Gift screenshots pause the server snapshot clock at 45% of the real effect duration for reproducible capture.",
  };
  await writeFile(
    "artifacts/v1.2/results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await runtime.close();
}
