import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const [theme, setThemeState] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setThemeState(isDarkMode ? 'dark' : 'light')
  }, [])

  React.useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'light' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches &&
        !document.documentElement.classList.contains('dark'))

    document.documentElement.classList.add('disable-transitions')
    document.documentElement.classList[isDark ? 'add' : 'remove']('dark')
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('opacity')

    requestAnimationFrame(() => {
      document.documentElement.classList.remove('disable-transitions')
    })
  }, [theme])

  return (
    <Button
      variant="outline"
      size="icon"
      title="Toggle theme"
      onClick={() => setThemeState(theme === 'light' ? 'dark' : 'light')}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'light' ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Sun className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -30, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Moon className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
