import { chromium, expect } from "@playwright/test";
import { createChapelServer } from "../apps/server/src/app.ts";
import { defaultProduction } from "../packages/shared/src/production.ts";
import { giftKeys, GIFTS } from "../packages/shared/src/index.ts";
import { writeFile, mkdir } from "node:fs/promises";
const runtime = createChapelServer();
await new Promise<void>((r) => runtime.server.listen(3119, "127.0.0.1", r));
let offset = 0;
const snapshot = runtime.engine.snapshot.bind(runtime.engine);
runtime.engine.snapshot = () => snapshot(Date.now() + offset);
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } }),
    errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const wav = Buffer.alloc(44 + 24000 * 3 * 2);
  wav.write("RIFF");
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(24000, 24);
  wav.writeUInt32LE(48000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(wav.length - 44, 40);
  for (let i = 0; i < 72000; i++)
    wav.writeInt16LE(
      Math.round(
        Math.sin((i * 2 * Math.PI * 220) / 24000) *
          1800 *
          Math.min(1, i / 1200, (72000 - i) / 1200),
      ),
      44 + i * 2,
    );
  const manifest = Object.fromEntries(
    ["en", "vi", "it"].flatMap((l) =>
      giftKeys.flatMap((k) =>
        [0, 1].map((v) => [`${l}/${k}-${v}`, "/voice/fixture.wav"]),
      ),
    ),
  );
  await page.route("**/voice/manifest.json", (r) =>
    r.fulfill({ json: manifest }),
  );
  await page.route("**/voice/fixture.wav", (r) =>
    r.fulfill({ body: wav, contentType: "audio/wav" }),
  );
  await page.addInitScript({
    content: `window.__media=[];const original=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__media.push(this);return original.apply(this,arguments);};`,
  });
  await page.goto("http://127.0.0.1:3119/");
  await page.getByTestId("live-frame").click({ position: { x: 20, y: 400 } });
  await expect
    .poll(
      async () =>
        JSON.parse(
          (await page.getByTestId("live-frame").getAttribute("data-audio")) ??
            "{}",
        ).running,
    )
    .toBe(true);
  runtime.engine.control("muted", false);
  let manifestLoaded = false;
  page.on("response", (r) => {
    if (r.url().endsWith("/voice/manifest.json")) manifestLoaded = true;
  });
  for (const locale of ["en", "vi", "it"] as const) {
    const response = await fetch("http://127.0.0.1:3119/api/production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...defaultProduction(),
        provider: "recorded",
        locale,
      }),
    });
    expect(response.ok).toBe(true);
    await expect.poll(() => manifestLoaded).toBe(true);
    const now = Date.now() + offset;
    runtime.engine.gift(
      {
        type: "gift",
        source: "mock",
        giftKey: "altar_100",
        eventId: locale,
        userId: "clip-donor",
        username: "Guest",
        coinValue: GIFTS.altar_100.coins,
        repeatCount: 1,
        timestamp: now,
      },
      now,
    );
    const active = runtime.engine.active!;
    offset = active.startedAt + 100 - Date.now();
    await expect(page.getByTestId("wish-banner")).toHaveAttribute(
      "data-locale",
      locale,
    );
    await expect(page.getByTestId("wish-banner")).toHaveAttribute(
      "data-speaking",
      "true",
    );
    await page.waitForTimeout(1000);
    const audio = JSON.parse(
      (await page.getByTestId("live-frame").getAttribute("data-audio"))!,
    );
    expect(audio.ducked).toBe(true);
    expect(audio.musicGain).toBeLessThan(0.11);
    expect(
      await page.evaluate(() => (window as any).__media.at(-1).paused),
    ).toBe(false);
    if (locale === "vi") {
      await fetch("http://127.0.0.1:3119/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...defaultProduction(),
          provider: "recorded",
          locale,
          mix: { ...defaultProduction().mix, voice: 0 },
        }),
      });
      await expect(page.getByTestId("wish-banner")).toHaveAttribute(
        "data-speaking",
        "false",
      );
      expect(
        await page.evaluate(() => (window as any).__media.at(-1).paused),
      ).toBe(true);
      await expect(page.getByTestId("wish-banner")).toHaveCount(0, {
        timeout: 6500,
      });
    } else if (locale === "it") {
      runtime.engine.control("muted", true);
      await expect(page.getByTestId("wish-banner")).toHaveAttribute(
        "data-speaking",
        "false",
      );
      expect(
        await page.evaluate(() => (window as any).__media.at(-1).paused),
      ).toBe(true);
    } else
      await expect(page.getByTestId("wish-banner")).toHaveAttribute(
        "data-speaking",
        "false",
        { timeout: 5000 },
      );
    offset = active.returnEndsAt! + 10 - Date.now();
    await page.waitForTimeout(200);
  }
  runtime.engine.control("muted", false);
  const busChecks: Record<string, number> = {};
  for (const layer of ["music", "ambient", "sfx", "master"] as const) {
    // Keep the SFX graph rendering while measuring its automated gain.
    if (layer === "sfx") {
      const beforeTriggers = JSON.parse(
        (await page.getByTestId("live-frame").getAttribute("data-audio"))!,
      ).triggers;
      const now = Date.now() + offset;
      runtime.engine.gift(
        {
          type: "gift",
          source: "mock",
          giftKey: "ceremony_500",
          eventId: "mixer-probe",
          userId: "clip-donor",
          username: "Guest",
          coinValue: 500,
          repeatCount: 1,
          timestamp: now,
        },
        now,
      );
      offset = runtime.engine.active!.startedAt + 100 - Date.now();
      await expect
        .poll(
          async () =>
            JSON.parse(
              (await page
                .getByTestId("live-frame")
                .getAttribute("data-audio"))!,
            ).triggers,
        )
        .toBeGreaterThan(beforeTriggers);
    }
    const mixResponse = await fetch("http://127.0.0.1:3119/api/production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...defaultProduction(),
        mix: { ...defaultProduction().mix, [layer]: 0 },
      }),
    });
    expect(mixResponse.ok).toBe(true);
    try {
      await expect
        .poll(
          async () =>
            JSON.parse(
              (await page
                .getByTestId("live-frame")
                .getAttribute("data-audio"))!,
            )[layer + "Gain"],
        )
        .toBeLessThan(0.001);
    } catch (e) {
      console.log(
        "MIX DIAGNOSTIC",
        layer,
        await (
          await fetch("http://127.0.0.1:3119/api/state")
        )
          .json()
          .then((s) => s.production),
        await page.getByTestId("live-frame").getAttribute("data-audio"),
        errors,
      );
      throw e;
    }
    busChecks[layer] = JSON.parse(
      (await page.getByTestId("live-frame").getAttribute("data-audio"))!,
    )[layer + "Gain"];
  }
  expect(errors).toEqual([]);
  await mkdir("artifacts/live-v16", { recursive: true });
  await writeFile(
    "artifacts/live-v16/recorded-provider.json",
    JSON.stringify(
      {
        result: "passed",
        locales: ["en", "vi", "it"],
        nativeHTMLAudioPlayback: true,
        duckAndMasterMute: true,
        voiceZeroStopsClipAndBannerExpires: true,
        busZeroGains: busChecks,
        fixture:
          "Generated 3-second sine WAV routed locally for provider integration only; NOT a spoken/translated voice clip or capture-output verification.",
        errors,
      },
      null,
      2,
    ),
  );
  console.log("Recorded provider playback, duck and master mute passed");
} finally {
  await browser.close();
  await runtime.close();
}
