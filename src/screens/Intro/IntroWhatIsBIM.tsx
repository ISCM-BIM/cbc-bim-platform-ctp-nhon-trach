import { Users, Workflow, Cpu } from 'lucide-react'

const PILLARS = [
  { icon: Users, label: 'Con người' },
  { icon: Workflow, label: 'Quy trình' },
  { icon: Cpu, label: 'Công nghệ' },
]

export function IntroWhatIsBIM() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-20">
      <h2 className="mb-8 text-center font-heading text-2xl font-bold text-on-surface md:text-3xl">BIM là gì</h2>
      <div className="panel p-8 md:p-10">
        <p className="text-base leading-relaxed text-on-surface-variant">
          BIM (Mô hình Thông tin Công trình) không phải là phần mềm vẽ. Đó là quy trình tạo
          lập, quản lý và khai thác thông tin công trình trên nền một mô hình số duy nhất. Mô
          hình chứa cả thông tin hình học và thông tin phi hình học — vật liệu, thông số kỹ
          thuật, nhà sản xuất, chi phí, tiến độ. Ba trụ cột của BIM là Con người, Quy trình và
          Công nghệ.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {PILLARS.map((p) => (
            <div
              key={p.label}
              className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-5 py-2.5"
            >
              <p.icon size={16} className="text-brand" />
              <span className="text-sm font-medium text-on-surface-variant">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
