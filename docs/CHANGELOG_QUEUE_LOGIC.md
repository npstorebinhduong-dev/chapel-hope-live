# Task #05 + #06 — AMEN chờ, gift vào lễ đường, chọn avatar và âm thanh

## Quy tắc mới thay thế tài liệu cũ

Bản v1.4 dựa trên toàn bộ mã và asset `feat/chapel-live-2-5d`, commit nền `3ce0a36`; tạo nhánh riêng `feat/gift-entry-queue` và merge tài liệu mới từ `origin/main` (`2d2a1cc`). Không sửa đè nhánh mỹ thuật cũ. Quy tắc **chỉ gift mới cho vào** của #06 ưu tiên hơn ý tưởng tự gọi FIFO trong #05 và TECH_SPEC_V1 cũ.

AMEN tạo/renew một người trong hàng chờ, không cấp ghế. `1`/`2` match chính xác sau trim, lưu lựa chọn avatar nam/nữ theo pseudonymous userId; chọn trước AMEN chưa sinh người. Chọn khi chờ giữ nguyên người/vị trí; chọn giữa hành trình được ghi nhận nhưng áp dụng khi về chỗ an toàn. Không suy đoán giới tính thật bằng tên/ID.

Gift hợp lệ mới chuyển Waiting → Invited, giữ ghế hoặc chỗ đứng. Dispatch theo priority có giới hạn; người được gọi đứng một nhịp, rời hàng qua đường sau hàng/giữa lối, đi đến zone rồi mới kích hoạt FX và âm thanh. Sau đó người ấy đi về ghế/chỗ đứng. Không còn bản sao trình diễn xuất hiện ngay trước bàn thờ. Người gửi lại gift giữ nguyên avatar/ghế. Không cần AMEN trước gift.

Inside chỉ đếm sau khi avatar đi qua cổng khỏi hàng chờ; Entering là người đã được gift mời nhưng còn chờ lượt/đang rời hàng. Seated chỉ đếm người đã về chỗ, không tính reservation. Ghế trống sau khi người cũ rời chỉ ưu tiên người **đã gifted** đang đứng, không tự gọi AMEN chưa tặng.

## Hàng chờ và animation

- Hai hàng serpentine, 12 slot vẽ chi tiết. Người vượt giới hạn còn nguyên trong engine và có `+N waiting`; không vẽ đè 100 avatar tại một điểm.
- Tên rút gọn, giới hạn chiều rộng theo slot. Caption hàng chờ tách khỏi tên; HUD quà lên khu trên để không che vùng chờ hay bàn thờ/chủ sự.
- Chỉ compact sau khi donor ra khỏi cổng; dịch slot 1,2 giây theo easing. Một hành trình dùng lối đi tại một thời điểm, reservation atomic, không xuyên hàng ghế.
- Controller dùng vị trí world liên tục, acceleration/deceleration, bước theo quãng đường. Đổi pose 0,45 giây, ngoại hình 0,65 giây, fade xuất hiện/rời và idle lệch pha.
- Ghép các pose/appearance vào một tile alpha riêng, rồi vẽ một lần; tránh làm alpha giảm xuống 0,75 ở giữa crossfade gây nháy. Có bài test tính liên tục của phép chiếu qua ranh giới tiền sảnh/lối đi.
- TTL hàng chờ fade-out không đi vào ghế. AMEN khi người trong nhà thờ đang rời tạo đường quay ngược liên tục, giữ cùng người/ghế.
- FX chỉ kéo dài thời lượng gốc 2,2–7 giây. Thời gian đi/về là riêng; do điều phối an toàn, burst quà lớn sẽ chờ lâu hơn bản teleport trước đó. Đây là tradeoff được hiển thị bằng pending/entering, không âm thầm bỏ quà.

## Âm thanh (phần còn phù hợp của #05)

Giữ chuông tổng hợp, thêm pad nền hòa âm bốn hợp âm/48 giây, room tone loop, room impulse/reverb, SFX đến hàng, bước chân, ngồi/đứng, nến, hoa, prayer và 100/500. Tất cả sinh bằng Web Audio, không tải nhạc/bản thu bên thứ ba. Có ba mức âm lượng riêng, 0 tắt lớp; master mute toàn phiên. AudioContext chỉ mở sau thao tác của người xem/operator.

Nhịp bước và âm nhỏ có throttle; tối đa 24 voice SFX, dọn onended và khi unmount. Hook SFX theo mốc `startedAt` thực của FX, không phát tiếng chuông khi donor mới bắt đầu đi từ cuối hàng. Music dùng oscillator đổi pitch liên tục; ambient buffer có hai đầu về 0 để giảm seam. Chưa phải bản thu organ/chuông nhà thờ thật.

## Các trường hợp giới hạn

- 100 viewer là giới hạn thông thường. Người mới tặng khi phiên đủ 100 được giữ gift trong queue và có tối đa một avatar tạm (101 tổng) để đi/diễn/rời; không đẩy mất người đang chờ. Avatar tạm không chiếm ghế người khác. Số đếm vẫn tính thật, không giả vờ 101 là 100.
- Ghế đầy: giữ overflow slot hợp lệ phía sau dãy ghế, lối giữa được chừa trống. Chỉ 8 người đứng inside được vẽ rõ khi ổn định; các người ở xa/out-of-frame vẫn có logic. Giới hạn vẽ không làm mất gift.
- Default appearance chỉ dựa thứ tự tạo avatar, không nickname/ID. Preference tối đa 256 phiên và TTL, không ghi ra database/localStorage; reset xóa hết.
- Model vẫn là atlas 2,5D cũ; chưa có đa hướng đầy đủ hoặc mocap. Blend/đường đi đã cải thiện, nhưng không khẳng định xoay thân/đi ngang/lùi chân thực hoàn toàn hay hết mọi foot sliding. Cần thêm art pass nếu muốn mức animation sản xuất cao cấp.
- Không có adapter TikTok thật, thanh toán hoặc cloud multi-user; các test là mock. Chưa đánh giá LIVE nhiều giờ hay FPS hardware sau thay đổi này. Không dùng FPS của v1.3 làm kết quả đo v1.4.

## Mã chính

| File | Thay đổi |
|---|---|
| `packages/shared/src/index.ts` | Parser AMEN/1/2, contracts avatar/gender/journey/counters |
| `packages/shared/src/engine.ts` | Waiting queue, admission chỉ bằng gift, seat allocator, preference, dedup, TTL, priority, FX theo arrival |
| `packages/shared/src/motion.ts` | Queue positions, đường đi/về, easing, state pose |
| `packages/shared/src/fixtures.ts` | Mock full-seat replay qua gift thật của engine |
| `apps/client/src/StageChapel.tsx` | Bỏ avatar trình diễn trùng; waiting/name, alpha blend/appearance, nhịp bước |
| `apps/client/src/scene/stageLayout.ts` | Phép chiếu liên tục tiền sảnh/lối đi |
| `apps/client/src/audio/*`, `audio.ts` | Audio manager/mixer/hook SFX/cleanup |
| `apps/client/src/App.tsx`, `strings.ts`, `style.css` | Hướng dẫn #06, counts, nút giới tính, danh sách chọn ID, mixer |
| `apps/client/src/preview/store.ts` | Cùng engine mới cho HTML offline; 50 AMEN chỉ chờ |
| `apps/server/src/app.ts` | Giữ routes hiện có, thêm operator mock full-seat |
| `tests/gameplay.test.ts`, `tests/stage.test.ts` | Regression theo luật mới, đường đi, collision, projection |
| `scripts/queue-browser.ts`, `scripts/preview-smoke.ts` | Smoke UI/HTTP/WS/audio và bản HTML offline |

## Cách chạy

`npm ci` → `npm run dev`, mở `http://127.0.0.1:5173/` và `/control`. Hoặc `npm run build` → `npm start`, cổng 3001. Tại control chọn đúng ID rồi AMEN / 1 Male / 2 Female / gift. Muốn nghe: Enable audio rồi bỏ Mute sound; mixer bằng 0 là tắt lớp.

`npm run build:preview` tạo HTML tự chứa không cần Node trên máy người xem; mọi tab có phiên riêng. ZIP và link tải mới nằm ở `downloads/README.md` trên nhánh này. Ảnh và JSON kết quả thật: `docs/screenshots/queue/`.

## Kết quả kiểm thử thực tế

- `npm run typecheck` / `npm run build`: đạt. Có cảnh báo PURE annotation của Zod/Rollup như bản trước, không làm build thất bại.
- `npm test`: **26/26 đạt**. Parser, gender trước/sau AMEN, trì hoãn appearance khi đang đi, chỉ gift mới cấp ghế, ghế đầy, dedup/retry, 50+5, 100+20, TTL, quay lại trong lúc rời, collision hàng chờ/đường đi, phép chiếu liên tục, HTTP/WS, adapter repeat đều được kiểm tra.
- `npm run test:browser`: đạt trên hai route production; **50 AMEN + 5 gifters = 45 Waiting, 5 Inside, 5 Seated**, NPC không tính. 100 AMEN + 20 gift = 80 Waiting, 20 Inside, không mất gift. Đã quan sát đủ sáu giftKey, kiểm tra full-seat và camera về 1,0000. Không có page/console error.
- AudioContext thật: chạy khoảng **50,36 giây**, qua các hợp âm 0→1→2→3→0 của chu kỳ 48 giây. RMS nền khi bật khoảng **0,0147**, chuông có **3 voice** hoạt động, master mute đưa RMS về **0**. Đây là đo tín hiệu graph, không phải đánh giá chất lượng nghe bằng tai trên loa máy phát. Không có file nhạc ngoài.
- `npm run build:preview` / `npm run test:preview`: đạt. Tài liệu HTML tự chứa khởi tạo 50 người **đang chờ**, kiểm tra AMEN/dedup, burst 20/50/100, phát sáu quà theo thời gian thực, offerings, camera, chất lượng, reset và khung sạch. Không phát sinh HTTP/WS ngoài tài liệu. Storage bị chặn vẫn chạy. Chromium cloud chặn điều hướng `file://` bởi policy; bài test đã ghi rõ dùng HTML local được intercept, không backend. Chưa kiểm chứng double-click trên máy Windows của người dùng.

Nguồn số liệu: [results.json](screenshots/queue/results.json), [HTML preview results](screenshots/queue/html-preview-results.json). [Ảnh 9:16](screenshots/queue/README.md) chứa đầy đủ các trạng thái yêu cầu. Không đo lại FPS hardware trong phiên này và không tuyên bố LIVE-ready cho mọi máy.
