# Stasios Design Website: instructions for Claude

stasiosdesign.com, the user's own company site. Astro 7, migrated from a Webflow export. Client folder: `stasiosdesign/`. Universal rules: the parent `CLAUDE.md`.
GitHub repo: `stasiosdesign/Stasiosdesign` (`main` deploys via Vercel). The README documents the architecture (Barba page lifecycle, Webflow runtime, features): read it before touching scripts.

## Commands

`npm run dev` (4321), `npm run build`, `npm run preview`, `npm run check`. Needs Node 22.12+.

## Layout

- `src/pages/`: one `.astro` per URL. `src/layouts/Layout.astro`: head, fonts, shell, Barba container. `src/components/`, `src/styles/`, `src/scripts/` (`app.js` owns the lifecycle; behaviours are features in `scripts/features/`).
- `src/vendor/webflow-runtime.js` and `src/data/webflow-interactions.json`: Webflow's runtime and exported interactions. Vendor/exported: do not edit by hand.
- `public/images/` (110 files) and `public/documents/`: served as-is at `/images/...`. Keep existing names: pages reference them.
- Libraries are deliberately pinned to the versions the site was built against (GSAP 3.12.2, Lenis 1.0.33, jQuery 3.5.1...). Do not upgrade them casually.
- `assets/{inbox,originals,references}/`: the user's drop zone (see `assets/README.md`).

## Deployment and environment

Vercel builds from GitHub; `vercel.json` provides clean URLs and the `/index` redirects. `PUBLIC_FORM_ENDPOINT` (contact form) lives in Vercel's environment variables and a git-ignored `.env`. Fonts come from an Adobe Fonts kit tied to the production domain.
Do not push without being asked.

## Future Sanity CMS (not installed)

Planned, not started. When added: `studio/` at this project's root with its own `package.json`, same pattern as `tomrow-studios/tomrow-website`. Do not add it unless asked.
