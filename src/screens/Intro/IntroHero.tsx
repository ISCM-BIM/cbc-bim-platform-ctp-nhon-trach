import { ArrowRight } from 'lucide-react'
import { WireframeBackground } from './WireframeBackground'
import cbcLogo from '../../assets/logos/cbc_logo_white.png'
import ctdLogo from '../../assets/logos/ctdlogo_white.png'
import iscmLogo from '../../assets/logos/iscm_white_text_v1.png'
import { useLanguage } from '../../i18n/LanguageContext'

interface IntroHeroProps {
  onEnter: () => void
}

export function IntroHero({ onEnter }: IntroHeroProps) {
  const { tr } = useLanguage()
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div className="absolute inset-0 opacity-60 saturate-[0.35]">
        <WireframeBackground />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-deep/40 via-navy-deep/80 to-navy-deep" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 3 logo ngang hàng, cùng chiều cao để thấy rõ vị thế ngang nhau: CBC - UEH|CTD - ISCM. */}
        <div className="mb-10 flex items-center gap-5 sm:gap-7">
          <img src={cbcLogo} alt="CBC - Civil & Building Construction" className="h-11 w-auto object-contain" />
          <span className="h-8 w-px bg-white/25" />
          <img src={ctdLogo} alt="College of Technology and Design" className="h-11 w-auto object-contain" />
          <span className="h-8 w-px bg-white/25" />
          <img src={iscmLogo} alt="ISCM - Institute of Smart City and Management" className="h-11 w-auto object-contain" />
        </div>

        <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-white/95 md:text-5xl">
          BIM-based Construction Monitoring Platform
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/60">
          {tr('Viện Đô thị Thông minh và Quản lý — Đại học Kinh tế TP.HCM', 'Institute for Smart City Management — University of Economics Ho Chi Minh City')}
        </p>

        <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/55">
          {tr(
            'Nền tảng do ISCM–UEH xây dựng và vận hành cùng CBC, phối hợp dữ liệu BIM giữa đơn vị tư vấn, nhà thầu, chủ đầu tư — từ mô hình hoá, kiểm tra xung đột, kiểm soát khối lượng đến bàn giao vận hành.',
            'A platform built and operated by ISCM–UEH together with CBC, coordinating BIM data between the consultant, contractor, and investor — from modeling and clash detection to quantity control and operational handover.',
          )}
        </p>

        <button
          type="button"
          onClick={onEnter}
          className="pop-shadow mt-10 flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105"
        >
          {tr('Khám phá nền tảng', 'Explore the platform')}
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  )
}
