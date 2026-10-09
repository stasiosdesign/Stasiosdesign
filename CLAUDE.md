# Stasios Design Website: instructions for Claude

stasiosdesign.com, the user's own company site. Astro 7, migrated from a Webflow export. Universal rules (naming, assets, git, safety): the workspace `CLAUDE.md`.
GitHub: `stasiosdesign/Stasiosdesign` (`main` deploys via Vercel; do not push unless asked). The README documents the architecture (Barba page lifecycle, Webflow runtime, features): read it before touching scripts.

## Commands

`npm run dev` (4321), `npm run build`, `npm run preview`. Needs Node 22.12+. There is no type-check script.

## Layout

- `src/pages/` one `.astro` per URL; `src/layouts/Layout.astro` the shell; `src/components/`, `src/styles/`, `src/scripts/` (`app.js` owns the lifecycle; behaviours are modules in `scripts/features/`).
- `src/vendor/webflow-runtime.js`, `src/data/webflow-interactions.json`: Webflow's runtime and exported interactions. Vendor/exported: do not hand-edit.
- Libraries are pinned to the versions the site was built against (GSAP 3.12.2, Lenis 1.0.33, jQuery 3.5.1...). Do not upgrade casually.

## Assets

- **Library: `public/assets/`**, served at `/assets/...`: `images/` (mockups, sketches, case-study imagery; Webflow's duplicate-looking `Name_1Name.avif` pairs are different renditions that pages reference, keep both), `logos/` (the Stasios mark), `icons/` (UI/social icons, `favicon.png`, `webclip.png`), `graphics/` (decorative SVGs). Reference them with absolute `/assets/...` paths; CSS in `src/styles/site.css` does too.
- **Exception:** `public/documents/Black-Wave-.json` (the loader's Lottie animation) stays in `documents/`.
- **New files: `source-assets/`** (git-ignored). Workspace rules describe what to do with them. Existing file names are kept (pages reference them); new ones follow the naming rule.
- After moving or renaming assets, build and confirm every referenced file exists in `dist/`.

## Deployment and environment

`vercel.json` provides clean URLs and the `/index` redirects. `PUBLIC_FORM_ENDPOINT` (contact form) lives in Vercel env vars and a git-ignored `.env`. Fonts come from an Adobe Fonts kit tied to the production domain.

## Future Sanity (not installed)

Planned. When added: `studio/` at this project's root, same pattern as `tomrow-studios/tomrow-website`. Do not add it unless asked.
