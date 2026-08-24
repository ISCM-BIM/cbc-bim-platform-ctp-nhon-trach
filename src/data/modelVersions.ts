import type { BlockId, ModelVersion } from '../types'
import { BLOCK_IDS, PROJECT_START } from './constants'
import { BIM_TEAM } from './people'
import { fieldChanges } from './fieldChanges'
import { addDays } from '../utils/random'

// Phiên bản mô hình MINH HOẠ, dựng từ chính các thay đổi hiện trường minh hoạ trong
// fieldChanges.ts (không phải dữ liệu tách rời) - mỗi phiên bản gộp các thay đổi "Đã cập nhật"
// tính đến đúng ngày phát hành, cùng cách tính countChangesInRange như phiên bản trước của nền
// tảng. Xem ghi chú provenance đầy đủ trong fieldChanges.ts (dự án chưa ký hợp đồng - đây là ví
// dụ minh hoạ tính năng, không phải lịch sử phiên bản model thi công thật).
const VERSION_DATES = [addDays(PROJECT_START, 30), addDays(PROJECT_START, 45), addDays(PROJECT_START, 60)]

const AUTHORS = [BIM_TEAM[1].name, BIM_TEAM[2].name, BIM_TEAM[0].name]

const NOTES = [
  'Cập nhật mô hình RBF6 theo kết quả khảo sát địa chất bổ sung và điều chỉnh vật tư tôn vách',
  'Tích hợp điều chỉnh vị trí Trạm điện 02 theo yêu cầu hành lang an toàn PCCC',
  'Cập nhật tổng hợp trước mốc chốt Shop Drawing - rà soát toàn bộ thay đổi giai đoạn thiết kế',
]

function countChangesInRange(from: Date, to: Date): number {
  return fieldChanges.filter(
    (c) => c.modelStatus === 'Đã cập nhật' && c.date > from && c.date <= to,
  ).length
}

function generateModelVersions(): ModelVersion[] {
  return VERSION_DATES.map((date, i) => {
    const from = i === 0 ? PROJECT_START : VERSION_DATES[i - 1]
    return {
      version: `v0.${i + 1}`,
      date,
      changesIntegrated: countChangesInRange(from, date),
      author: AUTHORS[i],
      note: NOTES[i],
    }
  })
}

export const modelVersions: ModelVersion[] = generateModelVersions()

// Mức độ trùng khớp mô hình với HIỆN TRẠNG THI CÔNG THẬT (%) - khác với modelVersions ở trên
// (đó là lịch sử cập nhật mô hình THIẾT KẾ, không phải đối chiếu as-built): dự án chưa khởi công
// nên chưa có công trình thật nào để đối chiếu, = 0 cho cả 4 block. KHÔNG PHẢI lỗi hiển thị.
export const MODEL_MATCH_RATE: Record<BlockId, number> = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
}

export const MODEL_MATCH_RATE_AVG = Math.round(
  BLOCK_IDS.reduce((sum, b) => sum + MODEL_MATCH_RATE[b], 0) / BLOCK_IDS.length,
)
