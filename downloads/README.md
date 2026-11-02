# HTML offline v1.4 — Task #06

[Tải ZIP v1.4](https://github.com/npstorebinhduong-dev/chapel-hope-live/blob/feat/gift-entry-queue/downloads/Chapel-of-Hope-HTML-Preview.zip?raw=true)

Giải nén và mở `index.html` bằng Chrome/Edge. Không cần Node, máy chủ hoặc Internet. Mặc định 50 người **ở hàng chờ**, không tự vào ghế. Chọn ID trong bảng, dùng AMEN / 1 Male / 2 Female / gift; chỉ đúng người tặng mới được vào.

Một tab là một phiên độc lập. Khung LIVE sạch mở tab mới không chia sẻ điều khiển. Bật âm thanh bằng Enable audio và bỏ Mute sound; ba mức âm riêng có thể kéo về 0. Tải lại sẽ khởi tạo lại 50 người chờ.

ZIP gồm HTML tự chứa, hướng dẫn, báo cáo, nguồn asset, preview và kết quả test. Trình duyệt cloud chặn `file://`, nên bài kiểm tra chạy HTML local được intercept không backend/tài nguyên ngoài; chi tiết ghi trong `test-results.json`. Bản server tiêu chuẩn vẫn chạy bằng `npm ci`, `npm run dev`.
