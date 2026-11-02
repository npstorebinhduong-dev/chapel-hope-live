# Tim, chia sẻ và lời mời – triển khai #10 trong v1.9

Adapter TikFinity dùng một WebSocket local hiện có, nhận `chat`, `gift`, `like`, `share`, `follow`. Chế độ Giả lập không đọc socket thật. Không tự tăng số tim khi idle. Lưu trong RAM theo phiên, reset đổi nguồn; không lưu lịch sử người xem.

LIKE: `likeCount`/`count` nguyên dương kèm mã sự kiện (`msgId`, `msg_id`, `eventId`, wrapper ID hoặc `createTime`) là batch delta. `totalLikeCount`/`totalLikes` là số tích lũy phòng: gói đầu ghi baseline, chỉ cộng chênh lệch. Gói cùng mã hoặc tổng không đổi bỏ qua. Tổng giảm thiết lập baseline chu kỳ mới, không cộng số âm và cảnh báo trong nhật ký. Delta >10000 hoặc số thiếu/sai định dạng không được đoán. Dữ liệu đến sai thứ tự không có timestamp đáng tin có thể trông như reset: phải đối chiếu phiên TikFinity thật, theo dõi cảnh báo. Không suy ra số người xem từ tim.

SHARE/FOLLOW: cần ID người gửi ổn định; ưu tiên mã sự kiện. Không có mã thì chống trùng trong 10 giây theo người/loại; đây là giới hạn có thể gộp hai chia sẻ thật quá gần nhau, ghi rõ thay vì đoán số lượng. Không chấp nhận count >1 trong payload share thật chưa xác minh. Mock hỗ trợ batch phục vụ stress. ID được băm cho phiên, không hiển thị raw ID trong nhật ký.

1000 tim mặc định → ánh sáng kính màu và vùng nến + chuông 7 giây, tối thiểu 20 giây giữa phản hồi tim. Các mốc vẫn được đếm khi đang diễn quà; phản hồi gộp tối đa bốn loại chờ. Một chia sẻ → một chim, mốc 10 → đàn tối đa năm, Low ba. Không tạo người/ghế từ like/share/follow.

Sau khoảng 5 phút, nếu có tương tác trong 5 phút gần nhất, NPC cùng cầu nguyện 7 giây. Chờ quà kết thúc, không đưa người AMEN vào ghế. CTA sau 60 giây ít tương tác, lời share chỉ sau 120 giây không share; nghỉ tối thiểu 90 giây, tối đa 3/10 phút; chờ nguồn âm sẵn sàng, không có quà/voice. Nút thủ công bỏ qua điều kiện inactivity nhưng không bỏ giới hạn tần suất/nguồn/quà. Tắt lời mời hoặc bật yên tĩnh dừng CTA. Nguồn TikFinity mất kết nối không phát CTA mới.

A/B chọn bộ câu; log tối đa 20 lần với snapshot trước và delta sau 60 giây. Không đo retention, không suy luận tôn giáo, không coi tương quan là hiệu quả đã chứng minh.

Kiểm thử: `npm test` có replay batch/cumulative/reset/dedupe, mốc tim/chia sẻ, CTA, giới hạn avatar và 1000 tim + 50 chia sẻ + 100 AMEN + 30 quà. `npm run test:production` chạy UI/canvas thật, `npm run test:soak` chạy 30 phút thời gian thực. Xem báo cáo v1.9 để phân biệt kiểm thử giả lập và những phần còn chờ Windows/LIVE thật.
