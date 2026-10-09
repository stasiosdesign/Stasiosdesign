# Stasios Design Website: instructions for Claude

stasiosdesign.com, the user's own company site. Astro 7, migrated from a Webflow export. Universal rules (naming, assets, git, safety): the workspace `CLAUDE.md`.
GitHub: `stasiosdesign/Stasiosdesign` (`main` deploys via Vercel; do not push unless asked). The README documents the architecture (Barba page lifecycle, Webflow runtime, features): read it before touching scripts.

This repository is also **the development environment for the shared CMS**: its Studio (`studio/`) runs the shared package's local source, so CMS changes are made and previewed from here (see "The CMS" below).

## Commands

`npm run dev` (4321), `npm run build`, `npm run preview`. Needs Node 22.12+. There is no type-check script for the site; the Studio has `npm run check` in `studio/`.

## Layout

- `src/pages/` one `.astro` per URL; `src/layouts/Layout.astro` the shell; `src/components/`, `src/styles/`, `src/scripts/` (`app.js` owns the lifecycle; behaviours are modules in `scripts/features/`).
- `src/vendor/webflow-runtime.js`, `src/data/webflow-interactions.json`: Webflow's runtime and exported interactions. Vendor/exported: do not hand-edit.
- Libraries are pinned to the versions the site was built against (GSAP 3.12.2, Lenis 1.0.33, jQuery 3.5.1...). Do not upgrade casually.
- `studio/`: the Sanity Studio, its own app with its own `package.json` (below).

## Assets

- **Library: `public/assets/`**, served at `/assets/...`: `images/` (mockups, sketches, case-study imagery; Webflow's duplicate-looking `Name_1Name.avif` pairs are different renditions that pages reference, keep both), `logos/` (the Stasios mark), `icons/` (UI/social icons, `favicon.png`, `webclip.png`), `graphics/` (decorative SVGs). Reference them with absolute `/assets/...` paths; CSS in `src/styles/site.css` does too.
- **Exception:** `public/documents/Black-Wave-.json` (the loader's Lottie animation) stays in `documents/`.
- **New files: `source-assets/`** (git-ignored). Workspace rules describe what to do with them. Existing file names are kept (pages reference them); new ones follow the naming rule.
- After moving or renaming assets, build and confirm every referenced file exists in `dist/`.

## Deployment and environment

`vercel.json` provides clean URLs and the `/index` redirects. `PUBLIC_FORM_ENDPOINT` (contact form) lives in Vercel env vars and a git-ignored `.env`; it is not set yet. Fonts come from an Adobe Fonts kit tied to the production domain. The public domain is still served by Webflow (DNS at Porkbun); the Vercel build is https://stasiosdesign.vercel.app. Moving the domain is on hold until the form has an endpoint.

## The CMS

The Studio is the shared CMS package `@stasiosdesign/sanity-cms` (private, GitHub Packages) set up for this site.

```
3 - Claude/
  1 - HQ/
    shared-sanity-cms/        @stasiosdesign/sanity-cms: the shared CMS (every Studio's layout,
                              navigation, editors, publishing UI, design). Its own CLAUDE.md.
    stasiosdesign-website/    this repository: this site and its Studio (studio/)
    stasiosdesign-dashboard/  a future project, not started
  tomrowstudios/
    tomrowstudios-website/    Tomrow Studios: a client site and Studio, on a released version
```

| Kind of change | Where |
| --- | --- |
| How every Studio looks or works: navigation, layout, the Content tool, the Visual editor's controls, editors, form components, publishing UI and logic, the theme, new general features | `../shared-sanity-cms/src/` |
| This site's content model: pages, sections, fields, collections, references | `studio/schemaTypes/` |
| This site's Studio setup: pages and collections listed, routes, brand, Visual editor locations, publishing | `studio/project.ts` |
| A bespoke editor only this site needs | `studio/components/`, used from its schema |
| A reusable editor (a map editor any site could use) | the component in `../shared-sanity-cms/src/` (exported from its `index.ts`); its use and data model here |
| Tomrow Studios' content or setup | its own repository (`../../tomrowstudios/tomrowstudios-website`, its own CLAUDE.md) |

Shared code never names a site or its types; if it needs to know something new about a site, it gets a typed option in `../shared-sanity-cms/src/config.ts` that this site's `project.ts` sets.

### Developing the shared CMS here

- `npm run dev` in `studio/` (port 3334) runs this Studio on `../shared-sanity-cms/src/` directly (`linkLocalCms` in `studio/sanity.cli.ts`): edits there show at once. The terminal says `@stasiosdesign/sanity-cms: LOCAL source`. Without that folder it falls back to the installed release, with a warning.
- `npm run dev:released` runs the installed release instead, to compare.
- On this machine Node isn't on PATH: in a Terminal tab, `$env:Path = '<Codex node bin>;C:\Windows\System32;C:\Windows;C:\Program Files\Git\cmd'; npm.cmd run dev`.
- Nothing reaches other Studios until a release. Tomrow and future clients stay on their pinned versions; this Studio's hosted copy too (builds and deploys never use the local source).
- Check shared changes in `../shared-sanity-cms`: `npm run check` and `npm run build`. Commit and push them there (its `main`), with a line under `## Unreleased` in its CHANGELOG.md. A change to this site's own Studio is committed here.
- A change that needs both (a new shared option this site uses): make the shared part in `../shared-sanity-cms`, use it here while developing; commit this repository's part only once a release with it exists and `studio/` depends on it, or `npm run check` here fails against the installed version.

### Releasing and updating

- Release only when the user asks: `npm run release -- patch|minor|major` in `../shared-sanity-cms` (its README.md, "Versions"). It tags; GitHub Actions publishes to GitHub Packages.
- Each website then gets a Dependabot pull request bumping `studio/package.json` to the new version, checked by its Studio workflow. Merging is the user's approval; never merge or deploy one without it.
- To take a release here by hand: `npm install --save-exact @stasiosdesign/sanity-cms@<version>` in `studio/`, `npm run check`, commit.
- The hosted Studio (https://stasiosdesign.sanity.studio) is deployed by hand (`npm run deploy` in `studio/`), only from a commit whose `studio/package.json` pins a release.

### Rules

- The Studio is not part of the Vercel deployment (`.vercelignore`).
- The site doesn't read Sanity yet: its pages hold their own words. Wiring a page to Sanity changes the live site: plan it with the user first. Publishing is `publishing: false` until the site has a publishing route (see `../shared-sanity-cms/README.md`, "What a website must provide").
- Never commit tokens. The package is private; `studio/.npmrc` names its registry only. Access: `../shared-sanity-cms/README.md`, "Access".
- Sanity project `9k36yeeg`: `staging` (the Studio edits it), `production` (for the site, once it reads Sanity). `npm run seed` in `studio/` adds the site's current words to `staging` (it never overwrites). The user's Sanity login is GitHub.
- Sanity upgrades are deliberate and start here: `autoUpdates` is off.
