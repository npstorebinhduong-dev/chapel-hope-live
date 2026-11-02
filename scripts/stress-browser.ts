import { chromium, expect } from "@playwright/test";
import { createChapelServer } from "../apps/server/src/app.ts";
import { mkdir, writeFile } from "node:fs/promises";
const runtime = createChapelServer();
await new Promise<void>((resolve) =>
  runtime.server.listen(3111, "127.0.0.1", resolve),
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
try {
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } }),
    errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:3111/");
  await expect(page.locator("canvas")).toBeVisible();
  await mkdir("artifacts/v1.1", { recursive: true });
  const results = [];
  for (const count of [20, 50, 100]) {
    runtime.engine.control("reset");
    const old = Date.now() - 120000;
    for (let i = 0; i < count; i++)
      runtime.engine.comment({
        type: "comment",
        userId: `stress${i}`,
        username: `Visitor ${i + 1}`,
        eventId: `join${i}`,
        text: "AMEN",
        timestamp: old,
      });
    await page.waitForTimeout(1500);
    const fps = await page.evaluate<number>(
      `new Promise(resolve=>{let frames=0;const start=performance.now();function sample(){frames++;if(performance.now()-start>=4000)resolve(frames*1000/(performance.now()-start));else requestAnimationFrame(sample);}requestAnimationFrame(sample);})`,
    );
    await page.screenshot({ path: `artifacts/v1.1/congregation-${count}.png` });
    results.push({ count, fps: Number(fps.toFixed(1)) });
  }
  for (const key of ["altar_100", "ceremony_500"] as const) {
    runtime.engine.gift({
      type: "gift",
      giftKey: key,
      eventId: key,
      userId: "stress0",
      username: "Visitor 1",
      coinValue: key === "altar_100" ? 100 : 500,
      repeatCount: 1,
      timestamp: Date.now(),
    });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `artifacts/v1.1/${key}.png` });
    while (runtime.engine.active) await page.waitForTimeout(200);
  }
  await page.goto("http://127.0.0.1:3111/control");
  await expect(
    page.getByRole("button", { name: "+ 100 visitors", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Rendering quality").selectOption("low");
  expect(
    await page.evaluate(() => localStorage.getItem("chapel-quality")),
  ).toBe("low");
  await page.screenshot({ path: "artifacts/v1.1/control.png", fullPage: true });
  expect(errors).toEqual([]);
  const report = {
    renderer: "Chromium SwiftShader software GPU",
    arrivalSetup:
      "Arrival clocks advanced by 120 seconds to measure fully populated scenes",
    results,
    errors,
  };
  await writeFile(
    "artifacts/v1.1/performance.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await runtime.close();
}
