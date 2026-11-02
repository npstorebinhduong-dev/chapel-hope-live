# Preview thật v1.6 — viewport 1080×1920

Ảnh do Chromium chụp từ bản production, không phải ảnh mô phỏng do image generator. 18 tổ hợp quà/ngôn ngữ được kiểm tra trong `results.json`; chọn các ảnh dưới để lưu gọn repository.

| Trạng thái | Ảnh |
|---|---|
| Không quà | [Idle](idle.png) |
| 50 AMEN chỉ chờ | [Waiting 50](waiting-50.png) |
| 45 chờ / 5 trong lễ đường | [50 + 5](50-amen-5-gifts.png) |
| Nến | [Candle](en-candle_1.png) |
| Cầu nguyện | [Prayer](en-prayer_5.png) |
| Hoa trắng | [Rose](en-rose_5.png) |
| Chuông | [Bell](en-bell_10.png) |
| 100 EN | [Altar EN](en-altar_100.png) |
| 500 EN | [Ceremony EN](en-ceremony_500.png) |
| 100 VI | [Altar VI](vi-altar_100.png) |
| 500 IT | [Ceremony IT](it-ceremony_500.png) |
| Control/preflight | [Control](control.png) |

`results.json`: banner/voice contract/audio graph; `queue-regression.json`: gameplay; `recorded-provider.json`: HTMLAudio playback; `html-preview.json`: HTML không backend. Không có giọng native trong Chromium cloud; voice fixture không phải giọng Windows thật. Không có video/audio output LIVE Studio đã xác minh.

`soak.json`: 30,05 phút mock thực, 49/49 quà hoàn tất, reload thành công. `package-check.json`: ZIP giải nén không node_modules chạy production trên Linux. `offline-acceptance.json`: nút 50+5 trong HTML. Cú pháp launcher đã parse; chưa chạy Windows.
