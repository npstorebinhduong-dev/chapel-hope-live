# LỆNH CODEX #06 – SỬA LOGIC AMEN / HÀNG CHỜ / CHỌN NAM NỮ / VÀO LỄ ĐƯỜNG BẰNG GIFT

## QUYẾT ĐỊNH MỚI NHẤT CỦA CHỦ DỰ ÁN – BẮT BUỘC ÁP DỤNG

Đây là thay đổi được chốt SAU các prompt và TECH_SPEC_V1 cũ. Đối với logic AMEN, ưu tiên đặc tả này khi có xung đột với tài liệu trước. Đọc AGENTS.md, code hiện có và toàn bộ cơ chế attendee, queue, animation, gift, camera trước khi sửa. **Tiếp tục trực tiếp trên nhánh có mã game 2.5D mới nhất, ưu tiên feat/chapel-live-2-5d nếu đúng là nhánh hoàn thiện nhất; không tạo game mới hoặc làm mất các thay đổi mỹ thuật hiện có.** Không được dừng ở bản mô tả.

### 1. LUẬT GAMEPLAY KHÔNG ĐƯỢC HIỂU NHẦM

**A. Người xem bình luận AMEN → CHỈ VÀO HÀNG CHỜ.**
- Avatar xuất hiện trong một hàng chờ ở phía dưới màn hình dọc 9:16 / khu tiền sảnh ngay phía sau các dãy ghế.
- Avatar được xếp đứng theo slot, tên TikTok có thể nhìn thấy, chuyển động đứng chờ mềm: thở, nhích vai, nhìn quanh nhẹ, dịch chuyển tiến một bước khi hàng cập nhật.
- Bình luận AMEN TUYỆT ĐỐI KHÔNG ĐƯỢC tự động gọi avatar đi vào lễ đường, không đặt avatar lên ghế, không chiếm seat, kể cả đang có rất nhiều ghế trống.
- Việc đi vào khu ghế hoặc bắt đầu hành trình dâng quà chỉ được kích hoạt bởi **sự kiện gift thật hoặc mock gift** gắn đúng userId; bình luận văn bản chứa từ "gift", "rose", "quà" hay "1"/"2" tuyệt đối không phải gift event.
- Free AMEN là tham gia không gian cầu nguyện ảo ở hàng chờ, không hứa hẹn phước lành/đáp lời cầu nguyện khi tặng quà. Quà chỉ mở một hành động/đường di chuyển mang tính hình ảnh trong game.

**B. Bình luận 1 = NAM, bình luận 2 = NỮ.**
- Dùng text được trim và match chính xác "1" hoặc "2" (không xử lý chuỗi khác như "12" hay "10"). So khớp theo userId, không theo username hiển thị.
- Nếu avatar đang ở hàng chờ: cập nhật model/outfit/hair nam hoặc nữ cùng vị trí và trạng thái; chuyển thay đổi ngoại hình an toàn, tránh pop/nhấp nháy/chớp sáng hoặc tạo thêm avatar.
- Nếu viewer comment 1/2 TRƯỚC AMEN: lưu lựa chọn cho phiên hiện tại, đến khi AMEN thì spawn đúng giới tính đã chọn.
- Nếu viewer chưa từng AMEN, comment 1/2 chỉ lưu lựa chọn, KHÔNG tự sinh avatar, KHÔNG gọi vào nhà thờ.
- Nếu viewer đã vào ghế: cập nhật avatar khi không ở giữa animation quan trọng hoặc chuyển đổi mượt khi an toàn; không reset seat, không đẩy về hàng chờ, không mất event gift.
- Nếu chưa chọn: có thể random nam/nữ cho avatar mặc định nhưng KHÔNG suy luận giới tính thật từ nickname, ảnh hay thông tin cá nhân.
- Bình luận 1/2 tuyệt đối không được kích hoạt loại quà có giá 1/2 xu; hệ thống gift chỉ nhận sự kiện từ adapter/mock có type = gift và giftKey chính xác.

**C. Khi viewer GỬI QUÀ → nhân vật mới được BƯỚC VÀO LỄ ĐƯỜNG.**
- Tìm đúng attendee bằng userId. Nếu đang đứng chờ, đánh dấu được mời vào (invited_by_gift), giải phóng vị trí chờ rồi điều khiển avatar đi theo lối hợp lý.
- Luồng hình ảnh: đứng chờ → được gọi → bước ra khỏi hàng → đi theo lối giữa → tới vị trí thích hợp để thực hiện hành động quà → ngồi vào ghế nếu có ghế hợp lệ. Với quà 1/5/10 có thể ưu tiên hành động ở zone phù hợp, với 100/500 cho camera focus/khu vực trước cung thánh. Không được chạy xuyên ghế, giá nến, tượng hoặc bàn thờ.
- Khi GHẾ ĐẦY: vẫn tiếp nhận và phát hiệu ứng quà cho người đó bằng điểm đứng cầu nguyện ở lối bên/hậu sảnh bên trong; chưa được chiếm seat của người khác; có thể vào danh sách ưu tiên ghế trống về sau. Tuyệt đối không để gift biến mất hoặc avatar chồng lên ghế.
- Nếu người gửi quà KHÔNG COMMENT AMEN TRƯỚC: tạo attendee đúng userId, đi qua điểm xuất phát/hàng chờ thật ngắn rồi chuyển theo luồng gifted; không bắt người tặng phải comment AMEN lại.
- Nếu viewer đã ở trong nhà thờ và tặng thêm quà: giữ một avatar, phát các hành động tương ứng, gia hạn thời gian ở lại; không đưa về hàng chờ hay sinh avatar thứ hai.
- Khi nhiều gift cùng lúc: xếp gift actions theo eventId và priority có kiểm soát, bảo đảm ai đã tặng cũng được xử lý; nếu cùng một gift event bị gửi lặp thì dedupe. Streak/repeatCount phải được xử lý theo contract adapter chứ không cộng nhầm. Hai quà 5 xu vẫn là hai giftKey riêng.

### 2. STATE MACHINE ĐỀ XUẤT

NONE → WAITING_SPAWN → WAITING_IDLE → (khi gift) CALLED_BY_GIFT → WALKING_FROM_QUEUE → WALKING_IN_AISLE → GIFT_ACTION → SEATED_OR_PRAYING_IDLE.

Nếu hết ghế: GIFT_ACTION → INSIDE_STANDING_WAIT → SEATED khi có chỗ.

Khi viewer không tặng: WAITING_IDLE chỉ được chuyển sang WAITING_IDLE / đổi giới tính / hết hạn phiên chờ → LEAVING. **Không tồn tại nhánh WAITING_IDLE → WALKING_TO_SEAT nếu không có gift hợp lệ.**

Viewer đã vào lễ đường: SEATED_OR_PRAYING_IDLE → GIFT_ACTION → RETURNING_TO_SEAT. Khi hết thời gian tham dự thì LEAVING.

Các mốc thời gian cấu hình được, ưu tiên giữ 10 phút sau lần tương tác cuối cho session chờ và session ngồi; khi TTL hết, nhân vật ra khỏi scene một cách tự nhiên chứ không nhảy vào ghế. Không dùng timer dài không cleanup.

### 3. HÀNG CHỜ 2,5D Ở PHÍA DƯỚI

- Hàng chờ được nhìn thấy rõ dưới cùng, bên dưới khu ghế và phía trước camera, nhưng không che mất bàn thờ, cha xứ, giá nến hay bảng quà.
- Dùng một hoặc hai hàng đứng với đường đi rõ, slot spacing theo tỷ lệ model; avatar gần lớn hơn, xa nhỏ hơn phù hợp phối cảnh. Tên người xem ở trên avatar, có logic chống chồng nickname.
- Tối đa khoảng 12–20 người hiển thị chi tiết ở vùng chờ; người vượt quá số này vẫn được lưu logic trong hàng chờ, UI hiện "+N waiting"; không bỏ sự kiện và không spawn chồng.
- Cơ chế FIFO để xếp vị trí chờ/điều chỉnh hàng khi người đầu rời đi. Tuy nhiên KHÔNG tự động gọi người chờ lên ghế dù có chỗ trống: điều kiện vào lễ đường là gift của chính userId đó.
- Khi một người gửi quà, chỉ avatar của người đó rời hàng chờ và hàng chờ còn lại lấp vị trí trống bằng dịch chuyển mượt, không dịch chuyển tức thời.
- NPC nền trong ghế luôn được phân biệt với số người dùng thực; top supporter chỉ gồm người gửi quà thật/mock.

### 4. BẢO TOÀN 6 QUÀ VÀ HIỆU ỨNG ĐÃ XÂY

- candle_1 (1 xu): vào trong, thắp nến ở giá nến riêng.
- prayer_5 (5 xu): vào trong, đứng/quỳ cầu nguyện.
- rose_5 (5 xu): vào trong, dâng hoa trắng.
- bell_10 (10 xu): vào trong, chuông + chuyển động cầu nguyện nhóm.
- altar_100 (100 xu): vào trong, điểm cầu nguyện gần cung thánh, camera focus.
- ceremony_500 (500 xu): vào trong, hiệu ứng tập thể trang nghiêm, camera + ánh sáng + banner.

Giữ các chuyển động và âm thanh bản trước; FX phải bắt đầu hợp lý sau khi nhân vật đã tới zone tương ứng, tuyệt đối không làm avatar teleport tới bàn thờ. Không cho gift 1 xu và comment "1" dùng chung điều kiện.

### 5. GIAO DIỆN

- Ở phần trên hoặc dải mảnh gần khu chờ hiển thị tiếng Anh dễ hiểu:
  "Type AMEN to join the waiting line"
  "Type 1 = Male | 2 = Female"
  "Send a gift to enter the chapel"
- Chữ không quảng cáo quá mức, không gợi ý gửi tiền thì cầu nguyện mới có hiệu lực. Giữ nhãn "Virtual chapel experience".
- Số lượng thật: Waiting (đang chờ) / Inside (đã vào) / NPC (không tính vào số viewer).
- Bảng điều khiển /control phải có nút giả lập "AMEN", "1 Male", "2 Female", gift cho user chỉ định, full-seat, burst AMEN; cho phép quan sát trước và sau gift.
- LIVE route / không được lộ nút debug.

### 6. IMPLEMENTATION CHI TIẾT

- Xác định chính xác event router đang xử lý comment AMEN / gift. Ngắt mọi logic hiện tại tự động gọi người comment AMEN từ hàng chờ vào seat.
- Tách rõ trạng thái audience/waitingQueue với seated/inside. SeatAllocator chỉ chạy khi attendee hợp lệ được thăng cấp bởi gift, không chạy khi bình luận AMEN.
- Xử lý đồng bộ/atomic giữa việc giải phóng waitingSlot và giữ seat để không sinh trùng khi 2 event tới sát nhau.
- Nếu nhân vật thay model nam/nữ, giữ immutable userId, world position, target, animation state và seatId; hỗ trợ fallback khi asset thiếu, tránh blank.
- Bất kỳ trạng thái nào bị lỗi (không tìm được path/model/seat) phải có phương án fallback an toàn và không làm hàng chờ kẹt.
- Không tăng thời lượng cảnh FX quá mức khi burst gifts; camera luôn có timeout trở về overview.
- Thêm log/debug metric chính xác: waitingCount, insideCount, seatedCount, giftPending, giftProcessed, ignoredDuplicates, avatarVariantByUser.

### 7. TEST BẮT BUỘC (TỰ ĐỘNG + KIỂM TRA TRÊN MÀN HÌNH)

1. A comment AMEN 1 lần: exactly một avatar ở hàng chờ, không ghế.
2. A comment AMEN 3 lần: vẫn một avatar, không ghế, gia hạn TTL.
3. A comment 1 rồi AMEN: đứng chờ là nam. B comment 2 rồi AMEN: đứng chờ là nữ.
4. A đổi 1 → 2 → 1 khi đang chờ: đúng model cuối, không spawn trùng hoặc chớp.
5. A chỉ comment 1/2: không avatar, không gift.
6. A đã AMEN, 20 giây sau không gift dù còn ghế: vẫn đứng chờ.
7. A tặng 1 xu: chỉ A rời hàng, thực hiện nến và vào chỗ nếu có.
8. B tặng 5 xu prayer, C tặng 5 xu rose: hai animation/FX khác nhau, không đọc nhầm comment 1/2.
9. D chưa AMEN nhưng gửi gift: xuất hiện và được vào lễ đường, không bị lỗi.
10. A đã vào rồi tiếp tục tặng 100/500: cùng một avatar, camera focus trả overview.
11. Nhà thờ full ghế, E gửi gift: FX vẫn chạy, không trùng seat/khóa queue.
12. 50 AMEN + chỉ 5 người gift: đúng 5 người viewer đi vào, 45 người còn chờ (trừ TTL hoặc quy tắc điều chỉnh đang test); NPC không tính.
13. 100 AMEN + 20 gift liên tiếp: không crash, không bỏ gift, hàng chờ không chồng hình.
14. Test trên khung 9:16: hàng chờ nằm bên dưới nhưng không che bàn thờ/cha xứ, đủ khoảng trống để tên và avatar.
15. Test âm thanh/animation khi gọi người đi từ hàng chờ → lễ đường, không foot sliding quá mức hay chuyển pose nhấp nháy.

### 8. BÀN GIAO

- Chỉnh sửa mã nguồn thật, không dừng ở bản kế hoạch.
- Có test cho parser bình luận (AMEN / 1 / 2 / other), chuyển trạng thái chỉ do gift, dedupe theo userId/eventId, queue slot/seat, gifting before AMEN, full-seat, burst, gender switch.
- Chạy npm run typecheck, npm test, npm run build và browser smoke nếu được; báo kết quả THẬT, không tự nhận pass.
- Nếu trình duyệt hỗ trợ, chụp screenshot 9:16 của: (a) 20 AMEN chỉ đứng chờ, (b) sau 5 gift chỉ 5 người vào lễ đường, (c) đổi gender trong queue, (d) quà 100/500.
- Cập nhật README và docs/CHANGELOG_QUEUE_LOGIC.md, ghi rõ new rule đã thay thế logic cũ.
- Tạo branch/PR theo quy trình hiện tại, tránh ghi đè công việc Codex chưa commit; báo bằng tiếng Việt.
