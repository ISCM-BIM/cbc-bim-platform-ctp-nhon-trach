import { useEffect, useState } from 'react'

// Bắt đầu từ mốc vài phút trước để cảm giác hệ thống đã "sống" từ trước khi mở app,
// sau đó tăng dần theo thời gian thực để tạo cảm giác dữ liệu luôn được cập nhật.
const INITIAL_SECONDS = 3 * 60 + 20

export function useLiveMinutesAgo(): number {
  const [seconds, setSeconds] = useState(INITIAL_SECONDS)

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return Math.floor(seconds / 60)
}
