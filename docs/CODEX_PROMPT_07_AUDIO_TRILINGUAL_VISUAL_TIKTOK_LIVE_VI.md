# LỆNH CODEX #07 – CHAPEL OF HOPE LIVE v1.5: AUDIO 3 NGÔN NGỮ + ĐỒ HỌA + TIKTOK LIVE TEST

## A. YÊU CẦU BẮT BUỘC
Đây là tác vụ **LẬP TRÌNH VÀ KIỂM THỬ THỰC TẾ**, KHÔNG phải lập kế hoạch. Đọc AGENTS.md, docs/TECH_SPEC_V1.md, docs/CODEX_PROMPT_06_AMEN_WAIT_GIFT_ENTRY_GENDER_VI.md và kiểm tra bản mã hoàn chỉnh mới nhất. Cơ sở đã được kiểm tra là nhánh `feat/gift-entry-queue` (v1.4, có gameplay AMEN/gift-only entry và mixer WebAudio). Nếu Codex đã tạo nhánh mới hơn, chọn nhánh chứa đầy đủ tính năng v1.4 và các thay đổi mới nhất. Không tạo repo mới, không xóa hàng chờ, không phá hình ảnh 2,5D hiện có, không ghi đè nhánh khác khi đang làm việc. Tạo feature branch riêng rồi PR nếu có quyền; nếu API không cho tạo PR thì push nhánh và báo chính xác.

**Ưu tiên của phiên v1.5:**
1. Nhạc nền nhà thờ có âm nhạc thực sự nghe dễ chịu, liên tục, loop sạch.
2. Hiệu ứng âm thanh theo hành động và quà.
3. Giọng đọc cầu chúc **ba ngôn ngữ Anh – Việt – Ý** và banner đồng bộ.
4. Nâng chất lượng hình ảnh thánh đường/nhân vật/cha xứ/nến và hiệu ứng quà.
5. Adapter kết nối **TikFinity Desktop Event API** vào luồng event game, có trạng thái kết nối, mapping, mock test và hướng dẫn test LIVE với LIVE Studio/OBS.

## B. KHÓA GAMEPLAY HIỆN TẠI (KHÔNG ĐƯỢC SỬA SAI)
- Comment `AMEN` = tạo/renew một avatar ở **HÀNG CHỜ PHÍA DƯỚI**, không tự ý vào ghế.
- Comment chính xác `1` = chọn avatar **nam**, `2` = chọn **nữ**, không spawn người khi chưa AMEN; đổi model mềm, không duplicate.
- Chỉ sự kiện `gift` hợp lệ từ đúng userId mới mời avatar vào lễ đường (kể cả người chưa AMEN vẫn nhận gift được).
- Khi ghế đầy vẫn phát FX tại chỗ đứng hợp lệ; không cướp ghế hay bỏ quà.
- Giữ 6 giftKey độc lập: `candle_1` 1, `prayer_5` 5, `rose_5` 5, `bell_10` 10, `altar_100` 100, `ceremony_500` 500. Đặc biệt hai quà 5 xu phân biệt **gift ID**, không dựa vào giá trị xu đơn thuần.
- Người xem comment AMEN được tham gia miễn phí ở hàng chờ; gifts chỉ thay đổi hoạt động hình ảnh trong game, **không nói quà giúp được ban phước, chữa bệnh hoặc được Thiên Chúa ưu ái**.
- Giữ route LIVE `/` sạch, Control Panel `/control` riêng. Nhận biết đây là không gian cầu nguyện **ảo**, không giả mạo giáo xứ hoặc linh mục có thật.

## C. ÂM THANH NỀN (MUSIC / AMBIENT)
Mã hiện tại đã có các lớp Web Audio tổng hợp (pad 48s / room tone / SFX). Cần **nâng lên chất lượng nghe phù hợp LIVE**, không chỉ thêm nút bấm giả:
- Tạo AudioManager trung tâm, giữ lại mixer và tương thích API cũ, các bus `master`, `music`, `ambience`, `sfx`, `voice`; điều khiển volume mỗi bus từ /control, mute master, công tắc music/ambience/sfx/voice và lưu config cấu hình phiên (không lưu dữ liệu cá nhân).
- Nhạc nền dành cho nhà thờ Công giáo châu Âu: hòa âm organ/piano nhẹ và âm nền trang nghiêm, không quá fantasy, không chói; tạo file audio loop gốc hợp pháp/được phép sử dụng và tài liệu nguồn giấy phép. Có thể dùng bản nhạc **nguyên tác do chính dự án tổng hợp/xuất file**, không lấy ngẫu nhiên nhạc thánh ca trên YouTube/TikTok. Nếu thiếu loop âm thanh thực, cải thiện phần composition Web Audio hiện có và ghi đúng là nhạc tổng hợp chưa phải bản thu thực.
- Loop không tiếng khựng ở điểm nối, crossfade 200–600ms hoặc căn sample/bpm; không tích lũy nhiều AudioBufferSource. Mốc 45–90s/chu kỳ tùy arrangement, không lặp một nốt đơn khó chịu.
- Khi giọng cầu chúc phát, giảm nhạc tự động (audio ducking khoảng 8–14 dB) rồi tăng mượt khi đọc xong; không bị 2 giọng nói đè nhau.
- Ambient stereo: room tone nhà thờ, tiếng gió rất nhẹ, lửa nến (không cần crackle thật liên tục, chỉ âm tinh tế); giảm âm khi có voice.
- Browser autoplay: audio chỉ có thể bật sau tương tác người điều hành trên trang phát âm, phải có nút “Bật âm thanh” hoặc quy trình unlock hợp lệ; không tự khẳng định autoplay hoạt động trong OBS/LIVE Studio. Chế độ control có hướng dẫn unlock ở /.

## D. HỆ THỐNG SFX ĐỒNG BỘ VỚI ANIMATION
- Danh mục SFX: bước chân trên nền đá/gỗ (nhiều biến thể, rate limit); đứng/ngồi/quỳ (rất nhỏ), bắt đầu chờ, thắp nến, đặt hoa, tiếng chuông 10 xu, điểm nhấn 100 xu, chuông + hợp xướng ngắn original/cleared 500 xu, nhẹ khi camera focus.
- SFX phát theo **mốc hành động thật** khi nhân vật tới zone/timeline của FX (đặt nến/hoa), không phát trước khi người còn đi từ hàng chờ.
- Có mixer, giới hạn simultaneous voices; không clip, không méo, tránh chuông đánh liên tục khi nhiều gift. Có cooldown/dedupe phù hợp, nhưng KHÔNG mất event gift.
- Hình và tiếng được đồng bộ; âm thanh fade in/out để tránh click. Lỗi audio hoặc voice TTS KHÔNG được làm đơ hoạt động quà và animation.

## E. BỘ MÁY TTS CẦU CHÚC BA NGÔN NGỮ
Phải có bộ chọn ngôn ngữ rõ tại /control: **English (en), Tiếng Việt (vi), Italiano (it)**, chọn giọng riêng và xem danh sách voice có thực trong máy. Cấu trúc mở rộng cho EN (en-GB/en-US), VI (vi-VN), IT (it-IT).
- Không dùng một voice Việt để đọc câu Ý/Anh hoặc một voice Anh đọc tiếng Việt kiểu robot. `speechSynthesis.getVoices()` không bảo đảm voice tồn tại; lắng nghe `voiceschanged` và lọc giọng theo `lang`, có nút “Nghe thử” và trạng thái Voice available / Missing voice.
- TTS provider interface: `BrowserSpeechProvider` + `RecordedClipProvider` (file âm thanh voice do dự án cung cấp/có quyền), có khả năng thêm provider mới sau; không hardcode Azure/giọng cloud tốn phí; KHÔNG tự ý dùng dịch vụ có tính phí hoặc API key ngoài.
- Nếu thiếu giọng ngôn ngữ chọn, **không đọc sai ngôn ngữ**: hiển thị banner + cảnh báo trong control, cho phép chọn audio clip bản địa sẵn có hoặc tắt voice. Không giả vờ giọng được hỗ trợ.
- Câu cầu chúc ngắn, tự nhiên, phù hợp văn hóa Công giáo nhưng **không giả mạo lời ban phép của linh mục thật hoặc nghi thức bí tích**. Giọng có chất ấm, rõ, tốc độ khoảng 0.88–1.0 tùy voice. Có thư viện ít nhất 8–12 mẫu lời chúc mỗi ngôn ngữ được biên tập tương ứng, theo chủ đề bình an, hy vọng, gia đình, sức khỏe theo kiểu động viên, không hứa chữa bệnh.
- Các mẫu ví dụ kiểm tra ngôn ngữ:
  EN: “May peace and hope accompany you today.”
  VI: “Cầu chúc bạn một ngày bình an và nhiều hy vọng.”
  IT: “Che la pace e la speranza ti accompagnino oggi.”
- Đừng đọc liên tục mọi AMEN (rất nhiều comment): chỉ chào đón bằng text/sound ngắn theo rate limit nếu cần. Ưu tiên đọc lời chúc khi có gift; 100 và 500 có lời riêng.
- Voice queue: chỉ một lời đang đọc, ưu tiên 500/100 nhưng không starvation; coalesce quà nhỏ khi spam; nếu giọng đọc quá dài, lựa chọn banner-only thay vì xếp hàng nhiều phút; báo số bỏ đọc vì overload, KHÔNG bỏ gift.
- Bật/tắt đọc tên: nickname bất thường, ký tự lạ, URL, từ bậy được kiểm soát; mặc định có thể không đọc nickname nhưng vẫn hiển thị nickname đã sanitize.
- Banner trên màn hình khi có lời chúc: hiển thị **đúng văn bản cùng ngôn ngữ đã chọn**, thời lượng ăn khớp lúc đọc và fade mềm; dòng chữ gọn, không che thánh giá/linh mục/bàn thờ; giữ banner ít nhất vài giây khi người dùng tắt voice, có nút show/hide tại control.
- Localization: tách `locales/en.ts`, `vi.ts`, `it.ts` (hoặc JSON) cho strings UI, gift labels/quotes, tránh hardcode khắp JSX. `/control` có ngôn ngữ LIVE và voice tương ứng; UI LIVE đổi cùng locale. Lựa chọn TTS ngôn ngữ thống nhất nếu không chọn biến thể riêng.
- Không cần phát nhạc hiện hành thuộc bản quyền hoặc giọng mô phỏng người nổi tiếng/giáo sĩ ngoài đời.

## F. ĐỒ HỌA 2,5D / HIỆU ỨNG PHỐI HỢP GIỌNG
- Tiếp tục phong cách **nhà thờ châu Âu chân thực 2,5D**, không quay lại nhân vật hình hộp. Giữ chiều sâu thánh đường, vòm Gothic, tượng/Thánh giá, cha xứ NPC, 2 dãy ghế, hàng nến, hoa, khói và kính màu.
- Nâng PBR/texture/lighting/hiệu ứng phù hợp khả năng stage hiện có; tránh đổi cả render pipeline gây giảm độ nét. Nếu stage là atlas 2,5D, ưu tiên chất lượng asset và animation blend hơn việc lắp hiệu ứng 3D nặng. Ghi rõ những gì là 2D atlas/placeholder.
- Nhân vật nam/nữ mặc trang phục đi lễ châu Âu, animation hàng chờ/đi vào lễ đường/ngồi/quỳ mượt; sửa xung đột z-order, chân xuyên ghế, chớp sáng khi chuyển pose. Cha xứ là NPC có animation nhẹ, không đọc giọng như linh mục có thật.
- Nến quà 1 xu: đúng vị trí giá nến, ánh lửa/khói nhỏ; 5 hoa phải thật sự thêm hoa; 5 cầu nguyện hoạt cảnh; 10 chuông; 100 ánh sáng điện ảnh + banner và giọng; 500 hợp xướng/chuông/ánh sáng tập thể + banner/giọng nổi bật nhưng không lòe loẹt.
- Bố cục 1080×1920; bảo vệ UI, tên, banner khỏi vùng bàn thờ. Khi voice phát, thêm subtitled banner readable trên điện thoại; không được che giữa màn hình bởi 2 dòng text quá lớn.
- 3 mức quality Low/Balanced/High, không crash với 100 avatar logic, 50 waiting + 5 donor, 20 gifts.

## G. KẾT NỐI THẬT TIKFINITY DESKTOP EVENT API / LIVE STUDIO
Mục tiêu: có thể chọn `Mock` hoặc `TikFinity LIVE` trong /control; nối event thật nếu người vận hành đã kết nối TikTok và đang LIVE, đồng thời vẫn test không cần TikTok.

Tài liệu chính thức tham khảo:
- https://tikfinity.zerody.one/tiktok/dapi
- https://blog.tikfinity.com/tikfinity-setup/
- Tài liệu TikFinity Actions & Events ghi local Event API WebSocket: `ws://localhost:21213/` khi TikFinity Windows Desktop App chạy cùng máy; dạng message wrapper thường là `{"event":"chat"|"gift", "data": {...}}`. Cần kiểm tra dữ liệu thực từng phiên, không coi payload ví dụ là schema bất biến.

Các nhiệm vụ:
1. Tạo `TikFinityEventAdapter` (server-side Node WebSocket client khuyến nghị để không phụ thuộc browser cross-origin/CSP), kết nối endpoint local cấu hình được (mặc định `ws://127.0.0.1:21213/`), chỉ chấp nhận loopback ở mặc định, auto-reconnect exponential backoff, health/status và đóng clean. Không bật LIVE mode khi chỉ có server WebSocket mock.
2. Nhận `chat` -> parse đúng `userId/uniqueId/nickname/comment` theo payload quan sát được; đưa qua shared event parser AMEN/1/2 cũ. Chat text phải không được giả gift.
3. Nhận `gift` -> lấy stable sender ID, giftId, gift name, diamondCount/coinPrice nếu có, repeatEnd/repeatCount và event identity; map theo cấu hình có thể chỉnh trong /control từ `official giftId` thực tế sang 6 `giftKey`; tuyệt đối không route 2 gift 5 xu theo giá tiền. Nếu chưa cấu hình, hiển thị “Unknown Gift” và sample metadata, không tự gán bừa hoặc kích hoạt sai.
4. Kết nối LIVE Event Adapter qua server events WebSocket hiện có -> cùng engine game; tuyệt đối không chạy song song mock và live theo cách nhân đôi donor. Operator chọn mode tường minh và mọi sự kiện ghi `source: mock|tikfinity`.
5. Lưu log rút gọn an toàn (ẩn userId đầy đủ nếu không cần, xóa theo session, không ghi file chứa profile/tôn giáo của viewer); hiển thị last chat/gift event và trạng thái Connected / Disconnected / Connecting / Reconnecting, thời gian nhận event mới nhất, số event/mất kết nối; có bảng kiểm tra /control để đọc gift ID trước khi gán mapping.
6. Xử lý TikTok streak/combo đúng: không coi tất cả update của cùng streak là gift mới. Nếu API gửi repeat-progress và repeatEnd, chốt theo semantics thực tế; cấu hình cap an toàn và test nhiều trường hợp gift 1 xu spam/combo.
7. Cung cấp mock/replay fixtures mô phỏng bọc TikFinity event; test cả chat, gender 1/2, gift cả 6, unknown gifts, disconnect/reconnect, duplicate/repeat, empty/malformed JSON. Không cần đăng nhập hay session token cho mock tests.
8. **Không tự động bấm bắt đầu phát LIVE** và không dùng user token/stream key chưa được cung cấp. Người vận hành tự đăng nhập TikFinity Desktop, LIVE Studio và quyết định phát sóng.
9. Hỗ trợ 2 hình thức capture: TikTok LIVE Studio Window Capture/browser link và OBS Browser Source/Window Capture. Hướng dẫn rõ URL / và /control, kích thước dọc 1080×1920, audio capture, audio-unlock, camera không bị crop, kiểm tra âm không bị phát trùng nếu đồng thời mở browser + OBS.
10. Nếu user đã có tiktok-live-connector ở dự án khác, có thể tạo adapter thứ hai theo abstraction nhưng **không tự thay thế TikFinity** hoặc sửa kết nối game khác. Mỗi adapter chỉ một nguồn event active.

## H. BẢNG /CONTROL PHẢI CÓ
- Source: Mock / TikFinity Live.
- Connection: status + Connect/Disconnect + endpoint loopback read-only/chỉnh theo xác nhận.
- Gift mapping table: gift ID platform, gift name, coin value thực tế, target game giftKey; cảnh báo hai mốc 5 xu phải có **hai ID khác nhau**.
- Live audio: EN / VI / IT, voice picker, test voice, mức volume master/music/ambience/SFX/voice, mute, toggle banner.
- Buttons: Test one AMEN, choose 1 male/2 female, test each of six gifts, burst 50 AMEN + 5 gifts, sound test, reset.
- Live view / không có debug buttons. Gift mapping, âm lượng và lựa chọn ngôn ngữ cần thay đổi được ngay khi đang test mà không crash hoặc reset mọi viewer.

## I. KIỂM THỬ BẮT BUỘC
1. `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser` (khi khả dụng).
2. Phát nhạc nền tối thiểu 2 vòng loop, không pause/click/nhiều nguồn đè; tắt/bật music/ambience/SFX riêng, mute master; voice ducking và restore.
3. Test EN/VI/IT cho ít nhất các sự kiện 1/5/5/10/100/500; đúng chữ banner và đúng locale TTS. Khi voice thiếu, báo rõ fallback, không đọc sai ngôn ngữ.
4. Test lần lượt 20/50 AMEN vẫn ở hàng chờ, 1/2 đổi đúng nam/nữ, chỉ những viewer gửi gift mới vào lễ đường. Test 50 AMEN + 5 gift = 45 waiting, 5 inside (không tính NPC nếu chưa TTL).
5. Test 100 AMEN + 20 gifts, 2x gift 5 xu không nhầm, quà khi full ghế, camera hồi overview và âm thanh không clip/noise/lag.
6. Test TikFinity adapter bằng replay messages theo tài liệu; kết nối thực ws://127.0.0.1:21213/ nếu app TikFinity có trên máy chạy Codex. Nếu không có app/live session, **KHÔNG được tuyên bố đã kết nối LIVE thật thành công**, chỉ ghi mock/replay đạt và chờ người vận hành test.
7. Browser screenshot 9:16: waiting area, giọng EN/VI/IT banner, 100 xu, 500 xu và overlay 50 attendees; chụp nếu có browser automation.
8. Nếu có thể ghi đoạn local OBS/LIVE Studio preview với audio, yêu cầu xác minh âm không bị mute/duplicate, không blur; nếu không thể, cung cấp checklist cho người vận hành.

## J. BÀN GIAO BẮT BUỘC (TIẾNG VIỆT)
- Mã nguồn chạy được, không chỉ code giả hoặc văn bản.
- docs/CHANGELOG_V1_5.md, docs/AUDIO_VOICES_AND_LICENSES.md, docs/TIKFINITY_LIVE_SETUP_VI.md (hướng dẫn TikFinity + LIVE Studio + OBS + audio capture + mapping quà), thay đổi README.
- Báo chính xác: giọng nào có sẵn trong môi trường thử, giọng nào chưa; nhạc là original synthesis, bản thu hay asset có license; TikFinity live test thật hay chỉ test giả lập.
- Danh sách file sửa, commit/PR, script chạy, kết quả test, ảnh preview nếu có.
- Ưu tiên làm tuần tự để giữ build xanh: (1) audio bus/music; (2) EN/VI/IT voices+banner; (3) SFX timeline; (4) adapter TikFinity; (5) đồ họa/FX hoàn thiện; (6) test + docs. Nhưng kết quả giao phải bao trùm tất cả mục tiêu trên.

## K. LỆNH NGẮN TÓM TẮT
Hãy THỰC HIỆN trọn vẹn Task #07, tập trung âm thanh 3 ngôn ngữ (English, Vietnamese, Italian), voice/banner, nhạc nền nhà thờ có bản quyền hợp lệ, SFX tự nhiên, nâng hình ảnh 2,5D, và TikFinity Event API `ws://127.0.0.1:21213/` để test LIVE. Bảo toàn AMEN chỉ vào hàng chờ / comment 1 nam 2 nữ / gift mới vào lễ đường / sáu giftKey. Không nói đã LIVE thật nếu mới test mock. Build, test, ghi báo cáo bằng tiếng Việt.
