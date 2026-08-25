export interface ModelClashPoint {
  id: string
  title: string
  images: string[]
}

// 2026-08-25: từng thử nạp va chạm thật từ "TH-CAP NHAT VA CHAM (1).xlsx" - sau đó người dùng
// xác nhận file đó thuộc dự án KHÁC (TH, xem [[cbc-bim-platform-overview]] - nội dung gốc mô tả
// "tầng lửng"/"phòng đóng gói"/"khu đóng gói gia vị", đúng bối cảnh nhà máy chế biến thực phẩm
// của dự án đó, không phải RBF6) và yêu cầu xoá khỏi nền tảng này. Đã xoá dữ liệu + ảnh gốc
// (src/assets/clashes/) - để trống lại, đúng nguyên tắc cũ: dự án CTP Nhơn Trạch chưa ký hợp
// đồng nên chưa có báo cáo va chạm thật của riêng RBF6. Model3D.tsx đã tự xử lý mảng rỗng gọn
// gàng (không hiện marker nào). Component hiển thị (IfcClashMarkers.tsx bán kính 0.9m dễ bấm,
// ModelClashPanel.tsx hiện nhiều ảnh/điểm + bấm phóng to toàn màn hình) vẫn giữ nguyên - chỉ là
// UI tổng quát, sẵn sàng dùng lại ngay khi có dữ liệu va chạm thật CỦA RBF6.
export const modelClashes: ModelClashPoint[] = []
