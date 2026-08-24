import { AlertTriangle, Loader2, RotateCcw, FileBox } from 'lucide-react'
import type { IfcLoadStatus } from '../useIfcModel'
import type { IfcParseProgress } from '../../../ifc/types'

const STAGE_LABEL: Record<IfcParseProgress['stage'], string> = {
  fetching: 'Đang tải file mô hình...',
  reading: 'Đang đọc file...',
  opening: 'Đang mở model IFC...',
  structure: 'Đang đọc cây không gian...',
  geometry: 'Đang dựng hình học...',
  done: 'Hoàn tất',
}

interface IfcUploadCardProps {
  status: IfcLoadStatus
  progress: IfcParseProgress | null
  error: string | null
  sizeWarning: string | null
  onRetry: () => void
}

// Nền tảng gắn cứng vào 1 file IFC dự án thật, tự tải khi vào màn hình - component này chỉ
// còn hiển thị trạng thái đang tải / lỗi (không còn cho chọn file thủ công).
export function IfcUploadCard({ status, progress, error, sizeWarning, onRetry }: IfcUploadCardProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      {status === 'error' ? (
        <>
          <div className="flex h-14 w-14 items-center justify-center border border-status-danger/30 bg-status-danger/5 text-status-danger">
            <AlertTriangle size={26} />
          </div>
          <div>
            <p className="font-heading text-base font-semibold text-on-surface">Không tải được mô hình dự án</p>
            {error && <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{error}</p>}
          </div>
          <button type="button" onClick={onRetry} className="btn-primary mt-1">
            <RotateCcw size={16} />
            Thử lại
          </button>
        </>
      ) : (
        <>
          {status === 'loading' ? (
            <Loader2 size={32} className="animate-spin text-brand" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center border border-outline-variant bg-surface-container-low text-outline">
              <FileBox size={26} />
            </div>
          )}
          <p className="text-sm font-medium text-on-surface">
            {progress ? STAGE_LABEL[progress.stage] : 'Đang tải mô hình dự án...'}
          </p>
          {progress?.detail && <p className="text-xs text-on-surface-variant">{progress.detail}</p>}
          <p className="max-w-xs text-[11px] text-outline">
            Mô hình được đọc hoàn toàn trên trình duyệt của bạn, không gửi lên máy chủ nào.
          </p>
          {sizeWarning && (
            <div className="mt-2 flex max-w-sm items-start gap-2 border border-status-warning/30 bg-status-warning/5 px-3 py-2.5 text-left text-xs text-status-warning">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{sizeWarning}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
