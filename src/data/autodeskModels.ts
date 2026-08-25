export interface PartnerModelLink {
  id: string
  name: string
  description: string
  url: string
  isDemo?: boolean
}

// Model do đối tác (nhà thầu phụ/nhà cung cấp thiết bị) tự upload lên "Autodesk Viewer"
// (viewer.autodesk.com - công cụ xem & chia sẻ model 3D MIỄN PHÍ của Autodesk). Link thật do
// người dùng cung cấp trực tiếp (2026-08-25) cho dự án CTP Nhơn Trạch - dùng link rút gọn
// autode.sk nguyên văn (không tự mở rộng/đổi link vì Autodesk Viewer không cho embed iframe từ
// domain khác, chỉ mở tab mới - xem AutodeskViewer.tsx).
export const PARTNER_MODEL_LINKS: PartnerModelLink[] = [
  {
    id: 'CTP-NHONTRACH-RBF6',
    name: 'Mô hình RBF6 - ctpark Nhơn Trạch',
    description: 'Model chia sẻ qua Autodesk Viewer.',
    url: 'https://autode.sk/4hTfGnj',
  },
]
