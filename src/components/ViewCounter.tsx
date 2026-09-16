import { useEffect, useState, useCallback, useRef } from 'react'
import { Eye } from 'lucide-react'
import { getCachedData, setCachedData, CACHE_TTL } from '@/lib/cache'

interface ViewCounterProps {
  slug: string
}

const ViewCounter = ({ slug }: ViewCounterProps) => {
  const cacheKey = `view_count_${slug}`
  const [views, setViews] = useState<number | null>(() => getCachedData<number>(cacheKey))
  const [error, setError] = useState(false)
  const isFetchingRef = useRef(false)

  const fetchViews = useCallback(async () => {
    if (!slug || isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      // Check if this post was already viewed in this browser session
      const sessionKey = `raihanpk_viewed_${slug}`
      const alreadyViewed =
        typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)

      let res: Response
      if (alreadyViewed) {
        // Read-only count fetch
        res = await fetch(`/api/viewcounter?slug=${encodeURIComponent(slug)}`)
      } else {
        // Increment count
        res = await fetch('/api/viewcounter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        })
        if (res.ok && typeof window !== 'undefined') {
          sessionStorage.setItem(sessionKey, 'true')
        }
      }

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`)
      }

      const data = await res.json()
      const count = typeof data?.count === 'number' ? data.count : 0
      setViews(count)
      setCachedData(cacheKey, count, CACHE_TTL.VIEW_COUNT)
      setError(false)
    } catch (err) {
      console.error('Error loading view count:', err)
      setError(true)
      setViews((prev) => prev ?? 0)
    } finally {
      isFetchingRef.current = false
    }
  }, [slug, cacheKey])

  useEffect(() => {
    // Re-check cache on mount
    const cached = getCachedData<number>(cacheKey)
    if (cached !== null) {
      setViews(cached)
    }

    fetchViews()

    const handlePageLoad = () => {
      fetchViews()
    }

    document.addEventListener('astro:page-load', handlePageLoad)
    window.addEventListener('astro:page-load', handlePageLoad)

    return () => {
      document.removeEventListener('astro:page-load', handlePageLoad)
      window.removeEventListener('astro:page-load', handlePageLoad)
    }
  }, [fetchViews, cacheKey])

  // Loading state
  if (views === null && !error) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span className="inline-block h-4 w-8 animate-pulse rounded bg-muted" />
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <Eye className="h-4 w-4" /> {views ?? 0} views
    </span>
  )
}

export default ViewCounter


