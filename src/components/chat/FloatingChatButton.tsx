import React, { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useTheme } from '@/lib/hooks/useTheme'
import { cn } from '@/lib/utils'

const jarvisStyles = `
  @keyframes scan {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateY(56px) rotate(180deg);
      opacity: 0;
    }
  }
  
  @keyframes jarvis-pulse {
    0%, 100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }
  
  @keyframes glow-pulse {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.6), 0 0 60px rgba(0, 0, 0, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.2);
    }
  }
`

export default function FloatingChatButton() {
  const [isHovered, setIsHovered] = useState(false)

  // Inject custom styles
  React.useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = jarvisStyles
    document.head.appendChild(styleElement)
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  const handleClick = () => {
    window.location.href = '/chat'
  }

  const { isDarkMode } = useTheme()
  return (
    <div className="fixed bottom-10 right-5 z-50 md:bottom-20 md:right-20">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'group relative flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-2xl transition-all duration-500 ease-in-out hover:scale-110 hover:shadow-white/50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-white dark:bg-white dark:text-black dark:hover:shadow-black/50 dark:focus:ring-2 dark:focus:ring-white dark:focus:ring-offset-black',
        )}
        aria-label="Open AI Chat"
        style={{
          animation: 'glow-pulse 3s ease-in-out infinite'
        }}
      >
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/30 dark:border-black/30 animate-spin" style={{
          animation: 'spin 4s linear infinite'
        }}>
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-white dark:bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-white dark:bg-black rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        {/* Middle rotating ring - opposite direction */}
        <div className="absolute inset-1 rounded-full border border-white/40 dark:border-black/40" style={{
          animation: 'spin 3s linear infinite reverse'
        }}>
          <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white dark:bg-black rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-0.5 h-0.5 bg-white dark:bg-black rounded-full"></div>
        </div>
        
        {/* Inner pulsing ring */}
        <div className="absolute inset-2 rounded-full border border-white/20 dark:border-black/20 animate-pulse"></div>
        
        {/* Scanning line effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white dark:via-black to-transparent opacity-60" style={{
            animation: 'scan 2s ease-in-out infinite'
          }}></div>
        </div>
        
        {/* Additional JARVIS-style effects */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          animation: 'spin 6s linear infinite'
        }}></div>
        
        {/* Hexagonal pattern overlay */}
        <div className="absolute inset-0 rounded-full opacity-20" style={{
          background: `radial-gradient(circle at center, 
            transparent 30%, 
            rgba(255, 255, 255, 0.1) 31%, 
            rgba(255, 255, 255, 0.1) 32%, 
            transparent 33%),
          radial-gradient(circle at center, 
            transparent 40%, 
            rgba(255, 255, 255, 0.05) 41%, 
            rgba(255, 255, 255, 0.05) 42%, 
            transparent 43%)`,
          animation: 'jarvis-pulse 2s ease-in-out infinite'
        }}></div>
        
        {/* Main button content with glow */}
        <div className="relative z-10 transition-all duration-300 group-hover:scale-110">
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7 drop-shadow-lg" style={{
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))'
          }} />
        </div>

        {/* Tooltip */}
        <div
          className={`absolute bottom-full right-0 mb-2 transform transition-all duration-200 ${
            isHovered
              ? 'translate-y-0 opacity-100'
              : 'translate-y-2 opacity-0 pointer-events-none'
          }`}
        >
          <div className="relative">
            <div className="whitespace-nowrap rounded-lg bg-black dark:bg-white px-3 py-2 text-sm text-white dark:text-black shadow-lg">
              Chat with AI
            </div>
            {/* Tooltip arrow */}
            <div className="absolute left-1/2 top-full -translate-x-1/2 transform">
              <div className="h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black dark:border-t-white"></div>
            </div>
          </div>
        </div>

        {/* Notification dot (optional - can be controlled via props) */}
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-black dark:border-white animate-pulse">
          <div className="h-full w-full rounded-full bg-red-400 animate-ping"></div>
        </div>
      </button>
    </div>
  )
}
