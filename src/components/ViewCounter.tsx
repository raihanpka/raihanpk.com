'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface ViewCounterProps {
  slug: string
}

const ViewCounter = ({ slug }: ViewCounterProps) => {
  const [views, setViews] = useState<number | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    // POST to increment and get count
    fetch('/api/viewcounter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then((data) => {
        setViews(data.count ?? 0)
      })
      .catch(() => {
        setError(true)
        setViews(0)
      })
  }, [slug])

  // Loading state
  if (views === null && !error) {
    return (
      <>
        <Separator orientation="vertical" className="h-4" />
        <span className="flex items-center gap-1 text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="inline-block h-4 w-8 animate-pulse rounded bg-muted" />
        </span>
      </>
    )
  }

  return (
    <>
      <Separator orientation="vertical" className="h-4" />
      <span className="flex items-center gap-1">
        <Eye className="h-4 w-4" /> {views} views
      </span>
    </>
  )
}

export default ViewCounter
