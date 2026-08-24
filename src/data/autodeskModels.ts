export interface PartnerModelLink {
  id: string
  name: string
  description: string
  url: string
  isDemo?: boolean
}

// Model do đối tác (nhà thầu phụ/nhà cung cấp thiết bị) tự upload lên "Autodesk Viewer"
// (viewer.autodesk.com - công cụ xem & chia sẻ model 3D MIỄN PHÍ của Autodesk). Chưa có link nào
// được CTP Nhơn Trạch/đối tác chia sẻ cho dự án này - để trống thay vì dùng lại link mặt bằng
// tổng thể của dự án khác. AutodeskViewer.tsx đã tự xử lý mảng rỗng gọn gàng ("Chưa có model nào
// được chia sẻ"). Gửi link mới cho ISCM để bổ sung vào danh sách khi có.
export const PARTNER_MODEL_LINKS: PartnerModelLink[] = []
