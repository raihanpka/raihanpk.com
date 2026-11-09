import { useEffect, useRef } from 'react'
import { useCloudSea } from '@/hooks/useCloudSea'

/** The top of the scene fades out, so the dense sky does not sit behind the header. */
const MASK = 'linear-gradient(to bottom, transparent 0%, hsl(0 0% 0%) 42%)'
/** Soft enough that the dots still read as ASCII, so the text on top stays the focus. */
const BLUR = 'blur(1px)'
/** How far the scene drifts behind the pointer, in px at the edges. Small on purpose. */
const DRIFT_X = 10
const DRIFT_Y = 6

/** Fixed, decorative background. Not interactive, so it is hidden from assistive tech. */
export default function CloudSeaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useCloudSea(canvasRef)

  // Light parallax: the scene eases toward the pointer. One transform per frame, eased, and skipped entirely
  // under reduced motion or when the pointer is not moving.
  useEffect(() => {
    const el = canvasRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    const frame = () => {
      cx += (tx - cx) * 0.12
      cy += (ty - cy) * 0.12
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) scale(1.03)`
      raf = Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ? requestAnimationFrame(frame) : 0
    }
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * -DRIFT_X
      ty = (e.clientY / window.innerHeight - 0.5) * -DRIFT_Y
      if (!raf) raf = requestAnimationFrame(frame)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ opacity: 0, WebkitMaskImage: MASK, maskImage: MASK, filter: BLUR }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-1/2 w-full sm:h-[60%] opacity-[0.55] transition-opacity duration-700 dark:opacity-[0.7]"
    />
  )
}
