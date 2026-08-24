import { useEffect, useState } from 'react'
import { X, Tag, Hash, Loader2 } from 'lucide-react'
import type { IfcAPI } from 'web-ifc'
import { getElementProperties } from '../../../ifc/parseIfc'
import type { IfcElementProperties } from '../../../ifc/types'

interface IfcElementPanelProps {
  api: IfcAPI
  modelID: number
  expressID: number
  onClose: () => void
}

export function IfcElementPanel({ api, modelID, expressID, onClose }: IfcElementPanelProps) {
  const [props, setProps] = useState<IfcElementProperties | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setProps(null)
    getElementProperties(api, modelID, expressID)
      .then((p) => {
        if (!cancelled) setProps(p)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [api, modelID, expressID])

  return (
    <div className="panel-strong absolute right-4 top-4 max-h-[calc(100%-2rem)] w-80 overflow-y-auto p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="label-caps text-brand">Thuộc tính cấu kiện</p>
        <button type="button" onClick={onClose} className="p-0.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
          <X size={16} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-on-surface-variant">
          <Loader2 size={16} className="animate-spin" /> Đang tải thuộc tính...
        </div>
      )}

      {!loading && props && (
        <>
          <p className="mb-1 text-sm font-semibold leading-snug text-on-surface">{props.name}</p>
          <div className="mb-3 space-y-1 text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <Tag size={12} /> {props.ifcClass}
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <Hash size={12} /> {props.globalId || `#${props.expressID}`}
            </div>
          </div>

          {props.propertySets.length === 0 ? (
            <p className="border-t border-outline-variant pt-3 text-xs text-outline">
              File không kèm bộ thuộc tính (Pset) cho cấu kiện này.
            </p>
          ) : (
            <div className="space-y-3 border-t border-outline-variant pt-3">
              {props.propertySets.map((pset) => (
                <div key={pset.name}>
                  <p className="mb-1.5 text-xs font-semibold text-on-surface">{pset.name}</p>
                  <div className="space-y-1">
                    {pset.properties.map((p) => (
                      <div key={p.name} className="flex items-start justify-between gap-3 text-[11px]">
                        <span className="text-on-surface-variant">{p.name}</span>
                        <span className="text-right font-medium text-on-surface">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
