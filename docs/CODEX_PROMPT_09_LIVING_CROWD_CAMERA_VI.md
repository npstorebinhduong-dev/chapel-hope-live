ROMPT CODEX – NÂNG CẤP CHAPEL OF HOPE LIVE: CHUYỂN ĐỘNG, CAMERA, HIỆU ỨNG, HÀNG CHỜ ĐÔNG NGƯỜI
Đọc toàn bộ code hiện có và tiếp tục phát triển trực tiếp trên nhánh mới nhất đang có mã hoàn chỉnh của dự án Chapel of Hope LIVE. Không tạo lại dự án từ đầu, không phá gameplay đang hoạt động, không đổi stack công nghệ.
Mục tiêu chính của phiên này
Tập trung nâng cấp cảm giác sống động và hấp dẫn khi livestream, cụ thể:
1. Nhân vật di chuyển phải mềm, mượt, tự nhiên hơn
2. Khi có người tặng quà, camera phải zoom/focus vào nhân vật đó
3. Các hiệu ứng quà phải đẹp hơn, rõ hơn, hấp dẫn hơn
4. Khi không có người tặng quà, scene vẫn phải có chuyển động sống, tránh cảm giác đứng hình
5. Khu hàng chờ của người comment AMEN phải không giới hạn số người, càng đông càng có cảm giác chen chúc, đông vui, người xếp đè lớp lên nhau
6. Vẫn giữ đúng logic hiện tại:
   - comment AMEN chỉ vào hàng chờ
   - comment 1 chọn nhân vật nam
   - comment 2 chọn nhân vật nữ
   - chỉ khi có gift thì nhân vật mới bước vào lễ đường
1. NÂNG CẤP CHUYỂN ĐỘNG NHÂN VẬT CHO MỀM HƠN
Yêu cầu
Nhân vật hiện tại vẫn còn di chuyển sượng, cứng và hơi game giả. Cần cải thiện để chuyển động nhìn tự nhiên hơn.
Cần nâng cấp các animation sau
- xuất hiện ở hàng chờ
- đứng chờ
- dịch chuyển trong hàng chờ
- được gọi từ hàng chờ vào lễ đường
- đi bộ theo lối chính
- rẽ vào khu hành động / khu ghế
- ngồi xuống
- đứng dậy
- quỳ cầu nguyện
- cúi đầu / chắp tay
- quay về chỗ ngồi hoặc đứng chờ trong nhà thờ
Yêu cầu kỹ thuật
- dùng easing / interpolation / blend / crossfade hợp lý
- không teleport
- không đổi pose đột ngột
- không chớp sáng khi đổi animation
- giảm hiện tượng foot sliding
- hướng thân người phải đúng với hướng di chuyển
- khi quỳ / ngồi / đứng dậy phải có trọng tâm cơ thể hợp lý
- idle của mỗi người nên lệch pha nhau nhẹ để tránh robot đồng bộ
Mục tiêu cảm giác
Nhìn vào phải thấy giống người thật hơn, không còn cảm giác “trượt trên mặt đất” hoặc “đổi pose cứng”.
2. THÊM CAMERA ZOOM / FOCUS KHI CÓ NGƯỜI TẶNG QUÀ
Mục tiêu
Khi có gift, camera không được chỉ đứng yên toàn cảnh. Phải có camera focus nhẹ vào nhân vật đang thực hiện nghi thức, rồi quay về overview.
Yêu cầu
- với quà nhỏ: camera chỉ pan / zoom nhẹ
- với quà lớn: camera zoom và focus rõ hơn
- mọi chuyển động camera phải mượt
- không giật
- không đổi FOV đột ngột
- không giữ camera quá lâu
- sau hiệu ứng phải tự động quay về toàn cảnh
Gợi ý mức độ
- 1 xu: focus nhẹ khu nến và nhân vật
- 5 xu cầu nguyện: zoom nhẹ vào nhân vật đang quỳ
- 5 xu hoa: zoom nhẹ vào nhân vật dâng hoa
- 10 xu: focus vừa phải, thấy cả nhân vật và phản ứng xung quanh
- 100 xu: focus rõ ràng, cinematic hơn
- 500 xu: camera đẹp nhất, cinematic nhất, nhưng vẫn phải trang nghiêm
Yêu cầu quan trọng
- nếu nhiều gift liên tục, phải có queue camera hợp lý
- không để camera bị kẹt ở một người
- không để gift sau bị mất focus hoàn toàn
- ưu tiên gift lớn hơn nhưng không bỏ gift nhỏ
3. NÂNG CẤP HIỆU ỨNG QUÀ CHO ĐẸP MẮT HƠN
Hiệu ứng quà hiện tại chưa đủ đã mắt. Cần nâng cấp theo hướng đẹp, rõ, sinh động, nhưng vẫn giữ phong cách trang nghiêm nhà thờ.
1 xu – candle_1
- nhân vật đi tới khu nến
- thắp nến thật vào giá nến
- ngọn lửa sáng lên rõ ràng hơn
- có glow nhẹ
- có khói rất nhẹ
- có âm thanh nến / lửa / chuyển động nhẹ
- nếu nhiều người thắp, giá nến ngày càng đầy nến sáng
5 xu – prayer_5
- nhân vật vào khu cầu nguyện
- chuyển động đứng → quỳ → chắp tay phải mượt hơn
- có một lớp ánh sáng ấm nhẹ trên nhân vật
- có thể thêm tia sáng rất nhẹ hoặc glow nền
- có lời chúc / banner tương ứng
5 xu – rose_5
- nhân vật cầm hoặc mang hoa tới khu dâng hoa
- đặt hoa vào bình / kệ hoa
- hoa xuất hiện rõ trong scene
- có hiệu ứng cánh hoa nhỏ, nhẹ, tinh tế
- không quá lòe loẹt
10 xu – bell_10
- chuông nhà thờ ngân rõ hơn
- có phản ứng nhẹ của một số giáo dân xung quanh
- có thể tăng nhẹ ánh sáng / không khí trong 1–2 giây
- camera nhìn thấy cả nhân vật lẫn vùng phản ứng
100 xu – altar_100
- phải đẹp hơn rõ rệt
- nhân vật đi lên trước cung thánh
- quỳ hoặc cầu nguyện tại vị trí trang trọng
- có ánh sáng kính màu hoặc ánh sáng ấm tập trung
- banner và lời chúc riêng
- camera cinematic hơn
- có cảm giác “khoảnh khắc đặc biệt”
500 xu – ceremony_500
- là hiệu ứng đẹp nhất
- chuông lớn
- ánh sáng toàn thánh đường tăng đẹp hơn
- giáo dân / cha xứ / khu vực xung quanh có phản ứng đồng bộ nhẹ
- có thể thêm ánh sáng kính màu, bụi sáng nhỏ, bồ câu hoặc tia sáng nhưng phải tinh tế
- banner vinh danh rõ hơn
- lời chúc nổi bật hơn
- tạo cảm giác “đại lễ” nhưng không biến thành sân khấu lòe loẹt
Lưu ý
- tất cả hiệu ứng phải có thời lượng hợp lý
- không được che kín bàn thờ hoặc nhân vật bằng particle
- không dùng hiệu ứng fantasy quá mức
- phải đẹp, rõ ràng, nhưng vẫn nghiêm trang
4. THÊM CÁC CHUYỂN ĐỘNG ĐỘNG KHI KHÔNG CÓ NGƯỜI TẶNG QUÀ
Mục tiêu
Khi không có gift, livestream vẫn phải có cảm giác “sống”, không bị đơ.
Cần bổ sung
- chim bồ câu bay qua bay lại theo chu kỳ, không quá dày
- ánh sáng kính màu thay đổi nhẹ theo thời gian
- nến luôn cháy và khói luôn chuyển động nhẹ
- cha xứ có animation idle nhẹ
- giáo dân ngồi trong nhà thờ có cử động rất nhỏ
- người trong hàng chờ có dịch chuyển nhẹ, nghiêng người, xoay đầu nhẹ
- có thể có một vài hạt bụi sáng trong không khí
- thỉnh thoảng có một chuyển động nền nhẹ để live đỡ nhàm chán
Yêu cầu
- không làm quá nhiều gây rối
- không phá sự trang nghiêm
- không tạo chuyển động vô nghĩa quá nhanh
- mục tiêu là phiên live nhìn luôn “có sự sống”
5. THAY ĐỔI KHU HÀNG CHỜ AMEN THÀNH CÀNG ĐÔNG CÀNG CHEN CHÚC
Đây là thay đổi rất quan trọng
Hiện tại hàng chờ bị giới hạn và xếp quá gọn. Tôi muốn đổi sang kiểu:
- người comment AMEN sẽ xuất hiện trong khu đứng chờ
- không giới hạn cứng số lượng hiển thị theo kiểu chỉ vài slot
- càng đông người thì càng xếp dày hơn
- có thể chồng lớp, che nhau một phần
- tạo cảm giác chen chúc, đông đúc, náo nhiệt
- giống một đám đông đang xếp hàng vào lễ đường
Yêu cầu hình ảnh
- khu hàng chờ nhìn như đám đông thật
- người phía trước che một phần người phía sau
- người ở xa nhỏ hơn, người gần lớn hơn
- tên người dùng vẫn cố gắng readable, nhưng không cần tất cả full rõ cùng lúc
- ưu tiên hiện rõ tên của một số người đầu / người mới vào / người đang được chọn / người sắp vào trong
Logic mới cho hàng chờ
- AMEN chỉ đưa người vào hàng chờ
- hàng chờ có thể chứa rất nhiều người
- không bị cắt cứng ở 12 hoặc 20 người hiển thị kiểu tĩnh
- phải dùng cơ chế density / crowd stacking:
  - nhiều người hơn → khoảng cách thu hẹp lại
  - xếp thành nhiều lớp
  - có thể chồng nhẹ
  - vẫn giữ được cảm giác đám đông
Điều quan trọng
- đây chỉ là khu đứng chờ
- người ở hàng chờ vẫn không tự vào lễ đường
- chỉ khi có gift mới rời đám đông để bước vào trong
- khi một người rời hàng chờ, đám đông tự lấp lại mượt mà
Yêu cầu kỹ thuật
- tối ưu render để đông người vẫn không tụt hiệu năng nghiêm trọng
- có thể dùng LOD / impostor / giảm chi tiết người ở xa
- không spawn tất cả ở đúng một điểm gây lỗi
- tránh việc đè nhau đến mức vỡ hình
6. GIỮ NGUYÊN LOGIC GAMEPLAY ĐÃ CHỐT
Phải giữ nguyên các quy tắc sau:
1. comment AMEN:
   - chỉ vào hàng chờ
   - không tự đi vào ghế
2. comment 1:
   - chọn nhân vật nam
3. comment 2:
   - chọn nhân vật nữ
4. gift:
   - mới là điều kiện để nhân vật bước vào lễ đường
5. nếu chưa AMEN mà gift:
   - vẫn tạo nhân vật và xử lý được
6. nếu trong nhà thờ đã đầy:
   - người tặng vẫn thực hiện được hiệu ứng ở vị trí hợp lệ
7. giữ nguyên 6 giftKey:
   - candle_1
   - prayer_5
   - rose_5
   - bell_10
   - altar_100
   - ceremony_500
7. TỐI ƯU BỐ CỤC 9:16 CHO LIVESTREAM
Yêu cầu
- khi hàng chờ đông lên, không được che toàn bộ nhà thờ
- phải cân bằng giữa:
  - đám đông chờ phía dưới
  - khu nhà thờ bên trong
  - bàn thờ
  - hàng ghế
  - UI
- đảm bảo khi xem trên TikTok vẫn thấy:
  - khu hàng chờ đông đúc
  - nhà thờ hoạt động
  - người đang được focus
Cần làm
- chỉnh lại bố cục màn hình nếu cần
- tránh UI đè lên đám đông hoặc bàn thờ
- camera overview phải giữ được cảm giác nhà thờ đông người và có không khí live
8. YÊU CẦU TEST BẮT BUỘC
Sau khi làm xong, phải test ít nhất:
Animation
- nhân vật đứng chờ
- chen chúc trong hàng chờ
- rời hàng chờ
- đi vào nhà thờ
- thực hiện gift
- ngồi / quỳ
- quay về
- không giật / không chớp / không sượng
Camera
- camera focus đúng nhân vật khi tặng quà
- camera quay lại overview đúng
- test nhiều gift liên tiếp
- không kẹt camera
Queue crowd
- 20 AMEN
- 50 AMEN
- 100 AMEN
- đám đông chờ phải nhìn thật sự đông và chen chúc
- không bị giới hạn kiểu cũ
Effects
- test cả 6 quà
- test quà liên tục
- test khi ghế đầy
- test khi nhiều người cùng chờ
Idle liveliness
- test khi 30–60 giây không có gift
- scene vẫn có chim bồ câu, ánh sáng, nến, cử động nền
9. BÀN GIAO BẮT BUỘC
Sau khi hoàn thành, báo cáo bằng tiếng Việt:
1. đã làm mềm animation như thế nào
2. đã thêm camera zoom/focus ra sao
3. đã nâng cấp hiệu ứng 6 quà thế nào
4. đã thêm các chuyển động nền khi idle như thế nào
5. đã đổi hàng chờ AMEN sang kiểu chen chúc đông đúc thế nào
6. các file chính đã sửa
7. kết quả build / test
8. phần nào còn là placeholder
9. cách chạy lại để kiểm tra
Nếu có thể, chụp preview các cảnh:
- hàng chờ đông đúc
- camera focus khi quà 100 xu
- camera focus khi quà 500 xu
- scene idle có chim bồ câu
- tổng thể 9:16 khi live
10. THỨ TỰ ƯU TIÊN THỰC HIỆN
Làm theo thứ tự sau:
1. sửa animation và movement cho mềm hơn
2. thêm camera focus / zoom khi có gift
3. nâng cấp hiệu ứng 6 quà
4. thêm chuyển động nền khi không có gift
5. đổi hàng chờ sang kiểu đông không giới hạn, chen chúc
6. chỉnh lại bố cục 9:16
7. test toàn bộ
8. build + báo cáo
Hãy trực tiếp chỉnh sửa mã nguồn, build, test và bàn giao. Không dừng ở bước lập kế hoạch.
Bản ngắn gọn để anh dán nhanh
Nếu anh muốn bản ngắn hơn, dùng bản này:

Lệnh ngắn:

Tiếp tục nâng cấp Chapel of Hope LIVE trên code hiện có.

Yêu cầu chính:
1. làm chuyển động nhân vật mềm hơn, tự nhiên hơn
2. thêm camera zoom/focus vào nhân vật khi tặng quà
3. nâng cấp hiệu ứng 6 quà cho đẹp mắt hơn
4. thêm chuyển động nền khi không có người tặng quà, ví dụ chim bồ câu bay, nến cháy, ánh sáng thay đổi nhẹ
5. đổi khu hàng chờ AMEN thành khu đông không giới hạn, càng đông càng xếp chồng, che nhau, tạo cảm giác chen chúc đông đúc
6. giữ nguyên logic:
   - AMEN chỉ vào hàng chờ
   - comment 1 là nam
   - comment 2 là nữ
   - chỉ gift mới vào lễ đường
Phải trực tiếp code, build, test và báo cáo bằng tiếng Việt. Không chỉ lập kế hoạch.