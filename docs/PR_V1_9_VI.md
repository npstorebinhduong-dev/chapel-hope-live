# Chapel of Hope v1.9: quản trị Việt, tương tác LIVE và điều phối âm thanh

Từ v1.7, người vận hành còn phải dùng control tiếng Anh và chưa có engine tim/chia sẻ của #10. Bản này triển khai tương tác thật qua adapter, HUD ba ngôn ngữ, sáu khu quản trị tiếng Việt và mixer/nhạc/lời chúc mới; giữ AMEN chờ và chỉ quà mới vào lễ đường. Điều khiển giọng và meter theo đúng cửa sổ LIVE, cap đám đông giữ count/identity, không đổi game hoặc asset nền.

Xác minh: 45 unit/integration; build/typecheck; 18 tổ hợp quà–locale và30 quà liên tiếp;50+5=45/5; stress tim/share/AMEN; HTML không backend;30,06 phút soak lõi âm với59 quà hoàn tất; FPS/heap thực; PowerShell syntax và gói production giải nén. Có ảnh9:16 và báo cáo trong `docs/screenshots/live-v19`, giới hạn tại `docs/CHANGELOG_V1_9.md`.

Chưa kiểm chứng launcher/voice/capture trên Windows hoặc TikFinity trong LIVE thật. Soak dùng client lõi âm đóng băng trước HUD cuối; speech/tone fixture không chứng minh giọng tự nhiên. Không LIVE VERIFIED. Đề nghị merge vào `feat/living-crowd-camera` để bảo toàn chuỗi triển khai hiện có.
