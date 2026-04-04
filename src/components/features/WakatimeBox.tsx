'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import type { IconType } from 'react-icons/lib'
import {
  SiAstro,
  SiC,
  SiCodecrafters,
  SiCplusplus,
  SiCss3,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiLatex,
  SiMarkdown,
  SiMdx,
  SiPython,
  SiScala,
  SiTypescript,
  SiYaml,
} from 'react-icons/si'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { motion } from 'framer-motion'
import {
  getCachedData,
  setCachedData,
  CACHE_TTL,
  CACHE_KEYS,
} from '@/lib/cache'

const languageIcons: { [key: string]: IconType } = {
  astro: SiAstro,
  html: SiHtml5,
  css: SiCss3,
  javascript: SiJavascript,
  python: SiPython,
  c: SiC,
  'c++': SiCplusplus,
  typescript: SiTypescript,
  markdown: SiMarkdown,
  mdx: SiMdx,
  json: SiJson,
  yaml: SiYaml,
  tex: SiLatex,
  scala: SiScala,
  other: SiCodecrafters,
}

const getLanguageIcon = (language: string): JSX.Element | null => {
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

const chartConfig: ChartConfig = {
  hours: {
    label: 'Hours',
    color: 'hsl(var(--primary))',
  },
  label: {
    color: 'hsl(var(--primary))',
  },
  ...colors.reduce(
    (acc, color, index) => ({
      ...acc,
      [`language${index}`]: { label: `Language ${index + 1}`, color },
    }),
    {},
  ),
}

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

  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const icon = getLanguageIcon(payload.value.toLowerCase())
    return (
      <g transform={`translate(${x},${y})`}>
        <title>{payload.value}</title>
        <circle cx="-18" cy="0" r="14" fill="var(--primary)" />
        <foreignObject width={16} height={16} x={-26} y={-8}>
          {icon ? (
            React.cloneElement(icon, { size: 16, color: 'var(--primary)' })
          ) : (
            <text
              x={8}
              y={12}
              fill="hsl(var(--primary))"
              fontSize="12"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {payload.value.charAt(0).toUpperCase()}
            </text>
          )}
        </foreignObject>
      </g>
    )
  }

  if (isLoading)
    return (
      <div className="size-full rounded-3xl p-4">
        <div className="space-y-1.5">
          {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map((id, index) => (
            <div key={id} className="flex items-center gap-x-2">
              <div className="h-6 w-6 animate-pulse rounded-full bg-primary/10" />
              <div className="flex-1">
                <div
                  className="h-6 animate-pulse rounded-md bg-primary/10"
                  style={{ width: `${90 * 0.8 ** index}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )

  if (error) return <div>Error: {error}</div>

  return (
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ChartContainer config={chartConfig} className="h-full w-full p-4">
        <BarChart
          accessibilityLayer
          data={languages}
          layout="vertical"
          margin={{ left: -10, right: 35 }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            width={50}
            tick={<CustomYAxisTick />}
          />
          <XAxis type="number" hide />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar
            dataKey="hours"
            fill="var(--color-hours)"
            radius={[8, 8, 8, 8]}
            isAnimationActive={true}
          >
            <LabelList
              dataKey="hours"
              position="right"
              formatter={(value: number) => `${Math.round(value)}h`}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </motion.div>
  )
}

export default WakatimeBox
