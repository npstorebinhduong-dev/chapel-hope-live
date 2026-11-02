# Mapping quà thật — operator điền sau khi quan sát TikFinity

Không có ID TikTok mặc định được đoán sẵn. Các ID 101–106 trong fixtures **chỉ là số giả dùng test**, không phải danh mục quà TikTok đã xác minh.

| Game giftKey | Mốc xu của game | Gift ID thực | Tên/coin quan sát | Ngày xác minh |
|---|---:|---|---|---|
| candle_1 | 1 | Chưa điền | | |
| prayer_5 | 5 | Chưa điền | | |
| rose_5 | 5 | Chưa điền | | |
| bell_10 | 10 | Chưa điền | | |
| altar_100 | 100 | Chưa điền | | |
| ceremony_500 | 500 | Chưa điền | | |

Nhận một event được phép trong Desktop, xem Unknown Gift ở Control, ghi ID/name/coin và gán đúng dòng. Hai gift 5 xu phải là **hai ID khác nhau**. Nếu giá gift trên nền tảng khác mốc dự kiến, operator phải chọn gift đúng trước phát; game không tự ánh xạ bằng giá xu. Số xu trong hiệu ứng/supporter là mốc canonical của game, không dùng làm sổ thanh toán.

Mapping được lưu trong `%LOCALAPPDATA%\ChapelOfHope\operator-settings.json` khi chạy launcher, áp dụng ngay không reset viewer/socket. Tên gift/coin dùng chẩn đoán; không ghi cookie/token/profile.
