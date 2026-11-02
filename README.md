# Chapel of Hope LIVE v1.7 — Chuyển động, camera và đám đông

Thánh đường châu Âu **2,5D**, khung dọc 9:16, hàng chờ AMEN, sáu quà, lời chúc Anh–Việt–Ý và adapter TikFinity Desktop. Đây là không gian ảo, không phải giáo xứ/bí tích thật; quà tạo hoạt cảnh, không hứa kết quả tâm linh.

**Trạng thái: READY FOR WINDOWS VALIDATION. Chưa LIVE VERIFIED.** Linux mock/replay và browser không thay cho kiểm tra launcher, giọng Windows, TikFinity và audio/video output trên máy phát.

## Chạy Windows

[Tải gói Windows production](https://github.com/npstorebinhduong-dev/chapel-hope-live/blob/feat/living-crowd-camera/downloads/Chapel-of-Hope-LIVE-v1.7-Windows.zip?raw=true).

Giải nén toàn bộ, cài Node.js ≥22.12 (khuyến nghị 24 LTS), chạy **START_CHAPEL_LIVE.bat**. Script mở LIVE và Control sau khi health check đạt. Dừng bằng **STOP_CHAPEL_LIVE.bat**, chỉ dừng tiến trình do launcher tạo. ZIP có bundle production và asset, không chứa Node runtime/node_modules, không phải standalone EXE.

- LIVE: `http://127.0.0.1:3001/`
- Control: `http://127.0.0.1:3001/control`
- Không cần Vite để chạy production.
- Nếu build thiếu, launcher cài đúng lockfile rồi build; khi đó cần Internet.

[Hướng dẫn Windows + TikFinity + LIVE Studio/OBS](docs/LIVE_STUDIO_TIKFINITY_WINDOWS_VI.md) · [Checklist audio capture](docs/AUDIO_CAPTURE_CHECKLIST_VI.md) · [Mapping ID thật](docs/GIFT_MAPPING_LIVE.md).

## Luật đã khóa

- AMEN chỉ tạo/renew một avatar **đứng hàng chờ**, không tự vào ghế.
- Comment chính xác `1` chọn nam, `2` chọn nữ; chọn trước AMEN chỉ lưu tùy chọn phiên.
- Chỉ gift hợp lệ của đúng viewer mới cho đi vào → đến zone → FX → ghế hoặc chỗ đứng. Gift trước AMEN vẫn chạy. Không sinh bản sao donor.
- Sáu key độc lập: `candle_1`, `prayer_5`, `rose_5`, `bell_10`, `altar_100`, `ceremony_500`. Hai quà 5 xu phải map hai gift ID khác nhau, không dựa giá xu.
- 50 AMEN + 5 người tặng → **45 chờ, 5 trong lễ đường**, không tính NPC.

## Control và âm thanh

Ba tab LIVE Connection, Audio & Language, Gift Test & Mapping. Có source Mock/TikFinity, endpoint loopback, Connect/Disconnect, bảng mapping sáu ID, log metadata giới hạn, 36 lời chúc, voice picker/rate/test, năm bus và preflight.

Nhấp vào **đúng trang LIVE được capture** để unlock âm thanh, bỏ Mute sound ở Control. BrowserSpeechProvider chỉ dùng giọng cùng locale có thật trên máy; thiếu giọng giữ banner và báo Missing. RecordedClipProvider hỗ trợ bản thu local do operator có quyền cung cấp. Music giảm khoảng 10 dB khi voice bắt đầu và phục hồi khi xong/lỗi/timeout. Chỉ một lời đọc, queue bounded. Ngôn ngữ event đang phát được giữ ổn định khi đổi lựa chọn.

Nhạc organ/piano, ambient, chuông và choir là **synthesis nguyên tác**, không phải recording người thật. [36 câu lời chúc](docs/VOICE_LINES_EN_VI_IT.md) · [Provider và giấy phép](docs/AUDIO_VOICES_AND_LICENSES.md).

## TikFinity

Server Node kết nối `ws://127.0.0.1:21213/` khi operator chọn TikFinity và Connect. Desktop phải chạy cùng PC. Mock endpoints không nhận quà/chat khi source LIVE được chọn. Mapping có thể sửa khi kết nối mà không reset scene. Socket connected không đồng nghĩa LIVE verified.

Gift ID chưa map chỉ hiện Unknown Gift. Xử lý final combo, dedupe transaction/group ID, cap repeat 20, retry socket có backoff/heartbeat. Phiên viewer chỉ ở RAM; cấu hình operator lưu riêng khi launcher cung cấp `CHAPEL_CONFIG`. Khởi động lại luôn ở Mock, không tự đăng nhập hay GO LIVE.

## Phát triển và kiểm thử

```bash
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run test:browser
npm run test:living
npm run test:production
npm run test:soak
npm run build:windows
```

Dev: Vite 5173 + server 3001; production chuẩn `npm run build` rồi `npm start`; bundle đầy đủ `npm run build:windows` rồi `node production/server.cjs`. `CHAPEL_CONFIG` tùy chọn đường dẫn JSON cấu hình operator. Giữ server bind loopback.

`test:living` kiểm tra đám đông 20/50/100/1.000, idle 60 giây, hành trình thời gian thực, focus sáu quà, 30 quà liên tiếp và mất kết nối.

`test:browser` kiểm tra gameplay 50+5/100+20/ghế đầy và audio. `test:production` kiểm tra 18 quà–locale, voice API contract có fixture giả được phân biệt với voices thật, hai vòng nhạc thực, UI mapping và preflight. `test:soak` mặc định 30 phút mock thời gian thực (đổi `SOAK_MINUTES` khi chẩn đoán; không gọi bài rút ngắn là soak 30 phút). Chromium mặc định `/usr/bin/chromium` trong cloud.

`npm run build:preview` → HTML offline tự chứa tại `artifacts/html-preview/index.html`; `npm run test:preview`. HTML chỉ là preview Mock, mỗi tab một phiên, không nối TikFinity. `npm run package:windows` (máy đóng gói có Python 3) tạo ZIP có manifest SHA256, không node_modules.

## Giới hạn và bằng chứng

Giữ atlas kiến trúc/nhân vật từ v1.4; thêm vật dâng, ánh sáng, micro-animation, blend và timeline. Chưa có mocap/quay nhân vật nhiều hướng; không gọi sprite là 3D photoreal. Hàng chờ không còn trần 100 viewer hoặc 12 người hiển thị; đám đông tự tăng lớp/mật độ và giữ TTL 10 phút. 48 ghế viewer + 16 NPC + 8 chỗ đứng; khi đầy cả chỗ đứng, người tặng thực hiện nghi thức rồi đi ra. Queue gift 128, một hành trình/lối tại một thời điểm; burst cần chờ đi/về, full queue được báo rejected. Không cam kết nhận vô hạn.

[Changelog và kết quả thực](docs/CHANGELOG_V1_7.md) · [Ảnh 9:16 và JSON kiểm thử](docs/screenshots/live-v17/README.md). Windows/TikFinity phiên LIVE/capture output phải xác nhận riêng trước khi ghi LIVE VERIFIED.
