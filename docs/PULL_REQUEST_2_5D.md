Nâng cấp cảnh LIVE từ hình học procedural sang sân khấu 2,5D châu Âu: artwork kiến trúc gốc, linh mục hư cấu, người nam/nữ nhiều tư thế, nến/hoa/FX động và UI 9:16 gọn hơn. AMEN, sáu khóa quà, seating, queue và server giữ nguyên.

Camera giữ toàn cảnh và tự trả về sau thời hạn ngay cả khi luồng snapshot bị gián đoạn. Thêm texture/animation LOD và cache lớp giáo dân. Giữ renderer 3D cũ trong mã; không ghi đè nhánh v1.2.

Kiểm chứng: build/typecheck đạt; 19 unit/integration tests; smoke hai route và sáu quà; visual stress 20/50/100 cùng Low/Balanced/High. Có ảnh và báo cáo tiếng Việt ở `docs/DELIVERY_2_5D_VI.md` và `docs/screenshots/stage/`.

Giới hạn: sprite chưa phải rig 3D/motion capture, bước đi/đổi hướng cần art pass. 100 người đạt khoảng 49 FPS ở 540×960 trên cloud; 1080×1920 chỉ khoảng 14–25 FPS, chưa xác nhận LIVE-ready ở độ phân giải này. Không có TikTok integration thật.
