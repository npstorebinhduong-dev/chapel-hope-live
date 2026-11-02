# Ảnh và kết quả kiểm thử v1.7

Ảnh LIVE chụp từ Chromium với viewport **1080×1920**. Chất lượng Balanced tự giới hạn canvas 800/640 pixel ngang; ảnh xuất vẫn 1080×1920. Chọn High trong Control nếu máy phát đủ mạnh và muốn canvas 1080 pixel ngang.

| Cảnh | Ảnh |
|---|---|
| 20 người chờ | [Mở ảnh](crowd-20.png) |
| 50 người chờ | [Mở ảnh](crowd-50.png) |
| 100 người chờ | [Mở ảnh](crowd-100.png) |
| 1.000 người chờ | [Mở ảnh](crowd-1000.png) |
| Rời đám đông | [Mở ảnh](leaving-crowd.png) |
| Nến | [Mở ảnh](candle_1.png) |
| Quỳ cầu nguyện | [Mở ảnh](prayer_5.png) |
| Hoa | [Mở ảnh](rose_5.png) |
| Chuông | [Mở ảnh](bell_10.png) |
| Focus 100 xu | [Mở ảnh](altar_100.png) |
| Focus 500 xu | [Mở ảnh](ceremony_500.png) |
| Idle có bồ câu | [Mở ảnh](idle-doves.png) |
| 50 AMEN + 5 gift | [Mở ảnh](50-amen-5-gifts.png) |
| Ghế đầy + đại lễ | [Mở ảnh](full-seats-ceremony.png) |

## Kết quả thực

- [36/36 unit/integration tests](unit-tests.txt).
- [Test scene/camera/đám đông](results.json): cả sáu quà focus đúng người, về overview, 30/30 quà có focus, 45 chờ / 5 trong / 5 ngồi. Camera tự nhả khi ngắt server; không có lỗi JavaScript.
- Idle dùng vòng kiểm tra ít nhất 60 giây thời gian thực; `idleSeconds` trong JSON là thời điểm **mẫu cuối** (58,165 giây), sau đó chờ thêm 2 giây mới kết thúc vòng. 29 mẫu pixel khác nhau và có bồ câu xuất hiện. Một hành trình quà hoàn chỉnh đo 25,028 giây, vận tốc gốc lớn nhất 2,533 đơn vị/giây trong mẫu kiểm tra. Phần test sáu quà/30 quà tua đồng hồ giữa các giai đoạn; không gọi đó là 30 quà phát hết trong thời gian thực.
- [Hồi quy Control/HTTP/WS và audio](queue-regression.json): 50+5, 100+20, ghế đầy, sáu key, chu kỳ nhạc và mute.
- [HTML offline](html-preview.json): AMEN, 171 người sau các đợt cộng, sáu quà chạy hết, candle/rose tồn tại, camera về, quality/reset/reload; không backend, HTTP/WS hoặc storage. Chính sách trình duyệt cloud chặn file://; đã thử tài liệu HTML tự chứa qua route localhost nội bộ, không dùng server. Cần nhấp đúp file kiểm tra lại trên Windows.
- [18 banner và provider/audio regression](production-regression.json): 18/18 EN/VI/IT, tuần tự voice/ducking, hai chu kỳ nhạc thật. Linux không có native voices; provider-contract dùng fixture giả, không xác nhận giọng nói nghe được trên Windows. [100 xu tiếng Việt](vi-altar_100.png) · [500 xu tiếng Ý](it-ceremony_500.png) · [Control](control.png).
- [Gói ZIP giải nén chạy được](package-check.json): bundle chạy trong thư mục sạch không node_modules, LIVE/Control/health OK, 200 AMEN vẫn ở hàng chờ, dừng bằng nonce thoát mã 0. Final HTML smoke xác nhận nội dung Control mới.
- [Cú pháp launcher](windows-parser.json): parser PowerShell Linux, không phải chạy Windows.

### Đo FPS ngắn trong cloud

| Người chờ | FPS vẽ trung bình / 2,5 giây | Tổng actor có cả NPC | Canvas |
|---|---:|---:|---|
| 20 | 60.4 | 36 | 800×1422 |
| 50 | 55.2 | 66 | 800×1422 |
| 100 | 59.2 | 116 | 640×1138 |
| 1000 | 30.4 | 1016 | 640×1138 |

Mức 1.000 người dùng lớp đám đông xa 5 Hz và sprite đơn giản; camera/người đang thực hiện quà vẫn cập nhật mỗi frame. Lần đo riêng sau khi ổn định đạt khoảng 47–51 FPS, còn mẫu trong bài đầy đủ ghi 30,4 FPS; đây là số đo Linux cloud, **không đảm bảo cùng FPS trên máy Windows khác**. Không có trần AMEN cố định nhưng tài nguyên không vô hạn.

Nhân vật vẫn là sprite 2,5D, chưa có atlas quay nhiều hướng/mocap. Chưa xác minh Windows launcher, giọng Windows và phiên TikTok/OBS thật; chưa LIVE VERIFIED.
