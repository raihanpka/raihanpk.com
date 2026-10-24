import { Marquee } from '@devnomic/marquee'
import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import {
  SiAnthropic,
  SiApachespark,
  SiAstro,
  SiApple,
  SiBun,
  SiCloudflare,
  SiCplusplus,
  SiClickhouse,
  SiClaudecode,
  SiDatabricks,
  SiDjango,
  SiDocker,
  SiExpo,
  SiExpress,
  SiFastapi,
  SiFirebase,
  SiFlutter,
  SiGin,
  SiGo,
  SiGooglegemini,
  SiGooglecloud,
  SiGrafana,
  SiGradle,
  SiGraphql,
  SiHuggingface,
  SiHono,
  SiJavascript,
  SiJupyter,
  SiK6,
  SiKeras,
  SiKotlin,
  SiLangchaincorporate,
  SiLanggraph,
  SiLatex,
  SiLinux,
  SiMlflow,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiNodedotjs,
  SiOllama,
  SiOpencode,
  SiOpencv,
  SiOpenjdk,
  SiOpenrouter,
  SiOpentelemetry,
  SiPnpm,
  SiPostgresql,
  SiPrisma,
  SiPrometheus,
  SiPydantic,
  SiPytest,
  SiPython,
  SiPytorch,
  SiQdrant,
  SiRabbitmq,
  SiReact,
  SiRedis,
  SiSentry,
  SiScikitlearn,
  SiScala,
  SiSpringboot,
  SiStreamlit,
  SiSupabase,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
  SiVercel,
  SiVite,
  SiVitest,
  SiApacheflink,
  SiGnubash,
  SiModelcontextprotocol,
} from 'react-icons/si'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface StackIconProps {
  name: string
  size?: string
  className?: string
}

const StackIcon: React.FC<StackIconProps> = ({ name, size = '2em', className }) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    // Programming Languages
    cplusplus: SiCplusplus,
    go: SiGo,
    openjdk: SiOpenjdk,
    javascript: SiJavascript,
    kotlin: SiKotlin,
    latex: SiLatex,
    python: SiPython,
    scala: SiScala,
    typescript: SiTypescript,
    // Frontend Frameworks
    astro: SiAstro,
    django: SiDjango,
    expo: SiExpo,
    flutter: SiFlutter,
    nextdotjs: SiNextdotjs,
    react: SiReact,
    streamlit: SiStreamlit,
    tailwindcss: SiTailwindcss,
    vite: SiVite,
    // Backend Frameworks
    bun: SiBun,
    pnpm: SiPnpm,
    express: SiExpress,
    fastapi: SiFastapi,
    gin: SiGin,
    hono: SiHono,
    nestjs: SiNestjs,
    nodedotjs: SiNodedotjs,
    springboot: SiSpringboot,
    // Databases
    firebase: SiFirebase,
    graphql: SiGraphql,
    mongodb: SiMongodb,
    mysql: SiMysql,
    postgresql: SiPostgresql,
    prisma: SiPrisma,
    rabbitmq: SiRabbitmq,
    redis: SiRedis,
    supabase: SiSupabase,
    // AI, ML, and Data Engineering
    anthropic: SiAnthropic,
    apacheflink: SiApacheflink,
    clickhouse: SiClickhouse,
    databricks: SiDatabricks,
    gemini: SiGooglegemini,
    huggingface: SiHuggingface,
    jupyter: SiJupyter,
    keras: SiKeras,
    langchain: SiLangchaincorporate,
    langgraph: SiLanggraph,
    mcp: SiModelcontextprotocol,
    mlflow: SiMlflow,
    ollama: SiOllama,
    opencv: SiOpencv,
    openrouter: SiOpenrouter,
    pydantic: SiPydantic,
    pytorch: SiPytorch,
    qdrant: SiQdrant,
    scikitlearn: SiScikitlearn,
    spark: SiApachespark,
    tensorflow: SiTensorflow,
    // Tools
    gnubash: SiGnubash,
    cloudflare: SiCloudflare,
    claude: SiClaudecode,
    docker: SiDocker,
    googlecloud: SiGooglecloud,
    grafana: SiGrafana,
    gradle: SiGradle,
    k6: SiK6,
    linux: SiLinux,
    macos: SiApple,
    opentelemetry: SiOpentelemetry,
    opencode: SiOpencode,
    prometheus: SiPrometheus,
    pytest: SiPytest,
    vitest: SiVitest,
    sentry: SiSentry,
    vercel: SiVercel,
  }

  const IconComponent = iconMap[name]
  if (!IconComponent) {
    return <div>?</div> // Fallback
  }
  return <IconComponent size={size} className={cn('text-neutral-900 dark:text-white', className)} aria-hidden="true" />
}

export default function TechStackSlider() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [marqueeKey, setMarqueeKey] = useState(0)

  const languages = [
    { name: 'python', alt: 'Python', url: 'https://python.org' },
    { name: 'typescript', alt: 'TypeScript', url: 'https://typescriptlang.org' },
    { name: 'javascript', alt: 'JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { name: 'go', alt: 'Go', url: 'https://go.dev' },
    { name: 'openjdk', alt: 'Java', url: 'https://java.com' },
    { name: 'kotlin', alt: 'Kotlin', url: 'https://kotlinlang.org' },
    { name: 'latex', alt: 'LaTeX', url: 'https://www.latex-project.org' },
    { name: 'scala', alt: 'Scala', url: 'https://scala-lang.org' },
    { name: 'cplusplus', alt: 'C++', url: 'https://isocpp.org' },
  ]
  const frontend = [
    { name: 'react', alt: 'React', url: 'https://react.dev' },
    { name: 'nextdotjs', alt: 'Next.js', url: 'https://nextjs.org' },
    { name: 'astro', alt: 'Astro', url: 'https://astro.build' },
    { name: 'tailwindcss', alt: 'Tailwind CSS', url: 'https://tailwindcss.com' },
    { name: 'django', alt: 'Django', url: 'https://djangoproject.com' },
    { name: 'streamlit', alt: 'Streamlit', url: 'https://streamlit.io' },
    { name: 'vite', alt: 'Vite', url: 'https://vite.dev' },
    { name: 'expo', alt: 'Expo', url: 'https://expo.dev' },
    { name: 'flutter', alt: 'Flutter', url: 'https://flutter.dev' },
  ]
  const backend = [
    { name: 'nodedotjs', alt: 'Node.js', url: 'https://nodejs.org' },
    { name: 'bun', alt: 'Bun', url: 'https://bun.sh' },
    { name: 'pnpm', alt: 'pnpm', url: 'https://pnpm.io' },
    { name: 'nestjs', alt: 'NestJS', url: 'https://nestjs.com' },
    { name: 'hono', alt: 'Hono', url: 'https://hono.dev' },
    { name: 'express', alt: 'Express', url: 'https://expressjs.com' },
    { name: 'fastapi', alt: 'FastAPI', url: 'https://fastapi.tiangolo.com' },
    { name: 'gin', alt: 'Gin', url: 'https://gin-gonic.com' },
    { name: 'springboot', alt: 'Spring Boot', url: 'https://spring.io/projects/spring-boot' },
  ]
  const databases = [
    { name: 'postgresql', alt: 'PostgreSQL', url: 'https://postgresql.org' },
    { name: 'mysql', alt: 'MySQL', url: 'https://mysql.com' },
    { name: 'mongodb', alt: 'MongoDB', url: 'https://mongodb.com' },
    { name: 'redis', alt: 'Redis', url: 'https://redis.io' },
    { name: 'prisma', alt: 'Prisma', url: 'https://prisma.io' },
    { name: 'rabbitmq', alt: 'RabbitMQ', url: 'https://rabbitmq.com' },
    { name: 'supabase', alt: 'Supabase', url: 'https://supabase.com' },
    { name: 'firebase', alt: 'Firebase', url: 'https://firebase.google.com' },
    { name: 'graphql', alt: 'GraphQL', url: 'https://graphql.org' },
    { name: 'mcp', alt: 'MCP', url: 'https://modelcontextprotocol.io' },
  ]
  const aiData = [
    { name: 'langchain', alt: 'LangChain', url: 'https://langchain.com' },
    { name: 'langgraph', alt: 'LangGraph', url: 'https://langchain-ai.github.io/langgraph' },
    { name: 'mlflow', alt: 'MLflow', url: 'https://mlflow.org' },
    { name: 'pydantic', alt: 'Pydantic', url: 'https://pydantic.dev' },
    { name: 'huggingface', alt: 'Hugging Face', url: 'https://huggingface.co' },
    { name: 'ollama', alt: 'Ollama', url: 'https://ollama.com' },
    { name: 'anthropic', alt: 'Anthropic', url: 'https://anthropic.com' },
    { name: 'gemini', alt: 'Gemini', url: 'https://ai.google.dev' },
    { name: 'openrouter', alt: 'OpenRouter', url: 'https://openrouter.ai' },
    { name: 'qdrant', alt: 'Qdrant', url: 'https://qdrant.tech' },
    { name: 'pytorch', alt: 'PyTorch', url: 'https://pytorch.org' },
    { name: 'tensorflow', alt: 'TensorFlow', url: 'https://tensorflow.org' },
    { name: 'keras', alt: 'Keras', url: 'https://keras.io' },
    { name: 'spark', alt: 'Spark', url: 'https://spark.apache.org' },
    { name: 'scikitlearn', alt: 'Scikit-learn', url: 'https://scikit-learn.org' },
    { name: 'opencv', alt: 'OpenCV', url: 'https://opencv.org' },
    { name: 'jupyter', alt: 'Jupyter', url: 'https://jupyter.org' },
    { name: 'apacheflink', alt: 'Apache Flink', url: 'https://flink.apache.org' },
    { name: 'clickhouse', alt: 'ClickHouse', url: 'https://clickhouse.com' },
    { name: 'databricks', alt: 'Databricks', url: 'https://databricks.com' },
  ]
  const tools = [
    { name: 'docker', alt: 'Docker', url: 'https://docker.com' },
    { name: 'googlecloud', alt: 'GCP', url: 'https://cloud.google.com' },
    { name: 'cloudflare', alt: 'Cloudflare', url: 'https://cloudflare.com' },
    { name: 'vercel', alt: 'Vercel', url: 'https://vercel.com' },
    { name: 'k6', alt: 'k6', url: 'https://k6.io' },
    { name: 'pytest', alt: 'Pytest', url: 'https://pytest.org' },
    { name: 'vitest', alt: 'Vitest', url: 'https://vitest.dev' },
    { name: 'sentry', alt: 'Sentry', url: 'https://sentry.io' },
    { name: 'opentelemetry', alt: 'OpenTelemetry', url: 'https://opentelemetry.io' },
    { name: 'grafana', alt: 'Grafana', url: 'https://grafana.com' },
    { name: 'prometheus', alt: 'Prometheus', url: 'https://prometheus.io' },
    { name: 'gnubash', alt: 'Bash', url: 'https://gnu.org/software/bash' },
    { name: 'linux', alt: 'Linux', url: 'https://linux.org' },
    { name: 'macos', alt: 'macOS', url: 'https://apple.com/macos' },
    { name: 'gradle', alt: 'Gradle', url: 'https://gradle.org' },
    { name: 'claude', alt: 'Claude Code', url: 'https://claude.com/product/claude-code' },
    { name: 'opencode', alt: 'Opencode', url: 'https://opencode.ai' },
  ]

  const row1 = [...languages, ...frontend, ...backend, ...databases]
  const row2 = aiData
  const row3 = tools

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
    document.addEventListener('astro:page-load', rerun)
    window.addEventListener('astro:page-load', rerun)

    return () => {
      mq.removeEventListener('change', handle as any)
      document.removeEventListener('astro:page-load', rerun)
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
        innerClassName="gap-2 [--duration:87s]"
      >
        {row1.map((stack, index) => (
          <a
            key={`row1-${index}`}
            href={stack.url}
            target="_blank"
            rel="noopener noreferrer"
            title={stack.alt}
            aria-label={stack.alt}
            className="relative mx-1 sm:mx-2 flex h-10 w-12 sm:h-14 sm:w-16 cursor-pointer items-center justify-center rounded-lg bg-linear-to-br from-[#ffffff] to-[#e6e6e6] dark:from-[#1f1f1f] dark:to-[#0e0e0e] border border-black/10 dark:border-transparent p-1.5 sm:p-2 shadow-md"
            onMouseEnter={() => setHoveredKey(`row1-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-10 w-12 sm:h-14 sm:w-16 rounded-lg border-2 border-b-0 border-r-0 border-white dark:border-[#2a2a2a] pointer-events-none" />
            <span
              className="h-full w-full select-none flex items-center justify-center transition-all duration-150 text-neutral-900 dark:text-white"
              draggable={false}
            >
              {hoveredKey === `row1-${index}` ? (
                <ExternalLink size="1.4em" className="sm:hidden text-neutral-800 dark:text-white/80" aria-hidden="true" />
              ) : (
                <StackIcon name={stack.name} size="1.8em" className="sm:hidden text-neutral-900 dark:text-white" />
              )}
              {hoveredKey === `row1-${index}` ? (
                <ExternalLink size="1.8em" className="hidden sm:inline text-neutral-800 dark:text-white/80" aria-hidden="true" />
              ) : (
                <StackIcon name={stack.name} size="2.5em" className="hidden sm:inline text-neutral-900 dark:text-white" />
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
        innerClassName="gap-2 [--duration:47s]"
      >
        {row2.map((stack, index) => (
          <a
            key={`row2-${index}`}
            href={stack.url}
            target="_blank"
            rel="noopener noreferrer"
            title={stack.alt}
            aria-label={stack.alt}
            className="relative mx-1 sm:mx-2 flex h-10 w-12 sm:h-14 sm:w-16 cursor-pointer items-center justify-center rounded-lg bg-linear-to-br from-[#ffffff] to-[#e6e6e6] dark:from-[#1f1f1f] dark:to-[#0e0e0e] border border-black/10 dark:border-transparent p-1.5 sm:p-2 shadow-md"
            onMouseEnter={() => setHoveredKey(`row2-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-10 w-12 sm:h-14 sm:w-16 rounded-lg border-2 border-b-0 border-r-0 border-white dark:border-[#2a2a2a] pointer-events-none" />
            <span
              className="h-full w-full select-none flex items-center justify-center transition-all duration-150 text-neutral-900 dark:text-white"
              draggable={false}
            >
              {hoveredKey === `row2-${index}` ? (
                <ExternalLink size="1.4em" className="sm:hidden text-neutral-800 dark:text-white/80" aria-hidden="true" />
              ) : (
                <StackIcon name={stack.name} size="1.8em" className="sm:hidden text-neutral-900 dark:text-white" />
              )}
              {hoveredKey === `row2-${index}` ? (
                <ExternalLink size="1.8em" className="hidden sm:inline text-neutral-800 dark:text-white/80" aria-hidden="true" />
              ) : (
                <StackIcon name={stack.name} size="2.5em" className="hidden sm:inline text-neutral-900 dark:text-white" />
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
        innerClassName="gap-2 [--duration:40s]"
      >
        {row3.map((stack, index) => (
          <a
            key={`row3-${index}`}
            href={stack.url}
            target="_blank"
            rel="noopener noreferrer"
            title={stack.alt}
            aria-label={stack.alt}
            className="relative mx-1 sm:mx-2 flex h-10 w-12 sm:h-14 sm:w-16 cursor-pointer items-center justify-center rounded-lg bg-linear-to-br from-[#ffffff] to-[#e6e6e6] dark:from-[#1f1f1f] dark:to-[#0e0e0e] border border-black/10 dark:border-transparent p-1.5 sm:p-2 shadow-md"
            onMouseEnter={() => setHoveredKey(`row3-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-10 w-12 sm:h-14 sm:w-16 rounded-lg border-2 border-b-0 border-r-0 border-white dark:border-[#2a2a2a] pointer-events-none" />
            <span
              className="h-full w-full select-none flex items-center justify-center transition-all duration-150 text-neutral-900 dark:text-white"
              draggable={false}
            >
              {hoveredKey === `row3-${index}` ? (
                <ExternalLink size="1.4em" className="sm:hidden text-neutral-800 dark:text-white/80" aria-hidden="true" />
              ) : (
                <StackIcon name={stack.name} size="1.8em" className="sm:hidden text-neutral-900 dark:text-white" />
              )}
              {hoveredKey === `row3-${index}` ? (
                <ExternalLink size="1.8em" className="hidden sm:inline text-neutral-800 dark:text-white/80" aria-hidden="true" />
              ) : (
                <StackIcon name={stack.name} size="2.5em" className="hidden sm:inline text-neutral-900 dark:text-white" />
              )}
            </span>
          </a>
        ))}
      </Marquee>

      <div className="flex justify-center pt-2 sm:mt-4">
        <Badge variant="outline" className="text-xs font-mono mb-1">
          My tech stack & tools
        </Badge>
      </div>
    </div>
  )
}
