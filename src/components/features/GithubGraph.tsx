import * as React from 'react'
import { describeDay, levelFor, monthLabels, visibleWeeks, type Week } from '@/lib/github'

interface Props {
  weeks: Week[]
  total: number
  profileUrl: string
}

const CELL = 12
const GAP = 4
const STEP = CELL + GAP
/** Used for the server render and the first client render, before the real width is known. */
const DEFAULT_WEEKS = 26

const LEVEL_CLASS = ['bg-foreground/10', 'bg-foreground/25', 'bg-foreground/45', 'bg-foreground/70', 'bg-foreground/95'] as const

export default function GithubGraph({ weeks, total, profileUrl }: Props) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const [count, setCount] = React.useState(DEFAULT_WEEKS)
  const [active, setActive] = React.useState<{ w: number; d: number } | null>(null)

  React.useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      setCount(visibleWeeks(el.clientWidth, CELL, GAP))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const shown = React.useMemo(() => weeks.slice(-count), [weeks, count])
  const max = React.useMemo(() => Math.max(0, ...shown.flatMap((w) => w.map((d) => d?.count ?? 0))), [shown])
  const labels = React.useMemo(() => monthLabels(shown), [shown])
  const gridWidth = shown.length * STEP - GAP

  const activeDay = active ? shown[active.w]?.[active.d] ?? null : null
  // Keep the tooltip (about 180px wide) inside the grid's left and right edges.
  const tipLeft = active ? Math.min(Math.max(active.w * STEP + CELL / 2, 90), Math.max(90, gridWidth - 90)) : 0

  const onKeyDown = (e: React.KeyboardEvent) => {
    const move = (dw: number, dd: number) => {
      e.preventDefault()
      setActive((a) => {
        let w = a ? a.w + dw : shown.length - 1
        let d = a ? a.d + dd : 0
        w = Math.min(Math.max(w, 0), shown.length - 1)
        d = Math.min(Math.max(d, 0), 6)
        // Skip padding cells that sit outside the data.
        return shown[w]?.[d] ? { w, d } : a ?? { w, d: shown[w]?.findIndex(Boolean) ?? 0 }
      })
    }
    if (e.key === 'ArrowLeft') move(-1, 0)
    else if (e.key === 'ArrowRight') move(1, 0)
    else if (e.key === 'ArrowUp') move(0, -1)
    else if (e.key === 'ArrowDown') move(0, 1)
    else if (e.key === 'Escape') setActive(null)
  }

  if (weeks.length === 0) {
    return (
      <div className="flex h-full flex-col items-start justify-center gap-2 text-sm">
        <p className="font-medium text-foreground">GitHub</p>
        <p className="text-muted-foreground">Contribution data is unavailable right now.</p>
        <a href={profileUrl} target="_blank" rel="noreferrer noopener" className="text-foreground underline underline-offset-4">
          Open my GitHub profile
        </a>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <a href={profileUrl} target="_blank" rel="noreferrer noopener" className="text-sm font-medium text-foreground hover:underline underline-offset-4">
          GitHub
        </a>
        <p className="font-mono text-xs text-muted-foreground">{total.toLocaleString('en-US')} contributions in the last year</p>
      </div>

      <div ref={wrapRef} className="relative flex min-w-0 flex-1 flex-col justify-center">
        <div
          role="group"
          tabIndex={0}
          aria-label="GitHub contribution graph. Use the arrow keys to read each day."
          className="relative ml-auto rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          style={{ width: gridWidth }}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
        >
          <div className="relative mb-2 h-4 text-xs text-muted-foreground" aria-hidden="true">
            {labels.map((l) => (
              <span key={`${l.name}-${l.col}`} className="absolute top-0" style={{ left: l.col * STEP }}>
                {l.name}
              </span>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            {shown.map((week, w) => (
              <div key={w} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((day, d) =>
                  day ? (
                    <span
                      key={day.date}
                      role="img"
                      aria-label={describeDay(day)}
                      onPointerEnter={() => setActive({ w, d })}
                      className={`size-3 rounded-sm transition-transform hover:scale-125 ${LEVEL_CLASS[levelFor(day.count, max)]} ${
                        active?.w === w && active.d === d ? 'ring-2 ring-ring' : ''
                      }`}
                    />
                  ) : (
                    <span key={`pad-${d}`} className="size-3" aria-hidden="true" />
                  ),
                )}
              </div>
            ))}
          </div>

          {activeDay && active && (
            <div
              role="status"
              className="pointer-events-none absolute z-20 whitespace-nowrap rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-2"
              style={{ left: tipLeft, top: 24 + active.d * STEP + CELL + 8, transform: 'translateX(-50%)' }}
            >
              {describeDay(activeDay)}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground" aria-hidden="true">
        Less
        {LEVEL_CLASS.map((c) => (
          <span key={c} className={`size-3 rounded-sm ${c}`} />
        ))}
        More
      </div>
    </div>
  )
}
