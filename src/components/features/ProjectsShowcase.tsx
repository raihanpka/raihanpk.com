'use client'

import { ArrowUpRight, SlidersHorizontal } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
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
                className="h-full"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <ProjectCard project={project} />
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
    </section>
  )
}

function ProjectCard({ project }: { project: ProjectItem }) {
  const [hovered, setHovered] = useState(false)
  const [assetSrc, setAssetSrc] = useState(project.asset)
  const [assetErrored, setAssetErrored] = useState(false)

  const handleError = () => {
    if (!assetErrored && project.fallback) {
      setAssetSrc(project.fallback)
      setAssetErrored(true)
    }
  }

  return (
    <div
      className="not-prose flex h-full flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media: video or image */}
      <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
        {assetSrc && isVideo(assetSrc) ? (
          <video
            src={assetSrc}
            autoPlay
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
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground text-justify">
          {project.description}
        </p>

        {/* Footer: tech icons + action buttons */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          {/* Tech icons */}
          <div className="flex items-center gap-2">
            {project.techStack?.map((tech) => {
              const Icon = techIconMap[tech]
              return Icon ? (
                <span
                  key={tech}
                  title={tech}
                  className="text-foreground transition-colors hover:text-foreground"
                >
                  <Icon size={16} />
                </span>
              ) : (
                <span
                  key={tech}
                  title={tech}
                  className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
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
