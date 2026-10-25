import { useRef } from 'react'
import { useBabysBreath } from '@/hooks/useBabysBreath'
import { cn } from '@/lib/utils'

/** Decorative dithered baby's breath band. Hidden from assistive tech. */
export default function BabysBreathField({
  className,
  animate = true,
  perspective,
}: {
  className?: string
  animate?: boolean
  perspective?: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useBabysBreath(ref, { animate, perspective })
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ opacity: 0 }}
      className={cn('pointer-events-none transition-opacity duration-700', className)}
    />
  )
}
