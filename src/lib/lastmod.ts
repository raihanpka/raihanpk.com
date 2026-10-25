/**
 * Last modified dates for the sitemap, taken from git so they change only when the content does.
 * On a shallow clone (some CI setups) git history is cut off and every file would look new, so there we
 * fall back to the date in a post's frontmatter and leave other pages without a date. A wrong date is worse
 * than none, because Google stops trusting lastmod once it sees dates that never match reality.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const CONTENT = 'src/content'
const PAGES = 'src/pages'

/** Source files or folders whose change means the page at `pathname` changed. */
export function sourcesFor(pathname: string): string[] {
  const path = pathname.replace(/\/+$/, '') || '/'
  const post = path.match(/^\/blog\/([^/]+)$/)
  if (path === '/') return [`${CONTENT}/authors/raihanpk.md`, `${PAGES}/index.astro`, `${CONTENT}/blog`, `${CONTENT}/projects`]
  if (path === '/about') return [`${CONTENT}/authors/raihanpk.md`, `${PAGES}/about.astro`]
  if (path === '/chat') return [`${PAGES}/chat.astro`]
  if (post && !/^\d+$/.test(post[1])) return [`${CONTENT}/blog/${post[1]}`, `${CONTENT}/blog/${post[1]}.md`, `${CONTENT}/blog/${post[1]}.mdx`]
  if (path.startsWith('/blog') || path.startsWith('/tags')) return [`${CONTENT}/blog`]
  if (path.startsWith('/authors')) return [`${CONTENT}/authors`]
  return []
}

const git = (args: string[]): string => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

let shallow: boolean | undefined
const isShallow = () => (shallow ??= git(['rev-parse', '--is-shallow-repository']) !== 'false')

/** Newest commit date across the files. Undefined when git history is not trustworthy. */
export function gitDate(files: string[]): Date | undefined {
  const present = files.filter((f) => existsSync(f))
  if (!present.length || isShallow()) return undefined
  const out = git(['log', '-1', '--format=%cI', '--', ...present])
  return out ? new Date(out) : undefined
}

/** `updated` or `date` from a post's frontmatter, for builds without full git history. */
export function frontmatterDate(files: string[]): Date | undefined {
  const file = files.find((f) => /\.mdx?$/.test(f) && existsSync(f)) ?? files.map((f) => `${f}/index.mdx`).concat(files.map((f) => `${f}/index.md`)).find((f) => existsSync(f))
  if (!file) return undefined
  const head = readFileSync(file, 'utf8').split(/^---\s*$/m)[1] ?? ''
  const value = head.match(/^updated:\s*['"]?([^'"\n]+)/m)?.[1] ?? head.match(/^date:\s*['"]?([^'"\n]+)/m)?.[1]
  const d = value ? new Date(value.trim()) : undefined
  return d && !Number.isNaN(d.valueOf()) ? d : undefined
}

export function lastmodFor(pathname: string): Date | undefined {
  const sources = sourcesFor(pathname)
  if (!sources.length) return undefined
  const fromGit = gitDate(sources)
  if (fromGit) return fromGit
  return /^\/blog\/[^/]+\/?$/.test(pathname) ? frontmatterDate(sources) : undefined
}
