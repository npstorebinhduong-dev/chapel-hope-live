import { createChapelServer } from "./app.ts";
const runtime = createChapelServer({
  configFile: process.env.CHAPEL_CONFIG,
  shutdownToken: process.env.CHAPEL_LAUNCH_TOKEN,
  onShutdown: () => {
    void runtime.close().then(() => process.exit(0));
  },
});
const port = Number(process.env.PORT ?? 3001);
runtime.server.listen(port, "127.0.0.1", () =>
  console.log(
    `Chapel production server (starts in Mock): http://127.0.0.1:${port}`,
  ),
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, () => {
    void runtime.close().then(() => process.exit(0));
  });
