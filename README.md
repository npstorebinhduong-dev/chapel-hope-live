# Chapel of Hope LIVE v1.9 — Hướng dẫn, tương tác và quản trị tiếng Việt

Thánh đường châu Âu **2,5D**, khung 9:16, hàng chờ AMEN, sáu hoạt cảnh quà, tim/chia sẻ, lời chúc Anh–Việt–Ý và TikFinity Desktop. Không gian ảo, không phải giáo xứ hoặc nghi lễ thật; quà tạo hoạt cảnh, không bảo đảm kết quả tâm linh.

**Chờ kiểm chứng Windows và LIVE thật. Không phải LIVE VERIFIED.** Kết quả Linux mock/replay không thay cho kiểm tra bình luận/quà/tim/chia sẻ và hình/tiếng trong TikTok LIVE Studio.

## Tải và mở

- [Gói Windows production v1.9](https://raw.githubusercontent.com/npstorebinhduong-dev/chapel-hope-live/feat/v1-9-vietnamese-live/downloads/Chapel-of-Hope-LIVE-v1.9-Windows.zip)
- [HTML xem thử offline v1.9](https://raw.githubusercontent.com/npstorebinhduong-dev/chapel-hope-live/feat/v1-9-vietnamese-live/downloads/Chapel-of-Hope-LIVE-v1.9-HTML.zip)

**Windows:** giải nén toàn bộ, cài Node.js ≥22.12 (khuyến nghị 24 LTS), chạy `START_CHAPEL_LIVE.bat`. Gói đã có bundle production và asset; không cần npm install để chạy bundle, không kèm Node runtime và không phải EXE. Dừng bằng `STOP_CHAPEL_LIVE.bat`; chỉ dừng tiến trình của launcher, không tắt Node khác.

- Màn hình đưa vào OBS: **http://127.0.0.1:3001/**
- Quản trị tiếng Việt: **http://127.0.0.1:3001/control**

OBS/LIVE Studio: dùng Window Capture cửa sổ LIVE, canvas/output 1080×1920. Thu tiếng Edge bằng một Application Audio Capture hoặc Desktop Audio; không thu trùng. Bỏ “Tắt toàn bộ âm thanh” ở quản trị rồi nhấp vào màn hình LIVE để mở âm. Ghi local trước khi phát. Không thu trang `/control`; chương trình không bấm GO LIVE.

**HTML:** giải nén rồi mở `index.html` bằng Edge/Chrome. Có sẵn 50 khách chờ; bảng điều khiển bên cạnh dùng chung phiên trang đó. Mỗi tab là phiên mock riêng, không kết nối TikFinity. Không mở HTML bên trong trình xem ZIP.

## Có gì mới

- Sáu khu quản trị cố định tiếng Việt, độc lập ngôn ngữ phát; kết nối/mapping, thử quà và tương tác, preflight, mixer và trạng thái đều hoạt động.
- Bảng kính mờ viền đồng luân phiên AMEN / tim–chia sẻ / sáu quà. Hai quà 5 xu tách biệt. Thu gọn khi focus; `+N` cho phần đám đông không vẽ.
- Tim thật theo delta hoặc tổng tích lũy có baseline/dedupe; mốc mặc định 1000 → ánh sáng/chuông. Chia sẻ → bồ câu, mốc 10 → đàn chim. Không tự tăng số liệu, không cấp ghế từ tim/chia sẻ.
- Cầu nguyện NPC miễn phí khoảng 5 phút khi có tương tác. CTA có giới hạn 90 giây, tối đa 3/10 phút, trì hoãn quà/giọng, có yên tĩnh và quan sát A/B.
- Ba đoạn organ/piano tổng hợp nguyên tác, chuyển đoạn ở ô nhịp, hòa chuyển 1,2 giây. 54 lời chúc và 36 câu cảm ơn quà cùng các lời phản hồi/CTA EN–VI–IT. Một giọng tại một thời điểm, nhạc giảm ~10 dB khi đọc. Không có giọng đúng ngôn ngữ thì chỉ phụ đề.

## Luật giữ nguyên

AMEN chỉ tạo/renew một avatar đứng chờ. `1` chọn nam, `2` chọn nữ, không nhân bản. Chỉ quà hợp lệ của đúng người mới cho vào → diễn → ghế/chỗ đứng. Quà trước AMEN vẫn chạy; đầy bên trong vẫn diễn rồi rời đi. **50 AMEN + 5 người tặng = 45 chờ, 5 trong lễ đường**, không tính NPC.

Sáu key: `candle_1`, `prayer_5`, `rose_5`, `bell_10`, `altar_100`, `ceremony_500`. Hai quà 5 xu map ID khác nhau, không theo số xu. 48 ghế người dùng +16 NPC +8 chỗ đứng, hàng quà 128, một hành trình tại một thời điểm. Hàng chờ tự tăng mật độ, cap render/RAM cấu hình được, phần gọn giữ danh tính/quyền tặng, TTL 10 phút. Có trần khẩn cấp và báo từ chối rõ, không hứa bộ nhớ vô hạn.

## TikFinity và tài liệu

Chọn TikFinity thực, Desktop cùng máy tại `ws://127.0.0.1:21213/`. Đổi nguồn reset phiên sau xác nhận. Map sáu ID thực tế; gói quà chưa map không đoán. Adapter có combo final, dedupe, reconnect/backoff/heartbeat và parser like/share/follow. Không lưu người xem ra đĩa, chỉ lưu cấu hình operator. Khởi động lại luôn Giả lập và tắt âm.

- [Bảng điều hành tiếng Việt](docs/CONTROL_PANEL_VI.md)
- [Hướng dẫn LIVE và vùng an toàn](docs/LIVE_GUIDE_UI_VI.md)
- [Âm thanh, giọng, bản thu và capture](docs/AUDIO_MIXING_AND_VOICES_VI.md)
- [Tương tác #10 và giới hạn dữ liệu](docs/ENGAGEMENT_LIVE_VI.md)
- [Windows/TikFinity/LIVE Studio](docs/LIVE_STUDIO_TIKFINITY_WINDOWS_VI.md)
- [Ánh xạ sáu ID quà](docs/GIFT_MAPPING_LIVE.md)
- [Changelog/kết quả v1.9](docs/CHANGELOG_V1_9.md) · [Ảnh và JSON thực](docs/screenshots/live-v19/README.md)

## Phát triển và kiểm thử

```bash
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run test:production
npm run test:recorded
npm run test:soak
npm run build:preview
npm run test:preview
npm run package:windows
npm run test:package
```

Dev: Vite 5173/server 3001. Production: `npm run build` rồi `npm start`; bundle: `npm run build:windows` rồi `node production/server.cjs`. `CHAPEL_CONFIG` chỉ định JSON operator. Server bind loopback. Script package cần Python 3. Chromium cloud mặc định `/usr/bin/chromium`.

`test:production` kiểm tra 6 tab Việt, 3 locale LIVE, tim/chim thật trên canvas, 50+5, 18 quà–locale, 30 quà liên tiếp, mixer, khóa âm hai tab và fixture speech. `test:browser`, `test:visual`, `test:living` là alias bài này; kiểm thử chi tiết đường đi/ghế/TTL vẫn trong `npm test`. `test:soak` mặc định 30 phút thời gian thực; `SOAK_MINUTES` chỉ để chẩn đoán, không gọi bài rút ngắn là test 30 phút. `test:recorded` dùng tone WAV để kiểm đường phát, không phải bản thu lời chúc.

## Giới hạn công bố

Kế thừa asset kiến trúc/atlas người v1.7, không tạo lại game. Nhân vật là sprite 2,5D với blend và timeline, không phải người 3D/mocap. Âm thanh tổng hợp, chất lượng voice phụ thuộc máy. Web Locks chống phát đôi trong cùng origin/hồ sơ, không đồng bộ hai trình duyệt hoặc OBS riêng. Windows launcher, tiếng loa/capture, giọng tự nhiên và TikFinity trong LIVE thật chưa xác minh trong cloud. Kiểm tra các mục này trước khi phát.
