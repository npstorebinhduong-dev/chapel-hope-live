import { createChapelServer } from "./app.ts";
const runtime = createChapelServer();
const port = Number(process.env.PORT ?? 3001);
runtime.server.listen(port, "127.0.0.1", () =>
  console.log(`Chapel mock server: http://127.0.0.1:${port}`),
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, () => {
    void runtime.close().then(() => process.exit(0));
  });
