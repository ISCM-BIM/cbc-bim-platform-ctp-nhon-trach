export interface SitePhoto {
  id: string
  phase: string
  note: string
  image: string
}

// Dự án CHƯA khởi công (xem CURRENT_DATE trong constants.ts - còn trước cả ngày LOA) nên chưa có
// ảnh công trường thật nào. Dự án trước có một bộ ảnh "mượn" từ công trường KHÁC của CBC, ghi rõ
// nguồn gốc/watermark gốc trong UI - lần này không có bộ ảnh tương đương nào được cung cấp cùng
// hồ sơ, nên để trống thay vì tiếp tục dùng lại đúng bộ ảnh đó (sẽ gây hiểu lầm là ảnh của dự án
// này). Ảnh phối cảnh 3D thật của RBF6-7/ctpark Nhơn Trạch đã có ở Thư viện ảnh dự án trên
// Dashboard (xem projectGallery.ts) - đó là ảnh phối cảnh THIẾT KẾ, không phải ảnh hiện trường.
export const sitePhotos: SitePhoto[] = []
