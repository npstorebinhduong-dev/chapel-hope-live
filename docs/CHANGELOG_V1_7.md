# Chapel of Hope LIVE v1.7 — Chuyển động, camera và đám đông

Phát triển tiếp từ commit `20418ea` của `feat/production-live-v1-6`, trên nhánh `feat/living-crowd-camera`. Giữ React/TypeScript, Canvas 2,5D, Node/Express/WebSocket; không thay thế mã v1.6 hoặc các nhánh chưa hợp nhất.

## Thay đổi hình ảnh

- Đường đi bo góc tối đa 0,12 đơn vị trong hành lang hiện có, lấy mẫu theo chiều dài đường. Tăng thời gian đứng dậy trước bước đầu; có 900 ms đứng dậy sau nghi thức rồi mới đi về. Ngồi/quỳ chuyển tư thế trong 850 ms. Trọng tâm hạ xuống có easing, chân làm điểm neo.
- Chu kỳ 8 frame bước chân chạy theo dịch chuyển thực được nội suy trên màn hình. Góc nghiêng và độ thu hẹp thân phản ứng theo hướng rẽ; pha thở/nghiêng người khác nhau theo từng ID. Trộn ảnh trong lớp trung gian với tổng trọng số bằng một để tránh chớp alpha.
- Mỗi quà có camera riêng: nến +6,5%, cầu nguyện +10%, hoa +7,5%, chuông +9,5%, 100 xu +24%, 500 xu tối đa +28%. Đây là mức mục tiêu trước nội suy, không phải FOV 3D. Bắt đầu focus 2,4 giây trước khi tới khu nghi thức; 500 xu mở rộng lại trong phần sau để thấy tập thể. Camera lấy đúng vị trí người tặng, giữ đáy khung hình cho đám đông, giới hạn pan để không lộ mép nền và tự trả về khi hiệu ứng kết thúc hoặc mất snapshot.
- Camera dùng chính lịch quà có ưu tiên 3 lượt rồi nhường FIFO, không tạo hàng đợi thứ hai có thể lệch nhịp. Quà nhỏ vẫn được lượt focus riêng.
- Nến: vật cầm theo người, chuyển đến giá bằng easing; thân nến, ngọn lửa hai lớp, glow, khói và tiếng nến. Nến đã thắp vẫn tích lũy, giới hạn 64 nến được tặng trên giá để giữ chi tiết đọc được.
- Cầu nguyện: quỳ mượt, đệm sáng ấm bám người tặng, banner/lời chúc và âm thanh giữ nguyên.
- Hoa: cầm theo người rồi đưa tới khu dâng, hoa trắng nhiều cánh tích lũy, cánh bay và chuyển động nhỏ; giữ mốc 5 xu độc lập.
- Chuông: giữ chuông có chiều sâu, thêm ánh sáng ấm giảm dần trong khoảng 1–2 giây; giáo dân lân cận phản ứng và camera thấy cả vùng đó.
- 100 xu: focus rõ hơn, ánh kính màu, vùng sáng sau người quỳ, lời chúc và banner theo ngôn ngữ hiện tại.
- 500 xu: cận rồi mở ra, ánh sáng toàn scene, bụi sáng tiết chế, cha xứ và giáo dân cầu nguyện; giữ chuông lớn, hợp xướng tổng hợp và banner vinh danh.
- Khi idle: bồ câu vector nguyên tác vỗ cánh, 1–2 con trong 9 giây mỗi chu kỳ 27 giây, đổi chiều giữa các chu kỳ; ánh kính màu thở chậm, nến/khói, bụi sáng, cha xứ và giáo dân vẫn chuyển động. Không cần gift để kích hoạt.

## Hàng chờ và gameplay

Bỏ giới hạn 100 người phiên và 12 avatar hàng chờ hiển thị. Mỗi người AMEN được một vị trí trong đám đông phía dưới: tăng số cột/lớp theo mật độ, lệch hàng và vị trí có tính ổn định, người phía xa nhỏ hơn, vẽ từ xa tới gần để che khuất một phần. Duy trì lối giữa. Khi có người rời hàng, các vị trí nội suy trong 1,2 giây; người tặng bắt đầu từ đúng vị trí đang đứng, không xuất hiện lại ở đầu hàng.

Không có trần số người AMEN cố định trong mã. Điều này **không có nghĩa RAM/FPS hoặc băng thông vô hạn**: viewer không hoạt động tự hết hạn sau 10 phút, ID trùng không tạo bản sao, sự kiện có rate limit và dedupe. Sprite/texture dùng LOD, lớp người đứng yên cache và vẽ lại 8 Hz (đám đông trên 250 người: 5 Hz, nhân vật xa dùng impostor); nhân vật đang đi/chuyển tư thế cập nhật theo frame. Những snapshot đã cũ được bỏ qua khi socket đang gửi, không xếp hàng vô tận hay ngắt người xem chỉ vì đám đông lớn.

Tên được vẽ sau đám đông, tối đa 7 nhãn không đè nhau: ưu tiên người đang thực hiện quà, người được gọi, người mới và đầu hàng. Không yêu cầu đọc rõ mọi tên cùng lúc. Bỏ dải chữ trùng lặp giữa khu ghế và hàng chờ; bộ đếm vẫn ở phía trên.

Luật giữ nguyên: AMEN chỉ chờ; `1` nam / `2` nữ đổi đúng một avatar; chỉ gift hợp lệ cho vào; gift trước AMEN vẫn xử lý; hai quà 5 xu khác key. Có 48 ghế viewer + 16 NPC và 8 vị trí đứng thường trực. Nếu cả chỗ đứng cũng đầy, người tặng vẫn đi vào thực hiện nghi thức rồi đi ra; không ép thêm avatar vào ghế/đè lên người khác. Hàng quà vẫn giới hạn 128 và xử lý tuần tự, không hứa nhận quà vô hạn.

## File chính

- `packages/shared/src/motion.ts`, `engine.ts`, `index.ts`: đường đi, đứng dậy, mật độ, điều kiện vào/ra.
- `apps/client/src/StageChapel.tsx`: renderer, nhịp chân, trộn tư thế, nhãn, ánh sáng, vật dâng.
- `apps/client/src/scene/stageCamera.ts`, `stageAtmosphere.ts`, `stageLayout.ts`: camera, bồ câu/ánh sáng, phối cảnh.
- `apps/client/src/App.tsx`, `apps/server/src/app.ts`: bố cục LIVE, backpressure snapshot.
- `scripts/living-browser.ts`, `tests/gameplay.test.ts`, `tests/stage.test.ts`: kiểm thử mới.
- `windows/Start-Chapel.ps1`, scripts đóng gói: nhận diện bản v1.7, tránh mở nhầm server v1.6 đang chạy.

## Kiểm thử

Kết quả cuối cùng và ảnh nằm trong [thư mục preview](screenshots/live-v17/README.md); JSON ghi rõ phần nào chạy thời gian thực và phần nào tua đồng hồ kiểm thử. Build production và typecheck đạt; 36/36 unit/integration đạt; test scene mới, hồi quy gameplay/audio và HTML offline đạt. 20/50/100/1.000 người đều được vẽ; FPS đo ngắn tương ứng 60,4 / 55,2 / 59,2 / 30,4 trên Chromium Linux. 50 AMEN + 5 gift → 45 chờ, 5 trong; 30/30 quà có lượt camera. Hồi quy 18 banner EN/VI/IT, provider contract và hai chu kỳ nhạc thời gian thực đạt; giọng Windows thật vẫn chưa được xác minh. ZIP đã giải nén vào thư mục sạch và chạy bundle không node_modules: LIVE/Control/health OK, 200 AMEN không tự vào, shutdown nonce thoát mã 0. Launcher được parse cú pháp bằng PowerShell Linux; chưa thực thi trên Windows.

## Giới hạn còn lại

- Nhân vật vẫn là atlas 2,5D với bốn mẫu cơ sở và biến thể màu. Không có bộ atlas front/side hoặc skeleton/mocap đầy đủ: quay thân khi đi ngang/đi về chỉ được xấp xỉ bằng nghiêng và biến đổi phối cảnh, **chưa đạt quay người đúng mọi hướng như người 3D thật**. Chưa có IK tay/bàn chân hay cử động đầu độc lập; bước chân/ngồi/quỳ mượt hơn nhưng không cam kết hết mọi foot sliding. Đây là hạn chế asset, không ghi đã đạt photoreal.
- Bồ câu là hình vector vẽ trong canvas, không phải model 3D. Synthesis âm thanh/voice provider và điều kiện thiếu giọng giống bản v1.6; không thêm recording chưa rõ giấy phép.
- Trong một khung 9:16, rất nhiều người sẽ che khuất nhau. Tất cả còn trong state và được xét/vẽ bằng LOD, không thể nhìn rõ từng người/tên khi số lượng quá lớn. Cấu hình phần cứng thực tế quyết định mức tải phù hợp.
- Không có phiên Windows/OBS/TikTok LIVE trong môi trường cloud. Chưa xác minh chất lượng giọng Windows, audio capture và nhận quà thật của bản này. **READY FOR WINDOWS VALIDATION; chưa LIVE VERIFIED.**

## Chạy lại

Dừng bản cũ bằng `STOP_CHAPEL_LIVE.bat` của chính bản đó, giải nén ZIP v1.7 vào thư mục mới, chạy `START_CHAPEL_LIVE.bat` (cần Node ≥22.12). LIVE: `http://127.0.0.1:3001/`, Control: `http://127.0.0.1:3001/control`. OBS dùng Window Capture cửa sổ LIVE, canvas 1080×1920, chỉ một nguồn âm thanh game. Nhấp trang LIVE để unlock audio, bỏ Mute sound trong Control.

Ở Control, Reset rồi thử +20/+50/+100; có thể nhấn thêm nhiều lần để vượt 100. Chọn đúng người trong danh sách để thử gift; thử cả 6 nút, xem đi/về và camera tự trả. Để yên 60 giây kiểm tra bồ câu, nến và cử động nền. Tắt/bật Cinematic camera để kiểm tra phục hồi overview.

Từ mã nguồn: `npm ci`, `npm run build:windows`, `node production/server.cjs`. Kiểm thử: `npm test`, `npm run test:living`, `npm run test:browser`; HTML: `npm run build:preview`, `npm run test:preview`.
