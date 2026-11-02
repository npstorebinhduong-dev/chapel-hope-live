LỆNH CODEX #05 – NÂNG CẤP ANIMATION, ÂM THANH, HÀNG CHỜ AMEN
Đọc toàn bộ mã nguồn hiện có trên nhánh mới nhất đang phát triển của dự án Chapel of Hope LIVE. Tiếp tục phát triển trực tiếp trên code hiện tại, không tạo lại dự án từ đầu, không phá gameplay hiện có, không đổi stack công nghệ.
Mục tiêu chính của phiên này
Tập trung nâng cấp trải nghiệm để game giống một phiên LIVE thật hơn, cụ thể:
- animation của nhân vật phải mềm, mượt và tự nhiên hơn
- bổ sung âm thanh, nhạc nền và hiệu ứng âm thanh
- nâng độ chân thực của các chuyển động và phản ứng trong scene
- thêm khu hàng chờ: người comment AMEN sẽ xuất hiện đứng ở dưới khu chờ trước, sau đó mới lần lượt đi vào chỗ ngồi hoặc đi vào nhà thờ
Không mở rộng gameplay sang hướng khác. Giữ nguyên cốt lõi:
- comment AMEN để tham gia
- giữ 6 mốc quà hiện có
- vẫn giữ phong cách nhà thờ châu Âu / 2,5D live-ready
1. Nâng cấp animation nhân vật cho mềm hơn, thật hơn
Yêu cầu chung
Toàn bộ chuyển động nhân vật hiện có phải được nâng cấp để:
- mượt hơn
- ít cứng hơn
- có cảm giác người thật hơn
- không giật
- không teleport
- không đổi pose đột ngột
- không chớp sáng khi đổi animation
Các animation cần làm mượt
- xuất hiện trong hàng chờ
- đứng chờ
- bước từ hàng chờ vào lối đi
- đi bộ trong thánh đường
- rẽ vào hàng ghế
- ngồi xuống
- đứng dậy
- quỳ
- cúi đầu cầu nguyện
- chắp tay / tư thế cầu nguyện
- quay về vị trí cũ hoặc rời scene
Yêu cầu kỹ thuật
- dùng transition / blend / crossfade hợp lý giữa các state animation
- mọi chuyển động phải có easing hợp lý
- hạn chế hiện tượng foot sliding
- hướng mặt và thân người phải đúng với hướng di chuyển hoặc hướng bàn thờ
- giữ tỷ lệ và trọng tâm cơ thể tự nhiên khi ngồi hoặc quỳ
- idle của các nhân vật phải khác pha nhau nhẹ, không đồng bộ như robot
State machine cần rõ ràng
Rà soát và cải thiện state machine của attendee với các state như:
- waiting
- called_from_queue
- walking_to_seat
- seated
- praying_idle
- kneeling
- gift_reacting
- returning
- leaving
Nếu cần, cập nhật lại logic state để animation chạy tự nhiên hơn.
2. Thêm khu hàng chờ cho người comment AMEN
Mục tiêu
Khi người xem comment AMEN, họ không xuất hiện trực tiếp lên ghế ngay lập tức, mà phải:
1. xuất hiện ở khu hàng chờ phía dưới
2. đứng chờ theo thứ tự
3. sau đó lần lượt được đưa vào trong nhà thờ
4. đi theo lối hợp lý vào ghế hoặc vị trí chờ tiếp theo
Thiết kế hàng chờ
- thêm một khu vực queue zone / waiting area ở phần dưới hoặc cuối nhà thờ, nhìn hợp bố cục 9:16
- có thể là khu tiền sảnh / khu đứng chờ trước khi vào hàng ghế
- nhân vật xếp hàng có thứ tự, không chồng lên nhau
- khu hàng chờ phải nhìn rõ nhưng không phá bố cục chính của thánh đường
- có thể hiển thị 1–2 hàng chờ nếu đông người
Logic hàng chờ
- người comment AMEN mới sẽ được spawn ở hàng chờ
- nếu còn chỗ ngồi hoặc tới lượt, hệ thống gọi người đầu hàng chờ đi vào trong
- nếu hết ghế, người mới vẫn đứng chờ
- khi có người rời ghế hoặc có slot mới, hệ thống tự đưa người tiếp theo vào
- hàng chờ phải xử lý đúng thứ tự FIFO cơ bản
- không để 2 người cùng đi vào 1 ghế
- không để queue bị kẹt vĩnh viễn
Hình ảnh hàng chờ
- người đứng chờ có idle riêng
- có hơi chuyển động nhẹ, thở, xoay người rất nhẹ
- tránh đứng như tượng
- có thể có một dòng trạng thái nhỏ hoặc logic nội bộ để debug, nhưng không làm rối màn live
3. Thêm âm thanh nền, hiệu ứng âm thanh và âm thanh môi trường
3.1 Nhạc nền
Thêm nhạc nền phù hợp bối cảnh nhà thờ:
- nhẹ nhàng
- trang nghiêm
- êm
- tạo cảm giác linh thiêng nhưng không u ám
- phù hợp để phát lặp khi livestream lâu
Yêu cầu
- phải có cơ chế loop mượt
- có volume hợp lý
- có nút mute / unmute
- có thể điều chỉnh mức âm lượng hoặc ít nhất phân tầng:
  - background music
  - ambient
  - sfx
3.2 Âm thanh môi trường
Thêm ambient nhẹ để scene sống hơn:
- room tone / không gian nhà thờ
- tiếng bước chân rất nhẹ khi người đi
- âm thanh môi trường rất nhẹ, không ồn
3.3 Hiệu ứng âm thanh
Bổ sung SFX cho các hành động chính:
- người xuất hiện ở hàng chờ
- bước chân
- ngồi xuống / đứng dậy nhẹ
- thắp nến
- đặt hoa
- chuông cho quà 10 xu
- hiệu ứng trang nghiêm cho quà 100 xu
- hiệu ứng nổi bật hơn cho quà 500 xu
- hiệu ứng chuyển cảnh / focus camera nếu phù hợp
Yêu cầu âm thanh
- âm thanh phải lịch sự, tinh tế, không arcade
- không dùng âm thanh chói gắt
- không làm người xem mệt tai khi live lâu
- nếu chưa có asset âm thanh phù hợp, dùng nguồn hợp pháp hoặc tạo tạm bằng Web Audio / placeholder nhưng phải tổ chức code sẵn để thay asset sau
4. Làm chuyển động và phản ứng trong thật hơn
Cần nâng cấp cảm giác “thật”
Toàn bộ scene cần có cảm giác tự nhiên hơn, không chỉ nhờ animation chính mà còn nhờ các chi tiết nhỏ:
- người trong hàng ghế có idle nhẹ
- một số người hơi cúi đầu hoặc đổi tư thế nhỏ
- người chờ ở queue có chuyển động nhẹ
- cha xứ / linh mục có cử động nhẹ ở cung thánh
- nến rung nhẹ
- ánh sáng ổn định, không giật
- khi có quà lớn, mọi thứ phản ứng hài hòa hơn
Khi có gift
- quà 1 xu: phản ứng nhỏ nhưng thật
- quà 5 xu: động tác cầu nguyện / đặt hoa phải mềm hơn
- quà 10 xu: chuông + phản ứng nhóm phải đồng bộ hơn
- quà 100 xu: camera focus + animation + sound phải tạo cảm giác đặc biệt
- quà 500 xu: đại cảnh đẹp hơn, có chiều sâu và cảm giác trang nghiêm rõ ràng
Lưu ý
Không biến game thành show sân khấu lòe loẹt. Mọi chuyển động và âm thanh phải giữ tinh thần:
- trang nghiêm
- đẹp
- thật
- dùng được cho livestream kéo dài
5. Yêu cầu cụ thể cho queue + seating flow
Rà soát và cải thiện luồng tổng thể:
Luồng mới mong muốn
1. User comment AMEN
2. User xuất hiện ở khu hàng chờ phía dưới
3. User đứng chờ tự nhiên
4. Khi tới lượt, user được gọi vào
5. User đi theo lối giữa
6. User rẽ vào khu ghế
7. User ngồi / quỳ / cầu nguyện
8. Nếu có quà thì thực hiện action tương ứng
9. Hết thời gian hoặc theo logic session thì có thể rời đi
Yêu cầu đặc biệt
- queue phải nhìn đẹp khi có 5–20 người
- nếu quá đông, vẫn phải degrade gracefully
- giữ scene gọn trong tỷ lệ 9:16
- không để queue che khu vực quan trọng của UI hoặc bàn thờ
6. Tối ưu và tách lớp âm thanh / animation rõ ràng
Về code
Tách rõ các phần:
- animation controller
- attendee state machine
- waiting queue manager
- audio manager
- sfx trigger system
- background music controller
- gift effect audio hooks
Cần có cấu hình
- bật / tắt nhạc nền
- bật / tắt SFX
- bật / tắt ambient
- bật / tắt queue visual nếu cần test
- debug số người trong queue / số người đang ngồi
7. Yêu cầu test
Sau khi làm xong phải test ít nhất các tình huống sau:
Queue
- 1 người AMEN
- 10 người AMEN
- 20 người AMEN
- queue hoạt động đúng
- người được gọi lần lượt
- không đè nhau
- không bị kẹt
Animation
- đi bộ vào ghế
- ngồi
- đứng dậy
- quỳ
- trở lại vị trí
- không giật / chớp / xoay sai
Audio
- nhạc nền phát được
- loop được
- mute / unmute hoạt động
- SFX chạy đúng sự kiện
- không bị chồng âm quá lớn khi spam quà
Gifts
- test cả 6 quà
- test liên tục nhiều quà
- audio + visual + animation phối hợp ổn
8. Bàn giao bắt buộc
Sau khi hoàn thành, phải báo cáo bằng tiếng Việt:
1. đã nâng cấp animation như thế nào
2. đã thêm hàng chờ AMEN như thế nào
3. đã thêm các lớp âm thanh nào
4. các file chính đã sửa
5. kết quả build / test thực tế
6. phần nào còn là placeholder
7. cách chạy lại để kiểm tra
Nếu có thể, chụp preview / screenshot:
- cảnh có hàng chờ phía dưới
- cảnh người từ hàng chờ đi vào ghế
- cảnh đông người trong thánh đường
- cảnh đang có quà 100 xu
- cảnh đang có quà 500 xu
9. Không được làm sai các điểm sau
- không bỏ cơ chế AMEN
- không bỏ 6 mốc quà
- không bỏ phong cách 2,5D hiện tại
- không làm hàng chờ che mất toàn bộ scene
- không dùng âm thanh quá game / quá vui nhộn
- không báo hoàn thành nếu animation vẫn còn cứng và queue chưa hoạt động thật
- không chỉ viết kế hoạch, phải code thực tế
10. Thứ tự ưu tiên thực hiện
Làm theo thứ tự:
1. hoàn thiện hàng chờ AMEN
2. làm mượt animation state transition
3. thêm âm thanh nền và ambient
4. thêm SFX cho các hành động và gift
5. chỉnh phản ứng scene để tự nhiên hơn
6. test queue + gifts + audio
7. build + báo cáo
Hãy trực tiếp chỉnh sửa mã nguồn và hoàn thiện tính năng. Không dừng ở bước lập kế hoạch.