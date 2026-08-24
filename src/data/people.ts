export interface Person {
  name: string
  role: string
}

// Đội ngũ BIM / điều phối
export const BIM_TEAM: Person[] = [
  { name: 'Nguyễn Văn Hùng', role: 'Trưởng nhóm BIM' },
  { name: 'Trần Thị Mai Anh', role: 'Điều phối viên BIM' },
  { name: 'Lê Minh Tuấn', role: 'Điều phối viên BIM' },
  { name: 'Phạm Quốc Bảo', role: 'Kỹ sư BIM Kết cấu' },
  { name: 'Đỗ Thị Ngọc Lan', role: 'Kỹ sư BIM MEP' },
  { name: 'Vũ Đức Thắng', role: 'Kỹ sư BIM Kiến trúc' },
]

// Giám sát / kỹ sư hiện trường của tổng thầu
export const SITE_TEAM: Person[] = [
  { name: 'Hoàng Văn Nam', role: 'Chỉ huy trưởng công trường' },
  { name: 'Bùi Văn Sơn', role: 'Giám sát thi công Kết cấu' },
  { name: 'Ngô Thị Thu Hương', role: 'Giám sát thi công Kiến trúc' },
  { name: 'Đặng Minh Khôi', role: 'Giám sát thi công MEP' },
  { name: 'Trịnh Văn Đạt', role: 'Giám sát thi công Hạ tầng' },
  { name: 'Phan Thị Kim Ngân', role: 'Kỹ sư QS' },
  { name: 'Lý Văn Phúc', role: 'Kỹ sư hiện trường Block A' },
  { name: 'Huỳnh Văn Tài', role: 'Kỹ sư hiện trường Block B' },
  { name: 'Đinh Thị Bích Trâm', role: 'Kỹ sư hiện trường Block C' },
  { name: 'Mai Xuân Thịnh', role: 'Kỹ sư hiện trường Block D' },
  { name: 'Võ Thành Long', role: 'Kỹ sư an toàn lao động' },
  { name: 'Nguyễn Thị Hồng Nhung', role: 'Kỹ sư vật tư' },
]

// Kỹ sư tư vấn thiết kế theo bộ môn
export const DESIGN_TEAM: Person[] = [
  { name: 'Trần Anh Dũng', role: 'Chủ trì thiết kế Kết cấu' },
  { name: 'Lê Thị Phương Thảo', role: 'Chủ trì thiết kế Kiến trúc' },
  { name: 'Nguyễn Hữu Phát', role: 'Chủ trì thiết kế MEP' },
  { name: 'Cao Văn Hiếu', role: 'Chủ trì thiết kế Hạ tầng' },
]

// Đại diện chủ đầu tư
export const INVESTOR_TEAM: Person[] = [
  { name: 'Trương Quang Vinh', role: 'Quản lý dự án - Chủ đầu tư' },
  { name: 'Đoàn Thị Yến Nhi', role: 'Quản lý vận hành - Chủ đầu tư' },
]

export const ALL_PEOPLE: Person[] = [
  ...BIM_TEAM,
  ...SITE_TEAM,
  ...DESIGN_TEAM,
  ...INVESTOR_TEAM,
]

export function namesOf(people: Person[]): string[] {
  return people.map((p) => p.name)
}
