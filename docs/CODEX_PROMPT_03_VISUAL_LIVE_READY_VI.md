# LỆNH CODEX #03 – CHAPEL OF HOPE LIVE v1.2
## HOÀN THIỆN TOÀN BỘ HÌNH ẢNH 3D ĐẠT MỨC SẴN SÀNG KIỂM THỬ LIVE

### 0. MỆNH LỆNH QUAN TRỌNG
Đọc kỹ AGENTS.md, docs/TECH_SPEC_V1.md, các lệnh Codex trước, rồi kiểm tra toàn bộ mã nguồn HIỆN CÓ trên nhánh feat/chapel-live-v1-1. Nếu nhánh này đã được hợp nhất, sử dụng nhánh mới nhất chứa code v1.1. Không tạo lại dự án từ đầu, không xóa gameplay đang hoạt động, không đổi stack React + Three.js/React Three Fiber, không chỉ viết báo cáo hoặc sơ đồ. Hãy trực tiếp chỉnh sửa mã nguồn, xây dựng bản xem được và kiểm thử.

Trọng tâm phiên này: **CHẤT LƯỢNG HÌNH ẢNH HOÀN CHỈNH**, không phải thêm cơ chế gameplay.

Mục tiêu cuối: màn hình LIVE dọc 9:16 thể hiện một thánh đường Công giáo châu Âu 3D có chiều sâu, đông người thật sự về mặt thị giác, bố cục nghiêm trang, ghế gỗ, nến cầu nguyện, khu dâng hoa, bàn thờ, ánh sáng kính màu, nhân vật với hình thể và chuyển động tự nhiên. Các hiệu ứng quà hoạt động thật trong cảnh. KHÔNG chấp nhận chỉ có vài hình hộp, hình trụ, mannequin cứng hoặc bố cục trống và gọi là sản phẩm hoàn chỉnh.

### 1. KIẾN TRÚC VÀ BỐ CỤC THÁNH ĐƯỜNG
Dựng hoàn chỉnh, theo lối Gothic/neo-Gothic châu Âu nhưng giữ sự hợp lý của không gian Công giáo:
- Một gian chính (nave) cao, mái vòm/nhịp vòm rõ, các cột và hốc vòm đối xứng, đường dẫn thị giác đi từ cuối thánh đường lên cung thánh.
- Tường đá hoặc đá tô màu ngà nhạt với vật liệu có roughness/normal hợp lý; nền đá có đường mạch, không để mặt phẳng nhựa trơn.
- Cửa sổ kính màu lớn hai bên; hoa văn kính màu tự tạo hoặc asset có bản quyền rõ ràng; ánh sáng màu chiếu nhẹ lên cột, lối đi và ghế.
- Bàn thờ ở đầu thánh đường, có bậc nâng, khăn bàn thờ sáng màu, nến lễ hai bên, thánh giá đặt đúng vị trí; bổ sung bục đọc sách/ambo và khu vực hoa phù hợp.
- Chừa khoảng cách tôn nghiêm: nhân vật tham dự không giẫm lên bàn thờ, không đi xuyên rào chắn hoặc đặt chân lên vật phẩm phụng vụ. Nơi thắp nến cầu nguyện là khu riêng bên hông hoặc phía ngoài cung thánh, không dồn tất cả vào bàn thờ chính.
- Lối đi giữa trải thảm đỏ trầm, có chiều rộng đủ cho người đi; hai bên có khoảng đi vào hàng ghế; bố trí chiều sâu từ hàng ghế gần camera đến bàn thờ.
- Hệ thống bảng hiệu trong cảnh phải tinh gọn, không treo chữ quá lớn che kiến trúc hoặc hình tượng tôn giáo.
- Bảo đảm hướng nhìn nhân vật đang ngồi/quỳ là hướng lên bàn thờ, không quay mặt về camera lúc cầu nguyện.
- Không đưa yếu tố tôn giáo không phù hợp vào ngẫu nhiên; thánh đường là không gian ảo, không đại diện nhà thờ hay giáo sĩ có thật.

Yêu cầu đồ họa: có nhiều lớp chiều sâu và chi tiết nhận diện ngay ở góc camera dọc; tránh hiện tượng toàn bộ bề mặt chỉ dùng một màu phẳng hoặc lighting trắng gắt.

### 2. HÀNG GHẾ GỖ: CHI TIẾT VÀ ĐÚNG TỶ LỆ
- Dựng hai dãy ghế dài bằng gỗ màu nâu sẫm hoặc gỗ sồi, có mặt ngồi, lưng ghế, tay đầu hồi, chân ghế và chi tiết gờ/gỗ.
- Tỷ lệ ghế phù hợp nhân vật (chiều cao mặt ngồi, lưng tựa, khoảng đầu gối). Có khoảng cách giữa các hàng để người đứng lên, bước ra ghế và quỳ.
- Phân bổ 48–64 chỗ ngồi được nhìn thấy rõ ở chế độ mặc định, thiết kế có thể mở rộng crowd logic; tránh để avatar ngồi xuyên mặt ghế, chân xuyên nền hay chồng ghế.
- Có vị trí ngồi và điểm chờ/kneeling marker riêng cho từng chỗ. Đường đi: cửa sau -> lối giữa -> lối ngang -> hàng ghế -> ngồi; không cắt xuyên lưng ghế.
- Những hàng gần camera có chi tiết cao, hàng xa có LOD đơn giản để giữ hiệu năng. Đừng làm toàn cảnh quá tối khiến hàng ghế chỉ còn một khối đen.
- Có khoảng trống mỹ thuật hợp lý nhưng màn hình vẫn phải tạo cảm giác nhà thờ đông người.

### 3. HÀNG NẾN VÀ HOA – BẮT BUỘC ĐẸP, HOẠT ĐỘNG THẬT
- Dựng ít nhất 1–2 giá nến cầu nguyện nhìn thấy được trong bố cục (ở khu phụ bên cạnh, không chặn lối đi).
- Giá nến có chân/khung kim loại hoặc đá, bệ đựng, 12–24 ngọn nến hiển thị ở baseline (có thể tăng bằng sự kiện), chiều cao và vị trí không chạm nhân vật.
- Nến có thân sáp, tim nến, ngọn lửa nhỏ chuyển động có kiểm soát, ánh sáng gần thật, quầng glow nhẹ và phản chiếu gần; tối ưu bằng nhiều mức chất lượng thay vì 1 point light cho mỗi nến.
- Khi nhận quà 1 xu: xác định vị trí nến trống, bật một ngọn nến mới; nếu hết vị trí thì xoay vòng/thay phiên nến cũ, không tràn mảng/bật sáng cả màn hình.
- Có khu vực dâng hoa riêng, bình/lọ hoa trắng và hồng, bó hoa hoặc cành hoa có hình thể rõ. Quà 5 xu loại hoa tạo thêm một bông/cành thật trong scene, có giới hạn số lượng và không chồng lộn xộn.
- Ánh nến và khói rất nhẹ luôn hoạt động, nhưng không dùng particle lớn che mặt, chữ, camera hoặc bàn thờ.

### 4. NHÂN VẬT 3D CHÂN THỰC – PHẦN QUAN TRỌNG NHẤT
- Nhân vật phải là người 3D có tỷ lệ đầu/cổ/vai/tay/chân/bàn tay hợp lý, chất liệu vải và tóc tương đối tự nhiên; không dùng hình viên nang hay robot khớp cầu làm nhân vật chính.
- Ưu tiên tích hợp GLB/GLTF humanoid có rig và animation từ những asset hợp pháp đã có, hoặc asset có giấy phép phù hợp, ghi rõ đường dẫn nguồn/giấy phép trong docs/ASSET_LICENSES.md. Không tải asset ngẫu nhiên thiếu bản quyền; nếu không có asset người đủ tốt, phải triển khai pipeline để thay thế và ghi rõ giới hạn, không giả vờ đã đạt photoreal.
- Hướng đến 8–12 biến thể nhìn khác nhau về trang phục/tóc/gương mặt; tông trang phục lịch sự châu Âu: navy, xám, be, trắng ngà, xanh rêu, nâu; tránh áo phát sáng và màu neon.
- Nam/nữ và ngoại hình được chọn ngẫu nhiên hoặc do người xem lựa chọn ở các bản sau; không suy đoán giới tính hoặc tôn giáo từ nickname.
- Nhân vật cần có idle thở nhẹ, đi bộ, rẽ, bước ngang vào ghế, ngồi, đứng dậy, quỳ gối, cúi đầu, chắp tay hoặc tư thế cầu nguyện tự nhiên.
- Chuyển state bằng crossfade hoặc nội suy liên tục theo delta time. Tuyệt đối sửa lỗi đổi tư thế bị chớp sáng, đổi vật liệu đột ngột, giật biến mất/hiện lại, xoay đầu 180 độ hay teleport.
- Hình dáng chân và tay phải có pose hợp lý khi ngồi/quỳ; không để chân lọt ghế, đùi cắm xuyên nệm, quỳ ngược hướng bàn thờ.
- Tạo hệ thống LOD: người gần camera/đang nhận quà chi tiết cao; người xa dùng chất lượng thấp hơn; giữ nhiều người đông mà không tụt FPS nghiêm trọng.
- Có thể dùng 12–20 NPC nền để thánh đường không trống. NPC phải được đánh dấu là nhân vật mô phỏng, KHÔNG giả mạo là người xem thật trong bảng top hoặc chat.
- Khi có AMEN, tạo avatar viewer bằng tên thật của session từ sự kiện, không cho trùng 2 avatar trên cùng userId. Người ngoài ghế chờ đúng vị trí. Khi FULL phải vẫn tiếp nhận hiệu ứng quà.

### 5. ÁNH SÁNG, SHADER, CHẤT LIỆU VÀ CHUYỂN ĐỘNG MÔI TRƯỜNG
- Dùng mô hình chiếu sáng PBR phù hợp Three.js, tone mapping/ exposure cố định hợp lý.
- Có nắng xuyên kính màu, quầng sáng tinh tế ở khu cung thánh, bụi rất nhỏ trong các tia nắng, ánh nến ấm trên đồ vật gần nến.
- Không lạm dụng bloom, lens flare, depth of field khiến LIVE bị mờ. Đồ họa phải vẫn rõ khi TikTok nén video; chữ và gương mặt gần đủ sắc nét.
- Không tạo nhấp nháy theo frame hoặc bloom flash khi camera focus và khi chuyển animation.
- Chuyển động môi trường khi vắng người tặng: nến cháy, ánh sáng nhẹ, NPC đổi idle một cách tự nhiên, không lặp synchronized như robot.
- Nếu dùng texture, ghi nguồn và dùng đúng color space; tránh lỗi gamma, sRGB, vật liệu đen hoặc cháy sáng.

### 6. HOÀN THIỆN HIỆU ỨNG HÌNH ẢNH CỦA 6 MỐC QUÀ
Giữ ĐÚNG 6 key, không đổi mapping, không gộp hai quà 5 xu:
1. candle_1 (1 xu): thắp 1 nến thật tại giá nến, hiện tên ngắn rồi mờ dần.
2. prayer_5 (5 xu): nhân vật đứng/quỳ cầu nguyện mượt, một lớp ánh sáng ấm kín đáo và trả về trạng thái ổn định.
3. rose_5 (5 xu): nhân vật mang/đặt hoa trắng ở khu vực dâng hoa; bông hoa xuất hiện rõ trong cảnh và được giữ lại trong giới hạn.
4. bell_10 (10 xu): chuông và rung động hình ảnh rất nhẹ ở khu kiến trúc, một nhóm nhỏ người tham dự cùng cúi đầu/cầu nguyện.
5. altar_100 (100 xu): camera pan/dolly nhẹ đến nhân vật ở điểm cầu nguyện trước cung thánh, ánh nắng ấm đổ xuống, nến nổi bật, hiện banner nhỏ "Special Prayer", camera trở lại toàn cảnh.
6. ceremony_500 (500 xu): hiệu ứng điện ảnh đẹp nhất: ánh sáng kính màu phong phú nhưng trang nhã, chuông, nhiều ngọn nến sáng hơn, chuyển động cầu nguyện tập thể, hoa/hạt bụi nhỏ có giới hạn, bảng tên vinh danh, rồi quay về cảnh thường. Không che kín bàn thờ bằng particle.
- Tất cả effect có thời gian giới hạn; hoạt động với viewer chưa có ghế hoặc khi ghế đầy.
- Xử lý quà liên tục 10/30 event không kẹt camera, không rơi event âm thầm, không chồng quá nhiều hiệu ứng. Có giới hạn priority và graceful fallback.
- Nếu âm thanh chưa có asset hợp pháp, dùng tiếng chuông tổng hợp gọn với WebAudio; không dùng bài thánh ca có bản quyền khi chưa có giấy phép.
- Đây là **hiệu ứng trực quan trong không gian ảo**, không gợi ý tiền mua được phép lành, khỏi bệnh hay kết quả tâm linh.

### 7. GÓC CAMERA VÀ GIAO DIỆN LIVE 9:16
- Góc chính từ phía sau nhìn thẳng theo lối giữa lên bàn thờ, có đủ cả hai dãy ghế, kính màu và nhân vật. Cảnh phải đẹp ngay cả lúc không có quà.
- Căn bố cục cho khung 1080 × 1920 và cả preview điện thoại; dùng render scale thích ứng để tránh GPU quá tải.
- Camera dùng ease-in/out, không đổi FOV đột ngột hoặc focus quá sát làm mất bối cảnh. Sau mỗi gift camera PHẢI về overview.
- UI chữ tiếng Anh dành cho EU: "CHAPEL OF HOPE", "Type AMEN to join", gift guide 6 mốc, toast ngắn, Top Supporters gọn, "Virtual chapel experience".
- UI không đè lên tượng/thánh giá, bàn thờ, người được focus, ngọn nến và góc tương tác TikTok. Hiện tên người dùng theo vị trí và ưu tiên người gần/đang tương tác; tự tránh chồng chữ.
- Control panel riêng ở /control; route / không lộ nút debug.

### 8. HIỆU NĂNG, CẤU HÌNH VÀ BẮT BUỘC KIỂM THỬ
- Đặt mục tiêu 30 FPS ổn định ở chế độ LIVE Balanced, không cam kết nếu chưa đo. Có ba mức Low / Balanced / High để giảm/cân bằng bóng đổ, độ phân giải, particle, số avatar chi tiết.
- Không tạo pointLight riêng cho hàng trăm ngọn nến; dùng instancing/batched geometry, chia sẻ material, caching, LOD và event lifecycle cleanup. Các model không tải lại mỗi sự kiện.
- Chế độ test demo: 0/20/50/100 AMEN, thử đủ 6 quà, chuỗi 30 quà, bật/tắt NPC, reset scene và kiểm tra không kẹt.
- Bảo toàn game logic có sẵn; không tự thay đổi gift mapping, state machine hay kết nối TikTok.
- Phải xử lý lỗi trang trắng, webGL context loss (nếu có thể), texture không load, missing asset fallback rõ ràng.
- Yêu cầu chạy lệnh npm install, npm run typecheck, npm test, npm run build; nếu môi trường không chạy được, phải báo thực tế, không tự khẳng định đã pass.
- Nếu có trình duyệt automation: chụp screenshot CHÍNH KHUNG 9:16 của (A) không có quà/đông 50 người, (B) khu nến + hoa, (C) đang chạy hiệu ứng 100 xu, (D) đang chạy 500 xu; kiểm tra ảnh để sửa bố cục/màu/đè UI.
- Đo FPS với thông số máy/viewport/mức chất lượng nếu có; không tự bịa số FPS.

### 9. TỔ CHỨC MÃ VÀ BÀN GIAO
- Bổ sung các component rõ: CathedralArchitecture, StainedGlass, ChapelLighting, Pews, CandleStation, FlowerOffering, Altar, AttendeeVisual, AttendeeLOD, ChapelFX, CameraDirector.
- Tách nguồn asset/giấy phép khỏi logic, tránh đặt hết 3D scene vào một file rất lớn.
- Cập nhật README chạy được trên Windows, route / và /control, các phím/nút test.
- Cập nhật docs/CHANGELOG_V1_2.md, docs/ASSET_LICENSES.md, tài liệu điểm hạn chế/các asset thật còn thiếu.
- Tạo PR hoặc commit vào nhánh mới phát triển từ **nhánh có code v1.1 hoàn chỉnh**, tránh ghi đè nhánh main vốn chưa có code.
- Ở cuối, trả lời bằng tiếng Việt gồm: những phần đã làm, những phần chỉ mới là fallback, danh sách file chính, ảnh preview nếu có, kết quả build/test thực tế, link PR hoặc commit và hướng dẫn mở màn hình LIVE để test.

### 10. TIÊU CHÍ CHẤP NHẬN, KHÔNG ĐƯỢC BỎ QUA
- [ ] Toàn cảnh nhà thờ đẹp, có chiều sâu, không chỉ là mô hình hình hộp đơn giản.
- [ ] Có cung thánh + bàn thờ + thánh giá + kính màu rõ và đúng bố cục.
- [ ] Hai dãy ghế gỗ đúng tỉ lệ; 50 avatar ngồi không xuyên ghế.
- [ ] Có giá nến riêng biệt nhìn rõ, nến cháy, khói nhẹ và thêm nến qua 1 xu.
- [ ] Có khu dâng hoa, hoa xuất hiện qua quà 5 xu loại hoa.
- [ ] Người đi / ngồi / đứng / quỳ mượt, không nhấp nháy, không giật và quay hướng đúng.
- [ ] Vẫn comment AMEN vào được nhà thờ, không bị clone trùng.
- [ ] Đủ 6 quà có hiệu ứng riêng, nhất là 100/500 xu rõ ràng và trang nhã.
- [ ] Camera hồi về toàn cảnh sau khi chạy quà liên tục.
- [ ] Khung 9:16 không bị UI che, control panel không lọt lên màn LIVE.
- [ ] Có chế độ Low/Balanced/High, không crash khi đông và stress test.
- [ ] Có bản build chạy được và báo cáo minh bạch về kết quả hình ảnh/thử nghiệm.

### 11. ƯU TIÊN THỰC HIỆN
Làm theo thứ tự: (1) hoàn chỉnh kiến trúc và camera -> (2) ghế + lối đi -> (3) nến + hoa -> (4) nhân vật 3D và animation -> (5) lighting/PBR -> (6) sáu FX -> (7) UI 9:16 -> (8) stress test/ảnh chụp/build.

**Hãy thực thi mã nguồn NGAY. Không chỉ lập kế hoạch. Chỉ báo hoàn tất khi đã thực sự chạy kiểm thử và có sản phẩm demo.**
