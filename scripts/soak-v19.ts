import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createChapelServer } from "../apps/server/src/app.ts";
import { GIFTS, giftKeys } from "../packages/shared/src/index.ts";
const minutes = Number(process.env.SOAK_MINUTES ?? 30);
if (!Number.isFinite(minutes) || minutes < 1 || minutes > 120)
  throw Error("SOAK_MINUTES must be 1..120");
// Run against the production build in the repository.
// SOAK_CLIENT_ROOT optionally selects a frozen client build for repeatable diagnostics.
const outputRoot = process.cwd() + "/artifacts/live-v19";
if (process.env.SOAK_CLIENT_ROOT) process.chdir(process.env.SOAK_CLIENT_ROOT);
const runtime = createChapelServer();
await new Promise<void>((r) => runtime.server.listen(3118, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir(outputRoot, { recursive: true });
const started = Date.now(),
  samples: any[] = [];
let serial = 0,
  lastMinute = -1,
  reloaded = false;
try {
  await page.goto("http://127.0.0.1:3118/");
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.getByTestId("live-frame").click({ position: { x: 20, y: 400 } });
  runtime.engine.control("muted", false);
  await expect
    .poll(
      async () =>
        JSON.parse(
          (await page.getByTestId("live-frame").getAttribute("data-audio")) ??
            "{}",
        ).running,
    )
    .toBe(true);
  for (let i = 0; i < 100; i++)
    runtime.engine.comment({
      type: "comment",
      eventId: "join" + i,
      userId: "soak-" + i,
      username: "Guest " + i,
      text: "AMEN",
      timestamp: Date.now(),
    });
  const gift = (i: number) => {
    const key = giftKeys[i % 6];
    runtime.engine.gift({
      type: "gift",
      source: "mock",
      eventId: "soak-gift-" + serial++,
      userId: "soak-" + (i % 100),
      username: "Guest " + (i % 100),
      giftKey: key,
      coinValue: GIFTS[key].coins,
      repeatCount: 1,
      timestamp: Date.now(),
    });
  };
  for (let i = 0; i < 30; i++) gift(i);
  for (let i = 0; i < 1000; i++)
    runtime.engine.engage({
      type: "like",
      source: "mock",
      eventId: `like-${i}`,
      userId: "",
      username: "",
      count: 1,
      timestamp: Date.now(),
    });
  for (let i = 0; i < 100; i++)
    runtime.engine.engage({
      type: "share",
      source: "mock",
      eventId: `share-${i}`,
      userId: `u${i}`,
      username: "Khách",
      count: 1,
      timestamp: Date.now(),
    });
  while (Date.now() - started < minutes * 60000) {
    const elapsed = Date.now() - started,
      minute = Math.floor(elapsed / 60000);
    if (minute !== lastMinute) {
      lastMinute = minute;
      for (let i = 0; i < 100; i++)
        runtime.engine.comment({
          type: "comment",
          eventId: `renew-${minute}-${i}`,
          userId: "soak-" + i,
          username: "Guest " + i,
          text: "AMEN",
          timestamp: Date.now(),
        });
      if (minute) gift(minute + 30);
      console.log(
        `soak minute ${minute}: processed ${runtime.engine.completed}, pending ${runtime.engine.queue.length}`,
      );
    }
    if (!reloaded && elapsed > Math.min(5, minutes / 2) * 60000) {
      await page.reload();
      await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
        "data-ready",
        "true",
      );
      await page
        .getByTestId("live-frame")
        .click({ position: { x: 20, y: 400 } });
      await expect
        .poll(
          async () =>
            JSON.parse(
              (await page
                .getByTestId("live-frame")
                .getAttribute("data-audio")) ?? "{}",
            ).running,
        )
        .toBe(true);
      reloaded = true;
    }
    const audio = JSON.parse(
      (await page.getByTestId("live-frame").getAttribute("data-audio")) ?? "{}",
    );
    if (audio.persistentSources !== undefined) {
      expect(audio.persistentSources).toBe(7);
      expect(audio.voices).toBeLessThanOrEqual(24);
      expect(audio.peak).toBeLessThan(1);
    }
    const snapshot = runtime.engine.snapshot();
    expect(snapshot.attendees.length).toBeLessThanOrEqual(100);
    expect(snapshot.rejected).toBe(0);
    expect(runtime.engine.accepted).toBe(serial);
    const community = snapshot.community!;
    expect(community.hearts).toBe(1000);
    expect(community.shares).toBe(100);
    samples.push({
      community,
      elapsedMs: elapsed,
      heap: process.memoryUsage().heapUsed,
      attendees: snapshot.attendees.length,
      pending: snapshot.giftPending,
      completed: snapshot.completed,
      audio,
    });
    await writeFile(
      outputRoot + "/soak-progress.json",
      JSON.stringify(
        { minutes, elapsedMs: elapsed, latest: samples.at(-1), errors },
        null,
        2,
      ),
    );
    await page.waitForTimeout(15000);
  }
  expect(errors).toEqual([]);
  await writeFile(
    outputRoot + "/soak.json",
    JSON.stringify(
      {
        result: "passed",
        wallClockMinutes: (Date.now() - started) / 60000,
        accepted: serial,
        completed: runtime.engine.completed,
        pending: runtime.engine.queue.length + (runtime.engine.active ? 1 : 0),
        reloaded,
        samples,
        errors,
        note: "Real-time mock server/browser/audio soak; ongoing queued gifts are retained. Not a Windows/live capture or FPS benchmark.",
      },
      null,
      2,
    ),
  );
  console.log("Real-time soak passed");
} finally {
  await browser.close();
  await runtime.close();
}
