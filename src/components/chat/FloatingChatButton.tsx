import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FloatingChatButton() {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    window.location.href = '/chat'
  }

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 md:bottom-8 md:right-8">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'group relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border border-border/80 bg-background/80 backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg',
        )}
        aria-label="Ask Assistant"
      >
        {/* Top Edge Specular Highlight - Stronger Contrast */}
        <div className="absolute inset-0 rounded-full border-t border-white/50 dark:border-white/30 pointer-events-none"></div>
        
        {/* Subtle Surface Shine Gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-60 pointer-events-none"></div>

        {/* Main button content - Enlarged Icon */}
        <div className="relative z-10 transition-transform duration-500 group-hover:rotate-12">
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7 text-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
        </div>

        {/* Tooltip - Matching Glass Style */}
        <div
          className={`absolute bottom-full right-0 mb-4 transform transition-all duration-300 ease-out ${
            isHovered
              ? 'translate-y-0 opacity-100'
              : 'translate-y-2 opacity-0 pointer-events-none'
          }`}
        >
          <div className="relative">
            <div 
              className="whitespace-nowrap rounded-xl border border-white/20 bg-white/10 dark:border-white/10 dark:bg-black/40 px-4 py-2 text-xs font-bold text-foreground shadow-2xl"
              style={{
                backdropFilter: 'blur(8px) saturate(150%)',
                WebkitBackdropFilter: 'blur(8px) saturate(150%)',
              }}
            >
              Ask Assistant
            </div>
            {/* Tooltip arrow */}
            <div className="absolute left-1/2 top-full -translate-x-1/2 transform">
              <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-white/20"></div>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
