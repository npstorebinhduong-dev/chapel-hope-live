# Nguồn asset — European 2.5D Stage (Task #04)

Ba PNG mới trong `apps/client/public/art/` được tạo riêng trong phiên phát triển ngày 02/11/2026 bằng công cụ sinh ảnh, theo yêu cầu người dùng:

| File | Kích thước | Nội dung / tham chiếu |
|---|---|---|
| `chapel-stage.png` | 941×1672 | Thánh đường hư cấu, tham chiếu bố cục ảnh chụp chính renderer v1.2 của dự án; không dùng ảnh nhà thờ ngoài |
| `people-atlas.png` | 1402×1122 RGBA | Bốn nhân vật nam/nữ hư cấu và một linh mục hư cấu, đứng/ngồi/quỳ/đi/đọc sách; không dùng chân dung người thật |
| `walk-atlas.png` | 1774×887 RGBA | Dải tám hình bước đi của từng nhân vật gốc, tham chiếu atlas trên |

Đây là artwork tạo riêng cho dự án, **không phải model mua/tải từ thư viện bên thứ ba**, không tự gán CC0 hoặc khẳng định độc quyền bản quyền. Quyền sử dụng đầu ra chịu điều khoản dịch vụ sinh ảnh và quyền áp dụng cho dự án; giấy phép thư viện Three.js không được dùng thay cho giấy phép artwork. Không có tải asset/CDN lúc chạy. Hash và nguồn được ghi trong `public/art/manifest.json`.

Biến thể màu/chiều cao, nguồn cắt sprite, lửa/khói/hoa, ánh sáng và hạt được thực hiện bằng mã tại runtime. Ba ảnh gốc được lưu nguyên bản; preview bàn giao là ảnh chụp trình duyệt, không chỉnh sửa để giả lập chất lượng sản phẩm.

**Giới hạn:** người là sprite 2,5D; chất lượng hình người tốt hơn primitive nhưng không phải rig 3D hoặc motion capture. Bộ bước đi sinh ảnh còn ít thay đổi chân giữa các khung. Cần artist chỉnh thêm tư thế, góc quay và alpha fringe để đạt animation sản xuất cao cấp.

---

# Nguồn asset và giấy phép — v1.2

## Asset được đưa vào bản này

| Nhóm                                                | Nguồn                                          | Ghi chú giấy phép                                                                                        |
| --------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Kiến trúc, mái vòm, cột, bàn thờ, bục đọc sách, ghế | Geometry tự tạo trong `apps/client/src/scene/` | Mã/tác phẩm mới của repository; không nhập model bên ngoài, không tự gán giấy phép CC0 cho toàn bộ dự án |
| Đá, gỗ, kính màu, tia sáng                          | Shader/hoa văn toán học tự tạo                 | Không dùng texture ảnh tải từ web                                                                        |
| Nến, lửa, khói, hoa, lá, bình                       | Geometry và texture quầng lửa sinh bằng mã     | Không dùng ảnh/texture bên thứ ba                                                                        |
| Người procedural                                    | `AttendeeVisual.ts`, `Crowd.tsx`               | Lưới loft thân/đầu, bộ phận và pose tự tạo; **không phải người photoreal hoặc model quét 3D**            |
| Tiếng chuông                                        | WebAudio tổng hợp từ v1.0                      | Không dùng bài hát, bản ghi âm hoặc thánh ca ngoài                                                       |
| Three.js / React / các thư viện                     | Dependency và lockfile dự án                   | Giữ nguyên giấy phép upstream đi kèm package; không coi giấy phép thư viện là giấy phép cho model ngoài  |

## Asset người chưa có

Repository không có bộ GLB nam/nữ chất lượng cao, skinning và các clip đi/ngồi/đứng/quỳ tương thích với hệ tọa độ hiện tại. Chưa nhập thêm model người bên ngoài trong phiên này.

Đã kiểm tra ví dụ skinning chính thức của Three.js (`https://github.com/mrdoob/three.js/blob/dev/examples/webgl_animation_skinning_morph.html`), trong đó ghi model RobotExpressive của Tomás Laulhé, sửa bởi Don McCurdy, CC0. Model robot đó không phù hợp yêu cầu người thật trong thánh đường nên **không được tải hay đưa vào bản build**. Không lấy một model bất kỳ rồi áp giấy phép Three.js cho nó.

## Đường tích hợp thay thế

`assets.ts` khai báo URL GLB nội bộ, credit, license, scale, góc hướng và bảng clip theo `AttendeeState`. `scene/AttendeeLOD.tsx` dùng GLTF cache, clone skeleton, AnimationMixer/crossfade 0,3 giây cho nhân vật được focus, có Suspense và error boundary để trả về fallback khi tải model lỗi. Vị trí gốc vẫn lấy từ đường đi của session. Các nhân vật còn lại giữ renderer instanced có giới hạn.

Đây là pipeline thực thi được nhưng **chưa được kiểm chứng với bộ asset người sản xuất cụ thể**. Cần cấp bộ model/clip có quyền phân phối, kiểm tra tên xương, pose ngồi/quỳ, root motion, hướng -Z, kích thước mét, LOD và hiệu năng trước khi bật rộng cho toàn crowd. Xem `ASSET_PIPELINE.md`.

## Âm thanh v1.4 / Task #05–06

`apps/client/src/audio/runtime.ts` tạo pad sine gốc, room tone bằng noise, room impulse và SFX bằng Web Audio. Không dùng bài hát, bản thu organ/choir/chuông tải từ ngoài; không gán giấy phép nhạc bên thứ ba cho âm tổng hợp. Ba PNG và atlas v1.3 được giữ nguyên. Âm tổng hợp và sprite vẫn có giới hạn về độ chân thực; đây không phải bản ghi thánh lễ thật.
