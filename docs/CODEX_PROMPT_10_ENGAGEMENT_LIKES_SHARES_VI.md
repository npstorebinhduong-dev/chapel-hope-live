# CODEX #10 – CHAPEL OF HOPE LIVE v1.8: TƯƠNG TÁC THẢ TIM / CHIA SẺ / GIỮ CHÂN / QUÀ TẶNG

## 0. NGUYÊN TẮC PHÁT TRIỂN
Hãy thực thi **mã nguồn thật** chứ không chỉ trình bày kế hoạch. Đọc AGENTS.md, CODEX_PROMPT_06, CODEX_PROMPT_07/08 nếu có, và mã trên nhánh **feat/living-crowd-camera** (v1.7 được xác nhận có package.json). Nếu nhánh mới hơn chứa đủ code và không mất tính năng thì dùng nhánh mới hơn; tạo feature branch riêng, KHÔNG làm mất bản đồ họa/animation/camera 2.5D/crowd/audio/LIVE của v1.7.

**Mục tiêu:** tăng tương tác có ý nghĩa, giữ chân khán giả và làm hoạt động quà hấp dẫn bằng cách nhận comment/like/share/follow/gift thật từ TikFinity Desktop, phản hồi thị giác nhẹ nhàng trong thánh đường, lời mời gọi tiếng Anh/Việt/Ý có giới hạn, và thống kê minh bạch.

Không dùng mẹo tạo tương tác giả, không giả số người/tim/share/quà, không dùng tiến trình quà để ám chỉ mua được phép lành hay chữa bệnh. Không ép quà/nhắc đi nhắc lại. Stream phải có người vận hành giám sát.

## 1. LUẬT GAMEPLAY CỐ ĐỊNH
- AMEN -> chỉ vào vùng đông người chờ phía dưới. Không tự vào hàng ghế dù có ghế.
- Comment 1 -> avatar NAM; comment 2 -> avatar NỮ; không hiểu 1/2 là gift.
- Chỉ gift hợp lệ từ userId đó -> được diễn hoạt đi từ hàng chờ tới zone nghi thức và ngồi nếu còn ghế.
- Giữ đúng 6 giftKey: candle_1, prayer_5, rose_5, bell_10, altar_100, ceremony_500. Hai gift 5xu ánh xạ theo **giftId khác nhau**.
- Người chưa comment AMEN nhưng tặng gift vẫn vào qua luồng hợp lệ. Khi hết ghế vẫn thực hiện FX ở điểm đứng.
- NPC không được tính là viewer/đã share/đã thả tim. Giá trị ngoài mô phỏng lấy từ sự kiện thật hoặc mock ghi rõ là mock.

## 2. TIKFINITY EVENTS / GIỚI HẠN NGUỒN DỮ LIỆU
- Tài liệu TikFinity công bố local WebSocket ws://localhost:21213/ có event: chat, gift, share, follow, like, roomUser, subscribe.
- Mở rộng adapter hiện có, **không tạo kết nối TikFinity thứ hai song song**; chỉ một event source active (Mock hoặc TikFinity LIVE).
- Dùng typed normalized events `like`, `share`, `follow`, `comment`, `gift` với `eventId`/timestamp/anonymous session id phù hợp. Không giả định schema field cố định: kiểm tra payload và tạo parse fallbacks có test fixtures.
- LIKE: event có thể chứa số lượng tim trong một batch / tổng lũy kế. Phải tính **delta thật** dựa field đáng tin cậy, event id, dedup, chống reset làm cộng sai, cap đột biến không xác minh; nếu payload không đủ dữ liệu thì ghi “LIKE COUNT UNVERIFIED”, không tăng mục tiêu giả.
- SHARE: sự kiện có thể không có count hoặc ID duy nhất; dùng idempotency/dedupe trong khoảng phù hợp, tránh lặp do reconnect. Không tăng 2 lần cùng một event. Nếu platform không cung cấp share event, disable phần phản ứng theo share (không giả lập share thật).
- FOLLOW: chào mừng ngắn và biểu tượng UI nhỏ, không làm avatar tự vào ghế, không tạo fake gift.
- Các sự kiện chat/likes/shares khi đang gift FX phải có queue ưu tiên: 500/100 gift focus > voice lời chúc > phản ứng share/like > CTA. Không làm mất dữ liệu đếm hợp lệ, có coalescing FX hình ảnh.

## 3. HEART OF HOPE – BỘ ĐẾM TIM CỘNG ĐỒNG MIỄN PHÍ
- Một thanh nhỏ “HEARTS OF HOPE” ở mép an toàn của màn hình 9:16, không che bàn thờ, cha xứ, tên người được focus hoặc bảng quà.
- Mục tiêu cấu hình từ control, mặc định 1000 tim, progress 0..goal và số tim thực tích lũy toàn session. Nếu event TikFinity không khả dụng, đừng hiện tiến độ trống như có số thực: nêu rõ “Demo” trong mock và “Waiting for live likes” trong live.
- Khi đạt mốc 1000, chỉ chạy 5–8 giây hiệu ứng cộng đồng miễn phí: dải sáng kính màu ấm hơn, nến trang trí lung linh, chuông nhẹ/hợp âm organ êm, chim bồ câu nhỏ thoáng qua cửa sổ. Reset thanh mục tiêu theo chu kỳ, nhưng lưu total session riêng.
- Anti-spam: không tạo 1000 particle hoặc voice cho 1000 likes; debounce hiệu ứng mỗi 15–30 giây và coalescing progress.
- Cho phép setting goal 250/500/1000/2000; hiệu ứng luôn free, không liên quan số xu hay quà.

## 4. SHARE THE PEACE – PHẢN ỨNG CHIA SẺ
- Mỗi sự kiện share **thực** có lời cảm ơn banner rất ngắn (tên tùy chọn, chống xếp chồng), và 1–2 bồ câu trắng bay ngang các cửa kính trên cao trong 4–6 giây. Không để chim bay che mặt hoặc va vào tượng/cung thánh.
- Mốc thử nghiệm 10 shares trong một session/chu kỳ: một đàn bồ câu nhỏ bay ở lớp hậu cảnh, ánh sáng nhẹ, chuông một tiếng. Nếu 10 shares đến quá nhanh, coalesce hiệu ứng và giới hạn trên màn hình.
- Chỉ đếm share khi nhận event đáng tin cậy; nếu không có/không rõ thông tin thì không “tự cộng”; cho phép test Mock với nhãn DEMO. Ban quản lý có thể tắt toàn bộ share visuals.

## 5. SMART VOICE HOST – KÊU GỌI AMEN, THẢ TIM VÀ CHIA SẺ
- Dùng hệ thống speech EN/VI/IT của v1.6/1.7, giữ nguyên voice availability và fallback banner-only. Không có TTS phù hợp thì không cho voice ngôn ngữ khác đọc sai.
- Thiết kế `EngagementPromptScheduler` chạy dựa trên **mức hoạt động gần đây** và trạng thái camera/audio, KHÔNG phát theo một timer lặp cứng:
  1) Khi ít comment/gift/likes/shares trong 45–60s: có thể mời “AMEN” hoặc thả tim.
  2) Nếu không có share trong ~120s và chưa phát lời mời gần đây: có thể gợi ý chia sẻ.
  3) Khi có gift đang thực hiện hoặc voice lời chúc: tuyệt đối không ngắt, không nói đè.
  4) Cooldown tối thiểu 90s giữa hai lời mời bằng GIỌNG, tối đa 3 lời mời/10 phút; có burst guard và quiet hours toggle. Đây là giá trị thử nghiệm có thể chỉnh, không cố định.
  5) Không đọc toàn bộ hướng dẫn cùng lúc, chỉ 1 câu ngắn; tránh lặp một câu hai lần liên tiếp. Có nút bật/tắt scheduler và “Play next invitation” từ control để operator chủ động.
- Bắt buộc những lời sau trong bộ đa ngôn ngữ, thêm ít nhất 4 biến thể/language cho AMEN/LIKE/SHARE:
  EN: “Welcome. Type AMEN to join the waiting line.”
  VI: “Chào mừng bạn. Hãy bình luận AMEN để tham gia hàng chờ.”
  IT: “Benvenuti. Scrivete AMEN per unirvi alla fila d’attesa.”
  EN: “If you enjoy this peaceful space, tap the heart to support our community.”
  VI: “Nếu bạn yêu thích không gian bình an này, hãy thả tim để cổ vũ cộng đồng nhé.”
  IT: “Se vi piace questo spazio di serenità, lasciate un cuore per sostenere la comunità.”
  EN: “You can share this live with someone who might enjoy a quiet moment.”
  VI: “Bạn có thể chia sẻ phiên LIVE này với người muốn có vài phút bình yên.”
  IT: “Potete condividere questa diretta con qualcuno che desidera un momento di serenità.”
- Lời mời không hứa tặng quà sẽ được may mắn, không khiến người xem thấy tội lỗi nếu không tặng.
- Khi viewer mới tặng quà, ưu tiên tên người tặng + lời chúc đúng ngôn ngữ, lời mời engagement tạm hoãn. Có audio ducking với nhạc nền và duration cap.
- Có thể phát lời giới thiệu 1 lần khi operator bắt đầu hoặc bật Live mode, không lặp vô tận mỗi viewer join. Tự nhận diện đang LIVE chỉ khi backend báo nguồn được xác nhận.

## 6. INTERACTION GUIDANCE UI – KHÁN GIẢ NHÌN LÀ HIỂU
- Tạo một hướng dẫn nhỏ/luân phiên, mỗi lần chỉ 1 thông tin:
  “Type AMEN to join”; “1 = Male · 2 = Female”; “Tap ♥ to brighten the chapel”; “Share to send a dove of peace”. Không chồng 4 banner ở màn hình.
- Gift guide 6 tier vẫn hiển thị gọn, mô tả là hoạt cảnh/đóng góp hình ảnh trong game; không đặt tiêu đề “Buy Blessings”.
- Có biểu đồ đơn giản (tùy chọn) hearts progress và share count, không chiếm quá 10–15% chiều cao khung.
- Mọi số đếm phải gắn rõ source MOCK vs LIVE. Không hiển thị số thật nếu chưa nhận event. Không cộng tim/share bằng ước đoán từ số viewer.
- Chặn tên nickname độc hại/URL, không đọc raw comment ngoài AMEN/1/2. Top supporters chỉ từ gift, không suy diễn niềm tin tôn giáo.

## 7. NÂNG CẤP ĐỂ GIỮ CHÂN KHÔNG PHỤ THUỘC GIFTS
- Một “Community Prayer Moment” **miễn phí** mỗi ~5 phút ở chế độ đang có tương tác và operator bật: cha xứ NPC cử động nhẹ/giáo dân thay đổi pose, organ chuyển đoạn, nến dịu. Cần định danh đây là hoạt cảnh ảo, không giả mạo lễ thánh thật. Nếu dồn gift, trì hoãn tới lúc camera overview.
- Chim bồ câu idle độc lập, 1–2 con thỉnh thoảng đi qua khung cửa sổ trên cao, khác đàn chim do share. Không dùng quá nhiều particle; giữ nét video khi TikTok nén.
- Thử nghiệm CTA A/B (chọn thủ công tại /control): 2 câu AMEN và 2 câu like/share khác nhau; ghi số tương tác trước/sau theo cửa sổ thời gian, KHÔNG kết luận quan hệ nhân quả khi chưa đủ dữ liệu.
- Theo dõi vận hành: real comments/AMEN, hearts, shares, follows, gifts theo tier, số người Waiting/Inside, camera interruptions, speech queue dropped, retention nếu sự kiện/tích hợp có dữ liệu; không bịa watch time hoặc conversion nếu TikFinity không cung cấp.
- Mục tiêu đo sau LIVE: AMEN per viewer, likes/minute, shares/minute, gift events/minute, % gift tiers, average event delay (không nhất thiết có unique viewer denominator đáng tin cậy thì ghi null).

## 8. CONTROL PANEL – CẤU HÌNH TƯƠNG TÁC & TRƯỜNG HỢP LỖI
- Tab mới “Engagement”: scheduler ON/OFF, language, voice test 3 ngôn ngữ, voice cooldown (default >=90s), prompt inactivity thresholds (45–60s AMEN/like; 120s share), quiet mode.
- Goal config hearts 250/500/1000/2000; share milestone 5/10/20, bật/tắt dove, toggles idle animations. Tất cả settings update live không reset event/game.
- Nút test riêng Mock Like (1, batch 100), Mock Share, Mock Follow, Demo heartbeat challenge, Simulate no activity 60s, Preview CTA EN/VI/IT. Không cho kích hoạt fake LIVE counters bằng mock khi nguồn live đang active (đánh dấu DEMO).
- Hiển thị “TikFinity: CONNECTED” khi socket kết nối, “LIKE/SHARE RECEIVED” chỉ khi nhận event thật. Expose diagnostics parsed count/rejected/malformed/duplicate/unknown.
- Pause các lời mời khi OBS/LIVE Studio không có nguồn âm phù hợp; preflight warning. Giữ nút stop audio khẩn cấp.
- Nếu TikFinity disconnect: không tự cộng hearts/shares, CTA giọng có thể ngừng hoặc về mode local demo được operator chọn, KHÔNG âm thầm giả mạo.
- Không có share data thì có thể vẫn hiển thị lời mời chia sẻ ở khoảng cách hợp lý, nhưng không dựng “x shares” giả hay effect được kích hoạt bằng share tưởng tượng.

## 9. KIỂM THỬ & BÀN GIAO
- Chạy npm ci, npm run typecheck, npm test, npm run build; Playwright/browser test nếu chạy được.
- Thử TikFinity replay events: 100 likes bằng 1 batch, like cumulative 110 rồi 130 -> +20, duplicate event -> 0, reset count -> không âm, malformed payload -> không crash.
- Test 1 share -> 1 bồ câu + 1 acknowledgement; repeated event id -> không tăng; 10 shares -> đàn bồ câu một lần, rate limit.
- Test inactivity 60s -> 1 invitation, gift đang zoom -> scheduler hoãn; 500 gift + CTA -> âm không chồng, camera không kẹt; voice thiếu locale -> banner only; <=3 lời thoại CTA/10 phút.
- Test 50 AMEN + 5 gift -> 45 waiting/5 inside (sau khi hoàn tất hành trình); 100 AMEN + 20 gift; comments 1/2 không đếm gift. 6 giftKey vẫn làm đúng visual+voice.
- Test mock và live trong control; chỉ claim “LIVE VERIFIED” nếu có phiên real TikTok và nghe/thấy cả like/share/gift trên nguồn capture; nếu không chỉ nói mock/replay validated.
- Stress 1000+ like events hợp nhất 1 FX, 100+ share, 50 gift: FPS, memory, voice queue và frame rate phải ổn; đo hoặc ghi chưa đo, không bịa.
- Chụp ảnh 9:16: heart bar 30% và 100%, đàn chim share, CTA subtitle, hàng chờ đông, 100/500 gift FX. Có video/record nếu test playback có thể làm.
- Bàn giao docs/CHANGELOG_V1_8.md, docs/ENGAGEMENT_PLAYBOOK_VI.md, mock fixtures, tests, ảnh thật nếu có, và README cập nhật.
- Báo cáo bằng TIẾNG VIỆT: branch, commit/PR, cái gì làm được, cái gì chưa thể xác minh trên Windows LIVE, source và giới hạn Like/Share fields, cách test Like/Share & CTA, kết quả build/test.

## 10. TIÊU CHÍ CHỐT
- Thả tim & chia sẻ thật có thể làm game thay đổi hình/tiếng qua TikFinity (nếu payload được xác minh).
- Không có gift vẫn có hoạt động bình an, lời mời có chừng mực, không spam giọng.
- Không làm mất trọng tâm thánh đường và 6 mốc quà, không chồng banner/camera/voice.
- AMEN không tự vào ghế; 1/2 chỉ đổi nam/nữ; gift hợp lệ mới vào lễ đường.
- Không bịa số liệu LIVE, không giả thông báo share, không coi NPC là người xem, không gây áp lực tâm linh để kiếm gifts.
- Code chạy được trên Windows theo launcher sẵn có, ghi trung thực trạng thái LIVE verification.

**HÃY BẮT ĐẦU CODE, SỬA LỖI, TEST VÀ BÀN GIAO — KHÔNG DỪNG Ở KẾ HOẠCH.**
