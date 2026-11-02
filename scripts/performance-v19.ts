import { chromium, expect } from "@playwright/test";
import { createChapelServer } from "../apps/server/src/app.ts";
import { defaultProduction } from "../packages/shared/src/production.ts";
import { mkdir, writeFile } from "node:fs/promises";
const runtime = createChapelServer();
await new Promise<void>((r) => runtime.server.listen(3140, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-background-timer-throttling"],
});
try {
  const page = await browser.newPage({
      viewport: { width: 1080, height: 1920 },
    }),
    base = "http://127.0.0.1:3140",
    errors: string[] = [],
    samples: any[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  const c = page.getByTestId("stage-canvas");
  await expect(c).toHaveAttribute("data-ready", "true");
  for (const target of [100, 1000, 1500]) {
    const now = Date.now();
    for (let i = runtime.engine.snapshot().totalAttendees ?? 0; i < target; i++)
      runtime.engine.comment({
        type: "comment",
        source: "mock",
        eventId: `a${i}`,
        userId: `u${i}`,
        username: `Guest ${i}`,
        text: "AMEN",
        timestamp: now,
      });
    if (target === 1500) {
      const r = await fetch(base + "/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...defaultProduction(),
          engagement: {
            ...defaultProduction().engagement,
            renderLimit: 200,
            memoryLimit: 1000,
          },
        }),
      });
      expect(r.ok).toBe(true);
    }
    await expect(c).toHaveAttribute("data-waiting", String(target));
    await page.waitForTimeout(1500);
    const start = Number(await c.getAttribute("data-frames")),
      time = Date.now();
    await page.waitForTimeout(5000);
    const end = Number(await c.getAttribute("data-frames"));
    const s = runtime.engine.snapshot();
    samples.push({
      target,
      framesPerSecond: ((end - start) * 1000) / (Date.now() - time),
      nodeHeap: process.memoryUsage().heapUsed,
      browserHeap: await page.evaluate(
        () => (performance as any).memory?.usedJSHeapSize ?? null,
      ),
      rendered: s.attendees.length,
      compact: s.compactWaiting,
      hidden: s.hiddenWaiting,
      waiting: s.waitingCount,
    });
  }
  await expect(page.locator(".hidden-waiting")).toContainText("1300");
  expect(runtime.engine.snapshot().insideCount).toBe(0);
  // Additional #10 acceptance pictures: 30% progress and a genuine scheduled subtitle.
  runtime.engine.control("reset");
  runtime.engine.engage({
    type: "like",
    eventId: "30pct",
    userId: "",
    username: "",
    count: 300,
    source: "mock",
    timestamp: Date.now(),
  });
  await expect(page.getByTestId("hearts-progress")).toHaveAttribute(
    "data-hearts",
    "300",
  );
  await page.screenshot({ path: "artifacts/live-v19/hearts-30-percent.png" });
  runtime.engine.community.lastActivity = Date.now() - 120001;
  runtime.engine.community.lastShare = Date.now() - 120001;
  runtime.engine.community.tick(Date.now(), false, true, false, true);
  await expect(page.getByTestId("wish-banner")).toContainText(/AMEN/);
  await page.screenshot({ path: "artifacts/live-v19/cta-subtitle.png" });
  expect(errors).toEqual([]);
  await mkdir("artifacts/live-v19", { recursive: true });
  await writeFile(
    "artifacts/live-v19/performance.json",
    JSON.stringify(
      {
        result: "passed",
        samples,
        errors,
        note: "Linux headless Chromium, balanced Canvas2D. Five-second windows, not Windows FPS promise. CTA source-ready flag supplied by the test; native speech absent.",
      },
      null,
      2,
    ),
  );
  console.log(samples);
} finally {
  await browser.close();
  await runtime.close();
}
