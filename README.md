# Chapel of Hope LIVE v1.4 — Hàng chờ AMEN, vào lễ đường bằng gift

Thánh đường châu Âu **ảo, hư cấu**, sân khấu 2,5D 9:16. Quy tắc mới trong [Task #06](docs/CODEX_PROMPT_06_AMEN_WAIT_GIFT_ENTRY_GENDER_VI.md) thay thế logic AMEN của mọi tài liệu cũ.

- **AMEN → chỉ đứng chờ miễn phí.** Không được cấp ghế hoặc tự đi vào, kể cả ghế trống.
- **`1` → avatar nam; `2` → avatar nữ.** Phải khớp đúng văn bản sau trim. Có thể chọn trước AMEN; chỉ lưu lựa chọn phiên, chưa tạo người. Không suy luận giới tính thật từ tên.
- **Gift của chính userId → được gọi, đi từ hàng chờ vào khu quà, thực hiện FX rồi về ghế/chỗ đứng.** Gửi gift trước AMEN vẫn xử lý được. Các comment chứa "gift", "rose", "quà", "1" không phải gift.
- Người đã ở trong gửi thêm quà vẫn dùng một avatar và ghế đó. Ghế đầy vẫn có đường đi/điểm đứng; chỉ người đã tặng mới được ưu tiên ghế trống về sau.

Quà chỉ mở một hành động hình ảnh, không mua hiệu lực cầu nguyện hay bảo đảm kết quả tâm linh. Chưa có kết nối TikTok hoặc thanh toán; các nút là mock events.

## Chạy

Node.js 24 LTS (tối thiểu 22.12):

```sh
npm ci
npm run dev
```

LIVE: http://127.0.0.1:5173/ — điều khiển: http://127.0.0.1:5173/control.

Production: `npm run build`, `npm start`, mở cổng **3001**. Vite dev dùng proxy tới server 3001. Không cần API key/database; sau khi cài dependencies có thể chạy offline.

Ở `/control`, chọn hoặc nhập **Session pseudonym** của người cần thử. Các nút AMEN / 1 Male / 2 Female / sáu quà đều dùng đúng ID đang chọn. Danh sách người phía dưới cho phép chọn lại một người có sẵn. Waiting/Entering/Inside/Seated và số quà chờ/đã xử lý/duplicate được cập nhật thực từ engine; NPC không tính vào các số này.

**Thử nghiệm chính:** gửi 50 AMEN, chọn 5 ID trong danh sách, mỗi ID gửi một quà, chờ hành trình hoàn tất. Kết quả: **45 Waiting, 5 Inside, 5 Seated**. Người đang chờ quà tới lượt thuộc Entering; Inside chỉ tăng khi người đó qua cổng hàng chờ. Không dùng riêng tổng số người để suy ra số đã vào.

Nút **Fill seats · mock gift replay** yêu cầu xác nhận reset, phát lại lịch sử gift mô phỏng để tạo 48 người đã vào ghế; không cấp ghế cho AMEN không có gift.

## Sáu quà

| Khóa | Xu mô phỏng | Hành động sau khi tới nơi |
|---|---:|---|
| `candle_1` | 1 | Thắp nến ở khu trái; thêm nến tồn tại |
| `prayer_5` | 5 | Quỳ cầu nguyện |
| `rose_5` | 5 | Dâng hoa ở khu phải; thêm hoa tồn tại |
| `bell_10` | 10 | Chuông và phản ứng nhẹ của cộng đoàn |
| `altar_100` | 100 | Điểm cầu nguyện trước bàn thờ, ánh ấm/focus |
| `ceremony_500` | 500 | Cảnh tập thể quỳ, linh mục giơ tay, ánh sáng trang nghiêm |

Giữ thời lượng FX 2,2–7 giây; **thời gian đi tới và về chỗ là riêng**, không nằm trong thời gian FX. Một hành trình dùng lối đi tại một thời điểm để tránh va chạm. Burst quà có thể phải chờ vài phút; queue tối đa 128 chờ, có ưu tiên giới hạn/chống bỏ đói. Queue đầy trả 429, sự kiện chưa được chấp nhận và có thể retry cùng ID. Dedupe bảo vệ cả gift đang phát và trong queue.

## Hàng chờ, hình ảnh và âm thanh

Giới hạn 100 viewer phiên, 48 ghế viewer + 16 NPC. Chỉ vẽ chi tiết 12 người chờ thành hai hàng, tên rút gọn và `+N waiting`; phần còn lại vẫn có trong logic. Avatar không tặng không bao giờ bị auto-seat. Hàng chỉ lấp khoảng trống sau khi người đi đã rời cổng, có nội suy. Mặc định TTL 10 phút; gift chờ/phát bảo vệ người gửi. Khi chính phiên đã đủ 100 người mà có người mới tặng, có tối đa một avatar người gửi tạm ngoài giới hạn để diễn đúng gift rồi rời; không nhân đôi người đã tồn tại.

Artwork, nhân vật và linh mục 2,5D được giữ từ bản trước. Chuyển pose/appearance dùng lớp alpha riêng rồi compositing một lần, tránh nhấp nháy do alpha chồng; nhịp bước gắn với quãng đường; phép chiếu liên tục từ tiền sảnh vào lối đi. Low/Balanced/High, cache sprite và lớp giáo dân 8 Hz giữ nguyên.

Âm thanh Web Audio gốc: nhạc pad nhẹ chu kỳ hòa âm 48 giây, room tone, reverb, bước chân/đến/ngồi/đứng, nến/hoa/chuông/100/500. Có ba thanh **Background music / Room ambience / Sound effects**, kéo về 0 để tắt từng lớp. Master **Mute sound** đồng bộ server. Mỗi tab cần bấm **Enable audio** để trình duyệt mở âm thanh; chỉ mở âm thanh ở tab bạn muốn thu, tránh phát đôi. Chặn tối đa 24 voice ngắn, bước chân/âm nhẹ có throttle; oscillator/buffer được dọn khi đóng scene. Đây là tổng hợp âm, chưa phải bản ghi organ/chuông thật.

## HTML mở trực tiếp

`npm run build:preview` xuất `artifacts/html-preview/index.html` tự chứa toàn bộ JavaScript/CSS/artwork. Giải nén [ZIP bản hiện tại](downloads/README.md) rồi mở `index.html` bằng Chrome/Edge, không cần Node/server/Internet trên máy người xem. Mặc định **50 người đang chờ**, không ai tự vào ghế. Mỗi tab là phiên riêng; tải lại tạo lại phiên mẫu. Bản sạch mở tab khác không dùng chung điều khiển.

## Kiểm thử và bàn giao

```sh
npm run typecheck
npm test
npm run build
npm run test:browser
npm run build:preview
npm run test:preview
```

`test:browser` và `test:visual` dùng cùng bộ smoke Task #06, gồm ảnh preview, kiểm tra thật HTTP/WS/UI và AudioContext; cổng **3116**, Chromium `/usr/bin/chromium` hoặc `CHROMIUM_PATH`. Test quà dài đưa đồng hồ server tới các mốc hành trình để kiểm thử tái lập; audio chạy thời gian thực hơn một chu kỳ 48 giây. Test HTML chạy sáu quà theo thời gian thực nên có thể mất vài phút. Browser cloud có thể chặn `file://`; script ghi rõ khi phải nạp tài liệu HTML local được intercept, không backend/asset mạng, thay cho thao tác double-click.

- [Báo cáo thay đổi, kết quả và giới hạn](docs/CHANGELOG_QUEUE_LOGIC.md)
- [Preview và kết quả trình duyệt](docs/screenshots/queue/README.md)
- [Nguồn asset](docs/ASSET_LICENSES.md)
- [Tài liệu v1.3](docs/DELIVERY_2_5D_VI.md), [v1.2 lưu trữ](docs/ARCHIVE_README_V1_2.md)

Các script hình ảnh v1.1/v1.2/v1.3 là fixture lịch sử, không còn tiêu chí gameplay hiện hành. Không dùng ảnh cũ AMEN tự ngồi để đánh giá bản v1.4.

## Giới hạn

Nhân vật vẫn là sprite bốn mẫu gốc, không phải rig 3D/motion capture. Đã cải thiện blend và đường đi nhưng chưa có đủ góc quay thân/người; đi ngang hoặc lùi vẫn có giới hạn hình ảnh, có thể còn foot sliding. Không tuyên bố animation đã đạt chất lượng người quay thật. Nghệ thuật ghế/kiến trúc trong phông cố định; occlusion theo hàng ghế không phải depth mesh hoàn chỉnh. Chưa kiểm chứng LIVE dài nhiều giờ hoặc hiệu năng GPU trên máy phát của bạn. Dữ liệu chỉ ở RAM; restart/reset xóa phiên và lựa chọn avatar.
