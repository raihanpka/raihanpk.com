import { Dithering } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

const isDark = () => document.documentElement.classList.contains('dark')

export default function HalftoneBg() {
  const [dark, setDark] = useState(isDark)

  useEffect(() => {
    const mo = new MutationObserver(() => setDark(isDark()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  return (
    <Dithering
      aria-hidden="true"
      colorBack="#00000000"
      colorFront={dark ? '#ebebf0' : '#1f1f24'}
      shape="wave"
      type="4x4"
      size={3}
      scale={0.8}
      speed={0}
      minPixelRatio={1}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]"
    />
  )
}
