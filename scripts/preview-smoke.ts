import { chromium, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { giftKeys } from "../packages/shared/src/index.ts";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors: string[] = [],
    network: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("websocket", (socket) => network.push(socket.url()));

  // The export also works when a browser blocks persistent file-origin storage.
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  const url = pathToFileURL(
    resolve(process.env.PREVIEW_HTML ?? "artifacts/html-preview/index.html"),
  ).href;
  let mode = "file://";
  try {
    await page.goto(url);
  } catch (error) {
    if (!String(error).includes("ERR_BLOCKED_BY_ADMINISTRATOR")) throw error;
    mode =
      "local HTML document fulfilled in browser; file:// blocked by managed browser policy";
    const html = await readFile(new URL(url), "utf8");
    await page.route(/^https?:/, (route) => {
      const requested = new URL(route.request().url());
      if (
        requested.origin === "http://127.0.0.1:3115" &&
        requested.pathname === "/index.html"
      )
        return route.fulfill({ contentType: "text/html", body: html });
      network.push(route.request().url());
      return route.abort();
    });
    await page.goto("http://127.0.0.1:3115/index.html");
  }
  if (mode === "file://")
    await page.route(/^https?:/, (route) => {
      network.push(route.request().url());
      return route.abort();
    });
  const loadedUrl = page.url();
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.getByTestId("viewer-count")).toHaveText("50");
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-waiting",
    "50",
  );
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-inside",
    "0",
  );
  await expect(page.getByTestId("live-frame").getByRole("button")).toHaveCount(
    0,
  );
  await page.waitForTimeout(700);
  await page.screenshot({ path: "artifacts/html-preview/preview.png" });
  const ink = await page
    .locator("canvas")
    .evaluate((canvas: HTMLCanvasElement) => {
      const pixels = canvas
        .getContext("2d")!
        .getImageData(0, 0, canvas.width, canvas.height).data;
      let alpha = 0;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) alpha++;
      return alpha;
    });
  expect(ink).toBeGreaterThan(1000);
  const reset = async () => {
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", { name: "Reset session", exact: false })
      .click();
    await expect(page.getByTestId("viewer-count")).toHaveText("0");
  };
  await reset();
  await page.getByRole("button", { name: "Send AMEN" }).click();
  await page.getByRole("button", { name: "Send AMEN" }).click();
  await expect(page.getByTestId("viewer-count")).toHaveText("1");
  for (const [count, total] of [
    [20, 21],
    [50, 71],
    [100, 100],
  ]) {
    await page
      .getByRole("button", { name: `+ ${count} visitors`, exact: true })
      .click();
    await expect(page.getByTestId("viewer-count")).toHaveText(String(total));
  }
  for (const key of giftKeys) await page.getByTestId(key).click();
  const observed = new Set<string>();
  const deadline = Date.now() + 240000;
  const played = page
    .locator("dl > div")
    .filter({ has: page.getByText("Played", { exact: true }) })
    .locator("dd");
  while (Date.now() < deadline) {
    const gift = await page
      .getByTestId("stage-canvas")
      .getAttribute("data-gift");
    if (gift) observed.add(gift);
    if ((await played.textContent()) === "6") break;
    await page.waitForTimeout(100);
  }
  expect([...observed].sort()).toEqual([...giftKeys].sort());
  await expect(played).toHaveText("6");
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-candles",
    "1",
  );
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-roses",
    "1",
  );
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-zoom",
    "1.0000",
  );
  await page.getByLabel("Rendering quality").selectOption("low");
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-quality",
    "low",
  );
  await page.getByLabel("Rendering quality").selectOption("balanced");
  await reset();
  await page.reload();
  await expect(page.getByTestId("viewer-count")).toHaveText("50");
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-waiting",
    "50",
  );
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-inside",
    "0",
  );
  await page.goto(loadedUrl + "?view=live");
  await page.setViewportSize({ width: 540, height: 960 });
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.getByRole("button")).toHaveCount(0);
  await page.screenshot({ path: "artifacts/html-preview/live-9-16.png" });
  expect(errors).toEqual([]);
  expect(network).toEqual([]);
  const report = {
    result: "passed",
    mode,
    conditions:
      "No backend/server process; all non-document HTTP/WS and browser storage blocked",
    checks: [
      "embedded artwork rendered",
      "50 prefilled viewers",
      "AMEN dedup",
      "20/50/100 bursts",
      "six gifts complete",
      "persistent candles and flowers",
      "camera returns",
      "quality selection",
      "reset and reload",
      "clean 9:16 view",
    ],
    observed: [...observed],
    errors,
    network,
  };
  await writeFile(
    "artifacts/html-preview/test-results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
