# CODEX #11 – CHAPEL OF HOPE LIVE v1.9
## BẢNG HƯỚNG DẪN LIVE + CONTROL PANEL 100% TIẾNG VIỆT + TỐI ƯU TOÀN BỘ ÂM THANH

**ĐỌC TRƯỚC KHI CODE.** Đây là lệnh tiếp nối các nhiệm vụ #06, #08, #10. Đọc `AGENTS.md`, `docs/CODEX_PROMPT_06_AMEN_WAIT_GIFT_ENTRY_GENDER_VI.md`, `docs/CODEX_PROMPT_08_PRODUCTION_LIVE_FX_VOICES_WINDOWS_VI.md`, `docs/CODEX_PROMPT_10_ENGAGEMENT_LIKES_SHARES_VI.md` và kiểm tra code thật trên `feat/living-crowd-camera` (đã kiểm thấy code v1.7). Nếu task #10 đã có code trên nhánh mới hơn, hãy dùng nhánh đó; nếu #10 chỉ là spec, HÃY TRIỂN KHAI cùng các hạng mục trong task #11, không chỉ tạo UI giả. Tạo nhánh phát triển riêng, không ghi đè các nhánh có code khác, không tạo ứng dụng từ đầu. Đích là ứng dụng Windows + TikTok LIVE Studio/TikFinity test được; nếu chưa thể kiểm chứng LIVE thật, phải báo giới hạn chính xác.

### 1. MỤC TIÊU CUỐI CÙNG
- Khán giả châu Âu nhìn khung dọc 9:16 hiểu ngay cách tham gia miễn phí, chọn nam/nữ, thả tim, chia sẻ, xem sáu hoạt cảnh quà.
- Hệ thống tim và chia sẻ có phản hồi hình ảnh thật khi adapter nhận được event hợp lệ, và hoạt cảnh công cộng/idle không có gift vẫn sinh động, **không giả mạo số liệu**.
- **Toàn bộ trang quản trị `/control` chuyển sang TIẾNG VIỆT** gồm menu, nhãn nút, placeholder, trạng thái, tooltip, lời nhắc, lỗi, popup xác nhận, biểu đồ, hướng dẫn test, mapping quà, preflight, danh sách giọng, kết quả test. Không còn chữ Anh dài khó hiểu; các thuật ngữ kỹ thuật như TikFinity/WebSocket/ID/OBS có thể giữ nhưng phải giải thích bằng tiếng Việt.
- **Màn hình LIVE `/` vẫn đổi giữa English / Tiếng Việt / Italiano** theo lựa chọn, tách khỏi ngôn ngữ quản trị; chuyển ngôn ngữ phát không làm bảng điều khiển quay lại tiếng Anh.
- Nhạc nền, môi trường, SFX, lời chúc và lời cảm ơn cần **hay hơn, nghe tự nhiên hơn, có nhịp, phân tầng**, không chồng tiếng và không bỏ qua nội dung người tặng.

### 2. BẢNG HƯỚNG DẪN LIVE – ĐẸP, RÕ, KHÔNG CHE CẢNH
Thiết kế HUD hướng dẫn riêng theo phong cách nhà thờ châu Âu: tấm kính màu mờ / parchment cream translucent + viền vàng đồng mảnh, text màu có tương phản cao, icon nhỏ cùng phong cách, tránh neon, tránh banner to quá mức. Tối ưu cho điện thoại sau TikTok nén. Đảm bảo cha xứ, bàn thờ, cửa kính, người được focus, hàng chờ không bị che; thiết lập safe areas 9:16, tránh vị trí các overlay mặc định của TikTok.

Cần **3 nhóm thông tin** có bố cục gọn, có thể luân phiên:
A. **Tham gia miễn phí**: 
  - EN: “Type AMEN to join the waiting crowd”
  - VI: “Bình luận AMEN để vào hàng chờ”
  - IT: “Scrivi AMEN per unirti alla fila d’attesa”
  - Dòng 2: “1 = Male · 2 = Female” / “1 = Nam · 2 = Nữ” / “1 = Uomo · 2 = Donna”
B. **Tương tác miễn phí**:
  - tim: icon ♥ + thanh Heart of Hope gọn (mốc thử nghiệm 1000, tùy chỉnh qua /control), đủ mốc -> ánh sáng/nến/chuông nhẹ
  - chia sẻ: icon share hoặc chim bồ câu + lời hướng dẫn “Share this LIVE” theo locale, nhận sự kiện thật -> chim trắng qua khung cửa kính; cột mốc 10 share -> đàn chim nhỏ; không cho chim che bàn thờ/người.
C. **Sáu quà tương tác**: liệt kê rõ:
  1 xu – Nến (candle_1)
  5 xu – Cầu nguyện (prayer_5)
  5 xu – Hoa trắng (rose_5)
  10 xu – Chuông (bell_10)
  100 xu – Cầu nguyện đặc biệt (altar_100)
  500 xu – Khoảnh khắc đại lễ (ceremony_500)
  Với UI EN/IT, dịch nhãn tương ứng. Icon phải phân biệt dễ nhận trên LIVE (nến, chắp tay, hoa, chuông, ánh sáng, nghi thức cộng đồng).
  **Không giả tên quà TikTok**: đây là tên hành động trong game, không phải tên của Gift trên TikTok. Hiển thị tên/icon/giá tiền quà TikTok thật trong thanh quà CHỈ sau khi verified mapping theo giftId trên tài khoản/market. Nếu chưa map, hiển thị mốc hoạt động “1/5/5/10/100/500 coins” và chỉ rõ trong control là “Chưa ánh xạ quà thật”.
  Giữ hai mốc 5 xu khác nhau theo giftId, không nhập làm một.

Thiết kế HUD: các nhóm có thể xoay luân phiên 8–12 giây, nhưng hướng dẫn AMEN luôn truy cập được (không cần liên tục che hình bằng nhiều bảng); người xem mới hiểu ngay trong vòng vài giây đầu. Có nút preview và cấu hình bật/tắt/độ mờ/scale/vị trí/chu kỳ trên /control. Có “chế độ camera đang focus quà”: HUD tự thu nhỏ/mờ các thành phần không quan trọng, nhưng vẫn đọc được.
Các chỉ số Waiting/Inside/Hearts/Shares phải lấy từ dữ liệu thật hoặc mock nhãn DEMO. Không tự điền những con số để làm giả đông người; NPC chỉ là nền, không nằm trong số người xem thực.

### 3. CONTROL PANEL CHUYỂN SANG TIẾNG VIỆT 100%
Thiết kế lại trang `/control` với menu điều hướng 6 nhóm:
1) “Tổng quan” – số đang chờ, người trong lễ đường, sự kiện đã xử lý, trạng thái máy phát, FPS khi đo được.
2) “Kết nối LIVE” – chọn “Giả lập / TikFinity thực”, “Kết nối / Ngắt kết nối / Thử lại”, trạng thái “Đang kết nối / Đã kết nối WebSocket / Đang nhận sự kiện / Mất kết nối”, lịch sử sự kiện không lộ userId nhạy cảm, chẩn đoán kết nối.
3) “Quà tặng & Hiệu ứng” – bảng ánh xạ 6 quà thật với các cột “Loại hoạt động / Số xu dự kiến / ID quà TikTok / Tên quà TikTok / Trạng thái / Thử hiệu ứng”, nút thử 6 mốc và kiểm tra combo, điều chỉnh camera và chất lượng FX.
4) “Âm thanh & Lời chúc” – chọn “Ngôn ngữ phát: Anh / Việt / Ý”, voice đúng locale, “Nghe thử”, “Tắt/Bật lời chúc”, “Bật/Tắt lời cảm ơn”, “Bật/Tắt nhạc nền”, “Âm lượng tổng / Nhạc nền / Môi trường / Hiệu ứng / Giọng đọc”, slider và đồng hồ mức âm.
5) “Tương tác cộng đồng” – tim và mốc tim (250/500/1000/2000), chia sẻ và mốc chia sẻ, bồ câu, hoạt cảnh cầu nguyện miễn phí, lời nhắc AMEN/tim/share và cooldown/công tắc, xem trước banner hướng dẫn (không gợi ý mua quà để được cứu rỗi).
6) “Kiểm thử & Cài đặt” – mô phỏng 20/50/100 AMEN, chọn nam/nữ, quà, lượt tim (1/100/batch), chia sẻ, no-interaction 60/120s, reset phiên, chế độ đồ họa Low/Cân bằng/Cao, kiểm tra sẵn sàng LIVE, thông báo rõ trạng thái.
Tất cả thông báo/toast/lỗi/confirm, cả lỗi socket hoặc thiếu giọng TTS phải dịch sang tiếng Việt và có gợi ý xử lý. Tooltips giải thích `LIVE verified` và `Mock/demo`. Không dịch các định danh mã nguồn và thông số kỹ thuật làm hỏng mapping.
Sử dụng một từ điển `adminLocales/vi` hoặc tương đương; tách adminLocale = vi khỏi `liveLocale`. Khi thêm string mới chỉ chỉnh từ điển, không hardcode rải rác. Chữ tiếng Việt hiển thị đủ dấu, tránh lỗi font và tràn nhãn. Responsive hoạt động ở 1366x768 và laptop nhỏ, có thể cuộn nhóm nếu nhiều tùy chỉnh.
Lưu cài đặt UI/âm thanh ở local config an toàn (ví dụ localStorage chỉ settings, KHÔNG lưu nick/id người xem hoặc suy đoán tôn giáo). Nút “Khôi phục cấu hình mặc định”, có confirm tiếng Việt. Không tự bật LIVE/GO LIVE.

### 4. TỐI ƯU MUSIC: NGHE NHƯ NHẠC NỀN NHÀ THỜ CHỨ KHÔNG PHẢI PAD LẶP MỘT NỐT
- Kiểm tra chính xác audio manager/mixer hiện có trước khi thay đổi. Duy trì hệ thống 5 bus Master/Music/Ambient/SFX/Voice đã có, thêm limiter/compressor chống vỡ tiếng phù hợp nhưng không bóp nát động lực.
- Nhạc nền original hoặc properly licensed: organ nhẹ, piano mềm, choir pad thoáng (nếu có quyền), giai điệu **nguyên tác**, có tiến triển hòa âm, 2–3 biến thể loop để tránh lặp khó chịu. Không phát nhạc có bản quyền chưa được phép. Nếu chỉ synth bằng WebAudio thì phải cải thiện cách hòa âm, reverb, nhịp và dynamics, ghi rõ là nhạc tổng hợp chứ không phải bản thu organ thật.
- Chọn/đổi track hoặc playlist nền qua control, thay bài ở điểm nhạc phù hợp, crossfade 0.5–2 giây, không “click”/khoảng lặng. Giữ nhạc nhẹ cho livestream dài, không che lời chúc. Tránh autoplay không có thao tác người dùng.
- Đặt mức music thấp hơn voice; khi lời chúc/cảm ơn hoặc CTA phát, music tự duck khoảng 9–12dB với fade mềm 200–500ms và restore 0.8–1.5s; không bị reset volume khi hai voice nối nhau.
- Ambient nhà thờ êm (room tone, tiếng không gian) không ù nền; không fake tiếng đám đông quá lớn hoặc giả vờ có người thật.

### 5. TỐI ƯU SFX ĐỒNG BỘ ĐỒ HỌA
- Kiểm tra danh mục âm thanh hiện có, tạo cue rõ cho: avatar xuất hiện hàng chờ, bước chân (rate limited), mở/đóng ghế nhẹ, quỳ, nến châm lửa, đặt hoa, chuông, bồ câu lướt gió, mốc 100, đại cảnh 500.
- Các quà nhỏ dùng FX êm, gần âm vật thật; quà 100 có chuông nhẹ + organ swell; quà 500 có chuông lớn + hợp xướng nguyên tác hoặc licensed, tạo cao trào tinh tế. Không dùng âm thanh game arcade.
- Trigger âm theo marker timeline thật (khi tay đến nến/hoa, khi chuông vào frame), không bắn ở lúc event mới tới mà avatar còn đứng chờ. Random micro-variation âm bước chân tránh lặp, volume tùy khoảng cách/tầm nghe của camera nếu dễ làm.
- Voice limiter: max simultaneous voices cho SFX, tránh khi 100 likes thì 100 sound trùng; duy nhất 1 hiệu ứng khi đạt mốc tim/share thay vì hiệu ứng cho mọi event.
- Kiểm tra đầu ra Browser Window Capture/TikTok LIVE Studio: xác minh nhạc, giọng, hiệu ứng không bị phát trùng bởi hai tab/Browser Source + desktop audio. Có nút “Kiểm tra tất cả âm thanh” và meter hiển thị âm lượng từng bus.

### 6. LỜI CẦU CHÚC VÀ LỜI CẢM ƠN – 3 NGÔN NGỮ CHẤT LƯỢNG CAO
- Dùng EN / VI / IT, mỗi locale có lời cầu chúc từng mốc quà và lời cảm ơn khác nhau, không đọc y hệt cho 1xu và 500xu; tối thiểu 3 câu chúc + 2 câu cảm ơn mỗi giftKey mỗi locale, nhưng lời cảm ơn nên ngắn gọn và có cơ chế **kết hợp/luân phiên** với lời chúc chứ không bắt buộc đọc cả hai khi quà liên tiếp.
- Bổ sung câu chào dành cho AMEN / tim / share / follow với rate limit riêng; không đọc tên mọi người liên tục khi hàng chờ rất đông.
- Những ví dụ cần có, với bản dịch tự nhiên, kiểm duyệt văn phong Công giáo châu Âu nhưng KHÔNG giả danh cha xứ thật hoặc lời hứa phép màu:
  + EN gratitude: “Thank you for being part of this moment of peace.”
  + VI gratitude: “Cảm ơn bạn đã cùng chia sẻ khoảnh khắc bình an này.”
  + IT gratitude: “Grazie per condividere con noi questo momento di pace.”
  + EN prayer: “May peace and hope accompany you and your family.”
  + VI prayer: “Cầu chúc bạn và gia đình luôn bình an, nhiều hy vọng.”
  + IT prayer: “Che la pace e la speranza accompagnino te e la tua famiglia.”
  + EN share: “You can share this peaceful moment with someone you care about.”
  + VI share: “Bạn có thể chia sẻ khoảnh khắc bình yên này với người mình quan tâm.”
  + IT share: “Puoi condividere questo momento di serenità con una persona cara.”
- Giọng đọc phải chọn voice **cùng ngôn ngữ**, không lấy voice tiếng Anh đọc câu Việt/Ý. Tìm đúng locale bằng `voiceschanged`, trạng thái voice readiness rõ trên control; hỗ trợ recorded voice clips hợp pháp cho EN/VI/IT; không tự gọi API TTS cloud mất phí.
- Nếu không có voice tương ứng, có banner phụ đề đúng ngôn ngữ và lỗi rõ trên control, tránh robot đọc sai. Nút test giọng độc lập từng locale, chọn tốc độ, ngắt/tiếp tục đúng event.
- `SpeechDirector`: chỉ 1 voice active, ưu tiên gift 500/100 > lời chúc khác > lời cảm ơn chung > CTA (có fairness và timeout), không đọc đè, coalesce lời quà nhỏ khi quá nhiều, giọng lớn không chặn camera/game. Text banner đi cùng active voice, fade hợp lý và không che bàn thờ.
- Tên tài khoản: lọc Unicode bất thường, URL, từ nhạy cảm; mặc định chỉ hiện text và không đọc username quá dài, cho phép operator bật đọc tên tùy chọn. Không lưu profile tôn giáo.
- Lời kêu gọi AMEN/tim/share **có kiểm soát** theo spec #10: chỉ khi ít tương tác, cooldown tối thiểu 90 giây giữa hai lời mời đọc, tối đa 3 lần/10 phút; đang gift hoặc prayer ceremony thì trì hoãn. Cho operator tắt ngay hoặc điều chỉnh. Không ép người xem tặng quà.

### 7. HIỆU ỨNG TƯƠNG TÁC TIM / SHARE / AMEN CẦN TẠO RA PHẢN HỒI THẬT
- Adapter TikFinity hiện có phải nhận event LIKE/SHARE/FOLLOW đáng tin cậy và đưa vào engine; mock phải có nhãn demo.
- LIKE: sử dụng số delta thật, khử duplicate, không tự đoán. Hiển thị Heart of Hope progress; mốc mặc định 1000 tim -> dải kính màu lung linh, ngọn nến ấm, bell ngắn, không che màn hình.
- SHARE: share thật -> một bồ câu trắng bay qua hậu cảnh + banner cám ơn, mốc 10 shares -> vài bồ câu bay nhóm, không gọi quà hoặc đưa avatar vào ghế.
- AMEN: chỉ vào khu chờ, 1/2 chọn model nam nữ; share/like không cấp ghế và gift mới vào lễ đường.
- Community Prayer Moment mỗi ~5 phút miễn phí, chỉ hoạt cảnh NPC nhẹ và nhạc, không ngụy trang thành thánh lễ thật, không chen vào gift lớn.
- Hướng dẫn, giọng mời và hiệu ứng phải cùng hiện đúng trạng thái, tránh “tap heart 1000” nhưng không nhận được like event mà vẫn chạy FX không đúng.
- Cơ chế like/share/kêu gọi **cần có tác dụng trong code**, không phải 3 nút đứng yên trong UI.

### 8. HIỆU NĂNG, ĐỒ HỌA, UI QUÀ VÀ LIVE
- Giữ stage đẹp 2,5D, camera focus quà vào cả avatar+bối cảnh rồi restore; tránh zoom kiểu chỉ scale một sprite. Nhân vật và đám đông đứng chờ ảo giác chiều sâu, không giới hạn số người theo cơ chế không giới hạn LÝ THUYẾT trong logic nhưng phải có cap bộ nhớ/render có thể cấu hình; nếu vượt sức chứa, giữ count/queue server hợp lệ, không crash/hủy event, LOD/impostor và hiển thị `+N` minh bạch.
- Giữ màn 9:16 nét; guide panel có độ mờ nhưng chữ, icon đủ tương phản để xem qua livestream, không che cha xứ, bàn thờ, hàng nến, khu chờ, nhân vật focus.
- LIVE mode không được hiển thị nút điều khiển admin; control panel tiếng Việt chỉ chạy `/control`. Keep LIVE locale dynamic, adminLocale fixed vi.
- Không tự tuyên bố LIVE VERIFIED nếu chưa test TikFinity + Studio với gift/like/share thật và âm thanh capture trên Windows.
- Mọi nguồn âm và mô hình phải do dự án tạo hoặc được cấp quyền phù hợp; ghi xuất xứ và giấy phép.

### 9. CÁC TEST CHẤP NHẬN BẮT BUỘC
1. `npm ci`, `npm run typecheck`, `npm test`, `npm run build` và browser smoke/production khi hỗ trợ. Ghi kết quả thực và các lỗi đã sửa.
2. UI Control: mở `/control`, toàn bộ chữ dễ đọc bằng tiếng Việt (kể cả tooltip, lỗi, lựa chọn voice/tier/connection), không tràn dòng 1366x768; chuyển Live EN/VI/IT không đổi control ngôn ngữ.
3. Thử hướng dẫn LIVE cả EN/VI/IT; bảng quà có 6 loại, icon rõ, 2 mốc 5xu khác nhau, safe areas trong màn dọc 1080×1920; khi camera 100/500 focus, bảng hướng dẫn không che nhân vật.
4. 50 AMEN + 5 gift -> 45 waiting, 5 inside; comment 1/2 chỉ đổi avatar. LIKE/SHARE không cho avatar vào ghế.
5. Mock/Replay: LIKE batch/cumulative/dedupe, 1000 tim đúng 1 milestone FX; 1 share 1 feedback, 10 share một đàn chim nhỏ; không fake LIVE counters; voice CTA không vượt 3/10 phút và không chen vào gift.
6. Tất cả 6 quà phát hình + SFX khác nhau, voice EN/VI/IT đúng text/locale; 30 gifts liên tục không clip âm, camera về overview, không mất gift action. Kiểm tra thiếu voice -> subtitle-only + cảnh báo.
7. Giả lập 30–60 phút có music loop nhiều lần, đánh giá click/seam/ducking + restore, không có nguồn âm chồng khi voice nối, mute từng bus. Nếu test nghe trên loa Windows không có thì ghi rõ chưa kiểm chứng.
8. Test preflight Windows LIVE Studio/TikFinity nếu môi trường cho phép; nếu không, chỉ báo mock/replay validated & Windows verification pending.
9. Screenshot thật: overview có bảng hướng dẫn; guide gift 6 mục; /control tiếng Việt; mốc 1000 tim; share bồ câu; banner lời chúc EN/VI/IT, FX100/500. Không tạo ảnh preview tưởng tượng rồi nói là screenshot app.
10. Chạy giới hạn memory: 1000 like, 50 share, 100 AMEN, 30 gift; mô tả FPS/heap nếu đo được, không đo thì ghi chưa đo.

### 10. FILES CẦN BÀN GIAO
- Mã thực có các module rõ: `LiveGuidePanel`, `HeartsProgress`, `ShareDoveReaction`, `EngagementPromptScheduler`, `AdminViDictionary`, `AudioMixer`, `MusicDirector`, `SFXDirector`, `SpeechDirector`, `LocalizedVoiceLibrary` (tên module tương đương được).
- `docs/CONTROL_PANEL_VI.md`: chỉ dẫn màn quản trị bằng tiếng Việt.
- `docs/LIVE_GUIDE_UI_VI.md`: bảng hướng dẫn, safe area 9:16, các bản dịch EN/VI/IT.
- `docs/AUDIO_MIXING_AND_VOICES_VI.md`: mix, voice fallback, license, capture audio trên LIVE Studio.
- `docs/CHANGELOG_V1_9.md` và README cập nhật; ảnh screenshot khi có thật; test fixtures.
- Mã/cấu hình chạy Windows không phá START_CHAPEL_LIVE.bat và server production.
- Báo cáo bằng TIẾNG VIỆT: nhánh/commit, file thay đổi, kết quả test thật, còn thiếu giọng/asset/Live validation nào, cách mở game & control trên Windows.

### 11. TIÊU CHÍ KHÔNG CHẤP NHẬN
- Không làm bảng quà quá to che bàn thờ; không còn tiếng Anh trong quản trị (ngoại trừ định danh kỹ thuật/tên công nghệ).
- Không chỉ thêm lựa chọn âm lượng mà không có nhạc/hiệu ứng/giọng hoạt động.
- Không ghép nhiều câu voice khiến âm thanh chồng nhau hoặc music lấn voice.
- Không dùng voice sai ngôn ngữ; không phát nhạc không có quyền.
- Không dùng event giả làm tim/share thật; không tạo tương tác ảo để gây hiểu lầm.
- Không gắn quà với “được Chúa phù hộ chắc chắn” hay bất kỳ bảo đảm tôn giáo.
- Không thay đổi logic AMEN waiting-only, 1 nam/2 nữ, gift-only entry, sáu giftKey.
- Không chỉ viết tài liệu. HÃY CODE, CHẠY TEST, SỬA LỖI, VÀ BÀN GIAO THỰC TẾ.

## LỆNH THỰC THI NGẮN
“Hãy hoàn tất Task #10 chưa xong và triển khai trọn Task #11. Thiết kế bảng hướng dẫn LIVE gọn đẹp, trực quan cho AMEN/1/2/tim/share/6 quà; chuyển hoàn toàn Control Panel sang tiếng Việt; tối ưu mixer, nhạc nền organ/piano, SFX và lời cầu chúc/cảm ơn EN–VI–IT, có audio ducking, tránh robot và chồng giọng. Giữ TikFinity + LIVE Studio, chống đếm like/share giả, không phá gameplay AMEN chỉ vào hàng chờ. Hoàn thành code, build, test, screenshot 9:16, viết báo cáo tiếng Việt.”
