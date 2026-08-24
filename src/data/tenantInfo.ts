import type { AssetItemInfo } from '../types'

// "Bảng thống kê chi tiết các công trình / Building Area Schedule" thật (hồ sơ thiết kế kỹ
// thuật, trang Tổng mặt bằng) - CHỈ liệt kê các hạng mục nằm trong PHẠM VI GIAI ĐOẠN 2 (gói thầu
// nền tảng này thể hiện: RBF6-7 + hạng mục phụ trợ liên quan, xem constants.ts). ctpark Nhơn
// Trạch còn RBF1-5, Club house, Parking 01, Nhà bảo vệ 1-2... thuộc phạm vi/gói thầu khác, không
// đưa vào đây để tránh nhầm là cùng 1 gói thầu.
//
// Đã đối chiếu số học: footprint + GFA của RBF6 và RBF7 cộng với 6 hạng mục phụ trợ khác trong
// bảng gốc CỘNG LẠI khớp đúng 2 dòng tổng "Công trình chính" (66.120,37 / 90.682,77 m²) - xem
// constants.ts. RBF6 = RBF7 (thiết kế đối xứng, cùng thông số). GLA (diện tích cho thuê) = GFA
// cho mọi hạng mục trong bảng gốc - tức 100% sàn xây dựng đều là diện tích cho thuê (ctpark là
// mô hình bất động sản công nghiệp cho thuê, khác dự án nhà máy tự vận hành trước đây của nền
// tảng này).
export const tenantInfo: AssetItemInfo[] = [
  {
    id: 'RBF-06',
    name: 'Nhà xưởng xây sẵn RBF6 (ctspace)',
    block: 'A',
    areaM2: 21_585.05,
    storeys: 4,
    clearHeightM: 21.55,
    note: 'Diện tích xây dựng (footprint) 10.751,65 m² · GFA = GLA (100% diện tích cho thuê)',
  },
  {
    id: 'RBF-07',
    name: 'Nhà xưởng xây sẵn RBF7 (ctspace)',
    block: 'A',
    areaM2: 21_585.05,
    storeys: 4,
    clearHeightM: 21.55,
    note: 'Diện tích xây dựng (footprint) 10.751,65 m² · GFA = GLA (100% diện tích cho thuê) · thiết kế đối xứng RBF6',
  },
  { id: 'UTI', name: 'Khu phụ trợ', block: 'C', areaM2: 144, storeys: 1, clearHeightM: 4.5 },
  { id: 'WT', name: 'Bể nước ngầm', block: 'C', areaM2: 144, storeys: 1, clearHeightM: 3, note: '12×12×4m' },
  { id: 'WWTP', name: 'Trạm xử lý nước thải', block: 'C', areaM2: 135.6, storeys: 1, clearHeightM: 3.85, note: '11,3×12m' },
  {
    id: 'PS2',
    name: 'Trạm điện 02 + bệ đỡ trạm điện',
    block: 'C',
    areaM2: 175.25,
    storeys: 1,
    clearHeightM: 4.5,
    note: 'Diện tích tách 2 hạng mục (trạm điện/bệ đỡ) bị xáo trộn khi trích xuất PDF - số liệu tổng gộp, chưa tách chính xác 2 hạng mục con',
  },
  { id: 'GH-03', name: 'Nhà bảo vệ 3', block: 'D', areaM2: 22.75, storeys: 1, clearHeightM: 3.7, note: '3,5×6,5m' },
  {
    id: 'PK-02',
    name: 'Bãi đậu xe 02',
    block: 'D',
    areaM2: 1_800,
    storeys: 1,
    clearHeightM: 3.5,
    note: 'Kèm bể chứa nước sinh hoạt ngầm 6×5×3m',
  },
]
