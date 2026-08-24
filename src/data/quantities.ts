import type { BlockId, Discipline } from '../types'
import { PROJECT_START } from './constants'
import { addMonths } from '../utils/random'

export type QuantityGroup =
  | 'Kết cấu - Bê tông'
  | 'Kết cấu - Thép'
  | 'Kiến trúc'
  | 'MEP - Điện'
  | 'MEP - Cơ & Đường ống'
  | 'Hạ tầng'

export type QuantityStatus = 'Khớp' | 'Cần rà soát' | 'Chênh lệch lớn'

export interface QuantityItem {
  id: string
  group: QuantityGroup
  discipline: Discipline
  block: BlockId | 'Toàn dự án'
  name: string
  unit: string
  contractQty: number
  modelQty: number
  diffPercent: number
  unitPrice: number
  costImpact: number
  status: QuantityStatus
}

export interface ProcurementBatch {
  id: string
  materialGroup: string
  quantitySummary: string
  releaseDate: Date
  status: 'Đã phát hành' | 'Đang chuẩn bị'
}

// Dữ liệu thật, từ "BOQ CTP -15.08.26 PHASE 2 (VALUE).xlsx" (19 sheet: Sum P2 = tổng hợp 8
// Bill, Bill 4-Fac 6-7 = chi tiết Nhà xưởng chính, B6.INFRA = hạ tầng...).
//
// PHÁT HIỆN QUAN TRỌNG (đọc trực tiếp từng ô, không suy đoán): bộ BOQ này có SẴN 2 cột khối
// lượng riêng biệt cho mỗi dòng công tác chi tiết - "Quantity" (khối lượng gốc theo hồ sơ thiết
// kế/mời thầu) và "CBC Quantity" (khối lượng CBC tự đo bóc lại, dùng để TÍNH GIÁ THẬT trong cột
// "Amount" - đã đối chiếu số học nhiều dòng: Amount = CBC Quantity × Đơn giá, KHÔNG PHẢI Quantity
// × Đơn giá). Tức là CBC đã tự đối chiếu khối lượng mô hình BIM/đo đạc thực tế so với khối lượng
// hồ sơ thiết kế ngay trong chính bộ hồ sơ chào giá - đây CHÍNH LÀ dữ liệu "khối lượng hợp đồng
// vs. mô hình" mà màn hình này thể hiện, không cần dựng số liệu giả để minh hoạ như dự án trước
// (xem contractQty/modelQty bên dưới - lấy đúng 2 cột thật này, KHÔNG gán modelQty=contractQty).
// Các dòng "ADD WORKS BY CONSTRACTOR" (khối lượng phát sinh, không có Quantity gốc để so sánh)
// không đưa vào danh sách chi tiết bên dưới vì không có cặp số để đối chiếu.
interface RealItem {
  id: string
  group: QuantityGroup
  discipline: Discipline
  block: BlockId | 'Toàn dự án'
  name: string
  unit: string
  contractQty: number
  modelQty: number
  unitPrice: number
}

// ----- A. Tổng hợp Giai đoạn 2 theo Bill (tab "Sum P2") -----
// Không có khối lượng chi tiết ở cấp tổng Bill (chỉ có 1 dòng "trọn gói"/Bill), nên modelQty =
// contractQty = 1 ở tầng này - đúng thực tế (không phải dựng số liệu, chỉ là chưa có gì để so
// sánh ở mức tổng). Khớp đúng dòng "TOTAL AMOUNT (EXCLUDING VAT)" = 398.420.000.000.
const BILL_SUMMARY_ITEMS: RealItem[] = [
  { id: 'B01', group: 'Hạ tầng', discipline: 'Hạ tầng', block: 'Toàn dự án', name: 'Bill 01 - Yêu cầu chung và công tác chuẩn bị', unit: 'trọn gói', contractQty: 1, modelQty: 1, unitPrice: 15_017_755_000 },
  { id: 'B02', group: 'Hạ tầng', discipline: 'Hạ tầng', block: 'Toàn dự án', name: 'Bill 02 - Chi phí thiết kế', unit: 'trọn gói', contractQty: 1, modelQty: 1, unitPrice: 374_885_000 },
  { id: 'B03', group: 'Hạ tầng', discipline: 'Hạ tầng', block: 'Toàn dự án', name: 'Bill 03 - Phê duyệt của cơ quan chức năng', unit: 'trọn gói', contractQty: 1, modelQty: 1, unitPrice: 700_000_000 },
  { id: 'B04', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Bill 04 - Nhà kho và xưởng (RBF6-7)', unit: 'trọn gói', contractQty: 1, modelQty: 1, unitPrice: 225_475_347_000 },
  { id: 'B05', group: 'Kiến trúc', discipline: 'Kiến trúc', block: 'Toàn dự án', name: 'Bill 05 - Công trình phụ trợ', unit: 'trọn gói', contractQty: 1, modelQty: 1, unitPrice: 12_973_546_000 },
  { id: 'B06', group: 'Hạ tầng', discipline: 'Hạ tầng', block: 'B', name: 'Bill 06 - Công tác hạ tầng kỹ thuật', unit: 'trọn gói', contractQty: 1, modelQty: 1, unitPrice: 22_285_175_000 },
  { id: 'B07', group: 'MEP - Điện', discipline: 'MEP', block: 'Toàn dự án', name: 'Bill 07 - Công tác cơ điện (MEP)', unit: 'trọn gói', contractQty: 1, modelQty: 1, unitPrice: 121_213_587_000 },
  { id: 'B08', group: 'Kiến trúc', discipline: 'Kiến trúc', block: 'A', name: 'Bill 08 - Chứng nhận LEED', unit: 'trọn gói', contractQty: 1, modelQty: 1, unitPrice: 380_000_000 },
]

// ----- B. Chi tiết Nhà xưởng chính RBF6-7 (sheet "Bill 4-Fac 6-7", mục A/B - Kết cấu) -----
// contractQty = cột "Quantity" (khối lượng hồ sơ thiết kế F6-7, cả 2 nhà), modelQty = cột "CBC
// Quantity" (CBC tự đo bóc lại - dùng để tính "Amount" thật trong BOQ, xem ghi chú đầu file).
const RBF_CONCRETE_ITEMS: RealItem[] = [
  { id: 'RBF-01', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Đào đất móng', unit: 'm³', contractQty: 13_963, modelQty: 7_949.97, unitPrice: 40_300 },
  { id: 'RBF-02', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Lấp đất móng', unit: 'm³', contractQty: 1_817, modelQty: 4_922.44, unitPrice: 70_100 },
  { id: 'RBF-03', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Đào đất đà kiềng', unit: 'm³', contractQty: 256, modelQty: 641.99, unitPrice: 40_300 },
  { id: 'RBF-04', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Lấp đất đà kiềng', unit: 'm³', contractQty: 79, modelQty: 400.37, unitPrice: 70_100 },
  { id: 'RBF-05', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Vận chuyển đất thải ra khỏi công trường', unit: 'm³', contractQty: 12_323, modelQty: 3_269.15, unitPrice: 18_500 },
  { id: 'RBF-06', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Huy động/di dời thiết bị ép cọc', unit: 'trọn gói', contractQty: 1, modelQty: 1, unitPrice: 123_717_300 },
  { id: 'RBF-07', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cung cấp và ép cọc thí nghiệm PHC-A400', unit: 'm', contractQty: 392, modelQty: 392, unitPrice: 838_000 },
  { id: 'RBF-08', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cung cấp và ép cọc đại trà PHC-A400', unit: 'm', contractQty: 34_776, modelQty: 30_720, unitPrice: 522_700 },
  { id: 'RBF-09', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Thử tải tĩnh cọc PHC-A400', unit: 'cái', contractQty: 14, modelQty: 14, unitPrice: 24_743_500 },
  { id: 'RBF-10', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cắt và đập đầu cọc D400', unit: 'cái', contractQty: 1_256, modelQty: 1_294, unitPrice: 54_100 },
  { id: 'RBF-11', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Xử lý đầu cọc D400', unit: 'cái', contractQty: 1_256, modelQty: 1_294, unitPrice: 579_614 },
  { id: 'RBF-12', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Đầm chặt đất móng', unit: 'm²', contractQty: 1_816, modelQty: 2_300.37, unitPrice: 20_300 },
  { id: 'RBF-13', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Bê tông lót móng (B10)', unit: 'm³', contractQty: 182, modelQty: 230.04, unitPrice: 2_014_284 },
  { id: 'RBF-14', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Bê tông móng (B30)', unit: 'm³', contractQty: 1_871, modelQty: 2_008.84, unitPrice: 1_988_800 },
  { id: 'RBF-15', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốt thép móng (VAS)', unit: 'kg', contractQty: 150_628, modelQty: 156_634.27, unitPrice: 21_800 },
  { id: 'RBF-16', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốp pha móng', unit: 'm²', contractQty: 2_823, modelQty: 3_076, unitPrice: 226_600 },
  { id: 'RBF-17', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Bê tông cổ cột, vách (B30)', unit: 'm³', contractQty: 358, modelQty: 470.89, unitPrice: 2_056_500 },
  { id: 'RBF-18', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốt thép cổ cột, vách (VAS)', unit: 'kg', contractQty: 144_482, modelQty: 134_223.74, unitPrice: 21_800 },
  { id: 'RBF-19', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốp pha cổ cột, vách', unit: 'm²', contractQty: 1_375, modelQty: 2_159.61, unitPrice: 318_500 },
  { id: 'RBF-20', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Bê tông đà kiềng (B30)', unit: 'm³', contractQty: 222, modelQty: 255.46, unitPrice: 2_002_300 },
  { id: 'RBF-21', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốp pha đà kiềng', unit: 'm²', contractQty: 1_644, modelQty: 2_336.39, unitPrice: 226_600 },
  { id: 'RBF-22', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốt thép đà kiềng (VAS)', unit: 'kg', contractQty: 61_706, modelQty: 74_820.12, unitPrice: 21_800 },
  { id: 'RBF-23', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Đầm chặt đất nền xưởng (K≥0.95)', unit: 'm²', contractQty: 19_440, modelQty: 19_439.65, unitPrice: 24_600 },
  { id: 'RBF-24', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Lớp đá 0x40 (K≥0.98)', unit: 'm³', contractQty: 4_860, modelQty: 4_093.34, unitPrice: 810_300 },
  { id: 'RBF-25', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Lớp PE (2 lớp) dưới nền', unit: 'm²', contractQty: 19_440, modelQty: 19_439.65, unitPrice: 13_600 },
  { id: 'RBF-26', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Bê tông nền nhà xưởng (M300)', unit: 'm³', contractQty: 3_903, modelQty: 3_780.24, unitPrice: 1_850_300 },
  { id: 'RBF-27', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốt thép nền tầng trệt (VAS)', unit: 'kg', contractQty: 330_383, modelQty: 29_323.82, unitPrice: 21_800 },
  { id: 'RBF-28', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Bê tông cột, vách (B30)', unit: 'm³', contractQty: 2_184, modelQty: 2_253.38, unitPrice: 2_056_500 },
  { id: 'RBF-29', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốt thép cột, vách (VAS)', unit: 'kg', contractQty: 329_626, modelQty: 336_116.6, unitPrice: 21_800 },
  { id: 'RBF-30', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốp pha cột, vách', unit: 'm²', contractQty: 9_843, modelQty: 10_172.24, unitPrice: 318_500 },
  { id: 'RBF-31', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Bê tông dầm sàn tầng (B30+R7)', unit: 'm³', contractQty: 8_449, modelQty: 8_531.62, unitPrice: 2_173_300 },
  { id: 'RBF-32', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốt thép dầm sàn tầng (VAS)', unit: 'kg', contractQty: 1_447_167, modelQty: 1_452_244.29, unitPrice: 21_800 },
  { id: 'RBF-33', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốp pha dầm sàn tầng', unit: 'm²', contractQty: 20_152, modelQty: 35_893.94, unitPrice: 274_500 },
  { id: 'RBF-34', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Bê tông cầu thang bộ (B30)', unit: 'm³', contractQty: 47, modelQty: 42.83, unitPrice: 2_097_100 },
  { id: 'RBF-35', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốt thép cầu thang bộ (VAS)', unit: 'kg', contractQty: 7_588, modelQty: 7_567.4, unitPrice: 21_800 },
  { id: 'RBF-36', group: 'Kết cấu - Bê tông', discipline: 'Kết cấu', block: 'A', name: 'Cốp pha cầu thang bộ', unit: 'm²', contractQty: 375, modelQty: 388.34, unitPrice: 227_600 },
]

// Kết cấu thép (sheet "Bill 4-Fac 6-7", mục C - HỆ KHUNG THÉP)
const STEEL_ITEMS: RealItem[] = [
  { id: 'STL-01', group: 'Kết cấu - Thép', discipline: 'Kết cấu', block: 'A', name: 'Cột thép nhà xưởng (Q355B/SS400, mạ kẽm)', unit: 'kg', contractQty: 68_182, modelQty: 117_446.83, unitPrice: 32_700 },
  { id: 'STL-02', group: 'Kết cấu - Thép', discipline: 'Kết cấu', block: 'A', name: 'Dầm/kèo thép (Q355B/SS400, mạ kẽm)', unit: 'kg', contractQty: 126_689, modelQty: 164_206.21, unitPrice: 29_700 },
  { id: 'STL-03', group: 'Kết cấu - Thép', discipline: 'Kết cấu', block: 'A', name: 'Bu lông neo chân cột thép', unit: 'bộ', contractQty: 576, modelQty: 576, unitPrice: 142_400 },
]

// Cửa, cửa sổ, vách kính (sheet "Bill 4-Fac 6-7", mục L)
const DOOR_ITEMS: RealItem[] = [
  { id: 'DR-01', group: 'Kiến trúc', discipline: 'Kiến trúc', block: 'A', name: 'Cửa cuốn thép chống cháy EI45 (SRD1, 3000×3500)', unit: 'bộ', contractQty: 24, modelQty: 24, unitPrice: 126_449_900 },
  { id: 'DR-02', group: 'Kiến trúc', discipline: 'Kiến trúc', block: 'A', name: 'Cửa cuốn thép cách nhiệt (SRD2, 3000×4500)', unit: 'bộ', contractQty: 6, modelQty: 12, unitPrice: 55_610_500 },
  { id: 'DR-03', group: 'Kiến trúc', discipline: 'Kiến trúc', block: 'A', name: 'Cửa đi 1 cánh thép chống cháy EI45 (SD-01, 1000×2200)', unit: 'bộ', contractQty: 12, modelQty: 12, unitPrice: 13_597_100 },
  { id: 'DR-04', group: 'Kiến trúc', discipline: 'Kiến trúc', block: 'A', name: 'Vách kính khung nhôm, cửa đẩy 2 cánh (GP-01, 3000×3000)', unit: 'bộ', contractQty: 4, modelQty: 4, unitPrice: 35_294_400 },
  { id: 'DR-05', group: 'Kiến trúc', discipline: 'Kiến trúc', block: 'A', name: 'Cửa sổ mở khung nhôm (W1, 1000×1100)', unit: 'bộ', contractQty: 16, modelQty: 16, unitPrice: 3_834_500 },
  { id: 'DR-06', group: 'Kiến trúc', discipline: 'Kiến trúc', block: 'A', name: 'Lam nhôm thông gió (WL-01, 5000×1000)', unit: 'bộ', contractQty: 80, modelQty: 80, unitPrice: 11_710_300 },
]

// Hạ tầng kỹ thuật (sheet "B6.INFRA", mục A/B - chuẩn bị mặt bằng & kết cấu mặt đường)
const INFRA_ITEMS: RealItem[] = [
  { id: 'INF-01', group: 'Hạ tầng', discipline: 'Hạ tầng', block: 'B', name: 'Dọn dẹp và phát quang mặt bằng', unit: 'm²', contractQty: 45_500, modelQty: 45_605.37, unitPrice: 10_500 },
  { id: 'INF-02', group: 'Hạ tầng', discipline: 'Hạ tầng', block: 'B', name: 'Bê tông nhựa chặt C12.5 dày 6cm (K≥0.98)', unit: 'm³', contractQty: 234, modelQty: 230.03, unitPrice: 4_015_800 },
  { id: 'INF-03', group: 'Hạ tầng', discipline: 'Hạ tầng', block: 'B', name: 'Tưới nhựa thấm bám (1,0 kg/m²)', unit: 'm²', contractQty: 3_906, modelQty: 3_833.89, unitPrice: 34_500 },
  { id: 'INF-04', group: 'Hạ tầng', discipline: 'Hạ tầng', block: 'B', name: 'Cấp phối đá dăm 0x4 loại 1, dày 20cm (K≥0.98)', unit: 'm³', contractQty: 781, modelQty: 776.96, unitPrice: 891_900 },
  { id: 'INF-05', group: 'Hạ tầng', discipline: 'Hạ tầng', block: 'B', name: 'Cấp phối đá dăm 0x4 loại 2, dày 20cm (K≥0.98)', unit: 'm³', contractQty: 781, modelQty: 817.67, unitPrice: 810_300 },
  { id: 'INF-06', group: 'Hạ tầng', discipline: 'Hạ tầng', block: 'B', name: 'Đầm chặt nền đường hiện hữu, lớp 50cm (K≥0.95)', unit: 'm²', contractQty: 3_906, modelQty: 3_833.89, unitPrice: 24_600 },
]

function toQuantityItem(t: RealItem): QuantityItem {
  const diff = t.modelQty - t.contractQty
  const diffPercent = t.contractQty !== 0 ? Math.round((diff / t.contractQty) * 100) : 0
  const costImpact = Math.round(diff * t.unitPrice)
  const absPercent = Math.abs(diffPercent)
  const status: QuantityStatus = absPercent < 3 ? 'Khớp' : absPercent <= 15 ? 'Cần rà soát' : 'Chênh lệch lớn'
  return {
    id: t.id,
    group: t.group,
    discipline: t.discipline,
    block: t.block,
    name: t.name,
    unit: t.unit,
    contractQty: t.contractQty,
    modelQty: t.modelQty,
    diffPercent,
    unitPrice: t.unitPrice,
    costImpact,
    status,
  }
}

export const quantityItems: QuantityItem[] = [
  ...BILL_SUMMARY_ITEMS,
  ...RBF_CONCRETE_ITEMS,
  ...STEEL_ITEMS,
  ...DOOR_ITEMS,
  ...INFRA_ITEMS,
].map(toQuantityItem)

const BATCH_TEMPLATES: Array<{
  id: string
  materialGroup: string
  quantitySummary: string
  month: number
}> = [
  { id: 'DOT-01', materialGroup: 'Cọc PHC-A400 (1.256 cọc thử + đại trà)', quantitySummary: 'Cọc thử + cọc đại trà Nhà xưởng RBF6-7, 1 robot ép cọc', month: 1 },
  { id: 'DOT-02', materialGroup: 'Thép kết cấu & bê tông thương phẩm', quantitySummary: 'Khung BTCT + kết cấu thép RBF6/RBF7 (~195 tấn thép hình)', month: 5 },
  { id: 'DOT-03', materialGroup: 'Vật tư MEP - điện, PCCC, HVAC', quantitySummary: 'Hệ thống điện & thông tin liên lạc, PCCC, điều hoà thông gió', month: 8 },
  { id: 'DOT-04', materialGroup: 'Hoàn thiện kiến trúc', quantitySummary: 'Tôn vách/mái, cửa cuốn, vách kính, sơn, ốp lát, hoàn thiện sàn', month: 11 },
]

export const procurementBatches: ProcurementBatch[] = BATCH_TEMPLATES.map((b) => ({
  id: b.id,
  materialGroup: b.materialGroup,
  quantitySummary: b.quantitySummary,
  releaseDate: addMonths(PROJECT_START, b.month - 1),
  status: 'Đang chuẩn bị',
}))

export const QUANTITY_GROUPS: QuantityGroup[] = [
  'Kết cấu - Bê tông',
  'Kết cấu - Thép',
  'Kiến trúc',
  'MEP - Điện',
  'MEP - Cơ & Đường ống',
  'Hạ tầng',
]
