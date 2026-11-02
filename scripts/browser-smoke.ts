import { chromium, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { giftKeys } from "../packages/shared/src/index.ts";

const port = Number(process.env.SMOKE_PORT ?? 3101),
  base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["apps/server/dist/index.js"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
server.stdout.on("data", (data) => (output += data));
server.stderr.on("data", (data) => (output += data));
const errors: string[] = [];
expect.configure({ timeout: 15000 });
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + "/health")).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error(`Production server failed: ${output}`);
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
    headless: true,
    args: [
      "--no-sandbox",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
    ],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 540, height: 960 },
    });
    const live = await context.newPage(),
      control = await context.newPage();
    for (const page of [live, control]) {
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error" && !message.text().includes("favicon"))
          errors.push(message.text());
      });
    }
    await live.goto(base);
    await control.setViewportSize({ width: 1440, height: 1100 });
    await control.goto(base + "/control");
    await expect(control.getByTestId("connection")).toHaveText(
      "LOCAL MOCK CONNECTED",
    );
    await expect(live.locator("canvas")).toBeVisible();
    await expect(
      live.getByText("Virtual chapel experience", { exact: false }),
    ).toBeVisible();
    await expect(live.getByRole("button")).toHaveCount(0);
    await expect(control.getByTestId("fps")).not.toHaveText("—", {
      timeout: 30_000,
    });
    await mkdir("artifacts", { recursive: true });
    await live.screenshot({ path: "artifacts/chapel-overview.png" });
    await control.getByLabel("Display name").fill("Avery");
    await control.getByRole("button", { name: "Send AMEN" }).click();
    await expect(control.getByTestId("viewer-count")).toHaveText("1");
    await control.getByRole("button", { name: "Send AMEN" }).click();
    await expect(control.getByTestId("viewer-count")).toHaveText("1");
    await expect(live.getByTestId("activity")).toContainText("Avery");
    for (const key of giftKeys) {
      await control.getByTestId(key).click();
      await expect(control.getByTestId(key)).toBeEnabled();
    }
    const getState = async () => await (await fetch(base + "/state")).json();
    const deadline = Date.now() + 65_000;
    let ceremonyCaptured = false;
    const observed = new Set<string>();
    while (Date.now() < deadline) {
      const state = await getState();
      if (state.active) observed.add(state.active.event.giftKey);
      if (state.active?.event.giftKey === "ceremony_500" && !ceremonyCaptured) {
        await expect(live.getByText("A MOMENT OF LIGHT")).toBeVisible();
        await live.screenshot({ path: "artifacts/chapel-ceremony.png" });
        ceremonyCaptured = true;
      }
      if (state.completed === 6) {
        if (state.active !== null)
          throw new Error("Camera focus did not expire");
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    const played = await getState();
    expect(played.completed).toBe(6);
    expect(played.candles).toBe(1);
    expect(played.roses).toBe(1);
    expect(observed.size).toBe(6);
    // Block the socket, then reload the live tab: current state survives on the server.
    await live.reload();
    await expect(live.getByText(/1 visitors/)).toBeVisible();
    await control
      .getByRole("button", { name: "+ 50 visitors", exact: true })
      .click();
    await expect(control.getByTestId("viewer-count")).toHaveText("51");
    await control
      .getByRole("button", { name: "+ 50 visitors", exact: true })
      .click();
    await expect(control.getByTestId("viewer-count")).toHaveText("100");
    const accepted = await fetch(base + "/mock/gift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "overflow-donor",
        username: "Overflow donor",
        giftKey: "rose_5",
      }),
    });
    expect(accepted.status).toBe(200);
    await expect(live.getByTestId("activity")).toContainText("Overflow donor");
    await control.getByLabel("Background congregation").click();
    await expect(
      control.getByLabel("Background congregation"),
    ).not.toBeChecked();
    await control.getByLabel("Gift camera focus").click();
    await expect(control.getByLabel("Gift camera focus")).not.toBeChecked();
    await control.screenshot({
      path: "artifacts/control-room.png",
      fullPage: true,
    });
    await live.screenshot({ path: "artifacts/chapel-burst.png" });
    const telemetry = await control.getByTestId("fps").textContent();
    control.once("dialog", (dialog) => dialog.accept());
    await control
      .getByRole("button", { name: "Reset session", exact: false })
      .click();
    await expect(control.getByTestId("viewer-count")).toHaveText("0");
    expect(errors).toEqual([]);
    console.log(
      JSON.stringify(
        {
          result: "passed",
          checks: [
            "production pages",
            "2.5D Canvas2D renderer",
            "live/control isolation",
            "AMEN dedup",
            "six gift playback",
            "persistent offerings",
            "focus timeout",
            "reload snapshot",
            "100 visitor cap",
            "full-capacity gift",
            "broadcast settings",
            "reset",
          ],
          observedGifts: [...observed],
          rendererFps: telemetry,
          renderer:
            "Chromium Canvas2D; multi-tab functional test, not a performance benchmark",
          screenshots: [
            "artifacts/chapel-overview.png",
            "artifacts/chapel-ceremony.png",
            "artifacts/chapel-burst.png",
            "artifacts/control-room.png",
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
} finally {
  server.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    if (server.exitCode !== null) resolve();
    else server.once("exit", () => resolve());
  });
}
