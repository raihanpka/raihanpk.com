import * as React from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  label: string
  children: React.ReactNode
  /** Controlled mode (e.g. keyboard navigation). Omit to open on hover and focus. */
  open?: boolean
  className?: string
}

const EDGE = 8

/** Pill tooltip rendered in a portal, so rotated or overflow-hidden parents never clip it. */
export function Tooltip({ label, children, open, className }: TooltipProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [hover, setHover] = React.useState(false)
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)
  const visible = open ?? hover

  React.useLayoutEffect(() => {
    if (!visible || !ref.current) return setPos(null)
    const r = ref.current.getBoundingClientRect()
    setPos({ x: r.left + r.width / 2, y: r.top })
  }, [visible, label])

  return (
    <span
      ref={ref}
      className={className ?? 'inline-flex'}
      onPointerEnter={(e) => e.pointerType !== 'touch' && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      {children}
      {visible &&
        pos &&
        createPortal(
          <span
            role="tooltip"
            ref={(el) => {
              // Keep the pill inside the viewport horizontally.
              if (!el) return
              const half = el.offsetWidth / 2
              const x = Math.min(Math.max(pos.x, half + EDGE), window.innerWidth - half - EDGE)
              el.style.left = `${x}px`
            }}
            className="pointer-events-none fixed z-50 whitespace-nowrap rounded-lg border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-2"
            style={{ left: pos.x, top: pos.y - EDGE, transform: 'translate(-50%, -100%)' }}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  )
}
