# Chapel of Hope LIVE v1.2 — Visual Production Edition

## Nền tảng và phạm vi

Phát triển trên mã v1.1 hoàn chỉnh và đã lấy commit tài liệu mới nhất của nhánh `feat/chapel-live-v1-1` (`b3d1e0a`). Nhánh v1.2 riêng; không reset hoặc ghi đè main/v1.1. Không sửa hợp đồng AMEN, gift registry, seat allocator, TTL, queue, API hay tích hợp TikTok.

## Những phần đã làm bằng mã nguồn

- Tách cảnh thành `CathedralArchitecture`, `StainedGlass`, `Vault`, `Pews`, `Altar`, `CandleStation`, `FlowerOffering`, `ChapelLighting`, `ChapelFX`, `CameraDirector`, `AttendeeVisual` và `AttendeeLOD`.
- Mái vòm khép kín theo đường cong Gothic, cột/nhịp vòm hiện hữu, đá/gỗ có hoa văn shader object-space. Thêm bục đọc sách và lan can hai bên cung thánh, giữ điểm cầu nguyện trước bàn thờ.
- Giá nến riêng có khung kim loại, tám tầng, thân sáp/tim nến, 18 lửa nền và vị trí cho quà nến. Lửa, quầng sáng và khói nhẹ dùng instancing; một point light cho cả giá, không nhân đèn theo số nến. Khử culling sai ở các instance động.
- Khu hoa có ba bình, hoa trắng/hồng với nhiều cánh, thân và lá; baseline 12 bông, thêm tối đa 48 bông từ quà hoa. Quà hoa có đạo cụ cầm tay và nhân vật trình diễn tại khu dâng hoa.
- Thân và đầu fallback dùng lưới loft có đường nét thay cho thân hình cầu; thêm chi tiết mắt/tai, tóc và trang phục. Giữ chuyển pose nội suy, cách chọn ngoại hình theo session ID và vai trò NPC riêng. Sửa hướng normal lưới để tránh mặt lưới lộn vào trong.
- Pipeline GLB cho nhân vật focus có clone skeleton, clip mapping, crossfade và fallback cục bộ khi tải lỗi. Không tải model không rõ giấy phép.
- Giữ sáu gift key. Nến/hoa tồn tại trong cảnh; prayer/bell giữ hành động cũ; 100 xu có dolly đến khu cầu nguyện, ánh sáng ấm và chữ “Special Prayer”; 500 xu có chuông, cầu nguyện tập thể, ánh nến tăng từ từ và số cánh hoa nhỏ có giới hạn. Khi giá nến đầy, hiệu ứng thắp lại luân phiên một vị trí có giới hạn theo event ID; hoa cuối cùng nở lại khi khu hoa đầy. Exposure cố định ACES/sRGB; không nhấp nháy exposure theo gift.
- Camera nến/hoa gần hơn; thu gọn overlay; bỏ label nổi trên bàn thờ trong cảnh 100/500, vẫn có tên tại toast/banner. Không thêm nút debug lên `/`.

## Phần chưa đạt — không được xem là đã hoàn tất photoreal

**Nhân vật nam/nữ chân thực chất lượng cao chưa đạt.** Chưa có asset GLB hợp pháp phù hợp để tích hợp đại trà. Người hiện tại vẫn là fallback procedural, chưa có mô phỏng vải, da/tóc PBR sản xuất hoặc animation capture/foot IK. Chuyển hướng/quỳ ở FPS thấp có thể còn thiếu tự nhiên. Không gọi đây là bản người photoreal hay bản đã đủ điều kiện phát LIVE thực tế.

Bộ clip GLB sản xuất và tính tương thích skeleton chưa được thử với asset thực. Màu kính/shafts là xấp xỉ shader/geometry, không phải global illumination hoặc volumetric ray tracing. Mục tiêu 30 FPS trên máy LIVE có GPU thật chưa được xác nhận; kết quả software GPU trong cloud không đủ để chứng nhận LIVE-ready.

## Kiểm thử và ảnh preview

Các lệnh cần chạy: `npm install`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`, `node --import tsx scripts/visual-v12.ts`.

Script visual chạy server thật, render bằng Chromium và xuất đúng khung 540×960 (9:16), Balanced. Đo FPS lúc thời gian chạy bình thường cho 0/20/50/100 người. Khi chụp gift, chỉ tạm dừng đồng hồ snapshot tại 45% thời lượng hiệu ứng để camera ổn định và ảnh tái lập được; không sửa ảnh, không ghép hình. Đồng hồ vào ghế được đẩy trước 120 giây để chụp trạng thái đã đông người; kiểm thử đường đi vẫn chạy riêng.

Ảnh và JSON số đo được lưu trong `docs/screenshots/v1.2/`; bản tạo lại nằm trong `artifacts/v1.2/`. Kết quả xác nhận:

- `npm install`, `npm run typecheck`, `npm run build`: đạt; build còn hai cảnh báo chú thích từ Zod upstream, không có lỗi build.
- `npm test`: **17 đạt, 0 lỗi, 0 bỏ qua**; gồm stress 100 AMEN + 30 quà, 20/50/100 người + 20 quà, kiểm tra ghế/overflow/TTL/dedupe/queue và normals lưới mới.
- `npm run test:browser`: đạt cả sáu quà, AMEN không clone, timeout focus, reconnect, quà khi đầy, điều khiển cross-tab, reset. Telemetry của tab nền trong bài nhiều tab có lúc làm tròn về 0 FPS; không dùng số đó thay số đo foreground.
- `npm run test:visual`: đạt, không có lỗi trang/console; số đo foreground ở 540×960 Balanced: 0 người 3,7 FPS; 20 người 3,6 FPS; 50 người 3,7 FPS; 100 người 3,4 FPS.
- Máy cloud Linux x64, 5 CPU được cấp, AMD EPYC 9V74; Chromium dùng SwiftShader. Đây là software renderer, không phải GPU máy LIVE.

Ảnh bàn giao: [50 người](screenshots/v1.2/A-50-attendees.png), [nến](screenshots/v1.2/B-candles.png), [hoa](screenshots/v1.2/B2-flowers.png), [100 xu](screenshots/v1.2/C-altar-100.png), [500 xu](screenshots/v1.2/D-ceremony-500.png), [JSON số đo](screenshots/v1.2/results.json).

## Mở để kiểm thử LIVE

Node 24 LTS. Tại thư mục repository: `npm ci`, `npm run dev`. Mở `http://127.0.0.1:5173/` và `/control`. Với build sản xuất: `npm run build`, `npm start`, dùng cổng 3001. Trên Windows PowerShell chạy cùng các lệnh này; nếu cần đổi cổng production, đặt `$env:PORT=3100` trước `npm start`.

Trong LIVE Studio/OBS dùng browser capture khung 1080×1920; chọn Balanced ban đầu rồi kiểm tra FPS thực. Có Low/Balanced/High tại `/control`. Mute mặc định; mỗi tab phát âm thanh cần một thao tác người dùng để unlock. Đây là không gian ảo, mock events, chưa nối TikTok thật.
