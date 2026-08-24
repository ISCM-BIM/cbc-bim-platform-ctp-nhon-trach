// Phân nhóm cấu kiện MEP theo HỆ THỐNG thật (không phải đoán) - dựa trên khảo sát trực tiếp file
// IFC thật (script khảo sát riêng qua web-ifc Node build, không đưa vào repo). Logic dưới đây đã
// được kiểm chứng qua 2 file dự án khác nhau nên giữ 2 tầng tín hiệu:
// - Dự án trước (01_ARC_TH_FACTORY_2.ifc, 508MB): 1053 thực thể IfcSystem thật do kỹ sư MEP CBC
//   đặt tên, mỗi hệ có ObjectType mô tả rõ ràng song ngữ (vd "M-Cấp Gió FCU/AHU-SAD"), đủ 23 nhóm
//   ký hiệu tên hệ - đây là nguồn của phần lớn pattern trong classifyByObjectType().
// - Dự án hiện tại (NT-CTP_NT3-CD-A-R6_7-R24_detached.ifc, file Kiến trúc thuần) chỉ có 52 IfcSystem
//   thật, toàn bộ là "RWP 1..52" / ObjectType "P_RAIN WATER" (đường ống thoát nước mưa mái) - đã
//   thêm pattern "rain water" riêng, không có hệ điện/nước/khí nào khác dạng IfcSystem trong file
//   này (khớp đúng: file "A" không có cấu kiện M&E thật ngoài ống thoát nước mưa mô hình chung
//   với Kiến trúc).
export type MepSystemCategory =
  | 'cap_gio'
  | 'hoi_thai_gio'
  | 'nuoc_lanh'
  | 'lo_hoi_nuoc_nong'
  | 'khi_nen'
  | 'cap_thoat_nuoc'
  | 'dien_chieu_sang'
  | 'khac'

export const MEP_SYSTEM_CATEGORIES: MepSystemCategory[] = [
  'cap_gio',
  'hoi_thai_gio',
  'nuoc_lanh',
  'lo_hoi_nuoc_nong',
  'khi_nen',
  'cap_thoat_nuoc',
  'dien_chieu_sang',
  'khac',
]

export const MEP_SYSTEM_LABEL: Record<MepSystemCategory, string> = {
  cap_gio: 'Cấp gió tươi / FCU-AHU',
  hoi_thai_gio: 'Hồi / hút thải gió',
  nuoc_lanh: 'Nước lạnh Chiller & giải nhiệt',
  lo_hoi_nuoc_nong: 'Lò hơi & nước nóng',
  khi_nen: 'Khí nén',
  cap_thoat_nuoc: 'Cấp thoát nước',
  dien_chieu_sang: 'Điện & chiếu sáng',
  khac: 'Khác / chưa phân loại',
}

// Tông màu tách biệt khỏi PHASE_COLORS (constructionPhase.ts) và DISCIPLINE_COLORS
// (data/constants.ts) - không dùng chung 1 legend với 2 bảng kia nên trùng tông không gây nhầm,
// nhưng vẫn chọn theo liên tưởng tự nhiên: xanh dương (gió cấp - khí sạch/mới) -> xanh xám (gió
// hồi/thải - khí đã dùng) -> xanh ngọc (nước lạnh) -> cam đỏ (lò hơi/nước nóng - nhiệt) -> tím
// (khí nén - hệ riêng biệt) -> xanh lá (cấp thoát nước - quy ước ống nước phổ biến) -> vàng đất
// (điện/chiếu sáng) -> xám trung tính (khác).
export const MEP_SYSTEM_COLORS: Record<MepSystemCategory, string> = {
  cap_gio: '#3987e5',
  hoi_thai_gio: '#64748b',
  nuoc_lanh: '#22b8c4',
  lo_hoi_nuoc_nong: '#d95926',
  khi_nen: '#9085e9',
  cap_thoat_nuoc: '#199e70',
  dien_chieu_sang: '#c98500',
  khac: '#9aa1ac',
}

/**
 * Tín hiệu CHÍNH: ObjectType của IfcSystem thật mà cấu kiện được gán vào (qua
 * IfcRelAssignsToGroup - xem buildMepSystemIndex trong parseIfc.ts). Đây là dữ liệu do kỹ sư
 * MEP tự đặt khi dựng hệ thống trong Revit, đáng tin hơn nhiều so với suy đoán từ tên
 * family/lớp IFC. So khớp trên bản ĐÃ hạ chữ thường của toàn bộ 23 giá trị ObjectType thật quan
 * sát được trong file, không phải regex rộng "đoán chừng".
 */
function classifyByObjectType(objectType: string | undefined): MepSystemCategory | null {
  if (!objectType) return null
  const t = objectType.toLowerCase()
  // "Fresh Air-FAD", "Cấp Gió FCU/AHU-SAD", "Make Up Air"
  if (/fresh\s*air|cấp\s*gió|fcu\/ahu|make\s*up\s*air/.test(t)) return 'cap_gio'
  // "Return Air-RAD", "Exhaust Air-EAD", "Smoke Exhaust Air"
  if (/return\s*air|hồi\s*gió|exhaust\s*air|hút\s*gió\s*thải|smoke\s*exhaust/.test(t)) return 'hoi_thai_gio'
  // "Chiller Supply/Return (CHWS/CHWR)", "Condenser Supply/Return (CWS/CWR)" - kiểm tra TRƯỚC
  // quy tắc "cw-" bên dưới vì "Condenser...(CWS)" cũng chứa chuỗi "cw".
  if (/chiller|condenser|giải\s*nhiệt/.test(t)) return 'nuoc_lanh'
  // "Cấp Boiler", "Nước ngưng Boiler", "Hot Chiller Supply/Return (HWS/HWR)"
  if (/boiler|hot\s*chiller|nóng/.test(t)) return 'lo_hoi_nuoc_nong'
  // "Cấp Khí nén thấp/cao áp", "Compressor Air (CA)"
  if (/khí\s*nén|compressor\s*air/.test(t)) return 'khi_nen'
  // "RP-uPVC" (rain pipe), "WP-..." (waste pipe), "SP-uPVC" (soil pipe), "VP-uPVC" (vent pipe),
  // "CW-..." (cold water) - tiền tố chuẩn ống cấp thoát nước.
  if (/^(rp|wp|sp|vp|cw)-/.test(t) || /soil\s*pipe/.test(t)) return 'cap_thoat_nuoc'
  // "P_RAIN WATER" (khảo sát trực tiếp file NT-CTP_NT3-CD-A-R6_7-R24_detached.ifc - 52 hệ RWP
  // 1-52, toàn bộ đường ống thoát nước mưa mái của RBF6-7, tín hiệu ObjectType thật khác cú pháp
  // "RP-..." đã có ở trên nên thêm pattern riêng thay vì sửa pattern cũ).
  if (/rain\s*water/.test(t)) return 'cap_thoat_nuoc'
  return null
}

/**
 * Tín hiệu DỰ PHÒNG khi cấu kiện không được gán vào IfcSystem nào (thường gặp ở đèn/máng cáp -
 * các hệ điện nhẹ trong file này không dựng thành IfcSystem như hệ gió/nước) - dựa vào tên
 * family/type Revit gốc (RelatingType.Name, cùng nguồn dữ liệu buildTypeNameIndex đã dùng cho
 * constructionPhase.ts).
 */
function classifyByTypeName(typeName: string | undefined): MepSystemCategory | null {
  if (!typeName) return null
  if (/^lf_|light\s*fixture|đèn/i.test(typeName)) return 'dien_chieu_sang'
  if (/cable\s*tray/i.test(typeName)) return 'dien_chieu_sang'
  if (/pipe|ống|upvc|ppr|valve|van[\s_-]/i.test(typeName)) return 'cap_thoat_nuoc'
  return null
}

export function classifyMepSystem(systemObjectType: string | undefined, typeName: string | undefined): MepSystemCategory {
  return classifyByObjectType(systemObjectType) ?? classifyByTypeName(typeName) ?? 'khac'
}
