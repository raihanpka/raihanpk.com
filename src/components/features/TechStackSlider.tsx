import { Marquee } from '@devnomic/marquee'
import { useEffect, useState } from 'react'
import '@devnomic/marquee/dist/index.css'
import { ExternalLink } from 'lucide-react'
import {
  SiAstro,
  SiBun,
  SiDjango,
  SiDocker,
  SiExpo,
  SiExpress,
  SiFastapi,
  SiFirebase,
  SiGnubash,
  SiGooglecloud,
  SiGooglecolab,
  SiInsomnia,
  SiJupyter,
  SiK6,
  SiKeras,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiOpencv,
  SiPostgresql,
  SiPrisma,
  SiPytest,
  SiPytorch,
  SiReact,
  SiScikitlearn,
  SiStreamlit,
  SiSupabase,
  SiTailwindcss,
  SiTensorflow,
  SiVercel,
  SiVite,
} from 'react-icons/si'
import { Badge } from '@/components/ui/badge'

interface StackIconProps {
  name: string
  size?: string
}

const StackIcon: React.FC<StackIconProps> = ({ name, size = '2em' }) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    react: SiReact,
    nextdotjs: SiNextdotjs,
    astro: SiAstro,
    tailwindcss: SiTailwindcss,
    django: SiDjango,
    streamlit: SiStreamlit,
    vite: SiVite,
    expo: SiExpo,
    nodedotjs: SiNodedotjs,
    bun: SiBun,
    express: SiExpress,
    fastapi: SiFastapi,
    mysql: SiMysql,
    postgresql: SiPostgresql,
    mongodb: SiMongodb,
    prisma: SiPrisma,
    supabase: SiSupabase,
    firebase: SiFirebase,
    pytorch: SiPytorch,
    tensorflow: SiTensorflow,
    keras: SiKeras,
    scikitlearn: SiScikitlearn,
    opencv: SiOpencv,
    pytest: SiPytest,
    jupyter: SiJupyter,
    googlecolab: SiGooglecolab,
    insomnia: SiInsomnia,
    docker: SiDocker,
    k6: SiK6,
    googlecloud: SiGooglecloud,
    vercel: SiVercel,
    gnubash: SiGnubash,
    linux: SiLinux,
  }

  const IconComponent = iconMap[name]
  if (!IconComponent) {
    return <div>?</div> // Fallback
  }
  return <IconComponent size={size} />
}

export default function TechStackSlider() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [marqueeKey, setMarqueeKey] = useState(0)

  const stacksList = [
    // Frontend
    { name: 'react', alt: 'React', url: 'https://react.dev' },
    { name: 'nextdotjs', alt: 'Next.js', url: 'https://nextjs.org' },
    { name: 'astro', alt: 'Astro', url: 'https://astro.build' },
    {
      name: 'tailwindcss',
      alt: 'Tailwind CSS',
      url: 'https://tailwindcss.com',
    },
    { name: 'django', alt: 'Django', url: 'https://www.djangoproject.com' },
    { name: 'streamlit', alt: 'Streamlit', url: 'https://streamlit.io' },
    { name: 'vite', alt: 'Vite', url: 'https://vitejs.dev' },
    { name: 'expo', alt: 'Expo', url: 'https://expo.dev' },

    // Backend
    { name: 'nodedotjs', alt: 'Node.js', url: 'https://nodejs.org' },
    { name: 'bun', alt: 'Bun', url: 'https://bun.sh' },
    { name: 'express', alt: 'Express', url: 'https://expressjs.com' },
    { name: 'fastapi', alt: 'FastAPI', url: 'https://fastapi.tiangolo.com' },
    { name: 'mysql', alt: 'MySQL', url: 'https://www.mysql.com' },
    {
      name: 'postgresql',
      alt: 'PostgreSQL',
      url: 'https://www.postgresql.org',
    },
    { name: 'mongodb', alt: 'MongoDB', url: 'https://www.mongodb.com' },
    { name: 'prisma', alt: 'Prisma', url: 'https://www.prisma.io' },
    { name: 'supabase', alt: 'Supabase', url: 'https://supabase.com' },
    { name: 'firebase', alt: 'Firebase', url: 'https://firebase.google.com' },

    // Data Science / ML
    { name: 'pytorch', alt: 'PyTorch', url: 'https://pytorch.org' },
    {
      name: 'tensorflow',
      alt: 'TensorFlow',
      url: 'https://www.tensorflow.org',
    },
    { name: 'keras', alt: 'Keras', url: 'https://keras.io' },
    {
      name: 'scikitlearn',
      alt: 'Scikit-Learn',
      url: 'https://scikit-learn.org',
    },
    { name: 'opencv', alt: 'OpenCV', url: 'https://opencv.org' },
    { name: 'pytest', alt: 'Pytest', url: 'https://pytest.org' },
    { name: 'jupyter', alt: 'Jupyter', url: 'https://jupyter.org' },
    {
      name: 'googlecolab',
      alt: 'Colab',
      url: 'https://colab.research.google.com',
    },

    // Tools
    { name: 'insomnia', alt: 'Insomnia', url: 'https://insomnia.rest' },
    { name: 'docker', alt: 'Docker', url: 'https://www.docker.com' },
    { name: 'k6', alt: 'Grafana K6', url: 'https://k6.io' },
    { name: 'googlecloud', alt: 'GCP', url: 'https://cloud.google.com' },
    { name: 'vercel', alt: 'Vercel', url: 'https://vercel.com' },
    { name: 'gnubash', alt: 'Bash', url: 'https://www.gnu.org/software/bash' },
    { name: 'linux', alt: 'Linux', url: 'https://www.linux.org' },
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
            className="relative mx-2 flex h-14 w-16 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#0e0e0e] p-2 shadow-xl"
            onMouseEnter={() => setHoveredKey(`row1-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-14 w-16 rounded-lg border-2 border-b-0 border-r-0 border-[#2a2a2a]" />
            <span
              className="h-full w-full select-none flex items-center justify-center transition-all duration-150"
              draggable={false}
              aria-label={stack.alt}
            >
              {hoveredKey === `row1-${index}` ? (
                <ExternalLink size="1.8em" className="text-white/80" />
              ) : (
                <StackIcon name={stack.name} size="2.5em" />
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
            className="relative mx-2 flex h-14 w-16 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#0e0e0e] p-2 shadow-xl"
            onMouseEnter={() => setHoveredKey(`row2-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-14 w-16 rounded-lg border-2 border-b-0 border-r-0 border-[#2a2a2a]" />
            <span
              className="h-full w-full select-none flex items-center justify-center transition-all duration-150"
              draggable={false}
              aria-label={stack.alt}
            >
              {hoveredKey === `row2-${index}` ? (
                <ExternalLink size="1.8em" className="text-white/80" />
              ) : (
                <StackIcon name={stack.name} size="2.5em" />
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
            className="relative mx-2 flex h-14 w-16 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#0e0e0e] p-2 shadow-xl"
            onMouseEnter={() => setHoveredKey(`row3-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-14 w-16 rounded-lg border-2 border-b-0 border-r-0 border-[#2a2a2a]" />
            <span
              className="h-full w-full select-none flex items-center justify-center transition-all duration-150"
              draggable={false}
              aria-label={stack.alt}
            >
              {hoveredKey === `row3-${index}` ? (
                <ExternalLink size="1.8em" className="text-white/80" />
              ) : (
                <StackIcon name={stack.name} size="2.5em" />
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
