// language mặc định 'vi' cho MỌI hàm bên dưới (không bắt buộc truyền) - giữ tương thích ngược với
// hàng chục nơi gọi hàm này từ trước khi có chức năng song ngữ (2026-09-02); các màn hình ĐÃ có
// sẵn `language` từ useLanguage() (Dashboard, Quantity, Clash...) truyền thêm tham số này vào để
// hiện đúng đơn vị/tên tháng theo ngôn ngữ đang chọn.
import type { Language } from '../i18n/LanguageContext'

export function formatNumber(n: number): string {
  const neg = n < 0
  const s = Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return neg ? `-${s}` : s
}

export function formatVND(amount: number, language: Language = 'vi'): string {
  return language === 'en' ? `${formatNumber(amount)} VND` : `${formatNumber(amount)} đ`
}

function trimDecimal(n: number): string {
  const rounded = Math.round(n * 100) / 100
  return rounded.toString().replace('.', ',')
}

// Bản tiếng Anh giữ nguyên dấu "," thập phân kiểu Việt (không đổi sang ".") - đây là số liệu dự
// án thật, ưu tiên nhất quán với mọi nơi khác trong nền tảng hơn là đổi quy ước thập phân theo
// từng ngôn ngữ (tránh 2 cách đọc số khác nhau cho cùng 1 dữ liệu).
export function formatVNDShort(amount: number, language: Language = 'vi'): string {
  const abs = Math.abs(amount)
  if (language === 'en') {
    if (abs >= 1_000_000_000) return `${trimDecimal(amount / 1_000_000_000)}B VND`
    if (abs >= 1_000_000) return `${trimDecimal(amount / 1_000_000)}M VND`
    return formatVND(amount, language)
  }
  if (abs >= 1_000_000_000) return `${trimDecimal(amount / 1_000_000_000)} tỷ đ`
  if (abs >= 1_000_000) return `${trimDecimal(amount / 1_000_000)} triệu đ`
  return formatVND(amount, language)
}

const WEEKDAYS = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]
const MONTH_LABELS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}`
}

export function formatWeekday(date: Date, language: Language = 'vi'): string {
  return language === 'en' ? WEEKDAYS_EN[date.getDay()] : WEEKDAYS[date.getDay()]
}

export function formatMonthLabel(date: Date, language: Language = 'vi'): string {
  const label = language === 'en' ? MONTH_LABELS_EN[date.getMonth()] : MONTH_LABELS[date.getMonth()]
  return `${label}/${date.getFullYear()}`
}

export function formatMonthShort(date: Date, language: Language = 'vi'): string {
  const prefix = language === 'en' ? 'M' : 'T'
  return `${prefix}${date.getMonth() + 1}/${String(date.getFullYear()).slice(2)}`
}
