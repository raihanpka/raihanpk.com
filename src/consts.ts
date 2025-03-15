export type Site = {
  TITLE: string
  DESCRIPTION: string
  EMAIL: string
  NUM_POSTS_ON_HOMEPAGE: number
  POSTS_PER_PAGE: number
  SITEURL: string
}

export type Link = {
  href: string
  label: string
}

export const SITE: Site = {
  TITLE: 'pk.',
  DESCRIPTION:
    'pk is his nickname. raihanpk.com is his digital home.',
  EMAIL: 'me@raihanpk.com',
  NUM_POSTS_ON_HOMEPAGE: 2,
  POSTS_PER_PAGE: 3,
  SITEURL: 'https://raihanpk.com',
}

export const NAV_LINKS: Link[] = [
  { href: '/blog', label: 'blog' },
  { href: '/authors', label: 'authors' },
  { href: '/about', label: 'about' },
  { href: 'https://gallery.raihanpk.com', label: 'gallery' },
]

export const SOCIAL_LINKS: Link[] = [
  { href: 'https://linkedin.com/in/raihanpk', label: 'LinkedIn' },
  { href: 'https://instagram.com/raihanpka', label: 'Instagram' },
  { href: 'me@raihanpk.com', label: 'Email' },
  { href: './rss.xml', label: 'RSS' },
]
