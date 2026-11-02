# CODEX #08 – CHAPEL OF HOPE LIVE v1.6 | PRODUCTION LIVE / FX / VOICE (TIẾNG VIỆT)

## 0. MỤC TIÊU & TRẠNG THÁI

Đây là yêu cầu CODE THẬT, BUILD THẬT, TEST THẬT, làm cho Chapel of Hope LIVE sẵn sàng vận hành với TikTok LIVE Studio + TikFinity Desktop trên máy Windows. Không chỉ mô tả kế hoạch, không báo “LIVE được ngay” khi chưa chứng minh các bước hoạt động.

Bắt buộc đọc AGENTS.md, docs/CODEX_PROMPT_06_AMEN_WAIT_GIFT_ENTRY_GENDER_VI.md, docs/CODEX_PROMPT_07_AUDIO_TRILINGUAL_VISUAL_TIKTOK_LIVE_VI.md và rà soát mã nguồn. Ở thời điểm viết yêu cầu, branch feat/gift-entry-queue chứa code v1.4; task #07 là SPEC, chưa chứng minh hoàn tất v1.5. Hãy chọn **branch thực sự có mã hoàn thiện mới nhất**; nếu #07 đã code thì kế thừa, nếu chưa thì IMPLEMENT các phần #07 còn thiếu ở đây. Không đảo ngược gameplay hoặc tạo repo từ đầu. Dùng nhánh riêng cho v1.6, không ghi đè công việc phiên khác; viết báo cáo bằng tiếng Việt.

Mục tiêu bàn giao:
- Bản game 2,5D đẹp, trang nghiêm, 9:16, vận hành ít nhất với nguồn mock và kết nối TikFinity Desktop nếu máy đang có ứng dụng.
- Sáu quà đều tạo FX thực sự trong scene + âm thanh + lời chúc + subtitle/banner đồng bộ.
- Chọn ngôn ngữ LIVE: English, Tiếng Việt, Italiano; tự chọn voice phù hợp, có nghe thử, fallback minh bạch khi thiếu voice.
- Có bộ khởi chạy Windows dễ dùng, trang /control với kết nối LIVE và test quà thật, hướng dẫn gắn cửa sổ game vào TikTok LIVE Studio/OBS.
- Có tiêu chuẩn xác nhận “READY FOR OPERATOR LIVE TEST”, chỉ gắn “LIVE VERIFIED” khi thực sự nhận chat + gift trên phiên LIVE của người vận hành.

## 1. KHÓA GAMEPLAY HIỆN HÀNH, TUYỆT ĐỐI KHÔNG ĐỔI

1) Comment AMEN -> duy nhất một avatar ở hàng chờ phía dưới; KHÔNG tự vào ghế; không nhất thiết phải gửi quà để đứng chờ.
2) Comment "1" chọn nam, "2" chọn nữ. Hai comment này KHÔNG là gift.
3) Gift event hợp lệ theo đúng TikTok viewer stable userId -> avatar rời hàng chờ, đi vào nhà thờ, thực hiện nghi thức hình ảnh và ngồi ghế nếu còn chỗ. Nếu chưa AMEN mà tặng: tạo và thực hiện như bình thường. Full seat vẫn chạy FX ở vị trí đứng.
4) Duy nhất 6 giftKey: candle_1, prayer_5, rose_5, bell_10, altar_100, ceremony_500. Phải phân biệt hai quà 5 xu bằng TikFinity giftId cụ thể, không đoán theo coin.
5) Không làm avatar kép, không mất gift, không kẹt camera, không gán nhãn NPC thành khán giả thật.
6) Không diễn đạt rằng gửi quà mua được phép lành/chữa bệnh/được Chúa ưu ái. Không giả danh linh mục hoặc nhà thờ ngoài đời. Tên gọi UI và lời đọc mang tinh thần chúc bình an, hy vọng, tưởng nhớ, hỗ trợ tinh thần, chứ không là lời hứa về phép màu.

## 2. NÂNG CẤP HIỆU ỨNG THÀNH 6 “CẢNH NHỎ” HOÀN THIỆN

Quy chuẩn chung: timeline gồm chuẩn bị -> đi tới zone -> thực hiện -> highlight -> banner/voice -> hạ hiệu ứng -> trở về tổng thể; camera không focus quá lâu khi spam quà. FX render từ chính scene, không chỉ hiển thị toast. Particles và bloom có giới hạn để chữ và bàn thờ luôn rõ trên TikTok.

- 1 xu / candle_1: người gửi di chuyển đến giá nến cầu nguyện, cầm hoặc chạm nến đúng vị trí, ngọn lửa sáng lên, glow ấm nhỏ, khói lửa mềm, tiếng nến nhẹ. Lưu vị trí đã thắp, không spawn nến vô hạn.
- 5 xu / prayer_5: chuyển pose đứng -> quỳ/cúi đầu -> chắp tay, ánh sáng ấm trên nhân vật, âm thanh organ/room nhẹ; không sai khớp gối, không xuyên hàng ghế.
- 5 xu / rose_5: nhân vật mang cành hoa trắng đến khu dâng hoa cạnh cung thánh, đặt vào bình/kệ đúng tọa độ, chuyển động cánh hoa tinh tế, tăng hoa nhìn thấy được nhưng cap ở mức hợp lý.
- 10 xu / bell_10: chuông nhà thờ ngân rõ một đoạn, light shaft thay đổi rất nhẹ, một nhóm người thật/NPC gần đó đứng/cúi đầu đồng bộ khác pha, không chiếm camera người gửi quá lâu.
- 100 xu / altar_100: góc camera điện ảnh qua lối đi, nhân vật đến điểm cầu nguyện **trước** cung thánh, quỳ, kính màu rọi ánh sáng nhẹ, nến sáng, banner tên và lời chúc riêng; kết thúc trở lại góc overview. Kịch bản 8–12 giây FX là mục tiêu, không tính đi bộ từ cửa chờ; khi backlog lớn cần rút bớt các đoạn không thiết yếu.
- 500 xu / ceremony_500: cinematic đại cảnh có nhịp rõ: (a) chuông mở màn, (b) camera nâng/chuyển về tâm nhà thờ, (c) ánh sáng kính màu có chiều sâu + bụi sáng nhỏ hợp lý, (d) linh mục NPC chắp tay/giơ tay cầu nguyện tự nhiên, giáo dân cùng phản ứng tinh tế, (e) hợp xướng/organ **nguyên tác hoặc có bản quyền cho phép LIVE**, (f) banner vinh danh + giọng đọc riêng + fade về overview. Tôn trọng tôn giáo, KHÔNG có thần xuất hiện/ban phép như game fantasy, KHÔNG ánh sáng chớp.
- Mỗi gift có sound signature riêng. Trường hợp người dùng đang được mời vào hoặc tặng nhiều lần, queue bảo đảm FX đúng thứ tự có ưu tiên và không đè animation/voice/camera lên nhau. Đừng tạo duplicate effects từ streak progress.

## 3. HỆ THỐNG LỜI CHÚC, BA LOCALE VÀ BANNER

Tách riêng prayerMessages / giftVoiceLines theo các ngôn ngữ en, vi, it; tối thiểu 12 mẫu/locale, 2 mẫu/giftKey (tổng 36 lời chúc) hoặc hơn, lấy ngẫu nhiên có seeded rotation, không lặp một câu liên tục. Dưới đây là bộ 6 câu chuẩn ban đầu phải được triển khai bằng text chính xác, sau đó thêm các biến thể khác tương đương:

GIFT                  EN                                      VI                                                IT
candle_1              May a gentle light bring you peace.     Mong ánh sáng dịu dàng mang đến bình an cho bạn.  Che una luce gentile porti pace nel tuo cuore.
prayer_5              May you find strength and calm today.  Chúc bạn tìm thấy sức mạnh và sự an yên hôm nay. Che tu possa trovare forza e serenità oggi.
rose_5                May love and kindness surround you.    Mong tình yêu và lòng nhân ái luôn ở bên bạn.    Che amore e gentilezza siano sempre con te.
bell_10               May this moment fill you with hope.   Mong khoảnh khắc này mang đến nhiều hy vọng.     Che questo momento ti riempia di speranza.
altar_100             Wishing you and your family peace.     Cầu chúc bạn và gia đình luôn bình an.          Auguro pace a te e alla tua famiglia.
ceremony_500          May peace and hope unite us all.       Cầu mong bình an và hy vọng kết nối mọi người.  Che la pace e la speranza ci uniscano tutti.

Lưu ý: Đây là lời chúc do game đọc, không phải lời của một linh mục thật đang thực hiện bí tích. Không có câu khẳng định kết quả tâm linh từ việc mua quà.

- Khi phát gift: nhận giftKey -> chọn ngôn ngữ hiện tại -> lấy lời theo key -> đặt vào voice queue -> đồng thời render subtitle/banner cùng nội dung (có username hiển thị được sanitize, ưu tiên KHÔNG đọc username).
- /control cho chọn locale en / vi / it, voice cụ thể trong locale nếu có, tốc độ 0.85–1.1, âm lượng và nút nghe thử từng ngôn ngữ; đổi trực tiếp khi đang chạy nhưng không làm cắt ngang event hiện có.
- Ưu tiên voice chất lượng tự nhiên, các giọng vi-VN sẵn trên Windows nếu được BrowserSpeechProvider hoặc Windows provider hỗ trợ; KHÔNG tự nhận có giọng Hoài Anh nếu môi trường không thực sự xuất hiện. Không tự ý dùng Azure hoặc TTS có tính phí.
- Tách VoiceProvider interface (browser speechSynthesis, optional Windows native voice, recorded/local clips). Khi locale chọn mà không có voice, báo “Missing voice for this language”, luôn giữ banner đúng ngôn ngữ và cho phép sử dụng bản thu do người vận hành cung cấp.
- Trên /control hiển thị rõ status Voice READY / Missing / Blocked, khuyến nghị cài giọng trước khi LIVE; có vòng test 3 ngôn ngữ, test voice 100/500.
- Audio focus: voice duck nhạc khoảng 10 dB, fade mượt và restore; voice queue bounded, không nói chồng, ưu tiên 500/100, có chống starvation; khi quá tải rút bớt lời đọc nhỏ nhưng GIỮ banner và gift event.
- Banner theo timing phát thực hoặc estimated speech duration nếu provider không có marks; nằm vùng an toàn ngoài cung thánh, giới hạn tối đa 2 dòng lớn dễ đọc. Không hiện lời sai locale khi switching.
- Có tùy chọn phát lời chào định kỳ khi trống (mặc định OFF) nhưng không spam lời kêu gọi gửi quà, không đánh lừa là livestream do giáo sĩ thật chủ trì.

## 4. NHẠC NỀN + SFX ĐỦ MỨC CHẠY THỰC

- Hoàn thiện 5 bus: master, background music, ambience, sfx, voice. Có nút bật âm thanh ở màn hình chạy (để vượt browser gesture gate), có mixer trên /control, volume limiter hoặc compressor bảo vệ âm không vỡ khi quà dồn.
- Nhạc organ/piano/choir original và ambient thánh đường trang nghiêm, loop không click, có file asset gốc được phép phát LIVE hoặc synthesis thực sự nghe tốt. Cung cấp file giấy phép hoặc ghi rõ tổng hợp bởi code. Tuyệt đối không tải bài hát thương mại.
- SFX bước chân theo animation, ghế, nến, hoa, chuông 10 xu, light sweep 100 xu, organ/choir 500 xu, đồng bộ đúng thời điểm vật thể/động tác.
- Khi LIVE Studio hoặc OBS bắt hình game, kiểm tra rõ có cả music + voice + sfx trong OUTPUT, không chỉ test ở trình duyệt. Có test-record 20–30 giây và hướng dẫn bật/tắt “Desktop audio”/capture tránh âm đúp.
- Nếu Browser Source không phát Web Speech thành công, hướng dẫn dùng Window Capture + Desktop Audio hoặc provider phát ra audio thành file/buffer để capture. Không tuyên bố audio ready trước khi kiểm tra audio output.
- Không dùng mic giả hoặc phát liên tục một tiếng chuông khi LIVE rảnh.

## 5. NÂNG CHẤT LƯỢNG ĐỒ HỌA VÀ CẢNH

- Giữ 2,5D stage hiện tại nhưng đánh bóng thật sự: texture đá/gỗ, nến, bệ dâng hoa, mái vòm, kính màu, tượng, thánh giá, cha xứ, trang phục nam/nữ người đi lễ châu Âu. Ánh sáng ấm, có chiều sâu nhưng không mờ nhoè như filter.
- Không quay lại hình hộp / hình trụ sơ khai hay camera xoay mất bố cục 9:16.
- Thêm micro-animation cho người ngồi, hàng chờ, linh mục NPC; sửa chớp sáng khi chuyển pose, chân lún ghế, nhãn tên chồng lên nhau. Sửa đúng những chỗ thấy được bằng screenshot thay vì chỉ thay các thông số hình học.
- Khi 50 AMEN chờ nhưng chỉ 5 gift, màn hình hiển thị đúng 45 waiting và 5 inside, không dùng NPC làm giả số khán giả thật.
- Tạo các ảnh viewport thực: no-gift, crowded queue, 100 effect, 500 effect, tri-language banner. Đánh giá kích thước chữ trên điện thoại 9:16.

## 6. TIKFINITY + LIVE STUDIO: BỘ KHỞI ĐỘNG VÀ CONNECTOR THẬT

**Nguồn chính thức đã kiểm tra:** https://tikfinity.zerody.one/tiktok/dapi
TikFinity Desktop App (chạy trên cùng Windows PC) cung cấp WebSocket local ws://localhost:21213/; wrapper sự kiện {"event":"chat"|"gift","data":{...}}. Phải inspect payload thực, không đoán schema cố định.

A. Xây TikFinityEventAdapter thật:
- Node server kết nối ws://127.0.0.1:21213/ (configurable local), trạng thái CONNECTING / CONNECTED / RECONNECTING / DISCONNECTED; reconnect backoff, ping/health, clear close.
- CHỈ một source active (mock hoặc live). Có reset session và lựa chọn reconnect không phá scene.
- Chat -> shared parser AMEN / 1 / 2. Gift -> platform giftId -> bảng mapping 6 giftKey. Phân biệt 2 quà 5 xu bằng giftId. Nếu unknown gift, log metadata an toàn và hiển thị ô chờ ánh xạ; KHÔNG tự đoán giá xu.
- Gift streak: tránh cập nhật tiến độ tạo nhiều gift giả; xử lý repeatCount/end theo dữ liệu thật; ghi log phân tích event vào control, cap và dedupe theo eventId/userId.
- Test mapping UI bằng 6 gift độc lập, cho operator sửa cấu hình gift IDs và xem raw giftId/name/coin amount ở chế độ debug mà không phơi các dữ liệu cá nhân.
- Thông báo LIVE chỉ “CONNECTED TO TIKFINITY SOCKET” khi socket thật connected; chỉ “RECEIVING LIVE EVENTS” sau khi nhận event TikFinity thật; nếu không chạy app thì báo nguyên nhân và nút Retry.
- Không lưu cookie hoặc thông tin đăng nhập TikTok, không tự yêu cầu stream key.

B. Bản Windows có cách chạy gần như một-click:
- Tạo START_CHAPEL_LIVE.bat cho Windows: kiểm tra Node.js >=22.12, thư mục repo, kiểm tra dependency/build có sẵn, nếu chưa thì npm ci và npm run build (thông báo lỗi rõ); khởi động server production (bind loopback 127.0.0.1), mở tab trình duyệt game LIVE và /control, hiển thị địa chỉ + trạng thái; **không** tự bấm “GO LIVE”.
- Tạo STOP_CHAPEL_LIVE.bat hoặc stop hướng dẫn an toàn, không kill mọi node.exe trên Windows; chỉ kết thúc process do launcher tạo.
- Nếu cung cấp ZIP Windows, tạo build hợp lệ từ script và file manifest, kèm README; KHÔNG upload node_modules hay tự gọi ZIP là standalone EXE.
- Production server phải serve game build (nếu hiện chỉ có Vite dev thì sửa), ví dụ http://127.0.0.1:3001/ và http://127.0.0.1:3001/control; kiểm tra reload route /control hoạt động. Không yêu cầu Vite dev để LIVE thật.
- /control có 3 tab cơ bản: “LIVE Connection”, “Audio & Language”, “Gift Test & Mapping”, kèm cảnh báo audio not enabled, voices missing, unmapped gifts, socket disconnected.
- Nút “RUN LIVE PREFLIGHT CHECK” trả ra status PASS / FAIL / NOT YET VERIFIED cho: game server, LIVE route, 9:16, canvas render, WebAudio unlocked, selected TTS voice, six gift mappings, TikFinity socket reachable, FPS/quality metrics nếu đo được. Những gì phụ thuộc LIVE thật phải còn PENDING khi chưa xác minh.
- Có chế độ Preview Mock OFFLINE, không cần đăng nhập TikTok. Operator phải chủ động chuyển sang LIVE mode trước khi nhận event thật.

C. Hướng dẫn TikTok LIVE Studio và OBS:
- Mở START_CHAPEL_LIVE.bat, bật âm bằng tương tác người vận hành trên trang LIVE, chọn ngôn ngữ, test lời/nhạc, Connect TikFinity.
- Mở TikFinity Desktop, thiết lập tài khoản/phòng LIVE chính xác theo ứng dụng TikFinity.
- Mở TikTok LIVE Studio, tạo scene dọc 9:16, Window Capture cửa sổ game hoặc Link/Browser Source nếu hỗ trợ; kiểm tra không vô tình capture control panel.
- Chỉnh crop/fit giữ tỷ lệ, nhạc/voice/SFX đi qua nguồn âm đúng một lần. Không bật đồng thời 2 tab phát audio trong hai nguồn capture.
- Test 6 gift bằng mock trước; khi LIVE thật hãy dùng 1 gift thật được cho phép để lấy official giftId, sau đó gán mapping lần lượt; kiểm tra AMEN/1/2 với tài khoản thử và từ người xem thực. Không bấm LIVE hộ người vận hành.
- Hướng dẫn đối chiếu số người, camera reset, âm lượng, thanh trạng thái, giám sát/chat moderation. LIVE có người điều hành, không vận hành bỏ máy dài giờ không giám sát.

## 7. KIỂM THỬ & ACCEPTANCE GATES

PHẢI kiểm tra ít nhất:
1. npm ci; npm run typecheck; npm test; npm run build; và browser smoke / mock-replay. Ghi kết quả thật.
2. AMEN -> waiting only; 1 nam/2 nữ; 50 AMEN + 5 gifts -> 45 waiting, 5 inside; 100 AMEN + 20 gift; full-seat không nuốt gift.
3. Hai gift 5 xu phải tách đúng; 6 FX có khác biệt trong hình, âm và subtitle/voice. Kiểm tra 10/30 gifts burst, không clip audio/khóa camera. Chi tiết effect 100/500 phải nhìn thấy được trong ảnh 9:16.
4. Chuyển 3 locale en/vi/it lúc đang chạy; banner đúng chữ, voice đúng locale khi có voice thực; thiếu voice không đọc bằng tiếng khác. Kiểm tra audio ducking, mute, restore và loop.
5. Replay giả lập 10 sample TikFinity payload (chat/gift/combo/duplicate/unknown/malformed/reconnect). Log event không chứa dữ liệu nhạy cảm không cần thiết.
6. Trên Windows có TikFinity Desktop: chạy thật trong phiên LIVE hợp lệ để xác minh connected/received chat/received gift/6 mapping. Nếu môi trường Codex không có Windows LIVE đang hoạt động, KHÔNG nhận vơ “LIVE VERIFIED”; bàn giao mã + operator preflight và báo rõ phần cần người vận hành xác nhận.
7. Screenshot thực của live idle, chờ 50, 100, 500, banner en/vi/it; chạy script record ngắn nếu môi trường hỗ trợ, không bịa FPS hay chất lượng audio.
8. Soak test tối thiểu 30 phút trong môi trường mock nếu có điều kiện, giám sát heap, disconnect/reconnect, voice/FX queue và cleanup, báo chính xác nếu không thử được.

CHỐT “READY FOR OPERATOR LIVE TEST” chỉ khi build chạy, preflight mock pass, UI map gifts & audio status dùng được, Windows launcher hoạt động đã kiểm trên Windows; nếu không kiểm được Windows thì ghi “READY FOR WINDOWS VALIDATION”.
CHỐT “LIVE VERIFIED” chỉ khi nhận được chat + gift thật từ một LIVE hợp lệ và đã kiểm âm thanh + hình ảnh trên LIVE Studio ở máy vận hành. Không tuyên bố việc tích hợp là chính thức từ TikTok.

## 8. FILES & BÁO CÁO

Tạo/cập nhật:
- START_CHAPEL_LIVE.bat và script dừng tương ứng.
- docs/LIVE_STUDIO_TIKFINITY_WINDOWS_VI.md (hướng dẫn từng bước chính xác; status & troubleshooting).
- docs/GIFT_MAPPING_LIVE.md với 6 target giftKeys + bảng điền ID thực tế.
- docs/VOICE_LINES_EN_VI_IT.md và code voice lines tương ứng (không chỉ tài liệu).
- docs/AUDIO_CAPTURE_CHECKLIST_VI.md.
- docs/CHANGELOG_V1_6.md + README + test fixtures.
- Lưu ảnh test ở docs/screenshots/live-v16/ nếu có screenshot thật.

Trả lời tiếng Việt gồm: branch/commit/PR, file sửa, các câu lời chúc đã tích hợp, công nghệ TTS/voice thực có, trạng thái TikFinity adapter (mock vs socket vs real LIVE), phương pháp mở game bằng 1 click Windows, kết quả test và tồn đọng. Không trả lời chung chung rằng “xong”. Nếu chưa thể LIVE được ngay do mapping/voice hoặc chưa test thực, liệt kê điều kiện cần người vận hành làm, rõ ràng và có thể kiểm tra.

## 9. LỆNH THỰC THI

HÃY CODE NGAY, không chỉ lên kế hoạch. Xây đầy đủ âm nhạc/giọng chúc/FX/visual và tích hợp TikFinity + LIVE Studio. Bảo toàn gameplay. Chạy kiểm thử, sửa lỗi phát hiện, bàn giao Windows launcher và hướng dẫn phát sóng. Đừng ngừng ở scaffold hoặc console log; hoàn thành những phần có thể test, và minh bạch phần nào cần phiên LIVE thật để xác nhận.
