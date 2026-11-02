# Bảng điều hành v1.9

Chạy `START_CHAPEL_LIVE.bat`, mở `http://127.0.0.1:3001/control`. Trang quản trị luôn dùng tiếng Việt; ngôn ngữ trên màn hình phát độc lập. Không thu cửa sổ quản trị vào OBS.

1. **Tổng quan:** số người trong phiên, chờ/vào/ngồi, quà nhận/đã diễn, tim/chia sẻ, lỗi trùng, FPS từ cửa sổ LIVE đang chạy. NPC tách riêng. Tỷ lệ giữ chân và người xem duy nhất không có dữ liệu từ adapter nên hiển thị “Chưa có dữ liệu”. Số theo phút là phút lịch hiện tại chưa hoàn tất, không ngoại suy.
2. **Kết nối LIVE:** chọn Giả lập hoặc TikFinity thực. Đổi nguồn có xác nhận xóa phiên để số giả lập không lẫn vào số LIVE. Nhập `ws://127.0.0.1:21213/`, lưu, kết nối. TikFinity Desktop chạy cùng Windows. Đã kết nối socket khác với đã nhận dữ liệu. Xem trạng thái tim/chia sẻ và nhật ký đã loại ID người xem.
3. **Quà tặng & Hiệu ứng:** nhập sáu ID từ tài khoản/thị trường thật. Hai hoạt động 5 xu cần ID khác nhau. Tên quan sát được chỉ là metadata, phải đối chiếu trong TikFinity. Thử sáu quà và combo chỉ trong Giả lập. ID mã nguồn cố định, không ánh xạ theo số xu.
4. **Âm thanh & Lời chúc:** chọn ngôn ngữ Anh/Việt/Ý, nguồn giọng cài trên máy hoặc bản thu hợp pháp. Thiếu giọng thì chỉ phụ đề và thông báo tiếng Việt. Bỏ “Tắt toàn bộ âm thanh”, bấm vào cửa sổ LIVE để mở âm; nghe thử tại control chỉ khi cửa sổ LIVE chưa giữ quyền phát âm. Có nhạc/giọng/cảm ơn riêng, tốc độ, năm bus, thử toàn bộ cue và dừng khẩn cấp. Nút đọc lại phát lại từ đầu lời vừa ngắt, không giả vờ tiếp tục giữa từ.
5. **Tương tác cộng đồng:** mốc tim 250/500/1000/2000; mốc chia sẻ 5/10/20; bật/tắt ánh sáng, bồ câu, chuyển động nền, cầu nguyện NPC, lời mời và yên tĩnh. Xem trước ba nhóm hướng dẫn; đổi độ rõ/kích thước/chu kỳ. Lời mời thủ công vẫn chịu giới hạn 90 giây và 3/10 phút, chờ quà/giọng kết thúc. Quan sát A/B chỉ là số thay đổi 60 giây sau lời mời, không chứng minh hiệu quả hay quan hệ nhân quả.
6. **Kiểm thử & Cài đặt:** 20/50/100 AMEN, 1 nam/2 nữ, tim/chia sẻ/theo dõi, mô phỏng ít tương tác, tình huống 50+5, đầy ghế, chọn chất lượng, giới hạn avatar, reset phiên hoặc cấu hình.

Cài đặt production được lưu ở `runtime/operator-config.json` bởi server; chỉ cấu hình và mapping, không lưu người xem, nhật ký hay số tương tác. Khởi động lại luôn Giả lập và tắt âm. Chất lượng hình ảnh lưu cục bộ trong trình duyệt. Bản HTML là phiên riêng mỗi tab, không đồng bộ nguồn TikFinity.

Giới hạn render mặc định 1000 người chờ, RAM avatar đầy đủ 5000 (điều chỉnh được). Người vượt mức render hiển thị `+N`, vẫn giữ đúng danh tính phiên và quyền thực hiện quà. Vượt RAM chi tiết chuyển sang bản ghi gọn không chứa đường đi; tối đa 80000 bản ghi gọn dự phòng. Khi đạt trần vật lý này, AMEN mới bị từ chối rõ và tăng bộ đếm, không bịa thêm người. Quà hợp lệ vẫn có dự phòng theo hàng quà tối đa 128 và bên trong 56 chỗ; người tặng ở tầng gọn được tạo lại avatar đúng giới tính. TTL người chờ 10 phút không tương tác. Không có bộ nhớ vô hạn.

**Kiểm tra sẵn sàng LIVE** phân biệt kết nối/âm thanh/giọng tại cửa sổ LIVE với những mục chưa kiểm chứng: Windows, capture, phiên LIVE thật. Không có nút tự bấm GO LIVE.

Đồng hồ âm thanh tại quản trị lấy telemetry từ cửa sổ LIVE khi cửa sổ đó đang phát (cập nhật khoảng mỗi giây). Nghe thử, thử chuỗi SFX, ngắt/đọc lại và dừng khẩn cấp gửi lệnh tới cửa sổ giữ âm; không cần bật thêm âm ở control. Dừng khẩn cấp giải phóng khóa âm. Nếu không có cửa sổ LIVE đang phát, nghe thử tại control cần thao tác mở âm ở đó.
