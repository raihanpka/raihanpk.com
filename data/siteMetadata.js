// @ts-check
/** @type {import("pliny/config").PlinyConfig } */

const siteMetadata = {
  title: 'Raihan Digital Home',
  author: 'Raihan Putra',
  fullName: 'Raihan Putra Kirana',
  headerTitle: "PK's Blog",
  description: 'Your thoughts shape your vision.',
  language: 'en-US',
  theme: 'light',
  siteUrl: 'https://raihanpk.com',
  analyticsURL: 'https://us.umami.is/share/8UkVZysZstR7MfmC/raihanpk.com',
  siteRepo: 'https://github.com/raihanpka/raihanpk.com',
  siteLogo: '/static/images/avatar.png',
  image: '/static/images/avatar.png',
  socialBanner: '/static/images/blogs/newblog.jpg',
  email: 'me@raihanpk.com',
  github: 'https://github.com/raihanpka',
  linkedin: 'https://www.linkedin.com/in/raihanpk',
  twitter: 'https://twitter.com/theycallmepeka',
  instagram: 'https://instagram.com/raihanpka',
  locale: 'id-ID',
  socialAccounts: {
    github: 'raihanpka',
    linkedin: 'raihanpk',
    twitter: 'theycallmepeka',
    instagram: 'raihanpka',
  },
  analytics: {
    // @ts-ignore
    umamiWebsiteId: 'd5f41f5f-8925-4e9a-91a1-b7226a775f8a',
  },
  newsletter: {
    provider: 'buttondown',
  },
  comments: {
    provider: 'giscus',
    giscusConfig: {
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
      mapping: 'title',
      reactions: '1',
      metadata: '0',
      theme: 'light',
      darkTheme: 'transparent_dark',
      themeURL: '',
      lang: 'en',
      inputPosition: 'top',
    },
  },
};

module.exports = siteMetadata;
