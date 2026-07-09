import { Marquee } from '@devnomic/marquee'
import { useEffect, useState } from 'react'
import '@devnomic/marquee/dist/index.css'
import { ExternalLink } from 'lucide-react'
import {
  SiAmazon,
  SiAstro,
  SiBun,
  SiCplusplus,
  SiDocker,
  SiExpo,
  SiExpress,
  SiFastapi,
  SiFirebase,
  SiGit,
  SiGnubash,
  SiGo,
  SiGooglecloud,
  SiGrafana,
  SiHuggingface,
  SiK6,
  SiKeras,
  SiLangchain,
  SiLinux,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiNumpy,
  SiOpenai,
  SiOpencv,
  SiOpenjdk,
  SiPandas,
  SiPostgresql,
  SiPrisma,
  SiPytest,
  SiPython,
  SiPytorch,
  SiReact,
  SiRedis,
  SiScikitlearn,
  SiSpringboot,
  SiStreamlit,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
  SiVercel,
  SiVite,
} from 'react-icons/si'
import { Badge } from '@/components/ui/badge'

interface StackIconProps {
  name: string
  size?: string
  className?: string
}

const StackIcon: React.FC<StackIconProps> = ({ name, size = '2em', className }) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    // Languages
    python: SiPython,
    typescript: SiTypescript,
    go: SiGo,
    cplusplus: SiCplusplus,
    gnubash: SiGnubash,
    openjdk: SiOpenjdk,
    // Frameworks
    react: SiReact,
    nextdotjs: SiNextdotjs,
    astro: SiAstro,
    tailwindcss: SiTailwindcss,
    nodedotjs: SiNodedotjs,
    bun: SiBun,
    express: SiExpress,
    fastapi: SiFastapi,
    springboot: SiSpringboot,
    // Data Science & AI
    pytorch: SiPytorch,
    tensorflow: SiTensorflow,
    scikitlearn: SiScikitlearn,
    opencv: SiOpencv,
    numpy: SiNumpy,
    pandas: SiPandas,
    openai: SiOpenai,
    langchain: SiLangchain,
    huggingface: SiHuggingface,
    // Cloud & Infrastructure
    postgresql: SiPostgresql,
    mongodb: SiMongodb,
    redis: SiRedis,
    firebase: SiFirebase,
    docker: SiDocker,
    googlecloud: SiGooglecloud,
    vercel: SiVercel,
    linux: SiLinux,
    git: SiGit,
    grafana: SiGrafana,
    aws: SiAmazon,
    // Tools (existing)
    prisma: SiPrisma,
    pytest: SiPytest,
    k6: SiK6,
    vite: SiVite,
    expo: SiExpo,
    streamlit: SiStreamlit,
    keras: SiKeras,
  }

  const IconComponent = iconMap[name]
  if (!IconComponent) {
    return <div>?</div> // Fallback
  }
  return <IconComponent size={size} className={className} />
}

export default function TechStackSlider() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [marqueeKey, setMarqueeKey] = useState(0)

  const stacksList = [
    // Languages
    { name: 'python', alt: 'Python', url: 'https://python.org' },
    { name: 'typescript', alt: 'TypeScript', url: 'https://typescriptlang.org' },
    { name: 'go', alt: 'Go', url: 'https://go.dev' },
    { name: 'openjdk', alt: 'Java', url: 'https://java.com' },
    { name: 'cplusplus', alt: 'C++', url: 'https://isocpp.org' },
    { name: 'gnubash', alt: 'Bash', url: 'https://gnu.org/software/bash' },

    // Frameworks
    { name: 'react', alt: 'React', url: 'https://react.dev' },
    { name: 'nextdotjs', alt: 'Next.js', url: 'https://nextjs.org' },
    { name: 'astro', alt: 'Astro', url: 'https://astro.build' },
    { name: 'tailwindcss', alt: 'Tailwind CSS', url: 'https://tailwindcss.com' },
    { name: 'nodedotjs', alt: 'Node.js', url: 'https://nodejs.org' },
    { name: 'bun', alt: 'Bun', url: 'https://bun.sh' },
    { name: 'express', alt: 'Express', url: 'https://expressjs.com' },
    { name: 'fastapi', alt: 'FastAPI', url: 'https://fastapi.tiangolo.com' },
    { name: 'springboot', alt: 'Spring Boot', url: 'https://spring.io/projects/spring-boot' },

    // Data Science & AI
    { name: 'pytorch', alt: 'PyTorch', url: 'https://pytorch.org' },
    { name: 'tensorflow', alt: 'TensorFlow', url: 'https://tensorflow.org' },
    { name: 'scikitlearn', alt: 'Scikit-learn', url: 'https://scikit-learn.org' },
    { name: 'opencv', alt: 'OpenCV', url: 'https://opencv.org' },
    { name: 'numpy', alt: 'NumPy', url: 'https://numpy.org' },
    { name: 'pandas', alt: 'Pandas', url: 'https://pandas.pydata.org' },
    { name: 'langchain', alt: 'LangChain', url: 'https://langchain.com' },
    { name: 'openai', alt: 'OpenAI API', url: 'https://openai.com' },
    { name: 'huggingface', alt: 'Hugging Face', url: 'https://huggingface.co' },

    // Cloud & Infrastructure
    { name: 'postgresql', alt: 'PostgreSQL', url: 'https://postgresql.org' },
    { name: 'mongodb', alt: 'MongoDB', url: 'https://mongodb.com' },
    { name: 'redis', alt: 'Redis', url: 'https://redis.io' },
    { name: 'firebase', alt: 'Firebase', url: 'https://firebase.google.com' },
    { name: 'docker', alt: 'Docker', url: 'https://docker.com' },
    { name: 'googlecloud', alt: 'GCP', url: 'https://cloud.google.com' },
    { name: 'aws', alt: 'AWS', url: 'https://aws.amazon.com' },
    { name: 'vercel', alt: 'Vercel', url: 'https://vercel.com' },
    { name: 'linux', alt: 'Linux', url: 'https://linux.org' },
    { name: 'git', alt: 'Git', url: 'https://git-scm.com' },
    { name: 'grafana', alt: 'Grafana', url: 'https://grafana.com' },
  ]

  const third = Math.ceil(stacksList.length / 3)
  const row1 = stacksList.slice(0, third)
  const row2 = stacksList.slice(third, 2 * third)
  const row3 = stacksList.slice(2 * third)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    const handle = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsDesktop(e.matches)
    handle(mq)
    mq.addEventListener('change', handle as any)

    const rerun = () => {
      // bump key to force remount of Marquee rows
      setMarqueeKey((p) => p + 1)
    }
    window.addEventListener('astro:page-load', rerun)

    return () => {
      mq.removeEventListener('change', handle as any)
      window.removeEventListener('astro:page-load', rerun)
    }
  }, [])

  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-xl p-4"
      style={{ background: 'transparent' }}
    >
      {/* Row 1 */}
      <Marquee
        key={`row1-${marqueeKey}`}
        fade={true}
        direction="left"
        pauseOnHover={hoveredKey !== null || isDesktop}
        className="mb-4 transform rotate-1"
        innerClassName="gap-2"
      >
        {row1.map((stack, index) => (
          <a
            key={`row1-${index}`}
            href={stack.url}
            target="_blank"
            rel="noopener noreferrer"
            title={stack.alt}
            className="relative mx-1 sm:mx-2 flex h-10 w-12 sm:h-14 sm:w-16 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#0e0e0e] p-1.5 sm:p-2 shadow-xl"
            onMouseEnter={() => setHoveredKey(`row1-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-10 w-12 sm:h-14 sm:w-16 rounded-lg border-2 border-b-0 border-r-0 border-[#2a2a2a]" />
            <span
              className="h-full w-full select-none flex items-center justify-center transition-all duration-150"
              draggable={false}
              aria-label={stack.alt}
            >
              {hoveredKey === `row1-${index}` ? (
                <ExternalLink size="1.4em" className="sm:hidden text-white/80" />
              ) : (
                <StackIcon name={stack.name} size="1.8em" className="sm:hidden" />
              )}
              {hoveredKey === `row1-${index}` ? (
                <ExternalLink size="1.8em" className="hidden sm:inline text-white/80" />
              ) : (
                <StackIcon name={stack.name} size="2.5em" className="hidden sm:inline" />
              )}
            </span>
          </a>
        ))}
      </Marquee>

      {/* Row 2 */}
      <Marquee
        key={`row2-${marqueeKey}`}
        fade={true}
        direction="left"
        reverse={true}
        pauseOnHover={hoveredKey !== null || isDesktop}
        className="mb-4 transform rotate-1"
        innerClassName="gap-2"
      >
        {row2.map((stack, index) => (
          <a
            key={`row2-${index}`}
            href={stack.url}
            target="_blank"
            rel="noopener noreferrer"
            title={stack.alt}
            className="relative mx-1 sm:mx-2 flex h-10 w-12 sm:h-14 sm:w-16 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#0e0e0e] p-1.5 sm:p-2 shadow-xl"
            onMouseEnter={() => setHoveredKey(`row2-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-10 w-12 sm:h-14 sm:w-16 rounded-lg border-2 border-b-0 border-r-0 border-[#2a2a2a]" />
            <span
              className="h-full w-full select-none flex items-center justify-center transition-all duration-150"
              draggable={false}
              aria-label={stack.alt}
            >
              {hoveredKey === `row2-${index}` ? (
                <ExternalLink size="1.4em" className="sm:hidden text-white/80" />
              ) : (
                <StackIcon name={stack.name} size="1.8em" className="sm:hidden" />
              )}
              {hoveredKey === `row2-${index}` ? (
                <ExternalLink size="1.8em" className="hidden sm:inline text-white/80" />
              ) : (
                <StackIcon name={stack.name} size="2.5em" className="hidden sm:inline" />
              )}
            </span>
          </a>
        ))}
      </Marquee>

      {/* Row 3 */}
      <Marquee
        key={`row3-${marqueeKey}`}
        fade={true}
        direction="left"
        pauseOnHover={hoveredKey !== null || isDesktop}
        className="mb-4 transform rotate-1"
        innerClassName="gap-2"
      >
        {row3.map((stack, index) => (
          <a
            key={`row3-${index}`}
            href={stack.url}
            target="_blank"
            rel="noopener noreferrer"
            title={stack.alt}
            className="relative mx-1 sm:mx-2 flex h-10 w-12 sm:h-14 sm:w-16 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#0e0e0e] p-1.5 sm:p-2 shadow-xl"
            onMouseEnter={() => setHoveredKey(`row3-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-10 w-12 sm:h-14 sm:w-16 rounded-lg border-2 border-b-0 border-r-0 border-[#2a2a2a]" />
            <span
              className="h-full w-full select-none flex items-center justify-center transition-all duration-150"
              draggable={false}
              aria-label={stack.alt}
            >
              {hoveredKey === `row3-${index}` ? (
                <ExternalLink size="1.4em" className="sm:hidden text-white/80" />
              ) : (
                <StackIcon name={stack.name} size="1.8em" className="sm:hidden" />
              )}
              {hoveredKey === `row3-${index}` ? (
                <ExternalLink size="1.8em" className="hidden sm:inline text-white/80" />
              ) : (
                <StackIcon name={stack.name} size="2.5em" className="hidden sm:inline" />
              )}
            </span>
          </a>
        ))}
      </Marquee>

      <div className="flex justify-center mt-4">
        <Badge variant="outline" className="text-xs font-mono mb-2">
          My tech stack & tools
        </Badge>
      </div>
    </div>
  )
}
