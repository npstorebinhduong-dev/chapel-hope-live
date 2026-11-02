import { chromium, expect } from "@playwright/test";
import { spawn, execFileSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
const root = await mkdtemp(join(tmpdir(), "chapel-v19-package-"));
execFileSync("python3", [
  "-c",
  "import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; z.extractall(sys.argv[2])",
  resolve("downloads/Chapel-of-Hope-LIVE-v1.9-Windows.zip"),
  root,
]);
const token = randomUUID(),
  base = "http://127.0.0.1:3131";
const child = spawn(process.execPath, ["production/server.cjs"], {
  cwd: root,
  env: { ...process.env, PORT: "3131", CHAPEL_LAUNCH_TOKEN: token },
  stdio: "pipe",
});
const exited = new Promise<number | null>((r) => child.once("exit", r));
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try {
      ready = (await fetch(base + "/health")).ok;
    } catch {}
    if (ready) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  expect(ready).toBe(true);
  const health = await (await fetch(base + "/health")).json();
  expect(health.version).toBe("1.9.0");
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
  await page.goto(base);
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  for (let i = 0; i < 2; i++) {
    const r = await fetch(base + "/api/mock/spam-amen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: 100 }),
    });
    expect(r.ok).toBe(true);
  }
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-visible-waiting",
    "200",
  );
  await expect(page.getByTestId("stage-canvas")).toHaveAttribute(
    "data-inside",
    "0",
  );
  await page.goto(base + "/control");
  await expect(
    page.getByRole("heading", { name: "Bảng điều hành Chapel of Hope" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.screenshot({
    path: "docs/screenshots/live-v19/control.png",
    fullPage: true,
  });
  const stop = await fetch(base + "/api/launcher/stop", {
    method: "POST",
    headers: { "X-Chapel-Launcher": token },
  });
  expect(stop.ok).toBe(true);
  const exitCode = await exited;
  expect(exitCode).toBe(0);
  // Check the final self-contained HTML after the control-copy-only rebuild.
  const preview = await browser.newPage();
  const html = await readFile("artifacts/html-preview/index.html", "utf8");
  await preview.route("http://127.0.0.1:3132/**", (r) =>
    r.fulfill({ contentType: "text/html", body: html }),
  );
  await preview.goto("http://127.0.0.1:3132/index.html");
  await expect(preview.getByTestId("stage-canvas")).toHaveAttribute(
    "data-visible-waiting",
    "50",
  );
  await expect(
    preview.getByRole("heading", { name: "Bảng điều hành Chapel of Hope" }),
  ).toBeVisible();
  const report = {
    result: "passed",
    version: health.version,
    mode: health.mode,
    extractedZip: true,
    nodeModulesBundled: false,
    routes: ["/", "/control", "/health"],
    waiting: 200,
    inside: 0,
    exitCode,
    htmlFinalSmoke: true,
    limitation:
      "Node Linux production bundle and browser checked; Windows BAT/PowerShell execution remains unverified.",
  };
  await writeFile(
    "docs/screenshots/live-v19/package-check.json",
    JSON.stringify(report, null, 2),
  );
  console.log(report);
} finally {
  await browser.close();
  if (child.exitCode === null) child.kill("SIGTERM");
}
