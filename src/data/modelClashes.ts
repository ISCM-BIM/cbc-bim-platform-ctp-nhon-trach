export interface ModelClashPoint {
  id: string
  title: string
  image: string
}

// Chưa có báo cáo va chạm thật đã kiểm tra (ảnh chụp màn hình Revit khoanh vị trí va chạm) cho
// dự án này - khác dự án trước, lần này không có file Excel "va chạm đã kiểm tra" nào được cung
// cấp cùng bộ hồ sơ. Để trống thay vì dùng lại ảnh va chạm của dự án khác (sẽ sai ngữ cảnh cấu
// kiện, không giống cách "ảnh minh hoạ có ghi rõ nguồn" đã áp dụng cho sitePhotos.ts) - Model3D.tsx
// đã tự xử lý mảng rỗng gọn gàng (không hiện marker nào trên mô hình 3D, không cần sửa thêm code).
export const modelClashes: ModelClashPoint[] = []
