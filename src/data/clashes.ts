import type { Clash, ClashComment } from '../types'
import { PROJECT_START } from './constants'
import { addDays } from '../utils/random'

// 3 xung đột MINH HOẠ (theo yêu cầu của người dùng - giữ tính năng có dữ liệu để trình bày thay
// vì để trống), KHÔNG PHẢI kết quả chạy kiểm tra xung đột tự động thật trên model RBF6: dự án còn
// ở giai đoạn tiền hợp đồng (xem CURRENT_DATE/PROJECT_START trong constants.ts - trước cả ngày
// LOA), mô hình phối hợp đa bộ môn (Kiến trúc-Kết cấu-MEP) cho RBF6 chưa được dựng đủ để chạy
// clash detection thật. Đây là 3 tình huống xung đột ĐIỂN HÌNH cho đúng loại công trình/hạng mục
// thật của RBF6-7 (nhà xưởng khung thép, mái/vách tôn, hệ thoát nước mưa mái, cửa cuốn chống
// cháy, XLNT) - dùng ngày trong đúng khung thời gian thật của giai đoạn đệ trình Shop Drawing/
// biện pháp thi công (mục "3.2" trong schedule.ts, 07/11/2026-10/01/2027), KHÔNG neo theo
// CURRENT_DATE (project chưa khởi công nên neo theo "hôm nay" sẽ ra toàn ngày trong quá khứ, vô
// lý cho các ví dụ mang tính "sẽ phát hiện khi phối hợp thiết kế").

function comments(msgs: Array<[string, number, string]>): ClashComment[] {
  return msgs.map(([author, dayOffset, message]) => ({
    author,
    date: addDays(PROJECT_START, dayOffset),
    message,
  }))
}

export const clashes: Clash[] = [
  {
    id: 'XD-0001',
    description:
      'Ống thoát nước mưa mái (RWP) DN150 giao cắt xà gồ mái tại khu vực nóc gió RBF6, cao độ +19.950',
    disciplineA: 'MEP',
    disciplineB: 'Kết cấu',
    block: 'A',
    elevation: '+19.950',
    severity: 'B',
    estimatedCost: 68_000_000,
    status: 'Đang xử lý',
    assignee: 'Đỗ Thị Ngọc Lan',
    detectedDate: addDays(PROJECT_START, 34),
    dueDate: addDays(PROJECT_START, 49),
    resolvedDate: null,
    comments: comments([
      ['Đỗ Thị Ngọc Lan', 34, 'Phát hiện khi ghép mô hình MEPF (hệ RWP) vào mô hình kết cấu thép mái RBF6 giai đoạn Shop Drawing.'],
      ['Phạm Quốc Bảo', 38, 'Đề xuất dịch tuyến ống RWP sang khoang xà gồ liền kề, không đổi cao độ đấu nối máng xối.'],
    ]),
    position: { x: 0, y: 19.95, z: 0 },
  },
  {
    id: 'XD-0002',
    description:
      'Khung cửa cuốn thép chống cháy EI45 (SRD1, khu xuất-nhập hàng) chồng lấn cột thép biên trục ngoài RBF6',
    disciplineA: 'Kiến trúc',
    disciplineB: 'Kết cấu',
    block: 'A',
    elevation: '+0.000',
    severity: 'C',
    estimatedCost: 19_500_000,
    status: 'Mới',
    assignee: 'Vũ Đức Thắng',
    detectedDate: addDays(PROJECT_START, 47),
    dueDate: addDays(PROJECT_START, 61),
    resolvedDate: null,
    comments: comments([
      ['Vũ Đức Thắng', 47, 'Phát hiện khi bố trí cửa cuốn SRD1 (3000×3500) theo mặt bằng kiến trúc lên đúng lưới trục kết cấu thép.'],
    ]),
    position: { x: 6, y: 0, z: 3 },
  },
  {
    id: 'XD-0003',
    description:
      'Tuyến ống xả nước thải sau xử lý của Trạm XLNT giao cắt tuyến cáp điện trung thế ngầm khu vực giáp Khu phụ trợ',
    disciplineA: 'Hạ tầng',
    disciplineB: 'Hạ tầng',
    block: 'C',
    elevation: '+0.000',
    severity: 'A',
    estimatedCost: 165_000_000,
    status: 'Đã xử lý',
    assignee: 'Trịnh Văn Đạt',
    detectedDate: addDays(PROJECT_START, 28),
    dueDate: addDays(PROJECT_START, 42),
    resolvedDate: addDays(PROJECT_START, 40),
    comments: comments([
      ['Trịnh Văn Đạt', 28, 'Phát hiện khi phối hợp mô hình hạ tầng ngầm khu vực Trạm XLNT - Khu phụ trợ trước khi thi công công tác hạ tầng (mục 4.10).'],
      ['Cao Văn Hiếu', 32, 'Đề xuất hạ cao độ tuyến cáp trung thế xuống dưới ống xả tối thiểu 300mm tại vị trí giao cắt, đúng quy định khoảng cách an toàn.'],
      ['Trịnh Văn Đạt', 40, 'Đã cập nhật mô hình theo phương án điều chỉnh, xác nhận hết xung đột.'],
    ]),
    position: { x: -10, y: 0, z: 5 },
  },
]
