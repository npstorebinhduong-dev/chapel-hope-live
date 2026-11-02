import { chromium, expect } from "@playwright/test";
import { createChapelServer } from "../apps/server/src/app.ts";
import { giftKeys, GIFTS } from "../packages/shared/src/index.ts";
import { defaultProduction } from "../packages/shared/src/production.ts";
import { giftVoiceLines } from "../apps/client/src/voice/lines.ts";
import { mkdir, writeFile } from "node:fs/promises";
const runtime = createChapelServer();
await new Promise<void>((r) => runtime.server.listen(3117, "127.0.0.1", r));
let offset = 0;
const snapshot = runtime.engine.snapshot.bind(runtime.engine);
runtime.engine.snapshot = () => snapshot(Date.now() + offset);
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const dir = "artifacts/live-v16";
await mkdir(dir, { recursive: true });
const base = "http://127.0.0.1:3117";
const post = async (url: string, body: unknown) => {
  const r = await fetch(base + "/api/" + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  expect(r.ok, await r.text()).toBeTruthy();
};
try {
  const errors: string[] = [];
  const live = await browser.newPage({
      viewport: { width: 1080, height: 1920 },
    }),
    control = await browser.newPage({
      viewport: { width: 1280, height: 1000 },
    });
  for (const p of [live, control]) {
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
  }
  await live.goto(base);
  await control.goto(base + "/control");
  await expect(live.getByTestId("stage-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await live.screenshot({ path: dir + "/idle.png" });
  const realVoices = await live.evaluate(() =>
    speechSynthesis
      .getVoices()
      .map((v) => ({ name: v.name, lang: v.lang, local: v.localService })),
  );
  await control.getByRole("tab", { name: "Audio & Language" }).click();
  await expect(control.getByTestId("voice-availability")).toContainText(
    realVoices.some((v) => v.lang.startsWith("en"))
      ? "Voice READY"
      : "Missing voice",
  );
  await control.getByRole("tab", { name: "Gift Test & Mapping" }).click();
  for (let i = 0; i < 6; i++)
    await control.getByLabel("Gift ID " + giftKeys[i]).fill(String(101 + i));
  await control.getByRole("button", { name: "Save gift mapping" }).click();
  await expect.poll(() => runtime.adapter.status.mapping["103"]).toBe("rose_5");
  await control
    .getByRole("button", { name: "RUN LIVE PREFLIGHT CHECK" })
    .click();
  await expect(control.getByTestId("preflight")).toContainText(
    "NOT YET VERIFIED",
  );
  // Real empty/missing voice fallback, no speech API overrides in this page.
  let sequence = 0;
  const event = async (
    key: (typeof giftKeys)[number],
    locale: "en" | "vi" | "it",
    page = live,
  ) => {
    const t = Date.now() + offset;
    runtime.engine.gift(
      {
        type: "gift",
        source: "mock",
        eventId: "prod-" + sequence++,
        userId: "prod-donor",
        username: "Sofia",
        giftKey: key,
        coinValue: GIFTS[key].coins,
        repeatCount: 1,
        timestamp: t,
      },
      t,
    );
    const a = runtime.engine.active!;
    offset = a.startedAt + 350 - Date.now();
    await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
      "data-gift",
      key,
    );
    const banner = page.getByTestId("wish-banner");
    await expect(banner).toHaveAttribute("data-locale", locale);
    await expect
      .poll(async () =>
        giftVoiceLines[locale][key].includes(
          (await banner.locator("p").textContent()) as never,
        ),
      )
      .toBe(true);
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${dir}/${locale}-${key}.png` });
    offset = a.returnEndsAt! + 10 - Date.now();
    await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
      "data-gift",
      "",
    );
    await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
      "data-zoom",
      "1.0000",
    );
  };
  for (const locale of ["en", "vi", "it"] as const) {
    await post("production", { ...defaultProduction(), locale });
    for (const key of giftKeys) await event(key, locale);
  }
  runtime.engine.control("reset");
  offset = 0;
  await post("mock/acceptance", {});
  await expect(live.getByTestId("stage-canvas")).toHaveAttribute(
    "data-waiting",
    "45",
  );
  while (runtime.engine.active) {
    offset = runtime.engine.active.returnEndsAt! + 10 - Date.now();
    await live.waitForTimeout(200);
  }
  await expect(live.getByTestId("stage-canvas")).toHaveAttribute(
    "data-inside",
    "5",
  );
  await live.screenshot({ path: dir + "/50-amen-5-gifts.png" });
  runtime.engine.control("reset");
  offset = 0;
  await post("mock/spam-amen", { count: 50 });
  await expect(live.getByTestId("stage-canvas")).toHaveAttribute(
    "data-waiting",
    "50",
  );
  await live.screenshot({ path: dir + "/waiting-50.png" });
  await control.screenshot({ path: dir + "/control.png", fullPage: true });
  // Deterministic provider-contract fixture. These are NOT installed/native voices.
  const simulated = await browser.newPage({
    viewport: { width: 540, height: 960 },
  });
  simulated.on("pageerror", (e) =>
    errors.push("Provider fixture: " + e.message),
  );
  await simulated.addInitScript({
    content: `
   Object.defineProperty(window,'SpeechSynthesisUtterance',{value:function(text){this.text=text;}});
   const records=[];window.__speech=records;
   const fake=[{name:'Test EN',lang:'en-GB',voiceURI:'test-en'},{name:'Test VI',lang:'vi-VN',voiceURI:'test-vi'},{name:'Test IT',lang:'it-IT',voiceURI:'test-it'}];
   let timer;
   Object.defineProperty(speechSynthesis,'getVoices',{value:()=>fake});
   Object.defineProperty(speechSynthesis,'speak',{value:(u)=>{records.push({lang:u.lang,text:u.text});if(u.onstart)u.onstart({});timer=setTimeout(()=>{if(u.onend)u.onend({});},2200);}});
   Object.defineProperty(speechSynthesis,'cancel',{value:()=>clearTimeout(timer)});
 `,
  });
  await simulated.goto(base);
  await simulated
    .getByTestId("live-frame")
    .click({ position: { x: 20, y: 500 } });
  await expect
    .poll(
      async () =>
        JSON.parse(
          (await simulated
            .getByTestId("live-frame")
            .getAttribute("data-audio")) ?? "{}",
        ).running,
    )
    .toBe(true);
  runtime.engine.control("reset");
  offset = 0;
  await post("mock/control", { action: "muted", enabled: false });
  for (const locale of ["en", "vi", "it"] as const) {
    await post("production", { ...defaultProduction(), locale });
    for (const key of giftKeys) {
      const t = Date.now() + offset;
      runtime.engine.gift(
        {
          type: "gift",
          source: "mock",
          eventId: "tts-" + sequence++,
          userId: "voice-donor",
          username: "Guest",
          giftKey: key,
          coinValue: GIFTS[key].coins,
          repeatCount: 1,
          timestamp: t,
        },
        t,
      );
      const a = runtime.engine.active!;
      offset = a.startedAt + 100 - Date.now();
      try {
        await expect(simulated.getByTestId("wish-banner")).toHaveAttribute(
          "data-speaking",
          "true",
        );
      } catch (e) {
        console.log(
          "VOICE DIAGNOSTIC",
          locale,
          key,
          await simulated.evaluate(() => ({
            calls: (window as any).__speech,
            voices: speechSynthesis.getVoices(),
            frame: document
              .querySelector("[data-testid=live-frame]")
              ?.getAttribute("data-audio"),
            status: document
              .querySelector("[data-testid=live-frame]")
              ?.getAttribute("data-voice-status"),
          })),
        );
        throw e;
      }
      await expect
        .poll(() =>
          simulated.evaluate(() => (window as any).__speech.at(-1).lang),
        )
        .toMatch(new RegExp("^" + locale));
      await simulated.waitForTimeout(1200);
      const ducked = JSON.parse(
        (await simulated.getByTestId("live-frame").getAttribute("data-audio"))!,
      );
      expect(ducked.ducked).toBe(true);
      expect(ducked.musicGain).toBeLessThan(0.1);
      await expect(simulated.getByTestId("wish-banner")).toHaveAttribute(
        "data-speaking",
        "false",
        { timeout: 5000 },
      );
      await expect
        .poll(
          async () =>
            JSON.parse(
              (await simulated
                .getByTestId("live-frame")
                .getAttribute("data-audio"))!,
            ).musicGain,
        )
        .toBeGreaterThan(0.18);
      offset = a.returnEndsAt! + 10 - Date.now();
      await simulated.waitForTimeout(200);
    }
  }
  const providerCalls = await simulated.evaluate(
    () => (window as any).__speech,
  );
  expect(providerCalls.length).toBe(18);
  await simulated.close();
  // Audio graph is real. Observe two complete 48-second music cycles, not accelerated time.
  await post("production", defaultProduction());
  await control
    .getByRole("button", { name: "Enable audio in this tab", exact: true })
    .click();
  const audio = control.getByTestId("audio-status");
  const read = async () =>
    JSON.parse((await audio.getAttribute("data-audio"))!);
  await expect.poll(async () => (await read()).running).toBe(true);
  const initial = await read();
  const loopSamples: any[] = [];
  while ((await read()).contextTime - initial.contextTime < 97) {
    const s = await read();
    expect(s.voices).toBeLessThanOrEqual(24);
    expect(s.persistentSources).toBe(4);
    expect(s.peak).toBeLessThan(1);
    loopSamples.push({
      time: s.contextTime,
      chord: s.chord,
      level: s.level,
      voices: s.voices,
    });
    await control.waitForTimeout(1000);
  }
  // Independent bus mute works, master ends at measured zero.
  for (const layer of ["music", "ambient", "sfx", "voice"] as const) {
    await post("production", {
      ...defaultProduction(),
      mix: { ...defaultProduction().mix, [layer]: 0 },
    });
    await control.waitForTimeout(150);
  }
  await post("mock/control", { action: "muted", enabled: true });
  await control.waitForTimeout(1800);
  const muted = await read();
  expect(muted.level).toBeLessThan(0.00001);
  expect(errors).toEqual([]);
  await writeFile(
    dir + "/results.json",
    JSON.stringify(
      {
        result: "passed",
        realBrowserVoices: realVoices,
        localeGiftBanners: 18,
        simulatedProviderCalls: providerCalls,
        acceptance: { waiting: 45, inside: 5 },
        musicLoopSeconds: loopSamples.at(-1).time - initial.contextTime,
        loopSamples,
        mutedRMS: muted.level,
        errors,
        limitations: [
          "Provider call tests use explicit fake voices; no claim of native audible TTS in Linux.",
          "No Windows/TikFinity real LIVE/capture verification.",
          "Journey boundaries accelerated; music ran for two real-time loops.",
        ],
      },
      null,
      2,
    ),
  );
  console.log(
    "v1.6 browser checks passed: 18 banners, provider contract, two music loops, preflight and acceptance.",
  );
} finally {
  await browser.close();
  await runtime.close();
}
