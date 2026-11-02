# Âm thanh và lời đọc v1.9

Nhạc/SFX là **WebAudio tổng hợp nguyên tác**, không phải bản thu organ, tiếng bước chân hoặc hợp xướng thật. Không nhập nhạc thương mại. Ba đoạn Bình an/Hy vọng/Chiều tĩnh lặng mỗi đoạn 48 giây, tám hợp âm và 32 nốt piano; playlist 144 giây. Chọn bài áp dụng ở ranh giới ô nhịp 6 giây, hai nhóm organ hòa chuyển 1,2 giây, piano có cường độ theo phách, reverb tổng hợp và compressor đầu ra. Không có bản thu giọng người đi kèm.

Năm bus: tổng / nhạc / môi trường / hiệu ứng / giọng. Các đồng hồ nhạc/môi trường/hiệu ứng và tổng đo RMS WebAudio. Giọng hệ điều hành nằm ngoài graph nên đồng hồ giọng chỉ báo đang đọc; không tuyên bố đo được tiếng TTS trong capture. Bản thu dùng HTMLAudio, âm lượng tính theo Master×Voice.

Mặc định nhạc 22%, môi trường 14%, SFX 45%, giọng 85%. Khi giọng bắt đầu, nhạc giảm hệ số 0,316 (~10 dB), tiếp cận mức mới khoảng 300 ms và phục hồi khoảng 1,2 giây. Hai giọng nối nhau không nhả duck ở giữa. Chỉ một voice active, hàng chờ tối đa bốn; ưu tiên 500/100 rồi quà nhỏ, cảm ơn chung, CTA, có fairness và timeout 10 giây. Quà đến ngắt CTA; không hủy hoạt cảnh quà khi gộp lời đọc nhỏ.

54 lời chúc: ba câu × sáu quà × ba locale. 36 câu cảm ơn quà: hai câu × sáu × ba. Có hai lời phản hồi mỗi loại AMEN/tim/share/follow/mốc tim/cộng đồng mỗi locale; bốn CTA mỗi AMEN/tim/share mỗi locale. Chu kỳ mỗi giftKey luân phiên ba lời chúc rồi hai cảm ơn, không bắt buộc đọc cả hai. Tên tài khoản không đọc mặc định; lọc URL/ký tự điều hướng Unicode và tên không phù hợp khi bật đọc tên.

Giọng đúng ngôn ngữ bắt buộc. Hệ thống nghe `voiceschanged`; nếu EN/VI/IT không có giọng tương ứng, giữ phụ đề cùng ngôn ngữ, thông báo thiếu giọng, không lấy giọng Anh đọc Việt. Mở Cài đặt Windows → Thời gian và ngôn ngữ → Giọng nói / gói ngôn ngữ, cài voice được trình duyệt hỗ trợ, mở lại Edge. Chất lượng phụ thuộc voice cài trên máy; kiểm tra bằng tai.

Bản thu hợp pháp tùy chọn đặt tại `apps/client/public/voice/` (development), `apps/client/dist/voice/` (production). `manifest.json` là object khóa → đường dẫn `/voice/...`. Ví dụ `vi/candle_1-0` → `/voice/vi/candle_1-0.wav`. Không gọi API TTS trả phí.

| Nhóm       | Khóa sau locale                                                                 | Chỉ số           |
| ---------- | ------------------------------------------------------------------------------- | ---------------- |
| Lời chúc   | `candle_1`, `prayer_5`, `rose_5`, `bell_10`, `altar_100`, `ceremony_500`        | `-0`, `-1`, `-2` |
| Cảm ơn quà | `thanks-` + giftKey                                                             | `-0`, `-1`       |
| Mời        | `invite-amen`, `invite-like`, `invite-share`                                    | `-0` … `-3`      |
| Phản hồi   | `ack-amen`, `ack-like`, `ack-share`, `ack-follow`, `ack-heart`, `ack-community` | `-0`, `-1`       |

Text chuẩn ở `voice/lines.ts` và `voice/engagementLines.ts`; ghi âm đúng text và quyền phát LIVE. Thiếu clip cụ thể → chỉ phụ đề, không ghép clip khác loại/ngôn ngữ. File example manifest không phải giọng đọc có sẵn.

SFX: đến hàng chờ, bước chân, ghế, đứng/quỳ, nến, hoa, chuông, bồ câu, mốc tim, 100/500. Marker nến/hoa phát sau khi tay bắt đầu nghi thức, không lúc mới nhận quà. Tối đa 24 nguồn ngắn + 7 nguồn nền, các cue lặp có giới hạn nhịp. “Kiểm tra tất cả âm thanh” thử khoảng 23 giây, không cộng quà hay tương tác.

## Thu âm vào OBS / TikTok LIVE Studio

1. Chỉ bật âm ở **một cửa sổ LIVE**. Web Locks ngăn hai tab cùng origin trong một hồ sơ trình duyệt cùng mở engine âm. Khác hồ sơ/trình duyệt/OBS Browser Source không chung khóa: vẫn phải operator chọn một nguồn.
2. Cửa sổ `/` là khung phát, `/control` để quản trị. Window Capture thu hình, thường không tự thu tiếng; thêm Application Audio Capture của Edge hoặc một Desktop Audio phù hợp. Không bật cả hai cho cùng nguồn.
3. Đặt canvas/output 1080×1920, tỉ lệ 9:16, tránh kéo giãn. Giữ cửa sổ LIVE mở và nhìn thấy, không minimize vì trình duyệt có thể giảm FPS. Ghi local 20–30 giây với nhạc, lời chúc và chuông 500; nghe tai nghe và xem meter ứng dụng phát, không chỉ meter game.
4. Nếu dùng Browser/Link Source, kiểm tra nguồn cho phép tương tác mở âm và thu tiếng riêng; không để cửa sổ trình duyệt thứ hai phát desktop audio trùng.
5. Test thiếu voice, mute từng bus, duck/restore, pause/reload, tiếng không bị clip. Test tone WAV trong bộ kiểm thử chỉ chứng minh HTMLAudio chạy, **không chứng minh bản thu lời chúc hoặc chất lượng giọng**.

Môi trường Linux không xác minh được tiếng loa Windows hay nguồn capture TikTok LIVE Studio. Chỉ ghi LIVE VERIFIED sau kiểm tra bình luận, quà, tim/chia sẻ thật và hình/tiếng trong một phiên LIVE thực tế.
