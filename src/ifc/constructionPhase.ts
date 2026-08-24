// Phân nhỏ trình tự thi công BÊN TRONG 1 bộ môn - "Kết cấu"/"Kiến trúc" ở 1 tầng không thi
// công dồn 1 lúc trong đời thật: ép cọc trước tiên, rồi móng/đài cọc, cột dựng trước dầm sàn,
// tường bao che lên sau khi khung xong, cửa/hoàn thiện là bước cuối. Trước đây thanh trượt 4D
// chỉ chia theo (tầng x bộ môn) nên cả tầng "hiện" cùng lúc trong 1 bước - không phản ánh đúng
// trình tự thật. classifyConstructionPhase() cho phép tách nhỏ hơn: (tầng x bộ môn x giai đoạn).
export type ConstructionPhase = 'coc' | 'mong' | 'khung' | 'san_mai' | 'bao_che' | 'hoan_thien' | 'khac'

export const PHASE_LABEL: Record<ConstructionPhase, string> = {
  coc: 'Ép cọc',
  mong: 'Móng / đài móng',
  khung: 'Khung cột/dầm',
  san_mai: 'Sàn/mái',
  bao_che: 'Bao che (tường/cửa)',
  hoan_thien: 'Hoàn thiện',
  khac: 'Khác',
}

// Tone màu theo giai đoạn thi công, dùng để tô cấu kiện Kết cấu/Kiến trúc trong viewport IFC
// (xem IfcModelView.tsx) - cố tình đi theo 1 câu chuyện thị giác nhất quán thay vì chọn màu rời
// rạc: nâu đất (cọc/đào đắp) -> xám bê tông (móng) -> dải xanh than đậm dần nhạt (khung -> sàn
// mái -> bao che, đúng thứ tự "lõi kết cấu" -> "bề mặt bao che") -> vàng đất ấm (hoàn thiện, vật
// liệu hoàn thiện/nội thất). Tách hẳn khỏi DISCIPLINE_COLORS (data/constants.ts) - đó là bảng
// màu 4 bộ môn dùng cho panel lọc/màn hình khác, không đổi theo yêu cầu này.
export const PHASE_COLORS: Record<ConstructionPhase, string> = {
  coc: '#b3742c',
  mong: '#5f6672',
  khung: '#2f4a68',
  san_mai: '#6f8ba6',
  bao_che: '#8fb4c4',
  hoan_thien: '#c9a876',
  khac: '#9aa1ac',
}

// Nhận diện cọc/móng/đài móng qua TÊN FAMILY/TYPE Revit (RelatingType.Name qua
// IfcRelDefinesByType) - bắt buộc phải dựa vào tên vì nhiều đồ án Revit->IFC (kể cả file dự án
// đang dùng) xuất TẤT CẢ cọc, đài móng và sàn thật xuống chung 1 lớp IfcSlab, không có IfcPile/
// IfcFooting riêng (đã kiểm chứng qua smoke-test thực tế: 1791 "…PILE…", 1174 "…Footing…"/"…PILE
// CAP…", chỉ 170 phần tử còn lại là sàn/mái thật kiểu "Floor:…"/"Basic Roof:…"). Thứ tự kiểm tra
// quan trọng: "pile cap" phải khớp trước "pile" đơn thuần (đài cọc thi công SAU cọc, không phải
// cùng giai đoạn).
const FOOTING_LIKE_NAME_PATTERN = /pile\s*cap|footing|móng|đài\s*cọc/i
const PILE_NAME_PATTERN = /pile|cọc/i

function classifyByTypeName(typeName: string | null | undefined): ConstructionPhase | null {
  if (!typeName) return null
  if (FOOTING_LIKE_NAME_PATTERN.test(typeName)) return 'mong'
  if (PILE_NAME_PATTERN.test(typeName)) return 'coc'
  return null
}

const PHASE_BY_CLASS: Record<string, ConstructionPhase> = {
  // Móng/cọc - luôn thi công đầu tiên trong 1 tầng/khối. Giữ IFCPILE/IFCFOOTING ở đây làm
  // phương án dự phòng theo LỚP IFC cho những file xuất đúng chuẩn (khác với file dự án hiện
  // tại) - typeName ở trên vẫn được ưu tiên kiểm tra trước khi rơi về bảng này.
  IFCFOOTING: 'mong',
  IFCPILE: 'coc',

  // Khung chịu lực đứng - cột dựng trước dầm.
  IFCCOLUMN: 'khung',
  IFCCOLUMNSTANDARDCASE: 'khung',
  IFCBEAM: 'khung',
  IFCBEAMSTANDARDCASE: 'khung',
  IFCMEMBER: 'khung',
  IFCMEMBERSTANDARDCASE: 'khung',
  IFCPLATE: 'khung',
  IFCPLATESTANDARDCASE: 'khung',

  // Sàn/mái - đổ sau khi khung xong.
  IFCSLAB: 'san_mai',
  IFCSLABSTANDARDCASE: 'san_mai',
  IFCROOF: 'san_mai',

  // Bao che - tường, cửa, vách kính lên sau khi có khung + sàn.
  IFCWALL: 'bao_che',
  IFCWALLSTANDARDCASE: 'bao_che',
  IFCWALLELEMENTEDCASE: 'bao_che',
  IFCCURTAINWALL: 'bao_che',
  IFCCURTAINWALLELEMENT: 'bao_che',
  IFCWINDOW: 'bao_che',
  IFCWINDOWSTANDARDCASE: 'bao_che',
  IFCDOOR: 'bao_che',
  IFCDOORSTANDARDCASE: 'bao_che',

  // Hoàn thiện - bước cuối cùng.
  IFCCOVERING: 'hoan_thien',
  IFCSTAIR: 'hoan_thien',
  IFCSTAIRFLIGHT: 'hoan_thien',
  IFCRAILING: 'hoan_thien',
  IFCRAMP: 'hoan_thien',
  IFCRAMPFLIGHT: 'hoan_thien',
  IFCFURNISHINGELEMENT: 'hoan_thien',
  IFCFURNITURE: 'hoan_thien',
}

/** typeName (nếu có) là RelatingType.Name đọc qua IfcRelDefinesByType - ưu tiên cao hơn lớp IFC
 * vì đây mới là tín hiệu đáng tin cậy để tách cọc/móng ra khỏi sàn thật trong các file gộp
 * chung 1 lớp IfcSlab (xem ghi chú ở FOOTING_LIKE_NAME_PATTERN/PILE_NAME_PATTERN). */
export function classifyConstructionPhase(ifcClass: string, typeName?: string | null): ConstructionPhase {
  return classifyByTypeName(typeName) ?? PHASE_BY_CLASS[ifcClass.toUpperCase()] ?? 'khac'
}
