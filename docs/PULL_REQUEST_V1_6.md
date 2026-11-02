v1.4 đã có hàng chờ AMEN và gift-only entry, nhưng thiếu voice ba ngôn ngữ, adapter TikFinity và bộ vận hành Windows. Bản v1.6 bổ sung 36 lời chúc/voice picker/banner, mixer 5 bus và ducking, sáu cảnh quà trong stage 2,5D, TikFinity socket/mapping/dedupe/reconnect, Control/preflight và launcher production có cơ chế dừng đúng tiến trình.

Giữ nguyên gameplay: 50 AMEN + 5 donor → 45 chờ / 5 trong lễ đường; hai quà 5 xu vẫn theo gift ID riêng. Tiếp tục từ `feat/gift-entry-queue` c3103ee, giữ nguyên nhánh nền.

Validation: npm ci, typecheck/build, 35 unit/integration tests; browser gameplay regression; 18 locale/gift banners, TTS API fixture và hai vòng nhạc thực; HTMLAudio provider; HTML offline. Chi tiết, soak và ảnh thật tại `docs/CHANGELOG_V1_6.md` và `docs/screenshots/live-v16/`.

Trạng thái **READY FOR WINDOWS VALIDATION**, chưa LIVE VERIFIED. Linux không có native TTS voices; Windows launcher đã parse nhưng chưa chạy trên Windows. TikFinity kiểm bằng replay/local socket; gift ID thật, phiên LIVE và audio/video trong LIVE Studio cần operator xác nhận. Nhân vật vẫn là sprite 2,5D, nhạc/choir là synthesis nguyên tác.
