// Ảnh phối cảnh 3D thật của dự án (CTP Nhơn Trạch cung cấp, "Dữ liệu dự án/Concept/", 22 ảnh) -
// phối cảnh THIẾT KẾ (chưa thi công, khác ảnh hiện trường thật) nhưng là hình ảnh CHÍNH THỨC của
// dự án, xác nhận rõ thương hiệu "ctpark Nhơn Trạch" (logo/biển hiệu "ctp" xuất hiện trong nhiều
// ảnh). Dung lượng lớn (~79MB/22 ảnh) nên KHÔNG bundle qua Vite import (src/assets), lưu cục bộ ở
// public/project-data/gallery/ (đã nằm trong .gitignore/.vercelignore sẵn có, không track git) -
// dùng đường dẫn tương đối như bản gốc trước khi chuyển Vercel Blob. Khi thật sự deploy, chuyển
// sang Vercel Blob theo đúng pattern đã dùng cho file IFC (xem README mục 5/8) - CHƯA làm bước đó
// (chỉ thực hiện khi được yêu cầu deploy).
const BASE = './project-data/gallery/'

export interface GalleryImage {
  id: string
  url: string
  caption: string
  captionEn: string
}

const FILE_COUNT = 22

export const projectGallery: GalleryImage[] = Array.from({ length: FILE_COUNT }, (_, i) => {
  const n = i + 1
  return {
    id: `GAL-${String(n).padStart(2, '0')}`,
    url: `${BASE}${String(n).padStart(2, '0')}.png`,
    caption: `Phối cảnh 3D ctpark Nhơn Trạch · Ảnh ${n}/${FILE_COUNT}`,
    captionEn: `ctpark Nhon Trach 3D rendering · Image ${n}/${FILE_COUNT}`,
  }
})
