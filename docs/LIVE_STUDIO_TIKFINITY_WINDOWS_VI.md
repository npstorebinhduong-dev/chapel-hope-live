# Chapel of Hope LIVE v1.6 — Windows, TikFinity và LIVE Studio

Trạng thái bàn giao: **READY FOR WINDOWS VALIDATION**. Đây là thánh đường ảo, không phải giáo xứ/bí tích thật. Mã đã có client WebSocket TikFinity; kết nối Desktop hoặc replay không chứng minh đã phát LIVE thật. Không có thao tác tự bấm GO LIVE.

## 1. Chạy bản production

1. Tải `Chapel-of-Hope-LIVE-v1.6-Windows.zip` từ nhánh `feat/production-live-v1-6`, **giải nén toàn bộ** vào một thư mục có quyền ghi.
2. Cài Node.js **22.12 trở lên**; khuyến nghị Node 24 LTS. ZIP chứa JS production và asset, **không phải EXE standalone**, không chứa `node_modules` hoặc Node runtime.
3. Nhấp `START_CHAPEL_LIVE.bat`. Launcher kiểm tra Node, package và build, chạy `production/server.cjs` trên loopback `127.0.0.1:3001`. Nếu build thiếu, launcher dùng `npm ci` rồi `npm run build:windows` (lúc đó cần Internet).
4. Launcher đợi `/api/health` báo sẵn sàng rồi mở LIVE `http://127.0.0.1:3001/` và Control `http://127.0.0.1:3001/control`. Không cần Vite dev. Reload `/control` được server phục vụ.
5. Dừng bằng `STOP_CHAPEL_LIVE.bat` trong **cùng thư mục**. Script đối chiếu PID, giờ bắt đầu, executable và command line, gửi lệnh dừng có nonce của launcher. Nếu không phản hồi mới dừng đúng PID đó. Không dùng `taskkill /IM node.exe` và không dừng TikFinity.

Log tại `%LOCALAPPDATA%\ChapelOfHope\*.out.log` và `*.err.log`. Cấu hình operator lưu `operator-settings.json` tại đó (mixer/ngôn ngữ/mapping/endpoint; **không lưu viewer hoặc chat**). Luôn bắt đầu ở Mock và audio muted sau khi server khởi động lại. Bản HTML `index.html` là preview Mock độc lập, không thay thế launcher khi nối TikFinity.

## 2. Kiểm tra Mock trước

- Trang `/control` có ba tab: LIVE Connection, Audio & Language, Gift Test & Mapping.
- Giữ Source = Mock. Nhấp **Test 50 AMEN + 5 gifts**, xác nhận reset. Chờ năm hành trình hoàn tất: **45 Waiting, 5 Inside**; 16 NPC được đếm riêng. Chỉ gift mới cho vào, AMEN không tự lấy ghế. Comment chính xác 1/2 chọn nam/nữ.
- Chọn từng ID người thử, chạy đủ sáu nút quà phía dưới. Hai quà 5 xu là Prayer và White Rose riêng.
- Tại Audio & Language chọn EN/VI/IT, voice cùng ngôn ngữ, tốc độ 0.85–1.1; thử 100/500. Thiếu giọng sẽ hiện **Missing voice for this language**, giữ phụ đề và không đọc bằng voice tiếng khác.
- Trang LIVE: nhấp một lần để unlock AudioContext. Bỏ Mute sound ở Control, chỉnh năm bus. Tránh unlock hai tab cùng phát vào Desktop Audio. Muốn nghe thử ở Control thì chỉ capture một nguồn phát, và tải lại tab Control trước capture để tắt monitor của tab đó.
- Nhạc là organ/piano/choir **tổng hợp nguyên tác**; không phải bản thu nhà thờ hoặc hợp xướng người thật. Chất lượng voice tùy giọng Windows/browser; danh sách thực mới là căn cứ, không mặc định tên giọng nào có sẵn.

## 3. Kết nối TikFinity Desktop

Nguồn giao thức: https://tikfinity.zerody.one/tiktok/dapi . Người dùng cung cấp xác nhận endpoint Desktop `ws://localhost:21213/`, wrapper `{event: "chat"|"gift", data: {...}}`. Cần kiểm tra payload từ phiên Desktop thực của bạn; replay trong dự án không thay cho bước này.

1. Chạy **TikFinity Desktop trên cùng Windows PC**, tự đăng nhập và chọn tài khoản/phòng theo ứng dụng. Game không cần cookie, stream key hay mật khẩu TikTok.
2. Ở Control, chọn **TikFinity LIVE**, xác nhận reset khi chuyển nguồn. Mock gift/comment bị server từ chối trong mode này; chỉ một nguồn có thể gửi event.
3. Giữ endpoint `ws://127.0.0.1:21213/`, nhấn **Connect / Retry**. Chỉ cho endpoint `ws://` loopback; không nối server bên ngoài.
4. `CONNECTING` → `CONNECTED TO TIKFINITY SOCKET` chỉ chứng minh socket mở. `RECONNECTING` nghĩa Desktop chưa chạy, port sai hoặc socket ngắt. Backoff 1/2/4/8/16/30 giây; heartbeat 15 giây. Disconnect dừng retry. Reconnect không reset scene.
5. Khi chat tới, log chỉ ghi AMEN/1/2/other và thời gian, không chép nguyên văn chat. Với gift chưa map, Control hiện giftId/name/coin ở danh sách **Unknown Gift**, không suy đoán theo xu và không gọi avatar vào.
6. Điền **ID thực** vào sáu dòng mapping, nhấn Save gift mapping. Hai dòng 5 xu phải khác ID. Sửa mapping không reset viewer và không ngắt socket đang chạy. Bảng `docs/GIFT_MAPPING_LIVE.md` là chỗ ghi lại kết quả xác minh.
7. Streak chỉ xử lý final (`repeatEnd=true/1`), ưu tiên groupId làm định danh combo; msgId/msg_id là định danh giao dịch thường. `repeatCount` được cap 20 cho một hành động. Payload thiếu ID giao dịch hoặc không khớp schema sẽ được ghi rõ là ignored; cần đối chiếu phiên Desktop trước LIVE.
8. Queue game có giới hạn 128; khi đầy, metric rejected/error hiện rõ. Adapter không ACK hoặc replay thay Desktop được. Burst 30 nằm trong mức test; không tuyên bố mọi burst vô hạn sẽ không mất sự kiện. Nếu cần replay một giao dịch bị từ chối, phải giữ đúng ID để dedupe.

Tên hiển thị được lọc control/bidi/HTML/URL, userId được băm thành ID phiên trong bộ nhớ. Không coi dữ liệu này là hồ sơ tôn giáo. Reset hoặc restart xóa dữ liệu phiên. Mapping/mixer được lưu riêng.

## 4. Gắn vào TikTok LIVE Studio

1. Tạo scene dọc **1080 × 1920 (9:16)**. Mở trang LIVE trong Edge/Chrome, bật toàn màn hình nếu dùng Window Capture. Không capture Control Panel.
2. Ưu tiên **Window Capture + một nguồn Desktop/Application Audio** để kiểm tra Web Speech của Windows. Nếu bản LIVE Studio của bạn có Link/Browser Source, dùng `http://127.0.0.1:3001/`, kích thước 1080×1920 và kiểm tra tương tác unlock âm thanh của source đó.
3. Fit hình giữ 9:16; không kéo giãn ngang. Kiểm tra hàng chờ, tiêu đề, banner và mép kính màu không bị crop. Dùng High khi máy giữ FPS ổn; giảm Balanced/Low nếu cần. Không dùng FPS cloud làm cam kết cho máy phát.
4. Ghi thử **20–30 giây**: một nến, một chuông, một quà 100/500, giọng từng ngôn ngữ dự định dùng. Nghe lại OUTPUT để xác nhận music + ambient + SFX + voice, giọng không trùng/không clip.
5. Không capture cùng âm thanh từ cả browser source và Desktop Audio. Nếu Browser Source không phát Web Speech, dùng Window Capture + Desktop Audio hoặc recorded clips có quyền sử dụng (xem tài liệu voice).
6. Chạy **RUN LIVE PREFLIGHT CHECK**. Canvas/9:16/audio/voice lấy telemetry của LIVE tab khi mở. Check Windows, capture output và chat/gift thật luôn còn **NOT YET VERIFIED** cho đến khi người vận hành đối chiếu ngoài game; UI không tự nhận verified.
7. Người vận hành tự quyết định bấm **GO LIVE**. Kiểm tra một comment AMEN, 1/2 và gift thật từ tài khoản thử được phép. Xác nhận source/log và hình + tiếng thực trong LIVE Studio. Chỉ sau toàn bộ bước này mới ghi **LIVE VERIFIED** vào biên bản vận hành.

OBS: Browser Source cùng URL và 1080×1920 nếu hỗ trợ audio/TTS; nếu không, Window Capture trình duyệt + Desktop Audio. OBS và LIVE Studio không tự chia sẻ quyền audio-unlock.

## 5. Khắc phục lỗi

- Node không tìm thấy/quá cũ: cài Node 24 LTS, đóng/mở launcher.
- Port 3001 đã dùng: launcher không kill chương trình đó; dùng launcher cũ dừng Chapel cũ hoặc đổi chương trình đang chiếm cổng.
- PowerShell policy/antivirus doanh nghiệp chặn `.bat/.ps1`: làm việc với quản trị máy; không tắt bảo vệ hệ thống. Có thể chạy thủ công `npm ci`, `npm run build:windows`, `node production/server.cjs` từ thư mục dự án.
- TikFinity disconnected: kiểm tra Desktop đang chạy cùng máy; endpoint đúng; phiên LIVE đúng. Không phải lỗi LIVE Studio capture.
- Unknown gift: chưa gán ID thực. Không nhập coin value vào cột gift ID.
- Missing voice: cài Speech language trong Windows Settings, khởi động lại browser, chọn voice cùng locale. Browser có thể không expose mọi giọng đã cài. Banner vẫn chạy.
- Im tiếng: click LIVE, bỏ Mute sound, kiểm tra Master và từng bus >0, output device và mixer của LIVE Studio. Test ở tab Control không chứng minh source LIVE có âm.
- Quà chờ lâu: từng donor đi/về và FX tuần tự để tránh xuyên ghế. Queue không teleport; lượng gift lớn có thể chờ nhiều phút. Theo dõi pending/rejected.

Không vận hành LIVE bỏ máy dài giờ. Cần người điều hành theo dõi chat, moderation, âm lượng, reconnect và mapping.
