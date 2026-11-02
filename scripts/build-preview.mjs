import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const out = path.join(root, "artifacts/html-preview");
await mkdir(out, { recursive: true });
const images = Object.fromEntries(
  await Promise.all(
    ["chapel-stage.png", "people-atlas.png", "walk-atlas.png"].map(
      async (name) => [
        name,
        `data:image/png;base64,${(await readFile(path.join(root, "apps/client/public/art", name))).toString("base64")}`,
      ],
    ),
  ),
);
const result = await build({
  entryPoints: ["apps/client/src/preview/main.tsx"],
  outfile: path.join(out, "preview.js"),
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  minify: true,
  target: ["chrome100", "edge100"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [
    {
      name: "standalone-preview",
      setup(builder) {
        builder.onResolve({ filter: /^\.\.?\/store$/ }, (args) => {
          if (
            args.importer.includes(`${path.sep}client${path.sep}src${path.sep}`)
          )
            return {
              path: path.join(root, "apps/client/src/preview/store.ts"),
            };
        });
        builder.onResolve({ filter: /^node:crypto$/ }, () => ({
          path: "browser-crypto",
          namespace: "preview",
        }));
        builder.onLoad({ filter: /.*/, namespace: "preview" }, () => ({
          contents:
            "export const randomUUID = () => globalThis.crypto.randomUUID();",
          loader: "js",
        }));
        builder.onLoad({ filter: /StageChapel\.tsx$/ }, async (args) => {
          let source = await readFile(args.path, "utf8");
          for (const [name, data] of Object.entries(images))
            source = source.replaceAll(`/art/${name}`, data);
          return {
            contents: source,
            loader: "tsx",
            resolveDir: path.dirname(args.path),
          };
        });
        builder.onLoad({ filter: /App\.tsx$/ }, async (args) => ({
          contents: (await readFile(args.path, "utf8"))
            .replace('href="/"', 'href="./index.html?view=live"')
            .replace(
              "<p>{en.controlNote}</p>",
              "<p>Offline preview. Controls affect this page only.</p>",
            ),
          loader: "tsx",
          resolveDir: path.dirname(args.path),
        }));
      },
    },
  ],
});
const js = result.outputFiles
  .find((f) => f.path.endsWith(".js"))
  .text.replace(/<\/script/gi, "<\\/script");
const css = result.outputFiles.find((f) => f.path.endsWith(".css")).text;
await writeFile(
  path.join(out, "index.html"),
  `<!doctype html>
<html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><link rel="icon" href="data:,"><title>Chapel of Hope — Bản xem thử offline</title><style>${css}</style></head><body><div id="root"></div><noscript>Vui lòng bật JavaScript trong trình duyệt.</noscript><script>${js}</script></body></html>`,
);
await writeFile(
  path.join(out, "HUONG_DAN.txt"),
  `CHAPEL OF HOPE — BẢN HTML XEM THỬ OFFLINE

1. Giải nén toàn bộ ZIP.
2. Mở index.html bằng Chrome hoặc Microsoft Edge (nhấp đúp hoặc Open with).
3. Cảnh có sẵn 50 khách ở hàng chờ + 16 NPC trong ghế. Dùng bảng bên cạnh để thử AMEN,
   20/50/100 khách, sáu quà, chất lượng, âm thanh và reset.
4. Bấm Enable audio, bỏ Mute sound để thử chuông.
5. “Mở khung LIVE sạch” mở một phiên mẫu riêng, không đồng bộ với tab điều khiển.
   Hãy dùng bảng bên cạnh cảnh trong cùng trang khi cần kiểm tra sự kiện.
6. Comment 1 chọn nhân vật nam, 2 chọn nữ. Chỉ gift của người đó mới cho vào ghế.
7. Tải lại trang sẽ khởi tạo lại 50 khách đang chờ. Mỗi tab là một phiên độc lập.

KHÔNG cần Node.js, npm, máy chủ, Internet hoặc kết nối TikTok.
Tất cả JavaScript, CSS và hình ảnh đã nhúng trong index.html.
Đừng mở HTML bên trong cửa sổ xem trước ZIP; hãy giải nén trước.

Đây là bản xem thử hình ảnh và gameplay local, không phải bản tích hợp TikTok LIVE.
Dùng cùng renderer và engine AMEN/ghế/hàng đợi quà của mã nguồn.
Nhân vật là sprite 2,5D; chuyển động/quay người vẫn có giới hạn.
`,
);
await writeFile(
  path.join(out, "NGUON_ASSET.txt"),
  await readFile("docs/ASSET_LICENSES.md", "utf8"),
);
console.log(
  `Created ${path.join(out, "index.html")} (${(js.length / 1048576).toFixed(1)} MiB JS including artwork); no server or network required.`,
);
