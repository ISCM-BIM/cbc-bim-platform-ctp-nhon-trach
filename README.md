# BIM Monitoring Platform — CBC × ISCM–UEH

Web app (không backend) triển khai nền tảng giám sát công trình bằng BIM, được **Viện Đô thị
Thông minh và Quản lý (ISCM) — Trường Công nghệ và Thiết kế, Đại học Kinh tế TP.HCM (UEH)**
xây dựng trong khuôn khổ hợp tác tư vấn/triển khai gói BIM cho **CBC (Civil & Building
Construction)**.

Nền tảng gắn cứng vào ĐÚNG 1 dự án thật: gói thầu **Thiết kế & Thi công (Design & Build) -
Giai đoạn 2** mà CBC đang chào giá cho **Công ty TNHH CTP Nhơn Trạch** (chủ đầu tư, thuộc tập
đoàn bất động sản công nghiệp **CTP/"ctpark"**) - phạm vi Nhà xưởng xây sẵn **RBF6-7** + hạng
mục phụ trợ tại **ctpark Nhơn Trạch** (KCN Dệt May Nhơn Trạch, Đồng Nai). TOÀN BỘ 8 màn hình
đều dùng dữ liệu THẬT lấy trực tiếp từ hồ sơ CBC cung cấp (`Dữ liệu dự án/` - BOQ, tiến độ MS
Project, hồ sơ thiết kế kỹ thuật, file IFC, ảnh phối cảnh 3D), không còn dữ liệu mô phỏng cho
công trình hư cấu nào - xem `src/data/constants.ts` để biết toàn bộ nguồn số liệu và
[MEMORY]-style ghi chú provenance trong từng file `src/data/*.ts`.

**Dự án đang ở giai đoạn TIỀN HỢP ĐỒNG** (chưa có LOA - Letter of Acceptance) tại thời điểm dữ
liệu này được cập nhật, nên các màn hình mô tả TRẠNG THÁI THI CÔNG THẬT (Kiểm tra xung đột,
Hoàn công, Thiết bị & vận hành, Hình ảnh hiện trường) hiển thị trạng thái RỖNG có giải thích rõ
ràng ("chưa ký hợp đồng") thay vì dựng dữ liệu giả - đây là chủ đích, không phải màn hình thiếu
dữ liệu. Tiến độ/Khối lượng/Mô hình 3D/Thư viện ảnh vẫn đầy đủ vì đó là dữ liệu HOẠCH ĐỊNH (kế
hoạch thi công, khối lượng dự thầu, mô hình thiết kế) đã có sẵn dù chưa khởi công.

Dùng để trình bày năng lực tư vấn/triển khai BIM của ISCM–UEH với CBC, CTP Nhơn Trạch, giảng
viên hoặc đối tác khác.

App mở ra ở màn hình giới thiệu (Intro) trước — có riêng một khối nêu rõ quan hệ hợp tác
CBC × ISCM–UEH — sau đó vào nền tảng vận hành thật với 8 màn hình theo vai trò. Xem
`DEMO-SCRIPT.md` để có kịch bản trình bày ~13 phút.

## 1. Cách chạy

Yêu cầu: Node.js 18+.

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ mà terminal in ra (mặc định `http://localhost:5173`).

`npm install` tự động chạy `postinstall` (`scripts/copy-ifc-wasm.mjs`) để đồng bộ file
`web-ifc.wasm` từ `node_modules/web-ifc/` vào `public/wasm/` — cần cho tính năng đọc file
IFC thật ở màn hình Mô hình 3D. Nếu thấy lỗi tải mô hình IFC sau khi cài lại dependencies,
chạy lại thủ công:

```bash
node scripts/copy-ifc-wasm.mjs
```

Build bản tĩnh để mở trực tiếp bằng file hoặc deploy lên hosting bất kỳ:

```bash
npm run build
```

Kết quả nằm trong thư mục `dist/`. `vite.config.ts` đã cấu hình `base: './'` nên có thể mở
`dist/index.html` trực tiếp bằng trình duyệt (không cần server) hoặc host tĩnh ở bất kỳ đường dẫn nào.

## 2. Cấu trúc thư mục

```
src/
  data/          Toàn bộ dữ liệu dự án (không có backend/API) - xem provenance chi tiết ở đầu
                 mỗi file, tất cả trích trực tiếp từ "Dữ liệu dự án/" (gitignored, xem mục 5)
    constants.ts     Tên/địa chỉ dự án, chủ đầu tư, giá trị hợp đồng, 4 block, mốc thời gian
                      (LOA/khởi công/sổ hồng thật), bảng màu, brand tokens
    schedule.ts        232 dòng WBS thật (script trích từ CTP_Master Cons Schedule_Phase 2.pdf,
                        không rút gọn) - % hoàn thành tính theo ELAPSED_DAYS thật, seeded random
                        chỉ áp dụng CHO các hạng mục ĐÃ start thật (hiện tại: chưa có hạng mục
                        nào, xem mục 1)
    quantities.ts        BOQ thật (Bill 4-Fac 6-7 + tổng hợp 8 Bill) - contractQty/modelQty lấy
                          đúng 2 cột "Quantity"/"CBC Quantity" có sẵn trong file BOQ gốc, KHÔNG
                          phải dữ liệu mô phỏng
    tenantInfo.ts           Bảng thống kê công trình RBF6-7 + hạng mục phụ trợ (diện tích/GFA/
                            GLA/số tầng thật) theo hồ sơ thiết kế kỹ thuật
    equipment.ts / clashes.ts / fieldChanges.ts / modelVersions.ts / sitePhotos.ts
                              Mảng RỖNG có chủ đích - dự án chưa ký hợp đồng nên chưa có dữ liệu
                              thi công/vận hành thật, xem ghi chú provenance trong từng file
    projectGallery.ts          22 ảnh phối cảnh 3D thật (CTP Nhơn Trạch cung cấp)
    autodeskModels.ts            Mảng rỗng - chưa có link Autodesk Viewer đối tác cho dự án này
    alerts.ts                      Cảnh báo dashboard (suy ra từ dữ liệu xung đột/tiến độ)
    people.ts                        Danh sách tên người Việt theo vai trò (không phải nhân sự thật)
    roles.ts                           Ma trận phân quyền theo vai trò + danh sách màn hình

  assets/logos/  Logo chính thức UEH / CTD / ISCM (bản trắng, dùng trên nền Deep Navy) + logo CBC

  ifc/           Module đọc file IFC thật (độc lập UI, không phụ thuộc React) - xem mục 5
    ifcApi.ts        Singleton IfcAPI (web-ifc), tự resolve đường dẫn wasm
    parseIfc.ts        Đọc file .ifc: cây không gian, gộp hình học theo (tầng x bộ môn), thuộc tính
    disciplineMap.ts     Phân loại bộ môn theo lớp IFC
    constructionPhase.ts   Phân loại giai đoạn thi công (cọc/móng/khung/sàn-mái/bao che/hoàn thiện)
    mepSystem.ts              Phân loại hệ thống MEP theo IfcSystem thật/tên family Revit
    ifc4d.ts                    4D: dò dữ liệu gốc trong file / suy luận heuristic / tinh chỉnh thủ công
    groupKey.ts                   Khoá ổn định cho 1 nhóm (tầng x bộ môn x giai đoạn)
    types.ts                       Kiểu dữ liệu dùng chung trong module

  screens/       Mỗi màn hình một thư mục con
    Intro/          Màn hình giới thiệu (mặc định khi mở app) — hero 3D wireframe, khối hợp
                     tác CBC × ISCM–UEH, năng lực ISCM–UEH, khái niệm BIM, vòng đời thông tin
                     công trình (7 giai đoạn, bấm vào để nhảy thẳng tới màn hình tương ứng)
    Dashboard/     Tổng quan (Bento grid các KPI + biểu đồ) + Thư viện ảnh phối cảnh 3D
    Model3D/         Mô hình 3D - tự động tải file IFC thật của RBF6-7, xem mục 5.
                     screens/Model3D/ifc/ chứa UI riêng cho mô hình IFC (lọc theo tầng,
                     panel thuộc tính, bảng tinh chỉnh 4D). Mô hình procedural cũ
                     (scene/Warehouse.tsx...) không còn được dùng nhưng vẫn giữ trong repo.
    Schedule/          Tiến độ thi công (Gantt + ảnh hiện trường - rỗng, xem mục 1)
    Quantity/            Khối lượng & Chi phí (5D) — đối chiếu khối lượng hợp đồng vs mô
                         hình thật (BOQ), liên kết "Xem trên mô hình 3D" sang màn Model3D
    Clash/                 Kiểm tra xung đột (trạng thái rỗng - chưa ký hợp đồng)
    AsBuilt/                 Hoàn công & Thay đổi hiện trường (trạng thái rỗng)
    Assets/                    Bảng thông số công trình thật + Thiết bị & vận hành (rỗng)

  components/common/   KpiCard, Badge, ChartTooltip - dùng chung nhiều màn hình
  components/layout/   Sidebar, TopBar, AppShell (nền Deep Navy, bo góc sắc cạnh)
  context/RoleContext.tsx   State vai trò hiện tại (không đăng nhập thật)
  utils/                Hàm định dạng số/ngày kiểu VN, seeded RNG, hình học 3D, mapping màu trạng thái
  types/index.ts         Toàn bộ kiểu dữ liệu dùng chung, AppView (intro | 7 màn hình)
```

Không có thư mục `api/` hay `server/` — toàn bộ dữ liệu sinh ra khi ứng dụng tải trong trình
duyệt; file IFC thật (hiện lưu cục bộ `public/project-data/`, xem mục 5) cũng chỉ được đọc/phân
tích trong trình duyệt của người xem, **không gửi đi máy chủ nào xử lý cả**.

## 3. Sửa dữ liệu ở đâu

- **Đổi thông tin dự án, mốc thời gian, giá trị hợp đồng, 4 block**: `src/data/constants.ts`
- **Đổi/thêm hạng mục tiến độ**: `src/data/schedule.ts` (mảng `TEMPLATES`, cấu trúc WBS lồng
  nhau qua `wbsCode`/`level` - xem comment đầu file để hiểu cách suy ra discipline/block)
- **Đổi hạng mục khối lượng BOQ, đơn giá**: `src/data/quantities.ts` (`BILL_SUMMARY_ITEMS` +
  `RBF_CONCRETE_ITEMS`/`STEEL_ITEMS`/`DOOR_ITEMS`/`INFRA_ITEMS`)
- **Đổi ảnh phối cảnh dự án**: copy ảnh vào `public/project-data/gallery/`, sửa `FILE_COUNT`
  trong `src/data/projectGallery.ts`
- **Bổ sung dữ liệu xung đột/hoàn công/thiết bị thật khi dự án bắt đầu triển khai**: sửa trực
  tiếp `src/data/clashes.ts` / `fieldChanges.ts` / `modelVersions.ts` / `equipment.ts` (hiện
  đang là mảng rỗng có chủ đích, xem mục 1) - format từng dòng xem `src/types/index.ts`
- **Đổi tên người**: `src/data/people.ts`
- **Đổi ma trận phân quyền, danh sách màn hình từng vai trò**: `src/data/roles.ts`

## 4. Thiết kế — "DESIGN for CBC" (Structural Precision), co-brand CBC × ISCM–UEH

- Design system tuân theo `DESIGN for CBC.md` (gốc repo) — nền sáng (`surface #faf9f9`),
  bo góc **sắc cạnh (0px)** ở mọi nút/thẻ/input (ngoại lệ: chấm tròn trạng thái, icon tròn,
  nút CTA dạng viên thuốc), viền mảnh + hard shadow lệch khi hover thay cho shadow mềm/kính
  mờ. Class tiện ích tương ứng nằm trong `src/index.css`: `.panel` / `.panel-hover` (thẻ),
  `.panel-navy` (khối điều hướng), `.btn-primary` / `.btn-secondary` / `.btn-ghost`,
  `.label-caps` (nhãn viết hoa kỹ thuật), `.list-structural` (bullet vuông đỏ).
- Màu thương hiệu CBC: **Deep Navy `#06477C`** (điều hướng - Sidebar/TopBar/Hero/Footer,
  nút chính), **Structural Red `#ED1C24`** (accent/CTA, dùng tiết chế), **Sky Accent
  `#4AC4F3`** (dữ liệu kỹ thuật, MEP trong mô hình 3D, progress bar), **Concrete Gray
  `#808080`** (viền, chữ phụ). Đổi giá trị ở `@theme` trong `src/index.css` và
  `src/data/constants.ts` (bảng `DISCIPLINE_COLORS`/`STATUS_COLORS`/`CHART_PALETTE`).
- Font: **Hanken Grotesk** (heading + nội dung) + **Space Grotesk** (nhãn viết hoa/kỹ
  thuật), tải qua Google Fonts trong `index.css`.
- Bố cục: khối điều hướng (Sidebar/TopBar) và Hero/Footer của trang giới thiệu giữ nền Deep
  Navy đậm; toàn bộ 8 màn hình nội dung dùng nền sáng theo thang `surface-*`.
- Logo: `src/assets/logos/` có UEH/CTD/ISCM (bản trắng - chỉ dùng trên nền Deep Navy, đặt
  trong khung `.panel-navy` khi xuất hiện trên nền sáng) và `cbc_logo.png` (logo CBC, nền
  trong suốt, dùng trực tiếp trên nền sáng). Trang giới thiệu có riêng khối
  **"Hợp tác triển khai BIM"** (`IntroPartnership.tsx`) nêu rõ CBC × ISCM–UEH, tách biệt
  với dữ liệu công trình minh hoạ (không gắn số liệu mô phỏng vào tên CBC).

## 5. Mô hình 3D — file IFC thật của RBF6-7 (ctpark Nhơn Trạch)

Màn hình **Mô hình 3D** gắn cứng vào **đúng 1 file IFC thật** (`NT-CTP_NT3-CD-A-R6_7-R24_
detached.ifc`, ~70MB, mô hình Kiến trúc RBF6-7, Revit → ODA toolkit) — không còn dữ liệu mô
phỏng, không cần bấm chọn file: `Model3D.tsx` tự động tải file này ngay khi vào màn hình.

- **File nằm ở đâu**: hiện lưu **cục bộ** ở `public/project-data/project-model.ifc`
  (gitignored, không track git - xem mục 2), CHƯA chuyển sang Vercel Blob như dự án trước
  (`dist/` hiện ~70MB, vẫn dưới giới hạn 100MB của Vercel Hobby nên chưa bắt buộc). File gốc
  CBC gửi vẫn lưu tạm ở thư mục `Dữ liệu dự án/` (repo root, gitignore) trước khi copy vào
  `public/`. **Khi triển khai thật và cần tách sang Blob** (file lớn hơn, hoặc `dist/` gần
  chạm 100MB), dùng đúng pattern đã áp dụng cho dự án trước (cần đã `vercel login` +
  `vercel link` trong thư mục repo 1 lần):
  ```bash
  npx vercel blob put "public/project-data/project-model.ifc" --access public \
    --pathname project-model.ifc --allow-overwrite --cache-control-max-age 3600
  ```
  rồi đổi hằng số `PROJECT_IFC_URL` trong `Model3D.tsx` sang URL Blob trả về. `--pathname
  project-model.ifc` (cố định) + `--allow-overwrite` giữ nguyên URL qua các lần cập nhật sau.
- **Cách đọc**: hoàn toàn trong trình duyệt bằng
  [`web-ifc`](https://github.com/ThatOpen/engine_web-ifc) (engine WASM, không gửi file đi
  đâu cả) — xem `src/ifc/parseIfc.ts`. Cây không gian IFC (`IfcProject → IfcSite →
  IfcBuilding → IfcBuildingStorey → cấu kiện`) xác định **tầng** chứa mỗi cấu kiện - đi hết
  cả các cấu kiện lồng nhau qua `IfcRelAggregates` ở cấp cấu kiện (vd mullion/panel bên
  trong 1 hệ vách kính `IfcCurtainWall`), không chỉ cấp không gian, nếu không các cấu kiện
  con kiểu này sẽ "mồ côi" tầng. Tên tầng ưu tiên `Name`/`LongName` thật trong file, chỉ dùng
  số thứ tự "Tầng N" khi cả hai đều rỗng - và đánh số này luôn theo **đúng thứ tự cao độ**
  (thấp → cao), tính sau khi đã sắp xếp.
- Mỗi cấu kiện phân loại vào 1 trong 4 **bộ môn** hiện có của platform theo lớp IFC
  (`src/ifc/disciplineMap.ts`), **và** vào 1 trong 7 **giai đoạn thi công** trong nội bộ bộ
  môn đó (ép cọc/móng-đài móng/khung cột-dầm/sàn-mái/bao che/hoàn thiện/khác,
  `src/ifc/constructionPhase.ts`) - hình học gộp theo nhóm **(tầng × bộ môn × giai đoạn)**,
  vừa giữ hiệu năng vừa là đơn vị lọc/gán mốc 4D. Cấu kiện Kết cấu/Kiến trúc trong viewport
  **tô màu theo giai đoạn** (không phải theo bộ môn nữa - xem `IfcModelView.tsx`, chú giải
  màu ở `IfcFilterPanel.tsx`), vì 2 bộ môn này chiếm phần lớn khối lượng cấu kiện thật nên tô
  đồng nhất theo bộ môn chỉ ra 1-2 màu phẳng; MEP/Hạ tầng vẫn giữ màu theo bộ môn như cũ.
  **Lưu ý quan trọng khi phân loại giai đoạn**: nhiều export Revit → IFC (kể cả file dự án
  đang dùng) gộp CHUNG cọc, đài móng và sàn thật vào cùng 1 lớp `IfcSlab` - lớp IFC không đủ
  để tách; phải đọc thêm **tên family/type Revit gốc** qua quan hệ `IfcRelDefinesByType`
  (vd `"CBC_S_PILE UST:400mm-P1"`, `"CBC-S-Footing Rectangle:..."`) và so khớp mẫu tên
  ("pile"/"footing"/"pile cap"...) mới phân biệt được - xem `buildTypeNameIndex()` trong
  `parseIfc.ts` và `classifyConstructionPhase()` trong `constructionPhase.ts`.
- **Khung camera mặc định** tính theo phân vị (percentile) toạ độ đỉnh hình học
  (`computeModelBounds` trong `parseIfc.ts`), không phải bounding box thô - file IFC thật
  ngoài đời thường lẫn vài cấu kiện quy mô toàn site (lưới trục, ranh đất...) lớn hơn hẳn
  phần công trình, nếu canh camera theo bounding box thô sẽ zoom ra quá xa. Người dùng vẫn
  kéo camera ra xa hơn được nếu muốn xem các cấu kiện đó (không có gì bị ẩn khỏi hiển thị,
  chỉ ảnh hưởng khung nhìn ban đầu).
- **Thanh trượt tiến độ 4D**: (1) dữ liệu 4D gốc trong file nếu có
  (`IfcTask`/`IfcTaskTime`/`IfcRelAssignsToProcess` - hiếm gặp); (2) nếu không, **suy luận
  tự động** theo tầng (thấp → cao), rồi trong mỗi tầng theo trình tự thi công hợp lý: hạ
  tầng → ép cọc → móng/đài móng → khung cột/dầm → sàn/mái → bao che (tường/cửa) → hoàn
  thiện → MEP (`SEQUENCE` trong `src/ifc/ifc4d.ts` - sửa trực tiếp mảng này nếu muốn đổi
  thứ tự); (3) vai trò **Quản lý BIM** có thể **tinh chỉnh thủ công** từng nhóm qua nút
  "Tinh chỉnh 4D" (tháng bắt đầu/kết thúc), xuất/nhập lại bằng file JSON (không backend/
  localStorage - chỉ lưu trong phiên làm việc trừ khi tự xuất file). Nút **Play** tròn cạnh
  thanh trượt tự chạy tiến độ theo thời gian thực (`MONTHS_PER_SECOND` trong `Model3D.tsx`,
  mặc định 0.6 tháng/giây - toàn bộ khung chạy hết trong ~13 giây), dùng
  `requestAnimationFrame` với delta-time có chặn trần (tối đa 0.1s/khung hình) để tránh mô
  hình "nhảy cóc" nếu tab bị trình duyệt tạm ngưng animation (chuyển tab, thu nhỏ cửa sổ...)
  rồi quay lại; tự dừng khi chạm mốc cuối, bấm lại từ mốc cuối sẽ quay về đầu, kéo tay thanh
  trượt lúc đang chạy sẽ tự dừng Play.
- Bấm vào 1 cấu kiện xem Tên/GlobalId/Loại IFC/Pset (`getElementProperties` trong
  `parseIfc.ts`). Marker xung đột (dữ liệu giả định ở các màn hình khác) **không** hiện trên
  mô hình 3D vì platform chưa chạy kiểm tra xung đột trên file thật.
- Deep-link từ màn **Khối lượng & Chi phí** ("Xem trên mô hình 3D") chuyển sang lọc theo
  đúng bộ môn của hạng mục đang xem (không còn lọc theo block - khái niệm "block" thuộc dữ
  liệu mô phỏng, không áp dụng cho file IFC thật).

**Giới hạn cần biết**: đọc file hoàn toàn phía client nên file càng lớn càng tốn thời gian/bộ
nhớ trình duyệt, và phải tải lại (qua mạng) mỗi lần vào màn hình (không cache ở tầng
app - trình duyệt có thể tự cache HTTP response tuỳ cấu hình hosting); không phải mọi file
IFC đều có dữ liệu 4D gốc (đa số sẽ dùng nhánh suy luận tự động ở trên); phân loại bộ môn
theo lớp IFC là quy ước phổ biến của các phần mềm BIM viewer, không đọc thuộc tính
`LoadBearing` để tách tường kết cấu khỏi tường kiến trúc.

## 6. Công nghệ

Vite + React 19 + TypeScript + Tailwind CSS v4 + Three.js (`@react-three/fiber`,
`@react-three/drei`) + [`web-ifc`](https://www.npmjs.com/package/web-ifc) (đọc file IFC) +
Recharts + lucide-react. Không backend, không `localStorage`.

## 7. Ba vai trò demo

Đổi vai trò bằng nút góc trên bên phải, không cần đăng nhập:

- **Ban Giám đốc nhà thầu** — xem đủ 7 màn hình (gồm cả Khối lượng & Chi phí), đầy đủ dữ liệu.
- **Chủ đầu tư** — chỉ thấy Tổng quan, Mô hình 3D, Tiến độ, Tài sản & Vận hành (4 màn
  hình). Khối lượng & Chi phí và xung đột chi tiết bị ẩn (marker trên mô hình 3D và cảnh
  báo xung đột trên Dashboard cũng ẩn).
- **Quản lý BIM** — như Ban Giám đốc, cộng thêm quyền đổi trạng thái xung đột ở màn
  Kiểm tra xung đột, và quyền tinh chỉnh thủ công thanh trượt 4D khi xem Mô hình IFC (thao
  tác chỉ lưu trong phiên làm việc, không có backend).

Bấm vào logo ở góc trên bên trái thanh điều hướng để quay lại màn hình giới thiệu bất kỳ
lúc nào. Xem `DEMO-SCRIPT.md` để có kịch bản trình bày đầy đủ.

## 8. Deploy — Vercel

**CHƯA deploy lần nào.** Repo này là bản copy của repo `BIM platform - CBC` gốc (cùng lịch sử
git/commit, xem `git remote -v` - vẫn trỏ về repo GitHub gốc `ISCM-BIM/cbc-bim-platform`, cần
trỏ sang remote riêng nếu muốn tách hẳn) để dựng nền tảng cho dự án CTP Nhơn Trạch. Thư mục này
đã từng có `.vercel/project.json` trỏ **NHẦM** vào đúng Vercel project của bản gốc
(`cbc-bim-platform`, đang chạy TH Hưng Yên) - dấu vết còn sót lại khi copy cả thư mục - **đã bị
xoá** để tránh `vercel --prod` từ thư mục này vô tình ghi đè lên site đang chạy thật của dự án
khác. Trước khi deploy lần đầu, **bắt buộc** `vercel link` tới **project Vercel MỚI** (không
được chọn lại `cbc-bim-platform`):
```bash
npx vercel login
npx vercel link   # chọn "Create new project" hoặc gõ tên mới, KHÔNG chọn cbc-bim-platform
npx vercel --prod
```

File IFC (~70MB, xem mục 5) vẫn đang bundle cục bộ trong `public/project-data/` - `dist/` build
ra dưới giới hạn 100MB của Vercel Hobby nên deploy code bình thường không cần tách Blob ngay.
Nếu sau này file IFC/ảnh gallery lớn hơn khiến `dist/` gần chạm 100MB, tách sang Vercel Blob
theo đúng lý do/cách làm đã áp dụng cho dự án trước (giới hạn Hobby, tách "cập nhật model" khỏi
"build lại code") - xem lệnh `vercel blob put ...` ở mục 5.
