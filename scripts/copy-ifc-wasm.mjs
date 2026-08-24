// Đồng bộ file WASM của web-ifc vào public/wasm/ để Vite phục vụ như static asset.
// Chạy tự động sau `npm install` (xem "postinstall" trong package.json) vì file .wasm
// không nằm trong bundle JS - phải copy thủ công ra thư mục public.
// Chỉ copy bản single-thread (web-ifc.wasm) - KHÔNG dùng bản multi-thread (web-ifc-mt.wasm)
// vì bản đó cần header COOP/COEP (cross-origin isolation) mà static hosting như Vercel
// không tự cấu hình được, trong khi bản single-thread chạy được ở mọi nơi không cần header.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const src = join(root, 'node_modules', 'web-ifc', 'web-ifc.wasm')
const destDir = join(root, 'public', 'wasm')
const dest = join(destDir, 'web-ifc.wasm')

if (!existsSync(src)) {
  console.warn('[copy-ifc-wasm] Không tìm thấy node_modules/web-ifc/web-ifc.wasm - bỏ qua (web-ifc chưa cài?)')
  process.exit(0)
}

mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)
console.log(`[copy-ifc-wasm] Đã copy web-ifc.wasm -> public/wasm/web-ifc.wasm`)
