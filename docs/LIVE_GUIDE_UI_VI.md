# Bảng hướng dẫn LIVE v1.9

`LiveGuidePanel` và `HeartsProgress` dùng locale phát, độc lập `adminLocales/vi`. Tấm kính mờ nâu ôliu, viền đồng, chữ kem; không dùng tên quà TikTok chưa xác minh. Sáu icon SVG do dự án tạo: nến, chắp tay, hoa, chuông, bàn thờ, đại lễ.

| Nhóm      | Anh                                 | Việt                           | Ý                                         |
| --------- | ----------------------------------- | ------------------------------ | ----------------------------------------- |
| AMEN      | Type AMEN to join the waiting crowd | Bình luận AMEN để vào hàng chờ | Scrivi AMEN per unirti alla fila d’attesa |
| Giới tính | 1 = Male · 2 = Female               | 1 = Nam · 2 = Nữ               | 1 = Uomo · 2 = Donna                      |
| Tim       | Heart of Hope                       | Trái tim hy vọng               | Cuore di speranza                         |
| Chia sẻ   | Share this LIVE                     | Chia sẻ buổi LIVE này          | Condividi questa LIVE                     |

Ba nhóm tham gia / tương tác / sáu quà luân phiên mặc định 10 giây, điều chỉnh 8–12 giây. Dòng AMEN và 1/2 luôn giữ trên bảng. Nhóm quà hiển thị **mốc hoạt động trong game**, hai mốc 5 xu độc lập. Tên/giá quà thật cần operator xác minh trên tài khoản, chưa được thay thế bằng dữ liệu phỏng đoán.

Khung chuẩn 1080×1920, bảng nằm x=7–87%, y bắt đầu 10,2%, dưới tiêu đề và trên vùng kính tròn/bàn thờ. Thu nhỏ khi camera tập trung quà. Khi có phụ đề, rút phần hướng dẫn luân phiên để dành dải phụ đề ở y=22%; không đặt phụ đề lên cha xứ/người tặng. Vùng chờ phía dưới vẫn nhìn thấy; `+N` nói rõ phần không vẽ. Chừa lề phải cho nút của nền tảng. Overlay TikTok thay đổi theo thiết bị: phải ghi thử và kiểm tra bằng điện thoại trước khi phát.

Tim, chia sẻ và số người lấy từ snapshot engine. Giả lập có nhãn GIẢ LẬP/DEMO; TikFinity chưa nhận sự kiện hiện trạng thái chờ. Đạt mốc tim giữ thanh đầy trong 7 giây phản hồi rồi tiếp tục chu kỳ; tổng tim không đặt lại. Tim không cấp ghế.

Bồ câu sự kiện dùng cùng renderer vector với nền nhưng được kích hoạt bằng reaction ID: một chia sẻ → một chim, đủ mốc → tối đa năm chim (ba ở mức thấp). Bay vùng hậu cảnh phía trên, không xuyên bàn thờ. Spam gộp hiệu ứng, giữ nguyên tổng số hợp lệ. Hiệu ứng chờ quà kết thúc; không chiếm camera quà. Chuyển động nền có thể tắt mà không ảnh hưởng chim từ chia sẻ thật.

Khi quà 100/500 focus, tiêu đề tạm ẩn; hướng dẫn rút lên dải 1,5–9%, phụ đề ở 9,5–15%. Zoom toàn cảnh giới hạn 16%/18% để kính tròn vẫn nằm dưới dải HUD. Camera dùng thời gian thực khi tab nền bị giảm FPS, tránh giữ zoom sau khi hoạt cảnh đã kết thúc.
