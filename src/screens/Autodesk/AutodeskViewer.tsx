import { ExternalLink, Boxes } from 'lucide-react'
import { PARTNER_MODEL_LINKS } from '../../data/autodeskModels'

// Danh sách link Autodesk Viewer đối tác chia sẻ - xem giải thích đầy đủ (vì sao không nhúng
// trực tiếp được) trong src/data/autodeskModels.ts. Mỗi model là 1 khối bấm được nguyên khối,
// bấm vào là mở thẳng link ở tab mới - không có nút riêng bên trong.
export function AutodeskViewer() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      {PARTNER_MODEL_LINKS.length === 0 ? (
        <div className="panel flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <Boxes size={28} className="text-outline" />
          <p className="text-sm text-on-surface-variant">Chưa có model nào được chia sẻ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PARTNER_MODEL_LINKS.map((m) => (
            <a
              key={m.id}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="panel panel-hover flex flex-col gap-3 p-4 no-underline"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-outline-variant bg-surface-container-low text-navy">
                  <Boxes size={18} />
                </div>
                <ExternalLink size={16} className="mt-1 shrink-0 text-outline" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-heading text-sm font-semibold text-on-surface">{m.name}</p>
                  {m.isDemo && (
                    <span className="shrink-0 border border-status-warning/30 bg-status-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-status-warning">
                      Demo
                    </span>
                  )}
                </div>
                {m.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">{m.description}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
