'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

import { type IconType } from 'react-icons/lib'
import {
  SiAstro,
  SiC,
  SiCplusplus,
  SiCss3,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiLatex,
  SiMarkdown,
  SiMdx,
  SiPython,
  SiTypescript,
  SiYaml,
  SiScala,
  SiCodecrafters,
} from 'react-icons/si'

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
    fetch(
      'https://wakatime.com/share/@raihanpk/5313bb35-0b69-4080-9b36-87d958bf7730.json',
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
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center gap-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1">
                <Skeleton
                  className="h-6 rounded-md"
                  style={{ width: `${90 * Math.pow(0.8, index)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  if (error) return <div>Error: {error}</div>

  return (
    <ChartContainer config={chartConfig} className="h-full w-full p-4">
      <BarChart
        accessibilityLayer
        data={languages}
        layout="vertical"
        margin={{ left: -10, right: 10 }}
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
  )
}

export default WakatimeBox