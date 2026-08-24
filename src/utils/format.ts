export function formatNumber(n: number): string {
  const neg = n < 0
  const s = Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return neg ? `-${s}` : s
}

export function formatVND(amount: number): string {
  return `${formatNumber(amount)} đ`
}

function trimDecimal(n: number): string {
  const rounded = Math.round(n * 100) / 100
  return rounded.toString().replace('.', ',')
}

export function formatVNDShort(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000_000) return `${trimDecimal(amount / 1_000_000_000)} tỷ đ`
  if (abs >= 1_000_000) return `${trimDecimal(amount / 1_000_000)} triệu đ`
  return formatVND(amount)
}

const WEEKDAYS = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
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

export function formatWeekday(date: Date): string {
  return WEEKDAYS[date.getDay()]
}

export function formatMonthLabel(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()]}/${date.getFullYear()}`
}

export function formatMonthShort(date: Date): string {
  return `T${date.getMonth() + 1}/${String(date.getFullYear()).slice(2)}`
}
