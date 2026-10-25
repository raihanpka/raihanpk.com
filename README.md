<div align="center">

<img src="./public/static/profile/twitter-card.png" alt="raihanpk.com" width="900">
<br><br>

# @raihanpka's website

[Website](https://raihanpk.com) &nbsp;&middot;&nbsp; [LinkedIn](https://linkedin.com/in/raihanpk) &nbsp;&middot;&nbsp; [Instagram](https://instagram.com/raihanpka)

![astro](https://img.shields.io/static/v1?logo=astro&label=&message=astro&color=36465D&logoColor=AAA&style=flat-square)
![react](https://img.shields.io/static/v1?logo=react&label=&message=react&color=36465D&logoColor=AAA&style=flat-square)
![typescript](https://img.shields.io/static/v1?logo=typescript&label=&message=typescript&color=36465D&logoColor=AAA&style=flat-square)
![tailwind](https://img.shields.io/static/v1?logo=tailwindcss&label=&message=tailwind&color=36465D&logoColor=AAA&style=flat-square)
![prisma](https://img.shields.io/static/v1?logo=prisma&label=&message=prisma&color=36465D&logoColor=AAA&style=flat-square)
![vercel](https://img.shields.io/static/v1?logo=vercel&label=&message=vercel&color=36465D&logoColor=AAA&style=flat-square)

</div>

### about this repo

Source code for [raihanpk.com](https://raihanpk.com) built with Astro. This website showcases a portfolio, blog, AI chatbot assistant, and interactive widgets such as live Spotify presence, Wakatime coding analytics, and an interactive project showcase.

Additional features developed from built-in features of the public template [Astro Erudite](https://github.com/jktrn/astro-erudite) by [jktrn](https://github.com/jktrn):

- **AI Chatbot**: Personal conversational assistant answering questions using Retrieval-Augmented Generation (RAG) with [Pinecone Vector DB](https://pinecone.io), [Google Gemini / OpenAI](https://ai-sdk.dev), and [Vercel AI SDK](https://sdk.vercel.ai).
- **Spotify Status**: Real-time live presence displaying currently playing and recently scrobbled tracks using [Spotify](https://spotify.com) and [Last.fm](https://last.fm) APIs with SWR caching.
- **Wakatime Analytics**: Weekly coding time breakdown across languages directly from the [Wakatime API](https://wakatime.com) with dynamic dark/light mode icons.
- **Projects Showcase**: Interactive portfolio grid featuring smooth media video previews, modal dialogs, and responsive category filtering.
- **Tech Stack Slider**: 3D-sculpted marquee slider displaying programming languages, frameworks, and cloud infrastructure tools.
- **Blog & View Counter**: MDX content collections with live view counter persistence backed by [PostgreSQL](https://postgresql.org) and [Prisma Accelerate](https://www.prisma.io/accelerate).
- **GitHub Contributions**: Contribution graph that adapts its number of weeks to the card width, with a keyboard-friendly tooltip. Data is loaded at build time from the GitHub GraphQL API when `GITHUB_TOKEN` is set, with a public-page fallback.
- **Profile Card**: Flip card with a dithered baby's breath band and a chat entry on the back.
- **About Page**: Bento cards and a hover scene built from the logo. All the copy for Home and About lives as fields in `src/content/authors/raihanpk.md`.
- **Details**: Hand-drawn signature that writes on at each full page load, soft click sounds with a mute toggle, and link tooltips that follow the pointer.
- **Design System**: Tokens for spacing, type, radius, and shadow in `src/styles/global.css`, documented in [`docs/design-system.md`](./docs/design-system.md) and enforced by `bun run check:tokens`.
- **High Performance**: Tuned for Core Web Vitals (Lighthouse desktop on Home: 98 Performance, 100 Accessibility, 100 Best Practices, 100 SEO) with font preloading, WebP assets, deferred islands and media, and build-time avatar optimization. The report is in [`public/scratch`](./public/scratch).

<div align="center">
  <img src="./public/scratch/lighthouse.png" alt="Lighthouse desktop score on Home: Performance 98, Accessibility 100, Best Practices 100, SEO 100" width="850">
</div>

---

### getting started

This project uses [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Useful scripts: `bun run build` (type check and build), `bun run check:tokens` (design token lint), `bun test`, and `bun run index-knowledge` (rebuild the chatbot index).

Environment variables go in `.env`. Names only, never commit values: `DATABASE_URL`, `GITHUB_TOKEN` (optional, read-only), `PINECONE_API_KEY`, `PINECONE_INDEX`, `PINECONE_NAMESPACE`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENAI_API_KEY`, `RATE_LIMIT_SECRET`.

---

### tech stack

- **Framework & Core**: [Astro](https://astro.build), [React](https://react.dev), [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com), [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css)
- **Database & ORM**: [PostgreSQL](https://postgresql.org), [Prisma ORM](https://prisma.io) with [Prisma Accelerate](https://www.prisma.io/accelerate)
- **Vector & AI**: [Pinecone](https://pinecone.io), [Vercel AI SDK](https://sdk.vercel.ai), [Google Generative AI](https://ai.google.dev), [OpenAI](https://openai.com)
- **UI Components & Animation**: [Radix UI](https://www.radix-ui.com), [Lucide Icons](https://lucide.dev), [React Icons](https://react-icons.github.io/react-icons), [Motion](https://motion.dev), [Recharts](https://recharts.org), [@devnomic/marquee](https://github.com/devnomic/marquee)
- **Deployment**: [Vercel](https://vercel.com)

<div align="center">
<sub>Copyright &copy; 2026 Raihan Putra Kirana. All rights reserved.</sub>
</div>
