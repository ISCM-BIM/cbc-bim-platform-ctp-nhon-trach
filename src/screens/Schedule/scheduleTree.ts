import type { ScheduleItem } from '../../types'

// scheduleItems (data/schedule.ts) đã ở đúng thứ tự pre-order như file MS Project gốc (cha ngay
// trước dãy con của nó) - mọi hàm dưới đây dựa vào đúng tính chất này, không cần dựng lại cây từ
// đầu bằng con trỏ cha/con.

// Mặc định chỉ mở tới cấp 3 (mục lớn + mục con trực tiếp) - cấp 4 trở xuống (Team/Zone/bước thi
// công chi tiết, lặp lại nhiều lần theo từng zone) bắt đầu ở trạng thái thu gọn, người dùng tự mở
// khi cần xem sâu hơn. Chỉ hạng mục TỔNG HỢP (có con) mới có thể thu/mở.
export function defaultCollapsedSet(items: ScheduleItem[]): Set<string> {
  return new Set(items.filter((it) => it.isSummary && it.level >= 3).map((it) => it.wbsCode))
}

// Trả về danh sách hạng mục thật sự hiển thị, theo đúng thứ tự cây, sau khi áp dụng:
// 1. Bộ lọc block/discipline (chỉ áp lên hạng mục LÁ - hạng mục tổng hợp hiện nếu có ít nhất 1
//    con thoả điều kiện, để không mất ngữ cảnh cây).
// 2. Trạng thái thu/mở (ẩn toàn bộ hạng mục con của 1 nhánh đang bị thu gọn).
// Khi bộ lọc đang bật, cây TỰ ĐỘNG mở hết các nhánh có kết quả khớp (bỏ qua trạng thái thu gọn
// thủ công) để không có chuyện lọc ra kết quả nhưng lại đang bị ẩn bởi 1 nhánh thu gọn từ trước.
export function computeVisibleRows(
  items: ScheduleItem[],
  collapsed: Set<string>,
  matchesLeaf: (item: ScheduleItem) => boolean,
  filterActive: boolean,
): ScheduleItem[] {
  const inFilter: boolean[] = new Array(items.length).fill(!filterActive)

  if (filterActive) {
    const ancestorStack: number[] = []
    items.forEach((it, i) => {
      while (ancestorStack.length && items[ancestorStack[ancestorStack.length - 1]].level >= it.level) {
        ancestorStack.pop()
      }
      if (!it.isSummary && matchesLeaf(it)) {
        inFilter[i] = true
        for (const ai of ancestorStack) inFilter[ai] = true
      }
      ancestorStack.push(i)
    })
  }

  const visible: ScheduleItem[] = []
  const collapseStack: { level: number; hidden: boolean }[] = []
  items.forEach((it, i) => {
    while (collapseStack.length && collapseStack[collapseStack.length - 1].level >= it.level) {
      collapseStack.pop()
    }
    const parentHidden = collapseStack.some((s) => s.hidden)
    if (!parentHidden && inFilter[i]) visible.push(it)
    const selfCollapsed = !filterActive && it.isSummary && collapsed.has(it.wbsCode)
    collapseStack.push({ level: it.level, hidden: selfCollapsed })
  })
  return visible
}
