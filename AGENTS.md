# AGENTS.md

Personal site for raihanpk. Astro (static output, Vercel adapter) with React islands, Tailwind v4, Bun.

## Start here

- Tokens and UI rules: `docs/design-system.md`
- Open work: `tasks/todo.md` (plan in `tasks/plan.md`)
- Setup and env var names: `README.md`

## Commands

- `bun install`, `bun run dev`
- `bun run check:tokens`: fails on forbidden classes
- `bun run check`: type check
- `bun test`
- `bun run build`: check, then build

## Editing UI

- Use only tokens from `docs/design-system.md`. Add a missing token there and in `src/styles/global.css` first.
- No raw hex, `px`/`rem`, or `clamp()` in components, except the rare one-off with `token-ok` and a reason.
- Titles outside blog use `font-title`. Blog stays sans.
- Keep layout and sizes stable. Do not change dimensions, fonts, or spacing for performance alone.

## New page

- Add it under `src/pages/` and wrap it in `Layout.astro` with `title` and `description`.
- Use existing components and tokens. Do not add a new dependency for something CSS or the platform does.
- Check at 320, 768, and 1440 px.

## Performance

- Islands: `client:visible` or `client:idle` for anything below the fold. `client:load` only if needed on first paint.
- Images: WebP, explicit width and height, lazy unless above the fold.
- Measure before and after: build, serve `dist/client` with gzip, then run Lighthouse. Mobile and desktop.
- Data that must stay fresh is fetched at runtime (see `GithubGraph.tsx` and `/api/contributions`), not baked at build.

## Done means

- `bun run check:tokens`, `bun run check`, and `bun test` pass.
- Visual check on the pages you touched. No layout shift.
- Update `docs/design-system.md` if a token changed, `README.md` if a claim changed, and `tasks/todo.md` for finished tasks.
- Update `public/scratch/lighthouse.png` when the desktop scores change.

## Git

- One-line commit subject, no body (the dotagent hook rejects bodies).
- Conventional type prefixes: `feat`, `fix`, `style`, `docs`, `chore`.
- Never commit values from `.env`.
