import { useRef } from 'react'
import { useCloudSea } from '@/hooks/useCloudSea'

/** The top of the scene fades out, so the dense sky does not sit behind the header. */
const MASK = 'linear-gradient(to bottom, transparent 0%, hsl(0 0% 0%) 42%)'

/** Fixed, decorative background. Not interactive, so it is hidden from assistive tech. */
export default function CloudSeaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useCloudSea(canvasRef)

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ opacity: 0, WebkitMaskImage: MASK, maskImage: MASK }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-1/2 w-full sm:h-[60%] opacity-[0.55] transition-opacity duration-700 dark:opacity-[0.7]"
    />
  )
}
