import { Download, GitCommitHorizontal } from 'lucide-react'
import { modelVersions } from '../../data/modelVersions'
import { formatDate } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'

export function ModelVersionTable() {
  const { tr } = useLanguage()
  if (modelVersions.length === 0) {
    return (
      <div className="panel p-4">
        <p className="mb-3 text-sm font-semibold text-on-surface">{tr('Phiên bản mô hình', 'Model versions')}</p>
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <GitCommitHorizontal size={22} className="text-outline" />
          <p className="text-xs text-on-surface-variant">
            {tr('Chưa có phiên bản mô hình thi công (as-built) nào - dự án chưa ký hợp đồng.', 'No as-built model versions yet - the project has not been contracted.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel p-4">
      <p className="mb-3 text-sm font-semibold text-on-surface">{tr('Phiên bản mô hình', 'Model versions')}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="text-on-surface-variant">
            <tr className="border-b border-outline-variant">
              <th className="py-2 pr-3 font-medium">{tr('Phiên bản', 'Version')}</th>
              <th className="py-2 pr-3 font-medium">{tr('Ngày cập nhật', 'Update date')}</th>
              <th className="py-2 pr-3 font-medium">{tr('Số thay đổi tích hợp', 'Changes integrated')}</th>
              <th className="py-2 pr-3 font-medium">{tr('Người thực hiện', 'Performed by')}</th>
              <th className="py-2 pr-3 font-medium">{tr('Ghi chú', 'Note')}</th>
              <th className="py-2 pr-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {modelVersions.map((v) => (
              <tr key={v.version} className="border-b border-outline-variant text-on-surface-variant last:border-b-0">
                <td className="py-2.5 pr-3 font-mono font-medium text-on-surface">{v.version}</td>
                <td className="py-2.5 pr-3 text-on-surface-variant">{formatDate(v.date)}</td>
                <td className="py-2.5 pr-3 tabular-nums">{v.changesIntegrated}</td>
                <td className="py-2.5 pr-3">{v.author}</td>
                <td className="py-2.5 pr-3 text-on-surface-variant">{v.note}</td>
                <td className="py-2.5 pr-3">
                  <button
                    type="button"
                    className="flex items-center gap-1 border border-outline-variant px-2 py-1 text-[11px] text-on-surface-variant hover:border-brand hover:text-brand"
                    title={tr('Demo - không tải file thật', 'Demo - does not download a real file')}
                  >
                    <Download size={11} /> {tr('Tải xuống', 'Download')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
