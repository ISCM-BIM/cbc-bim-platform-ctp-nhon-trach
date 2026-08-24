import type { Equipment } from '../types'

// Dự án CHƯA ký hợp đồng (xem CURRENT_DATE trong constants.ts - trước cả ngày LOA), nên chưa có
// bất kỳ thiết bị MEP/PCCC/HVAC nào được lắp đặt để theo dõi vận hành & bảo trì thật - để trống
// thay vì dựng danh mục thiết bị giả. Cả 3 màn hình dùng dữ liệu này (bảng thiết bị, lịch bảo
// trì, bộ lọc theo hệ thống trên Assets.tsx) đã tự xử lý mảng rỗng gọn gàng (không cần sửa thêm
// code UI - xem EquipmentTable.tsx "Không có thiết bị phù hợp bộ lọc", MaintenanceCalendar.tsx
// tự hiện "0 mốc bảo trì"). Danh mục hệ thống MEP dự kiến (điện, PCCC, cấp thoát nước...) đã có
// trong Bill 07 của BOQ - xem quantities.ts/QUANTITY_GROUPS và Bill 07 trong "Sum P2" - sẽ điền
// thiết bị cụ thể vào đây khi bước vào giai đoạn lắp đặt thật (sau khi có shop drawing MEPF được
// duyệt, mục 3.2.2 trong schedule.ts).
export const equipment: Equipment[] = []
