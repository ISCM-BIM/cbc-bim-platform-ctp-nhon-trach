import type { Discipline } from '../types'
import type { IfcGroupKey } from './types'
import type { ConstructionPhase } from './constructionPhase'
import type { MepSystemCategory } from './mepSystem'

// Chuỗi khoá ổn định cho một (tầng x bộ môn x giai đoạn x hệ MEP) - dùng làm key Map/JSON xuyên
// suốt module IFC (gộp hình học, gán mốc 4D, lưu/đọc bảng tinh chỉnh thủ công dạng JSON).
export function groupKeyToString(key: IfcGroupKey): string {
  return `${key.storeyExpressID ?? 'null'}|${key.discipline}|${key.phase}|${key.mepSystem ?? 'null'}`
}

export function groupKeyFromString(s: string): IfcGroupKey {
  const [storeyPart, discipline, phase, mepSystemPart] = s.split('|')
  return {
    storeyExpressID: storeyPart === 'null' ? null : Number(storeyPart),
    discipline: discipline as Discipline,
    phase: phase as ConstructionPhase,
    // mepSystemPart undefined = khoá cũ (trước khi thêm hệ MEP) đang được nhập lại từ file JSON
    // đã xuất trước đó - coi như null thay vì lỗi, chỉ ảnh hưởng độ khớp chính xác của phần
    // override MEP cũ, không phải lỗi runtime.
    mepSystem: !mepSystemPart || mepSystemPart === 'null' ? null : (mepSystemPart as MepSystemCategory),
  }
}
