import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Language = 'vi' | 'en'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  /** Chuỗi tĩnh 1-lần dùng ngay tại chỗ hiển thị - vd {tr('Cảnh báo cần xử lý', 'Alerts requiring
   * action')}. Đây là cách dịch CHÍNH của nền tảng (không dùng 1 file "strings.ts" tập trung khổng
   * lồ): mỗi vị trí văn bản tự khai báo cặp VI/EN ngay tại chỗ, tra theo `language` hiện tại - dễ
   * đối chiếu đúng-sai ngay trong code, không phải nhớ khoá tra cứu rời rạc. Với nhãn theo GIÁ TRỊ
   * DỮ LIỆU lặp lại nhiều nơi (Discipline, trạng thái tiến độ/xung đột...), dùng các hàm riêng
   * trong src/i18n/enumLabels.ts thay vì gọi tr() lặp lại ở từng nơi hiển thị.
   */
  tr: (vi: string, en: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

// Mặc định LUÔN là tiếng Việt (yêu cầu người dùng 2026-09-02) - không đọc/ghi localStorage (đúng
// nguyên tắc "không backend/localStorage" đã áp dụng xuyên suốt nền tảng), nên mỗi lần tải lại
// trang sẽ luôn quay về tiếng Việt, không "nhớ" lựa chọn trước đó của người dùng.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi')
  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((l) => (l === 'vi' ? 'en' : 'vi')),
      tr: (vi: string, en: string) => (language === 'en' ? en : vi),
    }),
    [language],
  )
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage phải được dùng bên trong LanguageProvider')
  return ctx
}

/** Chọn 1 trong 2 giá trị song ngữ theo ngôn ngữ hiện tại - dùng cho các Record<key, string> nhãn
 * cố định đã có sẵn bản tiếng Anh riêng (vd ROLE_LABELS/ROLE_LABELS_EN trong data/roles.ts) mà
 * KHÔNG muốn đổi shape gốc (nhiều nơi đã import trực tiếp bản tiếng Việt). */
export function pick<K extends string>(
  vi: Record<K, string>,
  en: Partial<Record<K, string>>,
  key: K,
  language: Language,
): string {
  return language === 'en' ? (en[key] ?? vi[key]) : vi[key]
}
