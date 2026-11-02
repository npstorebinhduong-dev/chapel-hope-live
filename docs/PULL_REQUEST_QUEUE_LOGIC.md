AMEN trước đây tự cấp ghế và đưa người vào lễ đường. Task #06 đổi thành AMEN chỉ tạo một avatar đứng chờ; chỉ gift hợp lệ của đúng userId mới cấp chỗ, cho đi đến zone, phát FX rồi về ghế/chỗ đứng. Comment chính xác 1/2 chọn avatar nam/nữ trong phiên, không tạo gift hoặc avatar trước AMEN.

Thêm bộ điều phối hành trình liên tục, waiting reflow, appearance crossfade, số đếm Waiting/Entering/Inside/Seated và UI chọn ID. Bỏ bản sao trình diễn teleport. Giữ sáu giftKey, asset 2,5D, queue priority/dedupe, NPC riêng; thêm mixer nhạc/ambient/SFX Web Audio theo phần còn phù hợp của Task #05. Cập nhật cả HTML offline và ZIP.

Kiểm chứng: typecheck/build đạt; 27 tests; browser smoke 50 AMEN + 5 gifters → 45 chờ / 5 trong / 5 ghế; stress 100+20 → 80/20; đủ sáu FX, ghế đầy, camera, AudioContext qua chu kỳ 48 giây và mute về 0. HTML offline cũng chạy đủ sáu quà theo thời gian thực. Ảnh và kết quả tại `docs/screenshots/queue/`; báo cáo VN tại `docs/CHANGELOG_QUEUE_LOGIC.md`.

Giới hạn: sprite vẫn thiếu góc quay/mocap, âm thanh tổng hợp; burst gift có thời gian đi/về riêng và dùng một hành trình/lối tại một thời điểm. Tối đa một donor tạm khi phiên 100 viewer đã đầy. Chưa benchmark LIVE dài/hardware hoặc tích hợp TikTok thật.
