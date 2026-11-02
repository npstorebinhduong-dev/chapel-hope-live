import { chromium, expect } from "@playwright/test";
import { createChapelServer } from "../apps/server/src/app.ts";
import { giftKeys, GIFTS, type GiftKey } from "../packages/shared/src/index.ts";
import {
  defaultProduction,
  type Locale,
} from "../packages/shared/src/production.ts";
import { giftVoiceLines } from "../apps/client/src/voice/lines.ts";
import { gratitude } from "../apps/client/src/voice/engagementLines.ts";
import { adminVi as v } from "../apps/client/src/adminLocales/vi.ts";
import { guideText } from "../apps/client/src/LiveGuidePanel.tsx";
import { mkdir, writeFile } from "node:fs/promises";
const runtime = createChapelServer();
await new Promise<void>((r) => runtime.server.listen(3129, "127.0.0.1", r));
const base = "http://127.0.0.1:3129",
  dir = "artifacts/live-v19";
await mkdir(dir, { recursive: true });
let offset = 0,
  serial = 0;
const snapshot = runtime.engine.snapshot.bind(runtime.engine);
runtime.engine.snapshot = () => snapshot(Date.now() + offset);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: [
    "--no-sandbox",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
  ],
});
const errors: string[] = [],
  checks: string[] = [],
  audioSamples: any[] = [];
const post = async (path: string, body: unknown) => {
  const r = await fetch(base + "/api/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  expect(r.ok, t).toBeTruthy();
  return JSON.parse(t);
};
try {
  const context = await browser.newContext();
  const live = await context.newPage(),
    control = await context.newPage();
  await live.setViewportSize({ width: 1080, height: 1920 });
  await control.setViewportSize({ width: 1366, height: 768 });
  for (const p of [live, control])
    p.on("pageerror", (e) => errors.push(e.message));
  await live.goto(base);
  await control.goto(base + "/control");
  const canvas = live.getByTestId("stage-canvas"),
    frame = live.getByTestId("live-frame");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await expect(control.getByTestId("admin-vi")).toHaveAttribute("lang", "vi");
  for (const tab of v.tabs) {
    await control.getByRole("tab", { name: tab, exact: true }).click();
    expect(
      await control.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await control.screenshot({
      path: dir + `/control-${v.tabs.indexOf(tab)}.png`,
      fullPage: true,
    });
  }
  checks.push(
    "Six Vietnamese admin sections fit 1366x768 without page overflow",
  );
  await control.getByRole("button", { name: v.preflight, exact: true }).click();
  await expect(control.getByTestId("preflight")).toContainText(v.pendingVerify);
  await post("mock/spam-amen", { count: 50 });
  await expect(canvas).toHaveAttribute("data-waiting", "50");
  for (const locale of ["en", "vi", "it"] as const) {
    await post("production", {
      ...defaultProduction(),
      locale,
      guide: { ...defaultProduction().guide, preview: "gifts" },
    });
    await expect(frame).toHaveAttribute("lang", locale);
    await expect(live.getByTestId("live-guide")).toContainText(
      guideText[locale].join,
    );
    await expect(live.locator(".guide-gifts>div")).toHaveCount(6);
    await expect(live.locator('[data-gift="prayer_5"]')).toHaveCount(1);
    await expect(live.locator('[data-gift="rose_5"]')).toHaveCount(1);
    await expect(
      control.getByRole("tab", { name: v.tabs[3], exact: true }),
    ).toBeVisible();
    await live.screenshot({ path: dir + `/guide-${locale}-six-gifts.png` });
  }
  checks.push(
    "EN/VI/IT guide, all six distinct gifts, fixed Vietnamese admin locale",
  );
  await post("production", { ...defaultProduction(), locale: "vi" });
  await post("mock/control", { action: "muted", enabled: false });
  await frame.click({ position: { x: 20, y: 800 } });
  const audio = async () =>
    JSON.parse((await frame.getAttribute("data-audio")) ?? "{}");
  await expect.poll(async () => (await audio()).running).toBe(true);
  await control.getByRole("tab", { name: v.tabs[3], exact: true }).click();
  const nativeVoices = await live.evaluate(() =>
    speechSynthesis.getVoices().map((x) => ({ name: x.name, lang: x.lang })),
  );
  await expect(control.getByTestId("voice-availability")).toContainText(
    nativeVoices.some((x) => x.lang.startsWith("vi"))
      ? v.voiceReady
      : v.missingVoice,
  );
  await expect
    .poll(() =>
      control
        .locator(`meter[aria-label="${v.meter} ${v.mix.music}"]`)
        .evaluate((el: HTMLMeterElement) => el.value),
    )
    .toBeGreaterThan(0);
  await control.getByRole("button", { name: v.unlock, exact: true }).click();
  await expect(control.getByRole("alert")).toContainText(
    "Cửa sổ khác đang phát âm thanh",
  );
  checks.push(
    "Same-origin audio ownership prevents a second tab; actual missing VI voice warns in Vietnamese",
  );
  const markerBefore = await audio();
  await post("mock/engagement", { type: "like", count: 1000 });
  await expect(canvas).toHaveAttribute("data-community", "heart");
  await expect(live.getByTestId("hearts-progress")).toHaveAttribute(
    "data-hearts",
    "1000",
  );
  await live.waitForTimeout(1300);
  await live.screenshot({ path: dir + "/hearts-1000.png" });
  offset += 8000;
  await expect(canvas).toHaveAttribute("data-community", "");
  await post("mock/engagement", { type: "share", count: 1 });
  await expect(canvas).toHaveAttribute("data-community", "share");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-birds")))
    .toBeGreaterThan(0);
  await live.waitForTimeout(1100);
  await live.screenshot({ path: dir + "/share-one-dove.png" });
  for (let i = 0; i < 9; i++)
    await post("mock/engagement", { type: "share", count: 1 });
  offset += 6000;
  await expect(canvas).toHaveAttribute("data-community", "flock");
  await live.waitForTimeout(1400);
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-birds")))
    .toBeGreaterThan(1);
  await live.screenshot({ path: dir + "/share-ten-flock.png" });
  expect(runtime.engine.snapshot().insideCount).toBe(0);
  checks.push(
    "1000 hearts one milestone, real canvas light; 1 share dove / 10 shares flock; no seat admission",
  );
  runtime.engine.control("reset");
  offset = 0;
  await post("mock/acceptance", {});
  await expect(canvas).toHaveAttribute("data-waiting", "45");
  while (runtime.engine.active || runtime.engine.queue.length) {
    offset = runtime.engine.active!.returnEndsAt! + 10 - Date.now();
    await live.waitForTimeout(180);
  }
  await expect(canvas).toHaveAttribute("data-inside", "5");
  await live.waitForTimeout(1000);
  await live.screenshot({ path: dir + "/50-amen-5-gifts.png" });
  checks.push("50 AMEN / 5 gifters = 45 waiting / 5 inside, NPC excluded");
  runtime.engine.control("reset");
  offset = 0;
  await post("mock/spam-amen", { count: 50 });
  const runGift = async (key: GiftKey, locale: Locale, screenshot = true) => {
    const now = Date.now() + offset;
    runtime.engine.gift(
      {
        type: "gift",
        source: "mock",
        eventId: `browser-${serial++}`,
        userId: "donor",
        username: "Sofia",
        giftKey: key,
        coinValue: GIFTS[key].coins,
        repeatCount: 1,
        timestamp: now,
      },
      now,
    );
    const active = runtime.engine.active!;
    offset = active.startedAt + 850 - Date.now();
    await expect(canvas).toHaveAttribute("data-gift", key);
    const banner = live.getByTestId("wish-banner");
    await expect(banner).toHaveAttribute("data-locale", locale);
    await expect
      .poll(async () =>
        [...giftVoiceLines[locale][key], ...gratitude[locale][key]].includes(
          (await banner.locator("p").textContent()) ?? "",
        ),
      )
      .toBe(true);
    await live.waitForTimeout(650);
    if (screenshot)
      await live.screenshot({ path: dir + `/${locale}-${key}.png` });
    const d = await audio();
    expect(d.voices).toBeLessThanOrEqual(24);
    expect(d.peak).toBeLessThan(1);
    audioSamples.push({ key, locale, ...d });
    offset = active.returnEndsAt! + 20 - Date.now();
    await expect(canvas).toHaveAttribute("data-gift", "");
    await expect(canvas).toHaveAttribute("data-zoom", "1.0000", {
      timeout: 5000,
    });
  };
  await live.bringToFront();
  for (const locale of ["en", "vi", "it"] as const) {
    await post("production", { ...defaultProduction(), locale });
    for (const key of giftKeys) await runGift(key, locale);
  }
  checks.push(
    "18 gift/locale scenes, localized banners, six SFX markers and camera restoration",
  );
  await post("production", { ...defaultProduction(), locale: "vi" });
  runtime.engine.control("reset");
  offset = 0;
  for (let i = 0; i < 30; i++) {
    const now = Date.now() + offset;
    runtime.engine.gift(
      {
        type: "gift",
        source: "mock",
        eventId: `stress${i}`,
        userId: `stress${i % 5}`,
        username: "Guest",
        giftKey: giftKeys[i % 6],
        coinValue: GIFTS[giftKeys[i % 6]].coins,
        repeatCount: 1,
        timestamp: now,
      },
      now,
    );
  }
  while (runtime.engine.active) {
    const a = runtime.engine.snapshot().active;
    if (!a) break;
    offset = a.startedAt + 800 - Date.now();
    await live.waitForTimeout(180);
    offset = a.returnEndsAt! + 20 - Date.now();
    await live.waitForTimeout(180);
  }
  expect(runtime.engine.completed).toBe(30);
  expect(runtime.engine.rejected).toBe(0);
  await expect(canvas).toHaveAttribute("data-zoom", "1.0000", {
    timeout: 6000,
  });
  checks.push("30 queued gifts complete, no rejected gift, camera restores");
  await post("production", {
    ...defaultProduction(),
    mix: { ...defaultProduction().mix, music: 0, ambient: 0, sfx: 0 },
  });
  await live.waitForTimeout(2400);
  const muted = await audio();
  expect(muted.busLevels.music).toBeLessThan(0.001);
  expect(muted.busLevels.ambient).toBeLessThan(0.001);
  expect(muted.busLevels.sfx).toBeLessThan(0.001);
  checks.push("Music / Ambient / SFX bus mute measured below .001 RMS");
  // The synthetic speech fixture verifies scheduling, not native voice quality or capture.
  await live.close();
  await control.close();
  await context.close();
  const fake = await browser.newPage({ viewport: { width: 540, height: 960 } });
  await fake.addInitScript({
    content: `Object.defineProperty(window,'SpeechSynthesisUtterance',{value:function(text){this.text=text;}});window.__speech=[];let timer;const voices=['en','vi','it'].map(lang=>({lang:lang+'-'+(lang==='vi'?'VN':lang==='it'?'IT':'GB'),voiceURI:'fixture-'+lang,name:'Fixture '+lang}));Object.defineProperty(speechSynthesis,'getVoices',{value:()=>voices});Object.defineProperty(speechSynthesis,'speak',{value:u=>{window.__speech.push({lang:u.lang,text:u.text});u.onstart?.({});timer=setTimeout(()=>u.onend?.({}),1200);}});Object.defineProperty(speechSynthesis,'cancel',{value:()=>clearTimeout(timer)});`,
  });
  await fake.goto(base);
  await expect(fake.getByTestId("stage-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await fake.getByTestId("live-frame").click({ position: { x: 20, y: 500 } });
  runtime.engine.control("reset");
  offset = 0;
  await post("mock/control", { action: "muted", enabled: false });
  for (const locale of ["en", "vi", "it"] as const) {
    await post("production", { ...defaultProduction(), locale });
    const now = Date.now() + offset;
    runtime.engine.gift(
      {
        type: "gift",
        source: "mock",
        eventId: `voice-${locale}`,
        userId: "voice",
        username: "Sofia",
        giftKey: "altar_100",
        coinValue: 100,
        repeatCount: 1,
        timestamp: now,
      },
      now,
    );
    const a = runtime.engine.snapshot().active!;
    offset = a.startedAt + 850 - Date.now();
    await expect
      .poll(() =>
        fake.evaluate(() => ((window as any).__speech as any[]).at(-1)?.lang),
      )
      .toContain(locale);
    await expect
      .poll(
        async () =>
          JSON.parse(
            (await fake.getByTestId("live-frame").getAttribute("data-audio")) ??
              "{}",
          ).ducked,
      )
      .toBe(true);
    if (locale === "vi") {
      await post("audio/command", { action: "stopVoice" });
      await expect(fake.getByTestId("wish-banner")).toHaveAttribute(
        "data-speaking",
        "false",
      );
      await post("audio/command", { action: "resumeVoice" });
      await expect(fake.getByTestId("wish-banner")).toHaveAttribute(
        "data-speaking",
        "true",
      );
    }
    await fake.waitForTimeout(1500);
    await expect
      .poll(
        async () =>
          JSON.parse(
            (await fake.getByTestId("live-frame").getAttribute("data-audio")) ??
              "{}",
          ).ducked,
      )
      .toBe(false);
    offset = a.returnEndsAt! + 10 - Date.now();
    await fake.waitForTimeout(300);
  }
  await post("audio/command", { action: "stopAll" });
  await expect
    .poll(
      async () =>
        JSON.parse(
          (await fake.getByTestId("live-frame").getAttribute("data-audio")) ??
            "{}",
        ).running,
    )
    .toBe(false);
  checks.push(
    "Remote audio meters and stop/resume/emergency commands operate on the LIVE window",
  );
  checks.push(
    "Simulated provider contract EN/VI/IT: correct utterance locale and duck/restore (not native voice verification)",
  );
  await fake.close();
  expect(errors).toEqual([]);
  await writeFile(
    dir + "/browser.json",
    JSON.stringify(
      {
        result: "passed",
        checks,
        errors,
        nativeVoices,
        audioSamples,
        note: "Linux Chromium mock/replay. No native voices/capture/Windows LIVE certification.",
      },
      null,
      2,
    ),
  );
  console.log(checks.join("\n"));
} catch (e) {
  console.error(e);
  await writeFile(dir + "/browser-error.txt", String(e));
  throw e;
} finally {
  await browser.close();
  await runtime.close();
}
