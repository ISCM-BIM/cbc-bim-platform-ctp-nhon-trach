# Kịch bản trình bày — ~13 phút

Đối tượng: ban giám đốc CBC + đại diện chủ đầu tư. Mục tiêu: họ tin rằng nền tảng này giúp
các bên nhìn chung một sự thật về công trình, theo thời gian thực — và rằng ISCM–UEH đủ
năng lực tư vấn/triển khai một hệ thống như vậy cho gói BIM đang hợp tác cùng CBC.

Bản demo hiện đã theo design system riêng cho CBC ("DESIGN for CBC" — Deep Navy/Structural
Red/Sky Accent, bo góc sắc cạnh) thay cho giao diện dark glassmorphism gốc. **Màn hình Mô
hình 3D không còn là dữ liệu mô phỏng** — đã gắn cứng vào file IFC thật của dự án CBC, tự
động tải khi vào màn hình (xem mục 2, đã viết lại). Các màn hình còn lại (Dashboard, Tiến
độ, Khối lượng, Xung đột, Hoàn công, Tài sản) vẫn dùng dữ liệu mô phỏng như bản demo gốc.

App mở ra ở **màn hình giới thiệu** (Intro) trước tiên — đây là nơi đặt bối cảnh trước
khi vào phần demo chức năng. Sau khi vào nền tảng, mở đầu bằng vai trò **Ban Giám đốc
nhà thầu** (góc trên bên phải) — vai trò này thấy đủ mọi thứ, dùng cho phần lớn buổi
demo. Chỉ chuyển sang **Chủ đầu tư** ở cuối để minh hoạ phân quyền. Muốn quay lại màn
giới thiệu bất kỳ lúc nào, bấm vào logo ở góc trên bên trái thanh điều hướng.

---

## 0. Màn hình giới thiệu — Intro (~1 phút)

**Nói:** "Trước khi vào phần vận hành thực tế, đây là cách ISCM–UEH giới thiệu năng lực
của mình."

- Để hero tự xoay vài giây — mô hình wireframe nhà xưởng làm nền, logo UEH–CTD–ISCM.
- Cuộn xuống khối **"Hợp tác triển khai BIM"** ngay sau hero — chỉ vào logo CBC cạnh logo
  ISCM–UEH, đọc câu mở đầu. Nói: "Đây là nền tảng ISCM–UEH xây dựng riêng trong khuôn khổ
  hợp tác tư vấn BIM với CBC — không phải một sản phẩm demo chung chung."
- Cuộn tiếp xuống khối **"Vì sao là ISCM–UEH"** — đọc nhanh 1-2 trong 4 thẻ (nền tảng học
  thuật, am hiểu khung pháp lý — Quyết định 258/QĐ-TTg, Thông tư 24/2025/TT-BXD, ISO
  19650...). Nhấn mạnh: đây không phải một công ty phần mềm đơn thuần, mà là một viện
  nghiên cứu-đào tạo có nền tảng pháp lý và học thuật.
- Cuộn tiếp tới **vòng đời thông tin công trình** (7 giai đoạn: 3D → Phối hợp → 4D →
  5D → Hoàn công → 6D/7D → Digital Twin). Đây là điểm quan trọng: **bấm thử vào một
  thẻ giai đoạn** (ví dụ "5D — Chi phí") để cho thấy nó đưa thẳng vào màn hình thật
  tương ứng, không phải trang giới thiệu tĩnh.
- Từ đó, tiếp tục bằng nút **"Khám phá nền tảng"** ở hero (hoặc đã vào sẵn nếu vừa bấm
  vào một giai đoạn).

## 1. Tổng quan — Dashboard (~1 phút)

Dừng lại vài giây ở đây trước khi bấm gì.

**Nói:** "Đây là màn hình đầu tiên cả hai bên cùng nhìn thấy mỗi sáng — không phải file
Excel ai đó gửi qua email, mà là dữ liệu sống, cập nhật liên tục."

**Chỉ vào:**
- Dòng "Cập nhật lần cuối: X phút trước" ở góc trên — số phút tự tăng, nhấn mạnh đây là hệ
  thống sống, không phải ảnh chụp tĩnh.
- Thẻ **Chi phí rủi ro đã ngăn ngừa ≈ 19,56 tỷ đ** — nêu ngay từ đầu, đây là con số sẽ quay
  lại ở phần xung đột.
- Thẻ **Chênh lệch khối lượng phát hiện ≈ 2,04 tỷ đ** — nêu nhanh, sẽ quay lại ở phần 5D.
- Biểu đồ S-curve: tiến độ thực tế đang bám sát kế hoạch, vùng tô màu là độ lệch.

**Đừng nán lại lâu** — đây là màn khởi động, điểm nhấn thật sự ở phần tiếp theo.

## 2. Mô hình 3D (~2,5 phút) — điểm nhấn chính, dữ liệu thật 100%

**Nói:** "Đây không phải ảnh render hay mô phỏng — đây chính là mô hình BIM thật của dự án,
đọc thẳng từ file IFC CBC cung cấp, xem ngay trên trình duyệt, không cần cài Revit hay
Navisworks, không gửi file lên máy chủ nào."

Mô hình tự tải sẵn khi vào màn hình (vài giây, tuỳ tốc độ máy/mạng) — không cần thao tác gì
thêm. Thao tác theo thứ tự:
1. Xoay mô hình vài giây cho khán giả thấy toàn cảnh (cây không gian IFC thật: tầng, lưới
   trục, kết cấu).
2. Chỉ vào panel trái: **số tầng, số cấu kiện, số tam giác** đọc thẳng từ file — nhấn mạnh
   đây là số liệu thật, không phải ước lượng.
3. Bật/tắt bộ lọc **Tầng** hoặc **Bộ môn** (Kiến trúc/Kết cấu/MEP/Hạ tầng) để cho thấy hệ
   thống tự phân loại cấu kiện theo đúng lớp IFC, không cần gắn nhãn thủ công.
4. Bấm nút **Play tròn đỏ** cạnh thanh trượt **"Tiến độ thi công"** để công trình tự "dựng
   lên" theo đúng trình tự — ép cọc → móng/đài móng → khung cột/dầm → sàn/mái → bao che →
   hoàn thiện (hết khoảng ~13 giây, tự dừng khi hoàn thiện). Đây là điểm nhấn tốt để mở đầu
   hoặc kết thúc phần demo mô hình, không cần kéo tay. Nhãn "suy luận tự động" nghĩa là hệ
   thống tự suy luận thứ tự thi công hợp lý theo tầng (thấp → cao) và loại cấu kiện, vì phần
   lớn file IFC xuất từ Revit không kèm sẵn dữ liệu tiến độ 4D. Nói: "Nếu có dữ liệu tiến độ
   thật, chỉ cần bấm 'Tinh chỉnh 4D' (vai trò Quản lý BIM) để sửa lại đúng theo tiến độ thi
   công thật, xuất ra file lưu lại dùng cho lần sau." Vẫn kéo tay được bình thường bất cứ lúc
   nào (tự dừng Play nếu đang chạy) để dừng lại ở một mốc cụ thể khi cần giải thích kỹ.
5. Bật **Chế độ cắt mặt cắt** để lộ nội thất/kết cấu bên trong nếu cần giải thích chi tiết.
6. Bấm vào 1 cấu kiện bất kỳ → panel bên phải hiện Tên, GlobalId, loại IFC và toàn bộ bộ
   thuộc tính (Pset) đọc thẳng từ file — đây là điểm khác biệt so với xem trong Revit: xem
   được ngay trên trình duyệt, ai cũng truy cập được mà không cần bản quyền phần mềm.

Lưu ý khi trình bày: marker xung đột đỏ nhấp nháy (mục 5 bên dưới) **không xuất hiện** ở màn
Mô hình 3D nữa vì đó là dữ liệu minh hoạ cũ, không áp dụng cho file thật của dự án - nếu được
hỏi, giải thích rằng kiểm tra xung đột trên mô hình thật là bước tiếp theo có thể triển khai
cùng CBC, chưa chạy trong bản demo này.

## 3. Tiến độ thi công (~1,5 phút)

**Nói:** "Đây là chi tiết đứng sau con số tiến độ trên Dashboard."

- Chỉ vào các hạng mục có **biểu tượng lửa đỏ** — đây là đường găng, quyết định tiến độ
  tổng thể dự án.
- Chỉ vào 1-2 thanh màu đỏ (chậm tiến độ) — ví dụ "Lắp đặt trạm bơm PCCC & bể nước" chậm.
  Nói: "Hệ thống cảnh báo ngay khi có hạng mục trên đường găng bị chậm."
- Lọc nhanh theo Block A để cho thấy bộ lọc hoạt động.
- Lướt qua lưới ảnh hiện trường bên dưới.

## 4. Khối lượng & Chi phí — 5D (~2 phút) — tính năng thuyết phục nhất

**Nói:** "Đây là câu hỏi mà ban giám đốc và chủ đầu tư luôn muốn biết: khối lượng thi
công thực tế có đúng với hợp đồng không, và ai phát hiện sai lệch trước?"

- Chỉ vào 5 thẻ KPI đầu trang: giá trị hợp đồng 312 tỷ, đã thực hiện 93,6 tỷ, chênh lệch
  khối lượng phát hiện 2,04 tỷ, 11 hạng mục cảnh báo, 87% khối lượng bóc tự động từ mô hình.
  Nói: "87% khối lượng trong bảng này không do ai đó nhập tay — máy bóc thẳng từ mô hình
  BIM, giảm sai sót và tranh cãi khi nghiệm thu."
- Lướt qua bảng so sánh, dừng ở 1-2 dòng có trạng thái **"Chênh lệch lớn"** (tô màu đỏ nhạt)
  — ví dụ tường bao panel cách nhiệt EPS lệch +19%. Nói: "Hệ thống tự gắn cờ những hạng mục
  lệch trên 10% để rà soát trước khi thanh toán."
- Bấm vào một dòng đang cảnh báo → panel chi tiết bên phải mở ra, chỉ vào phần diễn giải
  chênh lệch và lịch sử phiên bản.
- Bấm nút **"Xem trên mô hình 3D"** trong panel chi tiết — nền tảng chuyển thẳng sang màn
  hình 3D thật của dự án, tự lọc đúng bộ môn liên quan. Nói: "Đây là minh hoạ cơ chế liên kết
  - số liệu khối lượng ở đây là dữ liệu mẫu, nhưng mô hình 3D bên kia là file thật của dự án;
  khi có dữ liệu 5D thật gắn vào đúng model này, luồng thao tác sẽ giống hệt như vừa thấy."
- Nếu còn thời gian: lướt qua khối **"Bóc khối lượng phục vụ mua sắm"** ở cuối trang —
  3 đợt phát hành khối lượng theo nhóm vật tư, phục vụ bộ phận mua sắm lên kế hoạch sớm.

## 5. Kiểm tra xung đột (~2 phút) — con số bán hàng quan trọng nhất

**Nói:** "Đây là màn hình trả lời câu hỏi: BIM giúp chúng ta tiết kiệm được bao nhiêu tiền?"

- Chỉ thẳng vào thẻ xanh lớn: **Tổng chi phí rủi ro đã ngăn ngừa ≈ 19,56 tỷ đồng** — nhắc
  lại đây là tổng chi phí ước tính của các xung đột nhóm A và B *đã được xử lý trên mô hình
  trước khi thi công* — tức là 19,56 tỷ đồng chi phí phát sinh, chậm tiến độ, đục phá sửa
  chữa mà hai bên **không phải gánh chịu**.
- Lướt qua 3 biểu đồ nhỏ: xu hướng phát hiện/xử lý theo tuần, phân bố theo mức độ.
- Bấm vào một dòng trong bảng → panel chi tiết bên phải, chỉ vào lịch sử trao đổi để cho
  thấy tính minh bạch trong xử lý.
- Nếu đang ở vai trò **Quản lý BIM**: bấm nút đổi trạng thái để minh hoạ luồng xử lý.

## 6. Hoàn công & Thay đổi hiện trường (~1,5 phút)

**Nói:** "Công trường luôn có phát sinh — điều quan trọng là mô hình có theo kịp hay không."

- Chỉ vào dòng thời gian thay đổi hiện trường, đọc 1-2 mục cụ thể.
- Chỉ vào bảng 6 phiên bản mô hình — nhấn mạnh tần suất cập nhật đều đặn (~2 tuần/lần).
- Chỉ vào chỉ số **Mức độ trùng khớp mô hình với hiện trạng** — trung bình 94% — nói: "Đây
  là cam kết mô hình luôn phản ánh đúng những gì đang có ngoài công trường."

## 7. Tài sản & Vận hành (~1,5 phút) — dành riêng cho chủ đầu tư

**Nói:** "Phần này là giá trị dài hạn cho chủ đầu tư — không kết thúc khi bàn giao."

- Chỉ vào 4 thẻ thông tin cho thuê: diện tích, tải trọng sàn, tĩnh không, công suất điện
  còn dư — đây là dữ liệu bộ phận kinh doanh cho thuê cần ngay lập tức.
- Bấm vào một thiết bị (ví dụ trạm bơm PCCC) → panel chi tiết, chỉ vào lịch bảo trì 12
  tháng tới. Nói: "Toàn bộ 121 thiết bị đã có hồ sơ số hoá sẵn — không cần tìm lại catalogue
  giấy khi vận hành."

## 8. Kết — minh hoạ phân quyền (~0,5 phút)

Bấm chuyển vai trò sang **Chủ đầu tư** ngay trên màn hình đang mở.

**Nói:** "Và đây là điều quan trọng cuối cùng — chủ đầu tư và nhà thầu không nhìn thấy y
hệt nhau. Thông tin nội bộ, chi phí và xung đột chưa xử lý được ẩn đi tự động."

Chỉ vào việc menu bên trái rút còn 4 mục (mất hẳn mục Khối lượng & Chi phí) và cảnh báo xung
đột trên Dashboard biến mất.

**Câu chốt:** "Một nguồn dữ liệu, nhiều góc nhìn phù hợp với từng bên — và đây chính là
năng lực mà ISCM–UEH có thể tư vấn, đào tạo và triển khai cho các dự án thực tế."

---

## Bảng số liệu cần nhớ

| Số liệu | Giá trị | Xuất hiện ở |
|---|---|---|
| Chi phí rủi ro đã ngăn ngừa | ~19,56 tỷ đ | Dashboard, Kiểm tra xung đột |
| Tổng số xung đột đã ghi nhận | 340 | Kiểm tra xung đột |
| Tỷ lệ xung đột đã xử lý | ~68% | Kiểm tra xung đột |
| Tiến độ tổng thể hiện tại | 30% (kế hoạch 35%) | Dashboard |
| Số ngày còn lại | 179/272 ngày | Dashboard |
| Giá trị hợp đồng | 312 tỷ đ | Khối lượng & Chi phí |
| Giá trị đã thực hiện | 93,6 tỷ đ | Khối lượng & Chi phí |
| Chênh lệch khối lượng phát hiện | ~2,04 tỷ đ | Dashboard, Khối lượng & Chi phí |
| Số hạng mục cảnh báo (5D) | 11 / 90 | Khối lượng & Chi phí |
| Tỷ lệ khối lượng bóc tự động từ mô hình | 87% | Khối lượng & Chi phí |
| Mức khớp mô hình - hiện trạng | 94% trung bình | Hoàn công & Thay đổi |
| Số thiết bị đã số hoá | 121 | Tài sản & Vận hành |
| Số phiên bản mô hình đã phát hành | 6 | Hoàn công & Thay đổi |

*Lưu ý: số liệu sinh ngẫu nhiên có seed cố định nên không đổi giữa các lần mở lại, nhưng
nếu chỉnh sửa dữ liệu mẫu trong `src/data/`, hãy kiểm tra lại bảng số liệu này trước khi
trình bày.*
