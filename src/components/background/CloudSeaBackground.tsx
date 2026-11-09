import { useRef } from 'react'
import { useCloudSea } from '@/hooks/useCloudSea'

/** Fixed, decorative background. Not interactive, so it is hidden from assistive tech. */
export default function CloudSeaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useCloudSea(canvasRef)

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.55] transition-opacity duration-700 dark:opacity-[0.7]"
    />
  )
}
