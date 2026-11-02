# Chapel of Hope LIVE v1.6 — báo cáo triển khai

## Nền tảng và trạng thái

Nhánh `feat/production-live-v1-6` kế thừa toàn bộ code/asset v1.4 tại `feat/gift-entry-queue` (`c3103ee`, bao gồm tài liệu Task #07). Đã đọc và đưa Task #08 từ `origin/main` vào nhánh; không thay thế code bằng nhánh main chỉ có tài liệu. Task #07 chưa có implementation riêng nên phần thiếu được thực hiện trong v1.6.

**READY FOR WINDOWS VALIDATION**. Không có phiên TikTok LIVE thật hoặc Windows LIVE Studio trong môi trường Linux này. Không gắn LIVE VERIFIED; kiểm chứng Windows/capture/gift ID/voice trên máy phát còn phải thực hiện.

## Những gì đã triển khai

- Giữ nguyên AMEN chỉ vào hàng chờ, 1/2 chọn avatar, gift-only entry, 6 key, full-seat, dedupe/priority, TTL và avatar cùng userId. Sửa phép so sánh deadline TTL tránh sai số trừ số thực ở đúng thời điểm hết hạn.
- Nến/hoa: đưa điểm đến donor khớp giá nến và kệ hoa trong nền 2,5D; vẽ vật đang cầm/đặt theo cùng donor, ngọn lửa/glow/khói và hoa tích lũy có cap. Cánh hoa rung nhẹ.
- Prayer: pose quỳ có blend, quầng sáng ấm; Bell: chuông và nhóm NPC/viewer cúi/quỳ lệch pha. 100: FX 9,5 giây, 500: 11 giây (không tính đi/về), rút còn 65% khi backlog >12. Camera zoom/pan nhỏ luôn timeout về overview, ánh sáng kính màu nhiều tông, đại cảnh có ánh sáng toàn nhà thờ và choir synthesis. Không có ánh sáng chớp hoặc hình thần xuất hiện.
- Priest composite pose trong tile riêng trước khi vẽ một lần để tránh hụt alpha. Kiến trúc/atlas vẫn từ nền đã duyệt, không tuyên bố thêm model 3D thật hoặc mocap. Body turning/hand articulation còn giới hạn của sprite; vật dâng là overlay 2,5D, không phải IK bàn tay.
- `voice/lines.ts`: 36 câu đã biên tập, hai biến thể/gift/locale, luân phiên độc lập. Sáu câu chuẩn mỗi locale đúng Task #08. LIVE UI, nhãn quà và banner EN/VI/IT; locale/text chốt theo event, không đổi ngôn ngữ câu đang đọc khi operator đổi lựa chọn.
- BrowserSpeechProvider, RecordedClipProvider, danh sách voice đúng locale/voiceschanged, tốc độ 0.85–1.1, test EN/VI/IT và 500, read-name opt-in có lọc. Thiếu voice/clip giữ banner; không dùng voice ngôn ngữ khác, không tự cài dịch vụ trả phí.
- Một voice đang đọc, tối đa 4 pending, priority có giới hạn và coalesce speech quá tải; timeout 10 giây, không chặn gameplay. Music duck ~10 dB, ambient giảm 6 dB, fade/restore. Banner có tên, hai dòng, fade, nằm phía trên cung thánh; disclaimer chuyển sát mép dưới để không chồng chữ.
- Nhạc nguyên tác organ harmonic + arpeggio piano 48 giây, ambience/reverb, footsteps biến thể, quỳ/ghế, nến/hoa/chuông/100/500; choir là additive synthesis. Bốn nguồn nền cố định, 24 nguồn ngắn tối đa, limiter. Web Speech/HTMLAudio dùng bus volume logic Voice×Master riêng, không đi qua WebAudio limiter.
- TikFinity Node WebSocket loopback với backoff/heartbeat, parse wrapper chat/gift, map ID (không map coin), final streak/dedup, schema guards, unknown gift metadata, log phiên cap 40. Chỉ một source, mock endpoints bị chặn trong TikFinity mode. Mapping đang LIVE có thể cập nhật không reset scene/socket. Cấu hình operator có thể persist, viewer/chat không ghi disk.
- Control có ba tab, source/status/log, endpoint, mapping, locale/voice/rate/banner, 5 bus và preflight. Check server, route, canvas/9:16, audio/voice/telemetry còn mới và sáu mapping; Windows/capture/real LIVE không tự pass.
- START/STOP `.bat` + PowerShell: Node version guard, build/dependency fallback, health wait, mở hai route. Dừng qua nonce và xác minh PID/start time/executable/command line, không kill mọi Node. Bundle `production/server.cjs` chứa dependency cần chạy (không cần node_modules), Node runtime vẫn phải cài.

## File chính

| Nhóm | File |
|---|---|
| Luật/settings | `packages/shared/src/production.ts`, `index.ts`, `engine.ts`, `motion.ts` |
| TikFinity/config/server | `apps/server/src/tikfinity.ts`, `operatorConfig.ts`, `app.ts`, `index.ts` |
| Scene | `apps/client/src/StageChapel.tsx`, `App.tsx`, `style.css` |
| Voice/localization | `apps/client/src/voice/*`, `locales/*` |
| Mixer | `apps/client/src/audio/runtime.ts`, `settings.ts`, `useSceneAudio.ts` |
| Operator/telemetry | `ProductionPanel.tsx`, `store.ts`, `preview/store.ts` |
| Windows/build | `START_CHAPEL_LIVE.bat`, `STOP_CHAPEL_LIVE.bat`, `windows/*.ps1`, `scripts/build-windows.mjs`, `package-windows.py` |
| Kiểm thử | `tests/production.test.ts`, `tests/fixtures/tikfinity.json`, `scripts/production-browser.ts`, `scripts/soak-v16.ts` |

## Kiểm thử và giới hạn xác minh

Kết quả cuối sẽ được ghi cùng JSON dưới `docs/screenshots/live-v16/`; không dùng hình minh họa giả làm screenshot. Bài kiểm tra voice API có fixture giả được ghi riêng, không gọi chúng là giọng cài sẵn. Những phép nhảy đồng hồ để chạy nhanh hành trình được ghi rõ; nhạc và soak dùng thời gian thực.

Hiện bundle đã chạy trên Node/Linux, hai route `/` và `/control` trả 200, health đúng v1.6, graceful shutdown theo nonce đạt. Cú pháp cả hai script được PowerShell 7.4.6 parser kiểm tra sau khi đối chiếu SHA256 bản tải chính thức. **Đây không phải kiểm thử launcher trên Windows**.

Các việc operator phải xác minh: Node/launcher trên Windows; giọng native thực và quyền phát lại giọng; 6 ID gift thật và payload Desktop hiện hành; comment/gift thật; music/voice/SFX và hình trong bản ghi LIVE Studio/OBS 20–30 giây; hiệu năng trên máy phát. Cloud graph hoặc mock socket không thể xác nhận những phần này.

Queue 128 vẫn có ngưỡng từ chối; không claim burst vô hạn. Một hành trình/lối tại một thời điểm khiến burst nhiều quà phải chờ. 100 viewer thường, 12 waiting visible, 48 ghế viewer+16 NPC, một donor tạm nếu đầy. Không có hình 3D người mới; turning/foot sliding vẫn cần art pass để đạt animation cao cấp.

## Kết quả đã hoàn tất

- `npm ci`: đạt, 198 packages cài theo lockfile; typecheck và `npm run build:windows`: đạt. Rollup có warning PURE annotation của Zod như bản cũ, không lỗi build.
- `npm test`: **35/35 đạt**, gồm gameplay cũ, 30 gift liên tiếp, 16 fixture wrapper TikFinity + JSON malformed/null, reconnect socket thật tới server giả lập, source isolation, lưu config, mapping update không ngắt kết nối, shutdown nonce, 36 câu và voice queue.
- Browser gameplay regression: **45 Waiting / 5 Inside / 5 Seated**, NPC không tính; 100 AMEN + 20 gift → 80/20; sáu gift và ghế đầy đạt.
- Browser production: **18 tổ hợp quà × locale** có text đúng; 18 lời qua provider fixture đúng lang; duck Music đo trên graph thật, phục hồi đúng. Hai vòng nhạc thời gian thực, mẫu cuối tại **96.68 giây**; master mute RMS **0**, không có page errors.
- Danh sách giọng native trong Chromium Linux: **[]**. Test giọng EN/VI/IT dùng fixture API riêng, **không** chứng minh phát âm native hoặc capture. Fallback thiếu giọng được kiểm tra trong trang thật.
- RecordedClipProvider: HTMLAudio thật phát WAV tín hiệu test tổng hợp ba giây theo EN/VI/IT manifest; duck và mute đạt. WAV này là fixture kiểm tra provider, không phải lời đọc và không được bán như clip voice.
- HTML offline: sáu FX, AMEN, burst100, camera reset, renderer và storage-blocked đạt, không HTTP/WS ngoài tài liệu. Browser cloud chặn file:// nên test dùng tài liệu HTML local route-fulfilled; chưa double-click trên Windows.
- Bundle production độc lập Vite đã trả health/LIVE/control 200 và chấp nhận graceful stop có nonce. Cú pháp PowerShell đạt trên Linux; chạy Windows thực còn chưa xác minh.

Các test chức năng browser chạy cùng đợt, không dùng số FPS trong đó như benchmark hardware LIVE.

### Soak mock thời gian thực

Đạt **30.05 phút**, 100 viewer logic được renew; **49 quà nhận / 49 hoàn tất / 0 pending**, reload browser giữa phiên hoạt động, không page error. Heap Node lấy mẫu dao động **53,81–103,02 MiB**, đầu/cuối **62,18/72,90 MiB**; không phải phân tích heap leak chuyên sâu. Bốn nguồn nền và tối đa 24 nguồn ngắn được theo dõi. Soak này chạy core engine/audio v1.6; các chỉnh sửa subtitle/Voice=0/mixer diagnostic cuối có browser regression riêng, không tuyên bố đã soak 30 phút lại mọi thay đổi cuối.

Chi tiết: `screenshots/live-v16/soak.json`. Test ZIP giải nén độc lập không node_modules cũng chạy health/LIVE/control/AMEN/graceful stop đạt.

### Trạng thái PR

API GitHub vẫn chưa nằm trong network allowlist của môi trường đang chạy (bản nháp đã có `api.github.com` nhưng chưa áp dụng). Vì vậy chưa tạo được PR qua CLI/API. Nội dung PR đã chuẩn bị ở `PULL_REQUEST_V1_6.md`; nhánh được push riêng, không ghi đè nhánh v1.4.

### Kiểm tra mixer và phụ đề cuối

Đã sửa lỗi timer phụ đề bị gia hạn lặp khi Voice=0/voice disabled: chỉ cancel khi quyền phát voice chuyển trạng thái hoặc còn speech active/pending. Test HTMLAudio xác nhận Voice=0 dừng clip và banner hết hạn. Đo Music/Ambient/SFX/Master riêng khi graph đang render: mỗi gain về dưới 0,001; SFX được kích hoạt trước khi đo để tránh giá trị AudioParam cũ của nhánh idle. Kết quả trong `recorded-provider.json`.
