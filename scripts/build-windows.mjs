import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("production", { recursive: true });
await build({
  entryPoints: ["apps/server/src/index.ts"],
  outfile: "production/server.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  external: ["bufferutil", "utf-8-validate"],
});
await writeFile(
  "production/manifest.json",
  JSON.stringify(
    {
      product: "Chapel of Hope LIVE",
      version: "1.9.0",
      nodeMinimum: "22.12.0",
      entry: "server.cjs",
      client: "../apps/client/dist",
      mode: "mock on startup",
      verification: "READY FOR WINDOWS VALIDATION",
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(
  "Production bundle created; Node runtime required, no node_modules included.",
);
