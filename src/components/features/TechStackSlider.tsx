import { useState, useEffect } from 'react'
import { Marquee } from "@devnomic/marquee";
import "@devnomic/marquee/dist/index.css";
import { 
  SiReact, SiNextdotjs, SiAstro, SiTailwindcss, SiDjango, SiStreamlit, SiVite, SiExpo,
  SiNodedotjs, SiBun, SiExpress, SiFastapi, SiMysql, SiPostgresql, SiMongodb, SiPrisma, SiSupabase, SiFirebase,
  SiPytorch, SiTensorflow, SiKeras, SiScikitlearn, SiOpencv, SiPytest, SiJupyter, SiGooglecolab,
  SiInsomnia, SiDocker, SiK6, SiGooglecloud, SiVercel, SiGnubash, SiApple, SiLinux
} from "react-icons/si";
import { Badge } from '@/components/ui/badge'

interface StackIconProps {
  name: string;
  size?: string;
}

const StackIcon: React.FC<StackIconProps> = ({ name, size = "2em" }) => {
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
    apple: SiApple,
    linux: SiLinux,
  };

  const IconComponent = iconMap[name];
  if (!IconComponent) {
    return <div>?</div>; // Fallback
  }
  return <IconComponent size={size} />;
};

export default function TechStackSlider() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [marqueeKey, setMarqueeKey] = useState(0)

  const stacksList = [
    // Frontend
    { name: 'react', alt: 'React' },
    { name: 'nextdotjs', alt: 'Next.js' },
    { name: 'astro', alt: 'Astro' },
    { name: 'tailwindcss', alt: 'Tailwind CSS' },
    { name: 'django', alt: 'Django' },
    { name: 'streamlit', alt: 'Streamlit' },
    { name: 'vite', alt: 'Vite' },
    { name: 'expo', alt: 'Expo' },

    // Backend
    { name: 'nodedotjs', alt: 'Node.js' },
    { name: 'bun', alt: 'Bun' },
    { name: 'express', alt: 'Express' },
    { name: 'fastapi', alt: 'FastAPI' },
    { name: 'mysql', alt: 'MySQL' },
    { name: 'postgresql', alt: 'PostgreSQL' },
    { name: 'mongodb', alt: 'MongoDB' },
    { name: 'prisma', alt: 'Prisma' },
    { name: 'supabase', alt: 'Supabase' },
    { name: 'firebase', alt: 'Firebase' },

    // Data Science / ML
    { name: 'pytorch', alt: 'PyTorch' },
    { name: 'tensorflow', alt: 'TensorFlow' },
    { name: 'keras', alt: 'Keras' },
    { name: 'scikitlearn', alt: 'Scikit-Learn' },
    { name: 'opencv', alt: 'OpenCV' },
    { name: 'pytest', alt: 'Pytest' },
    { name: 'jupyter', alt: 'Jupyter' },
    { name: 'googlecolab', alt: 'Colab' },

    // Tools
    { name: 'insomnia', alt: 'Insomnia' },
    { name: 'docker', alt: 'Docker' },
    { name: 'k6', alt: 'Grafana K6' },
    { name: 'googlecloud', alt: 'GCP' },
    { name: 'vercel', alt: 'Vercel' },
    { name: 'gnubash', alt: 'Bash' },
    { name: 'apple', alt: 'Apple' },
    { name: 'linux', alt: 'Linux' },
  ]

  const third = Math.ceil(stacksList.length / 3)
  const row1 = stacksList.slice(0, third)
  const row2 = stacksList.slice(third, 2 * third)
  const row3 = stacksList.slice(2 * third)

  const isPaused = hoveredKey !== null

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    const handle = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(e.matches)
    handle(mq)
    mq.addEventListener('change', handle as any)

    const rerun = () => {
      setHoveredKey(null)
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
    <div className="relative mx-auto w-full overflow-hidden rounded-xl p-4" style={{ background: 'transparent' }}>
      {/* Row 1 */}
      <Marquee
        key={`row1-${marqueeKey}`}
        fade={true}
        direction="left"
        pauseOnHover={isPaused || isDesktop}
        className="mb-4 transform rotate-1"
        innerClassName="gap-2"
      >
        {row1.map((stack, index) => (
          <div
            key={`row1-${index}`}
            className="relative mx-2 flex h-12 w-12 cursor-help items-center justify-center rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#0e0e0e] p-2 shadow-xl"
            onMouseEnter={() => setHoveredKey(`row1-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-12 w-12 rounded-lg border-2 border-b-0 border-r-0 border-[#2a2a2a]" />
            {hoveredKey === `row1-${index}` && <span className='absolute z-30 left-1/2 transform -translate-x-1/2 max-w-[2.5rem] rounded bg-white/95 text-black px-0.5 py-0.5 text-center text-[0.4rem] md:max-w-[3rem] md:text-[0.5rem] shadow-sm'>{stack.alt}</span>}
            <span
              className={`h-full w-full select-none object-contain transition-all duration-200 flex items-center justify-center ${hoveredKey === `row1-${index}` ? 'blur-sm' : ''}`}
              draggable={false}
              aria-label={stack.alt}
            >
              <StackIcon name={stack.name} size="2em" />
            </span>
          </div>
        ))}
      </Marquee>

      {/* Row 2 */}
      <Marquee
        key={`row2-${marqueeKey}`}
        fade={true}
        direction="left"
        reverse={true}
        pauseOnHover={isPaused || isDesktop}
        className="mb-4 transform rotate-1"
        innerClassName="gap-2"
      >
        {row2.map((stack, index) => (
          <div
            key={`row2-${index}`}
            className="relative mx-2 flex h-12 w-12 cursor-help items-center justify-center rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#0e0e0e] p-2 shadow-xl"
            onMouseEnter={() => setHoveredKey(`row2-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-12 w-12 rounded-lg border-2 border-b-0 border-r-0 border-[#2a2a2a]" />
            {hoveredKey === `row2-${index}` && <span className='absolute z-30 left-1/2 transform -translate-x-1/2 max-w-[2.5rem] rounded bg-white/95 text-black px-0.5 py-0.5 text-center text-[0.4rem] md:max-w-[3rem] md:text-[0.5rem] shadow-sm'>{stack.alt}</span>}
            <span
              className={`h-full w-full select-none object-contain transition-all duration-200 flex items-center justify-center ${hoveredKey === `row2-${index}` ? 'blur-sm' : ''}`}
              draggable={false}
              aria-label={stack.alt}
            >
              <StackIcon name={stack.name} size="2em" />
            </span>
          </div>
        ))}
      </Marquee>

      {/* Row 3 */}
      <Marquee
        key={`row3-${marqueeKey}`}
        fade={true}
        direction="left"
        pauseOnHover={isPaused || isDesktop}
        className="mb-4 transform rotate-1"
        innerClassName="gap-2"
      >
        {row3.map((stack, index) => (
          <div
            key={`row3-${index}`}
            className="relative mx-2 flex h-12 w-12 cursor-help items-center justify-center rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#0e0e0e] p-2 shadow-xl"
            onMouseEnter={() => setHoveredKey(`row3-${index}`)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="absolute h-12 w-12 rounded-lg border-2 border-b-0 border-r-0 border-[#2a2a2a]" />
            {hoveredKey === `row3-${index}` && <span className='absolute z-30 left-1/2 transform -translate-x-1/2 max-w-[2.5rem] rounded bg-white/95 text-black px-0.5 py-0.5 text-center text-[0.4rem] md:max-w-[3rem] md:text-[0.5rem] shadow-sm'>{stack.alt}</span>}
            <span
              className={`h-full w-full select-none object-contain transition-all duration-200 flex items-center justify-center ${hoveredKey === `row3-${index}` ? 'blur-sm' : ''}`}
              draggable={false}
              aria-label={stack.alt}
            >
              <StackIcon name={stack.name} size="2em" />
            </span>
          </div>
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
