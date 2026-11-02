# Chapel of Hope LIVE v1.9 – bàn giao #11 và phần #10 còn thiếu

Nhánh: `feat/v1-9-vietnamese-live`, tách từ `feat/living-crowd-camera` tại `50e4bcd` (v1.7 hoàn thiện + tài liệu #10/#11). Không ghi đè nhánh cũ. #10 khi bắt đầu chỉ có spec, được triển khai trong bản này.

## Thay đổi thực tế

- Engine tương tác tim/share/follow, chuẩn hóa TikFinity batch/cumulative/baseline/reset/dedupe và trạng thái dữ liệu chưa xác minh. Một hàng hiệu ứng gộp có giới hạn, không tạo người hoặc cấp ghế từ tương tác miễn phí.
- `LiveGuidePanel`, `HeartsProgress`, bồ câu vector theo sự kiện, ánh sáng mốc tim, cầu nguyện NPC định kỳ, CTA có cooldown/quota/quiet và quan sát A/B. Hướng dẫn Anh–Việt–Ý, sáu icon riêng, tự luân phiên, cấu hình và thu gọn khi focus.
- Thay Control Panel bằng sáu khu cố định tiếng Việt, từ điển `adminLocales/vi`. Chọn locale LIVE không đổi ngôn ngữ quản trị. Điều khiển âm từ xa tác động đúng cửa sổ LIVE giữ quyền phát; meter từ telemetry, không báo meter giả từ tab control đang im lặng.
- Ba score organ+piano 48 giây, melody/hòa âm/cường độ biến đổi, crossfade 1,2 giây theo ô nhịp. Cue vật thể có marker, mixer năm bus, limiter, 54 lời chúc +36 cảm ơn quà, thư viện CTA/phản hồi. Giọng đúng locale, phụ đề khi thiếu; giữ duck giữa hai utterance và ưu tiên quà hơn CTA. Khóa âm cùng origin/hồ sơ ngăn phát đôi.
- Cap render/RAM cấu hình, tầng chờ gọn giữ identity/giới tính/quyền tặng và TTL, `+N` rõ. Trần khẩn cấp 80000 bản ghi gọn có bộ đếm từ chối, gift có dự phòng hữu hạn. Camera sử dụng thời gian thực khi tab bị throttle; zoom quà lớn 16%/18% và dải HUD dành riêng để giữ kính màu/cha xứ/người tặng nhìn rõ.
- Bundle Windows, START/STOP giữ cơ chế PID/token chỉ dừng đúng server. HTML tự chứa cập nhật quản trị tiếng Việt. Không thay atlas người/kiến trúc v1.7 bằng game mới.

## Kết quả đã chạy

| Bài kiểm tra                                                      | Kết quả                                                                                                                                                     |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci --cache /tmp/chapel-npm-cache`                            | Thành công, 198 package; cần quyền mở tiến trình esbuild trong cloud                                                                                        |
| `npm run typecheck`, `npm test`                                   | Đạt; **45/45** bài unit/integration                                                                                                                         |
| `npm run build`, `npm run build:windows`, `npm run build:preview` | Thành công; Rollup chỉ cảnh báo comment annotation trong Zod                                                                                                |
| Production Chromium                                               | 6 tab Việt ở 1366×768 không tràn trang; guide EN/VI/IT; 18 tổ hợp quà–locale; 30 quà liên tiếp; camera về overview                                          |
| Luật AMEN/quà                                                     | **50 AMEN +5 người tặng =45 chờ/5 trong lễ đường**, không tính NPC; hai quà 5 xu độc lập                                                                    |
| Tim/chia sẻ/stress                                                | 1000 tim →1 mốc; 1 share →1 chim, 10 share →đàn; 100 AMEN +1000 like +50 share +30 quà không cấp nhầm ghế                                                   |
| RAM/render                                                        | 1200 người giữ identity/gender/gift/TTL qua tầng gọn; 1500 người, render200 → `+1300`, trong lễ đường0                                                      |
| Âm thanh                                                          | Chống phát đôi hai tab; mute các bus đo dưới .001 RMS; EN/VI/IT speech fixture đúng locale, duck/restore; stop/resume từ xa và dừng khẩn cấp                |
| Recorded provider                                                 | Phát HTMLAudio thật bằng tone WAV cục bộ, duck/mute/voice0; không phải bản thu lời chúc                                                                     |
| HTML offline                                                      | Không backend, chặn HTTP/WS ngoài tài liệu và storage: AMEN dedupe, 20/50/100 thêm tới171, đủ6 quà, nến/hoa/camera, reset, khung sạch; không lỗi JS/network |
| PowerShell                                                        | Parse cú pháp START/STOP đạt trên PowerShell Linux; chưa thực thi trên Windows                                                                              |

**Soak 30,06 phút thời gian thực:** 100 người chờ được renew, 1000 lượt tim, 100 lượt chia sẻ, 59 quà đã nhận và hoàn tất59, còn chờ0; reload cửa sổ một lần. Cả ba score phát nhiều vòng, nguồn nền luôn7, nguồn ngắn quan sát tối đa18 (giới hạn24), peak WebAudio quan sát0,0751 (<1). Heap Node trong mẫu khoảng54,3–103,3 MiB, cuối80,1 MiB; không phải bằng chứng tuyệt đối không rò bộ nhớ.

Phạm vi soak: dùng **client đóng băng của lõi nhạc/SFX v1.9 trước khi chốt HUD và điều khiển âm từ xa** để build UI không làm hỏng lần reload. SHA256 client đóng băng trong `soak.json`; UI/lệnh âm cuối được kiểm tra browser riêng. Không gọi đây là soak toàn bộ bundle cuối, không xác minh click/seam bằng tai/loa Windows.

Đo riêng trên Linux Chromium headless, balanced, cửa sổ1080×1920, lấy mẫu5 giây sau warmup:

| Người chờ | Avatar gửi/vẽ | FPS đo | Heap JS trình duyệt |
| --------: | ------------: | -----: | ------------------: |
|       100 |           100 |  44,15 |             ~9,8MiB |
|      1000 |          1000 |  28,86 |            ~11,5MiB |
|      1500 |   200 (+1300) |  45,35 |            ~14,3MiB |

Đây là số đo máy cloud, không cam kết FPS Windows. Nếu 1000 avatar quá nặng, giảm giới hạn render; tổng người và quyền tặng giữ nguyên.

## Chưa xác minh / giới hạn

- Không có phiên TikTok LIVE thật hoặc Windows trong cloud. Chưa xác minh BAT thực thi, voice tự nhiên trên máy phát, TikFinity thực theo tài khoản/market, hoặc âm/hình trong nguồn OBS/LIVE Studio. **Không LIVE VERIFIED.**
- Chromium Linux không có voice native EN/VI/IT; fallback phụ đề/cảnh báo đã test. Speech fixture/tone WAV chỉ kiểm provider/scheduling, không chứng minh chất lượng giọng.
- Nhạc/SFX là synthesis nguyên tác, không phải recording organ/hợp xướng/bước chân thật; không có bản thu người chuyên nghiệp được đóng gói.
- Nhân vật/kiến trúc kế thừa sprite/atlas 2,5D; không có mocap hay người 3D photoreal. Không dùng claim thay thế.
- Cumulative like giảm được coi baseline chu kỳ mới và cảnh báo; dữ liệu đảo thứ tự không có timestamp đáng tin cần đối chiếu. Share thiếu mã sự kiện gộp trong10 giây/người, có thể gộp chia sẻ thật gần nhau. Không đo retention/unique viewer.
- Web Locks chỉ chống trùng cùng origin/hồ sơ trình duyệt; OBS Browser Source hoặc trình duyệt khác phải operator tự chọn một nguồn tiếng.
- Cloud policy chặn `file://`: bài HTML dùng tài liệu local được fulfill vào trình duyệt, chặn mạng còn lại; nhấp đúp thật trên Edge Windows vẫn cần kiểm tra.

Xem [ảnh và JSON](screenshots/live-v19/README.md), [control](CONTROL_PANEL_VI.md), [guide](LIVE_GUIDE_UI_VI.md), [âm thanh/capture](AUDIO_MIXING_AND_VOICES_VI.md), [tương tác #10](ENGAGEMENT_LIVE_VI.md). Mở Windows bằng START, lấy hình ở `http://127.0.0.1:3001/`, quản trị ở `/control`.
