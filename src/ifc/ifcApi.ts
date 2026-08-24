import { IfcAPI } from 'web-ifc'

// Singleton IfcAPI dùng chung cho mọi lần upload trong phiên làm việc - khởi tạo WASM một
// lần (khá tốn thời gian), các lần OpenModel sau chỉ tốn chi phí parse file.
let apiPromise: Promise<IfcAPI> | null = null

export function getIfcApi(): Promise<IfcAPI> {
  if (!apiPromise) {
    apiPromise = initApi()
  }
  return apiPromise
}

async function initApi(): Promise<IfcAPI> {
  const api = new IfcAPI()

  // Đường dẫn wasm phải tính TUYỆT ĐỐI theo document.baseURI (không dùng đường dẫn tương
  // đối theo currentScript) để chạy đúng trong mọi tình huống: dev server, build deploy ở
  // sub-path bất kỳ, hay mở trực tiếp dist/index.html qua file://. File .wasm được đồng bộ
  // vào public/wasm/ bởi scripts/copy-ifc-wasm.mjs (chạy tự động qua "postinstall").
  const wasmBaseUrl = new URL('wasm/', document.baseURI).toString()
  api.SetWasmPath(wasmBaseUrl, true)

  // forceSingleThread=true: chỉ dùng bản web-ifc.wasm (single-thread), tránh bản
  // web-ifc-mt.wasm vốn cần header COOP/COEP (cross-origin isolation) mà static hosting
  // thông thường (Vercel...) không tự cấu hình.
  await api.Init(undefined, true)
  return api
}

// Dùng khi cần "dọn" API để nạp lại từ đầu (vd. wasm load lỗi giữa chừng) - hiếm khi cần.
export function resetIfcApi(): void {
  apiPromise = null
}
