export interface SitePhoto {
  id: string
  phase: string
  note: string
  image: string
}

// Dự án CTP Nhơn Trạch CHƯA khởi công (xem CURRENT_DATE trong constants.ts) nên chưa có ảnh
// công trường thật của chính RBF6. Theo yêu cầu người dùng (2026-08-25: "dự án TH đang để như
// thế nào bạn đem qua lại giống vậy") - dùng lại ĐÚNG bộ 14 ảnh thi công thật CBC từng cung cấp
// cho nền tảng (xem [[cbc-bim-platform-overview]]), giữ nguyên watermark gốc "Project: ATAI FUJI
// ELECTRIC VIỆT NAM" - đây là ảnh thi công THẬT do CBC chụp, nhưng KHÁC công trường/dự án so với
// CTP Nhơn Trạch (một dự án khác của CBC). Đã ghi rõ nguồn gốc ngay trong UI (SitePhotoGrid.tsx,
// Badge "Ảnh minh hoạ" + đoạn giải thích) - không gán ngày/tiến độ của RBF6 cho các ảnh này. Thứ
// tự dưới đây theo đúng trình tự thi công CBC đặt tên file (1 → 14: cọc → móng → khung → bao
// che → nền → hoàn thiện văn phòng → MEPF), không phải thứ tự theo ngày chụp.
const BASE = './project-data/site-photos/'

const ENTRIES: Array<[string, string, string]> = [
  ['01-ep-coc.jpg', 'Ép cọc', 'Ép cọc bê tông ly tâm bằng robot ép cọc thuỷ lực'],
  ['02-thi-cong-mong.jpg', 'Thi công móng', 'Thi công móng, đổ bê tông đài móng'],
  ['03-thi-cong-da-kieng.jpg', 'Thi công đà kiềng', 'Thi công đà kiềng liên kết móng'],
  ['04-lap-dung-khung-thep.jpg', 'Lắp dựng khung thép', 'Lắp dựng khung, kèo thép nhà xưởng bằng cẩu bánh lốp'],
  ['05-lop-mai-vach-panel.jpg', 'Lợp mái, vách panel', 'Lợp mái tôn và lắp vách panel bao che'],
  ['06-lap-dat-vach-panel.jpg', 'Lắp đặt vách panel', 'Lắp đặt tấm panel cách nhiệt bao che nhà xưởng'],
  ['07-thi-cong-nen.jpg', 'Thi công nền', 'Thi công lưới thép sàn nền trước khi đổ bê tông'],
  ['08-mai-nen.jpg', 'Mài nền', 'Mài, hoàn thiện bề mặt nền bê tông'],
  ['09-xay-tuong-gach-van-phong.jpg', 'Xây tường gạch văn phòng', 'Xây tường gạch khu văn phòng'],
  ['10-xay-tuong-gach-van-phong-2.jpg', 'Xây tường gạch văn phòng (2)', 'Xây tường gạch khu văn phòng, giai đoạn tiếp theo'],
  ['11-to-trat-tuong-van-phong.jpg', 'Tô trát tường văn phòng', 'Tô trát hoàn thiện mặt ngoài khu văn phòng'],
  ['12-lap-dat-kinh-van-phong.jpg', 'Lắp đặt kính văn phòng', 'Lắp đặt hệ khung kính mặt tiền văn phòng'],
  ['13-lap-dat-mai-don-van-phong.jpg', 'Lắp đặt mái đón văn phòng', 'Lắp đặt mái đón sảnh văn phòng'],
  ['14-thi-cong-ong-pccc.jpg', 'Thi công ống PCCC', 'Lắp đặt hệ thống ống PCCC trong nhà xưởng'],
]

export const sitePhotos: SitePhoto[] = ENTRIES.map(([file, phase, note], i) => ({
  id: `IMG-${String(i + 1).padStart(3, '0')}`,
  phase,
  note,
  image: `${BASE}${file}`,
}))
