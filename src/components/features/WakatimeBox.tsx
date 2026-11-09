'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import type { IconType } from 'react-icons/lib'
import {
  SiAstro,
  SiC,
  SiCodecrafters,
  SiCplusplus,
  SiCss,
  SiDart,
  SiDocker,
  SiElixir,
  SiFlutter,
  SiGit,
  SiGnubash,
  SiGo,
  SiGraphql,
  SiHaskell,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiKotlin,
  SiLatex,
  SiLua,
  SiMarkdown,
  SiMdx,
  SiOcaml,
  SiPhp,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiR,
  SiRuby,
  SiRust,
  SiScala,
  SiSwift,
  SiTypescript,
  SiVuedotjs,
  SiYaml,
  SiZig,
} from 'react-icons/si'
import { FaJava } from 'react-icons/fa'
import { TbBrandCSharp, TbSql } from 'react-icons/tb'
import {
  getCachedData,
  setCachedData,
  CACHE_TTL,
  CACHE_KEYS,
} from '@/lib/cache'

const languageIcons: { [key: string]: IconType } = {
  // Web & Core
  typescript: SiTypescript,
  javascript: SiJavascript,
  astro: SiAstro,
  html: SiHtml5,
  css: SiCss,
  'vue.js': SiVuedotjs,
  vue: SiVuedotjs,

  // Systems & Native
  rust: SiRust,
  go: SiGo,
  golang: SiGo,
  c: SiC,
  'c++': SiCplusplus,
  'c#': TbBrandCSharp as IconType,
  csharp: TbBrandCSharp as IconType,
  'c-sharp': TbBrandCSharp as IconType,
  zig: SiZig,

  // JVM & Mobile
  java: FaJava as IconType,
  kotlin: SiKotlin,
  scala: SiScala,
  dart: SiDart,
  flutter: SiFlutter,
  swift: SiSwift,

  // Scripting & Backend
  python: SiPython,
  ruby: SiRuby,
  php: SiPhp,
  lua: SiLua,
  bash: SiGnubash,
  sh: SiGnubash,
  shell: SiGnubash,
  zsh: SiGnubash,

  // Functional & Scientific
  ocaml: SiOcaml,
  elixir: SiElixir,
  haskell: SiHaskell,
  r: SiR,

  // Data, Query, & Infra
  sql: TbSql as IconType,
  postgresql: SiPostgresql,
  docker: SiDocker,
  dockerfile: SiDocker,
  prisma: SiPrisma,
  graphql: SiGraphql,
  git: SiGit,
  'git config': SiGit,

  // Docs, Markup & Config
  markdown: SiMarkdown,
  mdx: SiMdx,
  json: SiJson,
  yaml: SiYaml,
  tex: SiLatex,
  other: SiCodecrafters,
}

const getLanguageIcon = (language: string): React.JSX.Element | null => {
  const Icon = languageIcons[language]
  return Icon ? <Icon /> : null
}

interface Language {
  name: string
  hours: number
  fill: string
}

interface Props {
  omitLanguages?: string[]
}

const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
]

const WakatimeBox = ({ omitLanguages = [] }: Props) => {
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check cache first for faster loading
    const cached = getCachedData<Language[]>(CACHE_KEYS.WAKATIME)
    if (cached) {
      setLanguages(cached)
      setIsLoading(false)
      return
    }

    // Fetch fresh data if cache miss
    fetch(
      'https://wakatime.com/share/@raihanpka/5313bb35-0b69-4080-9b36-87d958bf7730.json',
    )
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch data')
        return response.json()
      })
      .then((data) => {
        const filteredLanguages = data.data
          .filter(
            (lang: { name: string }) => !omitLanguages.includes(lang.name),
          )
          .slice(0, 4)
          .map((lang: { name: string; hours: number }, index: number) => ({
            name: lang.name,
            hours: Number(lang.hours.toFixed(2)),
            fill: colors[index % colors.length],
          }))

        // Cache the result for faster subsequent loads
        setCachedData(CACHE_KEYS.WAKATIME, filteredLanguages, CACHE_TTL.WAKATIME)
        setLanguages(filteredLanguages)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setIsLoading(false)
      })
  }, [])

  if (isLoading)
    return (
      // Mirrors the real chart: p-4 content box split into four equal bands, a 22px icon slot, and bars
      // at 80% of the band. The spacer on the right keeps room for the value label.
      <div className="size-full p-4">
        <div className="grid h-full grid-rows-4">
          {['100%', '72%', '45%', '30%'].map((width) => (
            <div key={width} className="flex">
              <div className="flex w-10 shrink-0 items-center pl-1">
                <div className="size-[22px] animate-pulse rounded-full bg-primary/10" />
              </div>
              <div className="flex min-w-0 flex-1 items-center">
                <div className="h-4/5 animate-pulse rounded-md bg-primary/10" style={{ width }} />
              </div>
              {/* Room for the value label that follows each real bar. */}
              <div className="w-[43px] shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )

  if (error) return <div>Error: {error}</div>

  // Plain bars: a row per language with its icon, a bar scaled to the largest value, and the hours.
  const max = Math.max(...languages.map((l) => l.hours), 1)
  return (
    <div className="flex h-full w-full flex-col justify-around p-4" role="list" aria-label="Coding hours by language">
      {languages.map((lang) => {
        const icon = getLanguageIcon(lang.name.toLowerCase())
        return (
          <div key={lang.name} role="listitem" className="flex items-center gap-2" title={`${lang.name}: ${Math.round(lang.hours)}h`}>
            <span className="flex size-[22px] shrink-0 items-center justify-center text-foreground" aria-hidden="true">
              {icon ? React.cloneElement(icon, { size: 22 }) : <span className="font-mono text-xs font-bold">{lang.name.charAt(0).toUpperCase()}</span>}
            </span>
            <div className="h-4 min-w-0 flex-1">
              <div className="h-full rounded-md bg-primary transition-[width] duration-500" style={{ width: `${(lang.hours / max) * 100}%` }} />
            </div>
            <span className="w-10 shrink-0 text-right text-xs text-foreground">{Math.round(lang.hours)}h</span>
          </div>
        )
      })}
    </div>
  )
}

export default WakatimeBox
