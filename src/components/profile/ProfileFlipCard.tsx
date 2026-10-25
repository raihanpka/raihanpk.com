import { ArrowUpRight, Check, Copy, Globe, Mail, MessageCircle, RotateCw } from 'lucide-react'
import * as React from 'react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import BabysBreathField from '@/components/profile/BabysBreathField'
import { isLinkTarget, nextFlip, tiltFromPointer, type FlipEvent } from '@/lib/flip'

export interface ProfileLink {
  kind: 'mail' | 'linkedin' | 'github' | 'web'
  label: string
  href: string
}

interface Props {
  name: string
  role: string
  pronunciation?: string
  avatar: string
  links: ProfileLink[]
}

const ICONS = {
  mail: Mail,
  linkedin: FaLinkedinIn,
  github: FaGithub,
  web: Globe,
} as const

const TILT_MAX_DEG = 5
const HOVER_DWELL_MS = 120

export default function ProfileFlipCard({ name, role, pronunciation, avatar, links }: Props) {
  const [flipped, setFlipped] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const sceneRef = React.useRef<HTMLDivElement>(null)
  const pointerRef = React.useRef<'mouse' | 'touch'>('mouse')
  const dwellRef = React.useRef<number | undefined>(undefined)
  const rafRef = React.useRef(0)

  const send = React.useCallback((event: FlipEvent) => {
    setFlipped((f) => nextFlip({ event, flipped: f, pointer: pointerRef.current }))
  }, [])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') send('escape')
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(dwellRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [send])

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerRef.current = e.pointerType === 'mouse' ? 'mouse' : 'touch'
    const scene = sceneRef.current
    if (e.pointerType !== 'mouse' || !scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const { clientX, clientY } = e
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const rect = scene.getBoundingClientRect()
      const { rx, ry } = tiltFromPointer(clientX, clientY, rect, TILT_MAX_DEG)
      scene.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
      scene.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
      scene.style.setProperty('--mx', `${(((clientX - rect.left) / rect.width) * 100).toFixed(1)}%`)
      scene.style.setProperty('--my', `${(((clientY - rect.top) / rect.height) * 100).toFixed(1)}%`)
    })
  }

  const onPointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    window.clearTimeout(dwellRef.current)
    const scene = sceneRef.current
    cancelAnimationFrame(rafRef.current)
    scene?.style.setProperty('--rx', '0deg')
    scene?.style.setProperty('--ry', '0deg')
    if (e.pointerType === 'mouse') send('card-leave')
  }

  const onZoneEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    window.clearTimeout(dwellRef.current)
    dwellRef.current = window.setTimeout(() => send('zone-enter'), HOVER_DWELL_MS)
  }

  const onZoneLeave = () => window.clearTimeout(dwellRef.current)

  const onZoneClick = (e: React.MouseEvent) => {
    if (isLinkTarget(e.target as Element)) return
    send('zone-tap')
  }

  const copyMail = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked. The mailto link still works.
    }
  }

  return (
    <div
      ref={sceneRef}
      className="flip-scene relative h-104 sm:h-88"
      data-flipped={flipped}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={(e) => {
        pointerRef.current = e.pointerType === 'mouse' ? 'mouse' : 'touch'
      }}
    >
      <div className="flip-tilt h-full">
        <div className="flip-inner">
          {/* Front */}
          <section
            className="flip-face flip-face-front metal rounded-xl border border-border p-6 flex flex-col"
            aria-label={`${name}, profile`}
            inert={flipped}
          >
            <div
              data-flip-zone
              className="relative z-10 flex items-start gap-4"
              onPointerEnter={onZoneEnter}
              onPointerLeave={onZoneLeave}
              onClick={onZoneClick}
            >
              <img
                src={avatar}
                alt=""
                width={96}
                height={96}
                decoding="async"
                fetchPriority="high"
                className="size-20 sm:size-24 shrink-0 rounded-lg object-cover grayscale border border-border"
              />
              <div className="min-w-0">
                <h2 className="font-title text-display-sm text-foreground">{name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{role}</p>
                {pronunciation && <p className="mt-1 font-mono text-xs text-muted-foreground">{pronunciation}</p>}
              </div>
            </div>

            <div className="relative z-10 my-4 h-px bg-border" />

            <ul className="relative z-10 grid grid-cols-1 gap-x-6 gap-y-2 font-mono text-sm sm:grid-cols-2" data-no-flip>
              {links.map((link) => {
                const Icon = ICONS[link.kind]
                return (
                  <li key={link.href} className="flex min-w-0 items-center gap-2">
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <a
                      href={link.href}
                      target={link.kind === 'mail' ? undefined : '_blank'}
                      rel={link.kind === 'mail' ? undefined : 'noreferrer noopener'}
                      className="truncate text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                    {link.kind === 'mail' && (
                      <button
                        type="button"
                        onClick={() => copyMail(link.label)}
                        className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                        aria-label={copied ? 'Email copied' : 'Copy email address'}
                      >
                        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>

            <BabysBreathField className="dither-fade absolute inset-x-0 bottom-0 h-1/3 w-full text-foreground/45 sm:h-2/5" />
          </section>

          {/* Back: the way into the chatbot */}
          <section
            className="flip-face flip-face-back metal rounded-xl border border-border p-6 flex flex-col justify-between"
            aria-label="Ask my assistant"
            inert={!flipped}
          >
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <MessageCircle className="size-4" aria-hidden="true" />
                assistant
              </p>
              <h2 className="mt-3 font-title text-display-sm text-foreground">Ask me anything.</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                A chatbot that has read my projects, stack, and write-ups. Ask about the work, not just the résumé.
              </p>
            </div>
            <a
              href="/chat"
              className="group flex items-center justify-between rounded-lg border border-border bg-background/70 p-4 text-sm text-muted-foreground shadow-1 transition-colors hover:text-foreground"
            >
              <span>What are you working on right now?</span>
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </section>
        </div>
      </div>

      <button
        type="button"
        onClick={() => send('button')}
        aria-pressed={flipped}
        aria-label={flipped ? 'Show profile' : 'Ask my assistant'}
        data-no-flip
        className="absolute right-3 top-3 z-10 rounded-full border border-border bg-background/70 p-2 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
      >
        <RotateCw className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
