# Chapel of Hope LIVE — European 2.5D Stage (v1.3.0 / Task #04)

Thánh đường **ảo, hư cấu**, bố cục châu Âu 9:16. Bình luận AMEN tham gia miễn phí; sáu quà mô phỏng tạo hiệu ứng hình ảnh. Không đại diện giáo xứ hay thánh lễ thật; quà không hứa hẹn kết quả tâm linh. Chưa có kết nối TikTok hoặc thanh toán.

Bản này tiếp nối toàn bộ mã v1.2 trên nhánh riêng `feat/chapel-live-2-5d`. Kiến trúc dùng artwork gốc tạo riêng, người và linh mục dùng sprite 2,5D nhiều tư thế; nến, hoa, ánh sáng và chuyển động chạy theo trạng thái phiên. **Không gọi sprite là model người 3D có skeleton.** Mã renderer Three.js cũ vẫn được giữ để tham khảo, nhưng route LIVE mặc định dùng Canvas2D.

## Chạy trên máy cá nhân

Cài Node.js 24 LTS (tối thiểu 22.12) và trình duyệt desktop mới. Tại thư mục dự án:

```sh
npm ci
npm run dev
```

- LIVE: http://127.0.0.1:5173/
- Điều khiển: http://127.0.0.1:5173/control
- Server mock chạy ở 3001; giữ terminal đang chạy. Không cần tài khoản hoặc API key. Sau khi cài dependencies, chạy offline được.

Chạy bản production:

```sh
npm run build
npm start
```

Mở http://127.0.0.1:3001/ và http://127.0.0.1:3001/control. Các lệnh tương tự trong Windows PowerShell/cmd. Dùng browser source/Window Capture khung **1080×1920** trong LIVE Studio/OBS; giữ `/control` ngoài nguồn phát. Chọn Low nếu máy yếu; đo FPS trên chính máy phát. Lần đầu muốn nghe chuông, bỏ mute ở control rồi bấm trong từng tab LIVE để mở quyền âm thanh.

## Tính năng giữ nguyên

- AMEN không phân biệt hoa/thường; gửi lại cùng pseudonym gia hạn chỗ, không nhân bản người. Tên không quyết định ngoại hình.
- Tối đa 100 khách, 64 ghế gồm 16 NPC riêng, 48 ghế khách và 52 chỗ đứng. Linh mục là vai diễn riêng, không được tính thành khách/NPC/quà.
- Chuyển động tiếp tục dùng đường đi và vị trí từ shared engine. Đến/rời theo làn; quà tại cung thánh dùng nhân vật trình diễn khi người gửi còn đang vào hoặc không có ghế.
- Hàng đợi tối đa 128 quà chờ, dedup, thứ tự ưu tiên có chống bỏ đói; nhận hết quà đã chấp nhận. Queue đầy trả 429 để gửi lại, không im lặng bỏ sự kiện.
- Số nến quà tối đa 64, hoa 48; cộng với đồ trang trí nền. Reset xóa dữ liệu phiên và quà chờ. Dữ liệu chỉ ở RAM, không lưu hồ sơ cá nhân.

| Khóa quà | Xu mô phỏng | Hiển thị |
|---|---:|---|
| `candle_1` | 1 | Thêm nến ở giá trái, lửa/glow/khói nhẹ |
| `prayer_5` | 5 | Người gửi chuyển sang quỳ |
| `rose_5` | 5 | Thêm hoa trắng, nhân vật ở khu dâng hoa |
| `bell_10` | 10 | Chuông tổng hợp, gợn sáng nhỏ và cộng đoàn cúi nhẹ |
| `altar_100` | 100 | Cầu nguyện trước bàn thờ, ánh vàng, focus tối đa 1,8% |
| `ceremony_500` | 500 | Cộng đoàn quỳ, chủ sự giơ tay nhẹ, tia sáng và bụi vàng tiết chế |

Camera giữ trọn sân khấu, tự hết focus theo thời hạn kể cả luồng snapshot ngừng cập nhật. Giao diện tiếng Anh được tách chuỗi để có thể dịch sau. Low/Balanced/High thay đổi độ phân giải lớp động, texture LOD và số hạt; không giảm số người trong engine.

## Kiểm thử và preview

```sh
npm test
npm run build
npm run test:browser
npm run test:visual
```

Test trình duyệt cần Chromium tại `/usr/bin/chromium` hoặc biến `CHROMIUM_PATH` trỏ đến file thực thi trình duyệt. `test:browser` dùng cổng 3101; `test:visual` dùng 3114. Chạy lần lượt khi cần đo FPS, tránh hai trình duyệt tranh CPU.

- [Báo cáo bàn giao và giới hạn](docs/DELIVERY_2_5D_VI.md)
- [Ảnh preview 9:16 và số đo](docs/screenshots/stage/README.md)
- [Nguồn và quyền sử dụng asset](docs/ASSET_LICENSES.md)
- [Yêu cầu Task #04](docs/CODEX_PROMPT_04_2_5D_VI.md)
- [Tài liệu v1.2 lưu trữ, gồm chi tiết API](docs/ARCHIVE_README_V1_2.md)

## Cấu trúc

`StageChapel.tsx` dựng lớp động; `scene/stageLayout.ts` định nghĩa phép chiếu, vị trí ghế và giới hạn camera; `public/art` chứa artwork nội bộ. `App.tsx` phân tách hai route. `packages/shared` giữ hợp đồng, engine và adapter; `apps/server` giữ Express/WebSocket. Không sửa logic gameplay trong lần nâng cấp này.

Các endpoint production `/api/health`, `/api/state`, `/api/mock/comment`, `/api/mock/gift`, `/api/mock/spam-amen`, `/api/mock/control` và WebSocket `/ws` vẫn hoạt động. Chạy local có người điều khiển; đây chưa phải dịch vụ đa người dùng công khai hoặc hệ thống xử lý thanh toán bền vững.

## Giới hạn hình ảnh cần biết

Kiến trúc, tượng, vật liệu và phần đồ trang trí nền được vẽ sẵn trong một góc nhìn. Sprite có bốn nhân vật gốc nam/nữ, biến thể màu áo/chiều cao, các tư thế và dải bước đi; vẫn lặp lại nhận diện khi đông người. Chuyển tư thế bằng crossfade và nội suy; chưa có motion capture, xoay đa góc hay biến dạng skeleton. Đi ngang vào ghế vẫn có thể trông như sprite trượt. Mép che người bởi ghế được hiệu chỉnh theo phông, chưa phải depth map hình học hoàn chỉnh. Cần kiểm tra video thực trên máy phát trước khi xác nhận LIVE-ready.

## Bản HTML mở trực tiếp, không cần Node trên máy người xem

Chạy `npm run build:preview` để xuất `artifacts/html-preview/index.html`. Đây là **một file tự chứa** JavaScript, CSS và cả ba artwork; có thể giải nén ZIP rồi mở `index.html` bằng Chrome/Edge. Không cần server hoặc Internet. Mặc định có 50 khách mẫu và bảng thử AMEN/quà ngay cạnh cảnh. Mỗi trang là một phiên độc lập, tải lại khởi tạo lại dữ liệu; khung LIVE sạch mở ở tab khác không chia sẻ điều khiển.

Bản export dùng cùng renderer và `ChapelEngine`; build chỉ thay transport HTTP/WS bằng store trong bộ nhớ trình duyệt. Ứng dụng production vẫn dùng server/WebSocket như trước. `npm run test:preview` kiểm tra tài liệu tự chứa, AMEN/dedup, 20/50/100 người, sáu quà, nến/hoa, camera, chất lượng và reset. Nếu chính sách Chromium cloud chặn `file://`, script ghi rõ và kiểm thử nội dung HTML qua tài liệu local được intercept, không backend, không tải tài nguyên ngoài. Không coi fallback đó là chứng minh đã kiểm tra double-click `file://` trên Windows.
