export interface SitePhoto {
  id: string
  phase: string
  phaseEn: string
  note: string
  noteEn: string
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
//
// phaseEn/noteEn: bản tiếng Anh cho chức năng song ngữ (yêu cầu người dùng 2026-09-02), dùng
// đúng thuật ngữ xây dựng chuẩn (không dịch sát nghĩa).
const BASE = './project-data/site-photos/'

const ENTRIES: Array<[string, string, string, string, string]> = [
  ['01-ep-coc.jpg', 'Ép cọc', 'Pile driving', 'Ép cọc bê tông ly tâm bằng robot ép cọc thuỷ lực', 'Driving precast concrete spun piles with a hydraulic piling robot'],
  ['02-thi-cong-mong.jpg', 'Thi công móng', 'Foundation works', 'Thi công móng, đổ bê tông đài móng', 'Foundation works, pouring concrete for pile caps'],
  ['03-thi-cong-da-kieng.jpg', 'Thi công đà kiềng', 'Ground beam works', 'Thi công đà kiềng liên kết móng', 'Constructing ground beams tying the foundations together'],
  ['04-lap-dung-khung-thep.jpg', 'Lắp dựng khung thép', 'Steel frame erection', 'Lắp dựng khung, kèo thép nhà xưởng bằng cẩu bánh lốp', 'Erecting the factory steel frame and rafters with a mobile crane'],
  ['05-lop-mai-vach-panel.jpg', 'Lợp mái, vách panel', 'Roof and wall panel cladding', 'Lợp mái tôn và lắp vách panel bao che', 'Installing metal roof sheeting and envelope wall panels'],
  ['06-lap-dat-vach-panel.jpg', 'Lắp đặt vách panel', 'Wall panel installation', 'Lắp đặt tấm panel cách nhiệt bao che nhà xưởng', 'Installing insulated envelope wall panels for the factory'],
  ['07-thi-cong-nen.jpg', 'Thi công nền', 'Floor slab works', 'Thi công lưới thép sàn nền trước khi đổ bê tông', 'Placing floor slab rebar mesh before concrete pour'],
  ['08-mai-nen.jpg', 'Mài nền', 'Floor grinding', 'Mài, hoàn thiện bề mặt nền bê tông', 'Grinding and finishing the concrete floor surface'],
  ['09-xay-tuong-gach-van-phong.jpg', 'Xây tường gạch văn phòng', 'Office brick wall construction', 'Xây tường gạch khu văn phòng', 'Building brick walls for the office area'],
  ['10-xay-tuong-gach-van-phong-2.jpg', 'Xây tường gạch văn phòng (2)', 'Office brick wall construction (2)', 'Xây tường gạch khu văn phòng, giai đoạn tiếp theo', 'Building brick walls for the office area, next stage'],
  ['11-to-trat-tuong-van-phong.jpg', 'Tô trát tường văn phòng', 'Office wall plastering', 'Tô trát hoàn thiện mặt ngoài khu văn phòng', 'Plastering and finishing the office exterior walls'],
  ['12-lap-dat-kinh-van-phong.jpg', 'Lắp đặt kính văn phòng', 'Office glazing installation', 'Lắp đặt hệ khung kính mặt tiền văn phòng', 'Installing the glass curtain wall system for the office facade'],
  ['13-lap-dat-mai-don-van-phong.jpg', 'Lắp đặt mái đón văn phòng', 'Office canopy installation', 'Lắp đặt mái đón sảnh văn phòng', 'Installing the entrance canopy for the office lobby'],
  ['14-thi-cong-ong-pccc.jpg', 'Thi công ống PCCC', 'Fire protection piping works', 'Lắp đặt hệ thống ống PCCC trong nhà xưởng', 'Installing the fire protection piping system inside the factory'],
]

export const sitePhotos: SitePhoto[] = ENTRIES.map(([file, phase, phaseEn, note, noteEn], i) => ({
  id: `IMG-${String(i + 1).padStart(3, '0')}`,
  phase,
  phaseEn,
  note,
  noteEn,
  image: `${BASE}${file}`,
}))
