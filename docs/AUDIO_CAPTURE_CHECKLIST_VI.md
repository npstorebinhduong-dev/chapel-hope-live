# Kiểm chứng âm thanh đầu ra — chưa xác minh trên Windows LIVE Studio

- [ ] Chỉ một tab/source phát được capture. Nhấp LIVE để mở AudioContext; bỏ Mute sound.
- [ ] Master, Music, Ambient, SFX, Voice có mức phù hợp. Kéo mỗi lớp về 0 phải tắt riêng lớp đó.
- [ ] Chạy nhạc ít nhất 2 vòng 48 giây; nghe đường nối không click/pause. Nhạc là synthesis nguyên tác, chưa phải bản thu thật.
- [ ] Voice READY của locale đã chọn trên đúng tab/source capture; kiểm tra Anh, Việt, Ý riêng.
- [ ] 100/500: tên và câu banner đúng locale; nhạc giảm khoảng 10 dB khi bắt đầu đọc, phục hồi mượt khi kết thúc/lỗi/timeout.
- [ ] Một lời mỗi lần; nickname mặc định không đọc. Không dùng voice tiếng khác nếu thiếu giọng.
- [ ] Thử nến, hoa, quỳ, chuông, 100 và 500; có signature riêng, không nổ âm khi dồn quà.
- [ ] Ghi 20–30 giây trong LIVE Studio/OBS, **nghe lại file output**, không chỉ nghe tab browser.
- [ ] Có music + SFX + voice, không mute hoặc echo từ nguồn Desktop Audio thứ hai.
- [ ] Browser Source không phát TTS: thử Window Capture + Desktop Audio, hoặc local recorded clips có quyền. Không khẳng định speechSynthesis được mọi source hỗ trợ.
- [ ] Mute master dừng cả speech; tắt Voice không ảnh hưởng gameplay/FX/banner.

Kết quả đo AudioContext trong cloud chỉ xác nhận graph/limiter/ducking. Native TTS, loa Windows, mixer LIVE Studio và file capture vẫn phải kiểm chứng trên máy phát. Không có bản ghi LIVE output được dựng giả trong repository.
