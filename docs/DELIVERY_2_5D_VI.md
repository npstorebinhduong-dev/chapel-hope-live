# Bàn giao Task #04 — European 2.5D Stage

## Trạng thái

Có mã chạy được và bản build production, phát triển trên `feat/chapel-live-2-5d` từ commit v1.2 `ad10386`. Không ghi đè nhánh v1.1/v1.2 hoặc thay đổi chưa hợp nhất. Version package là **1.3.0**, tên sản phẩm **European 2.5D Stage** để phân biệt với bản Visual Production v1.2.

Đã nâng cấp hình ảnh thực tế và có ảnh chụp trình duyệt. **Đây là bản để kiểm thử LIVE, chưa xác nhận đạt 30 FPS tại 1080×1920 trên máy phát thật, và animation sprite chưa đạt độ tự nhiên của người có rig/motion capture.**

## Đã triển khai

1. Phông thánh đường hư cấu tạo riêng: vòm Gothic, cột/tường đá, gỗ chạm khắc, kính màu, ánh xuyên kính, thánh giá, tượng Đức Mẹ và Thánh Giuse ở hai hốc, bàn thờ/khăn thêu, nhà tạm, bục đọc sách, nến/hoa. Các chi tiết kiến trúc này là artwork trong góc nhìn cố định, không phải geometry mới có thể xoay tự do.
2. Nhân vật chủ sự riêng sau bàn thờ; tư thế đứng, đọc sách, cúi đầu và giơ tay nhẹ. Có crossfade 0,7 giây. Không tính linh mục vào 100 khách, NPC hay supporters.
3. Hai nhóm nam và hai nhóm nữ gốc; thêm ba nhóm sắc áo/chiều cao bằng runtime, vẫn nhận ra bốn nhân vật cơ sở. Có sprite đứng/ngồi/quỳ, tám hình bước đi mỗi người, chuyển tư thế 0,45 giây và nội suy tọa độ. Không dùng người hình hộp/trụ trên route LIVE mới.
4. Phép chiếu cố định cho gần/giữa/xa; sắp thứ tự theo chiều sâu, che chân bằng mép ghế, bóng chân khi đi/đứng, tách NPC/khách/người trình diễn nội bộ. Giữ engine và đường đi trước đó.
5. Giá nến nhận thêm từng nến quà, lửa dao động, glow và khói nhẹ; hoa trắng với cành/lá/cánh thêm ở khu phải. Trang trí nền có sẵn trong ảnh không được tính là quà thật.
6. Đủ sáu hiệu ứng: 1 nến; 5 quỳ; 5 hoa; 10 chuông/gợn sáng/cúi nhẹ; 100 ánh ấm/người trước cung thánh/chủ sự cúi; 500 cộng đoàn quỳ/chủ sự giơ tay/tia sáng/bụi vàng. Không đổi khóa, giá, thời lượng hoặc logic hàng đợi.
7. Camera chỉ thay đổi tỷ lệ toàn sân khấu tối đa **1,018**; không mất bàn thờ/chủ sự/cộng đoàn. Deadline hiệu ứng dùng đồng hồ riêng để tự thoát khi snapshot ngừng đến.
8. UI 9:16: header nhỏ, một hàng sáu quà, toast/supporters gọn ở đáy; `/control` riêng. Giữ thông báo trải nghiệm ảo và mô phỏng local.
9. Canvas2D không cần WebGL; phông tĩnh được trình duyệt cache riêng. Sprite cache theo độ phân giải/tư thế/biến thể, LOD texture theo kích thước. Giáo dân đứng/ngồi ổn định được vẽ vào lớp đệm 8 Hz; di chuyển/chuyển tư thế cập nhật từng frame. Low giới hạn khoảng 30 lần vẽ/giây, ít hạt/khói; Balanced giảm ngân sách pixel khi quá 64 khách; High giữ chi tiết cao hơn. Không bỏ khách khỏi engine để tăng FPS.

## Kiểm thử

- `npm run build`: đạt; gồm TypeScript và build client/server. Rollup có cảnh báo chú thích PURE từ dependency Zod; không ảnh hưởng build.
- `npm test`: **19/19 đạt**. Bao gồm AMEN, chống trùng, ghế/chỗ đứng, 100 người đến/rời, queue đầy và retry, đủ sáu quà, stress 100 comment + 30 quà, HTTP/WebSocket, phép chiếu ghế và deadline camera.
- `npm run test:browser`: kiểm tra production `/` và `/control`, không có nút admin trên LIVE, AMEN/dedup, sáu quà phát hết, nến/hoa tồn tại, camera hết focus, reload, 100 khách, quà khi đầy, đổi NPC/camera/reset. Không có lỗi console/page.
- `npm run test:visual`: 0/20/50/100 khách, sáu quà, người đang đi vào, snapshot bị ngừng trong quà 100 rồi camera trở về 1,0000; Low/Balanced/High với 100 khách tại 1080×1920. Không có lỗi console/page.

### FPS thực đo trong cloud

Chromium headless Canvas2D, Linux x64, 5 CPU được cấp, AMD EPYC 9V74. Đây là đo foreground đơn trình duyệt, không chạy đồng thời bộ smoke. Mỗi mẫu 4 giây sau warm-up; dữ liệu gốc ở [results.json](screenshots/stage/results.json).

| Khung / chế độ | Khách thật mô phỏng | FPS vẽ |
|---|---:|---:|
| 540×960 Balanced | 0 (+16 NPC) | 48,1 |
| 540×960 Balanced | 20 | 53,4 |
| 540×960 Balanced | 50 | 55,1 |
| 540×960 Balanced | 100 | 49,4 |
| 1080×1920 Low | 100 | 24,7 |
| 1080×1920 Balanced | 100 | 20,2 |
| 1080×1920 High | 100 | 14,2 |

Mẫu 0 người thấp hơn một số mẫu có người phản ánh biến động máy cloud; không dùng những số này để suy ra tăng số người sẽ nhanh hơn. Chế độ Low có giới hạn tần số chủ động. FPS smoke nhiều tab có thể thấp vì tab LIVE không ở foreground; không dùng nó thay benchmark. Chưa đo trên máy Windows/GPU/TikTok LIVE Studio của người dùng, chưa benchmark dài nhiều giờ hay một luồng TikTok thật.

## Preview

[Thư viện ảnh bàn giao](screenshots/stage/README.md) có đủ toàn cảnh, linh mục/bàn thờ, đông giáo dân, nến, 100 và 500 xu; thêm hoa, chuông, quỳ, đi vào, 1080p và trang control. Tất cả là ảnh chụp sản phẩm, không retouch preview. Timestamp được đưa về trước để người đến chỗ; ảnh quà giữ snapshot ở giữa hiệu ứng để tái lập. Đo FPS dùng đồng hồ thật.

## Những phần chưa đạt / còn giới hạn

- **Không còn primitive làm nhân vật chính**, nhưng đây là sprite 2,5D, chưa có model nam/nữ 3D chất lượng cao với skeleton. Bốn mẫu gốc vẫn lặp khi đông người; biến thể sắc áo không tạo thành 12 danh tính khác nhau.
- Bộ bước đi sinh ảnh còn ít thay đổi chân. Quay ngang vào ghế/chuyển đi về vẫn chưa có đủ góc nhìn; có thể thấy trượt hoặc crossfade. Không khẳng định đã đạt bước đi/ngồi/quỳ tự nhiên như motion capture. Cần artist làm thêm atlas đa hướng và in-between trước khi chốt chất lượng animation cao cấp.
- Mép alpha, tỷ lệ giữa một số tư thế và vùng che ghế còn cần art pass. Che người bằng mặt cắt theo hàng ghế, không có depth mesh hoàn chỉnh; người gần máy có thể che nhau/đi ra ngoài đáy khung theo phối cảnh.
- Các tượng, chi tiết kiến trúc, nhiều nến/hoa trang trí và chuông trong phông không có mesh/animation riêng. Quà bổ sung lớp vật thể/hiệu ứng động; chuông dùng âm tổng hợp và gợn sáng, không xoay quả chuông vẽ sẵn.
- Các shader/model/asset hook 3D cũ vẫn nằm trong mã nhưng không được tải trên route 2,5D. Không coi chúng là bộ rig đã tích hợp cho renderer mới.
- Canvas2D mới cần các PNG nội bộ tải thành công; khi thiếu file hiển thị lỗi rõ ràng. Không tự thay bằng ảnh ngoài hoặc gọi API sinh ảnh lúc chạy.
- 1080×1920 trên cloud **chưa đạt mục tiêu 30 FPS**. Có thể dùng nguồn 540×960 để thử bố cục hoặc chọn Low; cần đo lại máy phát thật trước LIVE dài.
- Mock session, không có TikTok API, thanh toán hoặc hồ sơ người dùng bền vững; reset/restart xóa phiên.

## File chính

| File | Vai trò |
|---|---|
| `apps/client/src/StageChapel.tsx` | Renderer 2,5D, priest/crowd, cache/LOD, nến/hoa/FX, đo FPS |
| `apps/client/src/scene/stageLayout.ts` | Phép chiếu, hàng ghế, source rectangle atlas, giới hạn focus |
| `apps/client/public/art/*` | Ba PNG gốc và manifest hash/nguồn |
| `apps/client/src/App.tsx`, `style.css`, `strings.ts` | Chuyển renderer mặc định, UI 9:16, thông tin phù hợp bản mới |
| `apps/client/src/store.ts` | Cho phép gửi tên renderer Canvas2D trong telemetry |
| `tests/stage.test.ts` | Kiểm tra phép chiếu và camera |
| `scripts/visual-stage.ts` | Test thực/browser, stress chất lượng, chụp ảnh |
| `scripts/browser-smoke.ts` | Giữ kiểm thử hồi quy, cập nhật mô tả renderer |

`packages/shared/src` và `apps/server/src` không sửa logic. Chỉ tăng version package để đánh dấu bản phát hành.

## Cách chạy

```sh
npm ci
npm run dev
```

Mở `http://127.0.0.1:5173/` và `/control`. Hoặc `npm run build` rồi `npm start`, mở cổng 3001. Hướng dẫn Windows/LIVE Studio và endpoint ở [README](../README.md). Khi cài từ gói mã có dist kèm sẵn vẫn cần `npm ci` để cài runtime; build lại bằng lệnh trên nếu thay mã.
