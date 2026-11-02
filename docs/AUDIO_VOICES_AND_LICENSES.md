# Audio, voice và giấy phép v1.6

## Nhạc và SFX

Âm thanh từ `apps/client/src/audio/runtime.ts` là sáng tác tổng hợp gốc bằng Web Audio: organ harmonics, piano arpeggio hòa âm bốn hợp âm/48 giây, room tone, impulse/reverb, bước chân biến thể, đặt nến/hoa, chuông partials và choir dạng additive vowel. Không tải nhạc, ca khúc thương mại hoặc bản thu giáo sĩ. Choir là synthesis, không phải người thật hát. Có limiter, envelope và giới hạn 24 nguồn âm ngắn; bốn nguồn nền cố định. Dự án cho phép sử dụng phần synthesis nguyên tác này trong bản chạy và nội dung LIVE của Chapel of Hope.

Đầu ra Browser Speech không thể route qua AudioContext limiter: provider điều khiển volume theo Voice×Master; duck chỉ áp dụng Music/Ambient. RecordedClipProvider dùng HTMLAudio và cùng mức volume logic. Operator phải kiểm tra mixer/capture thực, không dựa vào RMS của WebAudio để kết luận đã có giọng nói trong output.

## Ba ngôn ngữ

36 câu, hai câu cho mỗi giftKey/locale, trong `voice/lines.ts`; mỗi loại quà luân phiên hai biến thể, seed mặc định 0, không lặp cùng câu liên tục. Sáu câu chuẩn mỗi ngôn ngữ được giữ nguyên văn Task #08. Bảng đầy đủ: `VOICE_LINES_EN_VI_IT.md`.

`BrowserSpeechProvider` lấy giọng thực từ `speechSynthesis.getVoices()` và `voiceschanged`, lọc đúng en/vi/it; selector hiển thị name/lang/voiceURI. Không có giọng phù hợp thì không đọc, giữ subtitle. Không có Azure, dịch vụ trả phí, API key hoặc giọng mô phỏng giáo sĩ/người nổi tiếng. Giọng Windows/browser có điều kiện sử dụng riêng của nhà cung cấp; dự án không đóng gói binary/recording giọng đó hoặc cam kết mọi giọng được phép phát lại thương mại. Operator chọn giọng được phép cho mục đích của mình.

Môi trường Chromium Linux phải ghi danh sách giọng thực trong `docs/screenshots/live-v16/results.json`; test với speech API giả chỉ xác minh chọn locale/queue/ducking, không chứng minh phát âm tự nhiên. Chất lượng nghe trên Windows chưa được xác nhận.

## RecordedClipProvider (operator cung cấp bản thu có quyền)

Không có bản thu lời nói bên thứ ba được đóng gói. Có thể thêm các file wav/mp3/ogg vào `apps/client/public/voice/` và khai báo `manifest.json`, ví dụ:

```json
{"vi/candle_1-0":"/voice/vi/candle_1-0.wav","vi/candle_1-1":"/voice/vi/candle_1-1.wav"}
```

Mỗi key là `locale/giftKey-variant` với variant 0 hoặc 1. File phải đọc **đúng câu** trong bảng lời chúc, ngắn hơn 10 giây, có quyền phát LIVE; recorded provider không nối nickname. Điền đủ 12 file/locale trước khi chọn Recorded. Build lại (`npm run build:windows`) hoặc chép file/manifest tương ứng vào `apps/client/dist/voice/` của bản đã đóng gói. Chỉ chấp nhận đường dẫn local `/voice/...`; không phát URL bên ngoài. Nếu file/voice thiếu hoặc lỗi, game tiếp tục bằng phụ đề và báo trạng thái.

Queue voice tối đa bốn job pending, một đang đọc, ưu tiên 500/100 có giới hạn; bỏ/coalesce speech nhỏ khi quá tải nhưng không bỏ gift engine. Speech timeout 10 giây; không kéo camera vô hạn. Mute/stop/unmount dọn timer và hạ duck. Banner giữ riêng text/locale đã chốt cho event, đổi locale trong Control chỉ áp dụng event sau.
