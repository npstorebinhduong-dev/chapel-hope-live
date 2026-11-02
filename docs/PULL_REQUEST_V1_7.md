# Chapel LIVE v1.7: chuyển động, camera theo người tặng và đám đông AMEN

Tiếp nối `feat/production-live-v1-6`. AMEN trước đây bị chặn ở 100 người và chỉ 12 avatar hiện ra; camera chỉ zoom 1,8% cho quà lớn. Bản này bỏ trần hàng chờ, bố trí crowd nhiều lớp trong phần dưới 9:16, làm mượt góc rẽ/ngồi/quỳ/đứng dậy và focus riêng cả sáu quà theo đúng người tặng. Thêm bồ câu và ánh kính màu khi idle, giữ âm thanh/giọng đọc và các luật gift-entry.

Lớp đám đông xa dùng LOD độc lập để người tặng/camera không phải chờ vẽ cả nghìn sprite. Bỏ snapshot cũ khi socket đang gửi để tránh ngắt kết nối vì backpressure. Khi đầy cả ghế và chỗ đứng, người tặng vẫn thực hiện nghi thức rồi đi ra. Không merge/ghi đè các nhánh cũ.

Kiểm tra: build/typecheck đạt; 36 unit/integration đạt; browser 50 AMEN + 5 gift = 45 chờ / 5 trong, sáu key, 30/30 lượt focus, full seats và camera trả về sau disconnect. Đã chạy 60 giây idle và một hành trình thực ~25 giây. Đám đông 20/50/100/1.000 đều được vẽ; đo ngắn 1.000 người ~30 FPS trên cloud, không phải cam kết Windows. Hồi quy 18 banner EN/VI/IT, provider contract, hai chu kỳ nhạc, offline HTML đạt.

Ảnh, JSON và giới hạn: `docs/screenshots/live-v17/`, `docs/CHANGELOG_V1_7.md`. ZIP Windows có build production, mã nguồn và launcher; HTML preview tự chứa.

Asset vẫn là sprite 2,5D rear-view, chưa có atlas quay nhiều hướng/mocap/IK. Linux không có native voices; test provider dùng fixture giả và được ghi rõ. Chưa kiểm chứng Windows launcher hoặc phiên TikTok/OBS thật; chưa LIVE VERIFIED.
