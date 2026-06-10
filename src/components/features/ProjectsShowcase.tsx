'use client'

import { ArrowUpRight, SlidersHorizontal, Link2, Check } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  SiAmazon,
  SiAstro,
  SiDjango,
  SiDocker,
  SiExpo,
  SiFastapi,
  SiFlutter,
  SiGit,
  SiGithub,
  SiGo,
  SiGooglecloud,
  SiGraphql,
  SiJavascript,
  SiKubernetes,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenai,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedis,
  SiRust,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiLangchain,
  SiVite
} from 'react-icons/si'

const techIconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  'Next.js': SiNextdotjs,
  React: SiReact,
  TypeScript: SiTypescript,
  TailwindCSS: SiTailwindcss,
  Supabase: SiSupabase,
  PostgreSQL: SiPostgresql,
  Python: SiPython,
  'Google Cloud': SiGooglecloud,
  Expo: SiExpo,
  OpenAI: SiOpenai,
  'Node.js': SiNodedotjs,
  Prisma: SiPrisma,
  Docker: SiDocker,
  Git: SiGit,
  Vercel: SiVercel,
  MongoDB: SiMongodb,
  Redis: SiRedis,
  GraphQL: SiGraphql,
  Astro: SiAstro,
  JavaScript: SiJavascript,
  Go: SiGo,
  Rust: SiRust,
  FastAPI: SiFastapi,
  Django: SiDjango,
  Flutter: SiFlutter,
  Kubernetes: SiKubernetes,
  AWS: SiAmazon,
  Langchain: SiLangchain,
  Vite: SiVite,
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export type ProjectItem = {
  name: string
  description: string
  tags: string[]
  type: string[]
  asset?: string
  fallback?: string
  link?: string
  github?: string
  date?: string
  techStack?: string[]
}

const VIDEO_RE = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i
function isVideo(src: string) {
  return VIDEO_RE.test(src)
}

type Props = {
  projects: ProjectItem[]
}

export function ProjectsShowcase({ projects }: Props) {
  const [activeType, setActiveType] = useState('All')
  const [visibleCount, setVisibleCount] = useState(4)
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)

  const allTypes = [
    'All',
    ...Array.from(new Set(projects.flatMap((p) => p.type))).sort(),
  ]

  const filtered =
    activeType === 'All'
      ? projects
      : projects.filter((p) => p.type.includes(activeType))

  const visibleProjects = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleTypeChange = (type: string) => {
    setActiveType(type)
    setVisibleCount(4)
  }

  // Deep linking logic
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const projectSlug = searchParams.get('project')

    if (projectSlug) {
      const found = projects.find(p => slugify(p.name) === projectSlug)
      if (found) {
        setActiveType('All')
        const index = projects.indexOf(found)
        if (index >= visibleCount) {
          setVisibleCount(index + 1)
        }
        setSelectedProject(found)
        
        // Wait for render/expansion
        setTimeout(() => {
          const element = document.getElementById(projectSlug)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 300)
      }
    }
  }, [projects])

  return (
    <section className="flex flex-col gap-y-5">
      {/* Section heading */}
      <div className="flex items-center gap-4">
        <h2 className="shrink-0 text-2xl font-bold">
          Projects
        </h2>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <SlidersHorizontal size={14} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`rounded-full border px-3 py-0.5 text-xs font-medium transition-colors duration-200 ${
                activeType === type
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-transparent text-foreground hover:bg-secondary/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {visibleProjects.map((project) => (
              <motion.div
                key={project.name}
                id={slugify(project.name)}
                className="h-full scroll-mt-24"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <ProjectCard 
                  project={project} 
                  onOpenModal={() => setSelectedProject(project)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom fade overlay */}
        {hasMore && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background via-background/70 to-transparent" />
        )}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + 4)}
            className={buttonVariants({ variant: 'ghost' }) + ' group'}
          >
            Load more stuff that i've built
            <span className="ml-1.5 transition-transform group-hover:translate-y-0.5">
              &darr;
            </span>
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal 
            project={selectedProject} 
            onClose={() => {
              setSelectedProject(null)
              const url = new URL(window.location.href)
              url.searchParams.delete('project')
              window.history.replaceState({}, '', url)
            }} 
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function CopyLinkButton({ projectName }: { projectName: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const slug = slugify(projectName)
    const url = `${window.location.origin}/projects/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative flex items-center">
      <button
        onClick={handleCopy}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-secondary active:scale-95 shadow-sm"
        aria-label="Copy project link"
      >
        {copied ? <Check size={16} className="text-additive" /> : <Link2 size={16} />}
      </button>
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 z-30">
        <div className="whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-bold text-background shadow-md border border-background/10">
          {copied ? 'Link Copied!' : 'Copy Link'}
        </div>
        {/* Tooltip triangle */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground"></div>
      </div>
    </div>
  )
}

function ProjectCard({ project, onOpenModal }: { project: ProjectItem; onOpenModal: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [assetSrc, setAssetSrc] = useState(project.asset)
  const [assetErrored, setAssetErrored] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isInView = useInView(containerRef, { once: false, margin: '100px' })

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isInView])

  const handleError = () => {
    if (!assetErrored && project.fallback) {
      setAssetSrc(project.fallback)
      setAssetErrored(true)
    }
  }

  return (
    <div
      ref={containerRef}
      onClick={onOpenModal}
      className="not-prose flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media: video or image */}
      <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
        {assetSrc && isVideo(assetSrc) ? (
          <video
            ref={videoRef}
            src={assetSrc}
            preload="none"
            loop
            muted
            playsInline
            onError={handleError}
            className={`h-full w-full object-cover transition-[transform,filter] duration-500 ease-in-out ${
              hovered ? 'grayscale-0' : 'grayscale'
            }`}
            style={{ transform: hovered ? 'scale(1.02)' : 'scale(1)' }}
          />
        ) : assetSrc ? (
          <img
            src={assetSrc}
            alt={project.name}
            loading="lazy"
            decoding="async"
            onError={handleError}
            className={`h-full w-full object-cover transition-[transform,filter] duration-500 ease-in-out ${
              hovered ? 'grayscale-0' : 'grayscale'
            }`}
            style={{ transform: hovered ? 'scale(1.02)' : 'scale(1)' }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
            No preview
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name + Date */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight">{project.name}</h3>
          {project.date && (
            <span className="shrink-0 text-right text-sm text-muted-foreground leading-tight">
              {project.date.split(' ').map((part, i) => (
                <span key={i} className="block">{part}</span>
              ))}
            </span>
          )}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" showHash={false}>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground text-justify line-clamp-3">
          {project.description}
        </p>

        {/* Footer: tech icons + action buttons */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          {/* Tech icons */}
          <div className="flex items-center gap-2">
            {project.techStack?.slice(0, 5).map((tech) => {
              const Icon = techIconMap[tech]
              return Icon ? (
                <span
                  key={tech}
                  title={tech}
                  className="text-foreground/70 transition-colors hover:text-foreground"
                >
                  <Icon size={16} />
                </span>
              ) : null
            })}
            {project.techStack && project.techStack.length > 5 && (
              <span className="text-[10px] text-muted-foreground">+{project.techStack.length - 5}</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <CopyLinkButton projectName={project.name} />
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-secondary"
              >
                <SiGithub size={14} />
              </a>
            )}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View project"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-secondary"
              >
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectModal({ project, onClose }: { project: ProjectItem; onClose: () => void }) {
  const [assetSrc, setAssetSrc] = useState(project.asset)
  const [assetErrored, setAssetErrored] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    // Prevent scrolling of body when modal is open
    document.body.style.overflow = 'hidden'
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'auto'
    }
  }, [onClose])

  const handleError = () => {
    if (!assetErrored && project.fallback) {
      setAssetSrc(project.fallback)
      setAssetErrored(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-2xl p-4 sm:p-8 cursor-pointer"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-7xl overflow-hidden rounded-[2.5rem] border bg-background shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-[70%_30%] md:h-[620px] overflow-hidden">
          {/* Media Section - Height Master */}
          <div className="relative bg-black border-b md:border-b-0 md:border-r w-full h-full">
            <div className="w-full h-full overflow-hidden">
              {assetSrc && isVideo(assetSrc) ? (
                <video
                  ref={videoRef}
                  src={assetSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={handleError}
                  className="h-full w-full object-cover"
                />
              ) : assetSrc ? (
                <img
                  src={assetSrc}
                  alt={project.name}
                  onError={handleError}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
                  No preview available
                </div>
              )}
            </div>
          </div>
          
          {/* Content Section - Precision Alignment */}
          <div className="flex flex-col min-h-0 bg-background overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto p-5 md:p-8 scrollbar-hide">
              <div className="flex flex-col gap-5">
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-foreground">{project.name}</h3>
                  {project.date && (
                    <div className="flex">
                      <span className="text-[12px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border/50">
                        {project.date}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" showHash={false}>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground text-justify">
                  {project.description}
                </p>

                {/* Tech Stack - Compact Grid */}
                <div className="pt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">Powered By</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                    {project.techStack?.map((tech) => {
                      const Icon = techIconMap[tech]
                      return (
                        <div key={tech} className="flex items-center gap-2.5 group">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/30 border border-border/40 transition-all group-hover:bg-secondary/60 group-hover:border-foreground/20">
                            {Icon && <Icon size={14} className="text-foreground/60 group-hover:text-foreground transition-colors" />}
                          </div>
                          <span className="text-[11px] font-bold text-foreground/50 group-hover:text-foreground transition-colors truncate">{tech}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer - Precision Alignment */}
            <div className="h-20 shrink-0 px-6 md:px-8 border-t border-border bg-background flex items-center justify-between gap-4 mt-auto">
              <div className="flex items-center gap-2">
                <CopyLinkButton projectName={project.name} />
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-secondary active:scale-95 shadow-sm"
                    title="View Source"
                  >
                    <SiGithub size={16} />
                  </a>
                )}
              </div>
              
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'default' }) + " gap-2 rounded-lg h-9 text-xs font-bold shadow-sm hover:bg-primary flex items-center justify-center"}
                >
                  <ArrowUpRight size={16} />
                  <span>Live Preview</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
