# Stasiosdesign

The source of <https://www.stasiosdesign.com/>, built with [Astro](https://astro.build). It began
life as a Webflow export; the design, content, interactions and URLs are the live site's, and the
code underneath is now a native Astro project.

```
src/
  pages/            one .astro file per URL: index, work, lets-talk, about, the case studies, 404
  layouts/Layout.astro   <head>, fonts, global CSS, the persistent shell, the Barba container, the client script
  components/       TabletNav, SideMenu, GlobalElements (loader + cursor labels), Footer
  styles/           normalize.css, webflow.css, site.css - the site's stylesheet, unchanged
  scripts/          the client code, as ES modules (see "How a page comes to life")
  data/webflow-interactions.json   the site's Webflow interactions (IX2), as exported
  vendor/webflow-runtime.js        Webflow's runtime (IX2 engine, Lottie, links, forms)
  lib/current-page.ts   the route helper the nav components use to mark the current page
public/
  assets/ documents/    assets/{images,logos,icons,graphics}, served as-is at /assets/...; documents/ holds the loader animation
  robots.txt
astro.config.mjs    file-based output (/work -> work.html), no trailing slashes, sitemap
vercel.json         clean URLs and the two /index redirects
```

## Working on it

Requires Node 22.12 or newer.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
```

Push to GitHub and Vercel builds it. Vercel detects Astro from `package.json` (build command
`astro build`, output `dist`), and `vercel.json` keeps the clean URLs the site has always used.
Two branches, two deployments, both fully static:

|            | URL                                                          | From      | Built from the dataset |
| ---------- | ------------------------------------------------------------ | --------- | ---------------------- |
| Production | https://stasiosdesign.vercel.app                             | `main`    | `production`           |
| Staging    | https://stasiosdesign-git-staging-stasiosdesign.vercel.app   | `staging` | `staging`              |

Which is which comes from Vercel itself (`VERCEL_ENV`, read in `astro.config.mjs`), never
from a hostname. Staging is never indexed (`noindex` on every page) and sits behind Vercel
Authentication. Work locally, push to `staging` for an online preview, and promote to
production with `git switch main`, `git merge --ff-only staging`, `git push`.

### The contact form

`src/scripts/features/forms.js` handles the Let's Talk form. Set `PUBLIC_FORM_ENDPOINT` (see
`.env.example`; in production, in the Vercel project's environment variables) to any backend that
accepts a POST - Formspree, Basin, Formcarry, Getform, your own handler. Left unset, the form opens
the visitor's email client with the answers prefilled and addressed to `stas@stasiosdesign.com`.
The success and error states are the ones Webflow showed.

### Fonts

The display faces (`urbane`, `mixta-pro`) come from the Adobe Fonts kit
`https://use.typekit.net/vhm2hbv.js`, which serves them per domain: the production domain must be
listed in that web project. Montserrat comes from Google Fonts through the WebFont loader, which
also hides the page (`wf-loading`) until the faces are in.

## How a page comes to life

Navigation is AJAX-based via Barba.js: `<body>` is the wrapper and each page's container
(`.body-container`, or `.body-container-contact` on Let's Talk) is swapped in with Osmo's
overlapping parallax transition. Everything outside the container - the tablet nav, the side menu,
the loader, the cursor labels - is created once and lives for the whole visit.

`src/scripts/app.js` owns the lifecycle; every page goes through the same phases whether it was
loaded directly, reached through a link, or reached with the browser's back/forward buttons:

| Phase | When | What happens |
| --- | --- | --- |
| **boot** | once per document | Lenis, the shell features (side menu, scroll lock, magnetic cursor), Barba. |
| **mount** | the container is in the DOM, possibly still off-screen | the page's shell state is applied (body class, cursor labels, current links), Webflow's interactions are started for this page, and every feature's `mount()` runs inside a GSAP context. |
| **ready** | the container is in normal flow at the top of the viewport | work that needs real layout runs (ScrollTriggers), then Webflow's page-load interactions fire. |
| **unmount** | the container has left the document | feature cleanups run and the GSAP context is killed, which takes every tween and ScrollTrigger the page created with it. |

The site's behaviours are **features** in `src/scripts/features/` with a `mount(container, page)`
contract: they only look inside the container they are given, register layout-dependent work with
`page.onReady()`, and return a cleanup function for anything that is not GSAP. Shell features
mount once and expose `pageWillChange()` to put the shell back to rest before a swap.

`src/scripts/webflow.js` treats Webflow as a component with two halves. The runtime
(`src/vendor/webflow-runtime.js`) is vendor code that binds delegated handlers once at DOM ready.
Its interaction engine, IX2, is page-scoped - element targets are `<pageId>|<elementId>`, resolved
against `<html data-wf-page>` - so every mount sets that attribute and re-initialises IX2 from the
exported data, exactly what Webflow's own runtime did at the end of a full page load. The
per-page pre-states IX2 needs before it starts are the `<style is:global>` block at the bottom of
each page.

`src/scripts/transition.js` knows nothing of the above: it pins, swaps and unpins containers and
plays the first-load loader (the Lottie wipe).

## Things to know

- The libraries are pinned to the versions the site was built against: GSAP 3.12.2, Lenis 1.0.33
  (`@studio-freight/lenis`), SplitType 0.3.4, Barba 2.10.3, jQuery 3.5.1 (for the Webflow
  runtime), WebFont loader 1.6.26.
- `about`, `hawkstone-developments` and `mikhail-riches-copy` are published but unlinked, as on
  the live site. `about` is a "Page coming soon" placeholder, which is why the menu's About item
  points at `/work`; the other two are duplicates of the CSJ Architects and Mikhail Riches case
  studies. `mikhail-riches-copy.astro` renders `mikhail-riches.astro` under its own Webflow page
  id rather than duplicating the markup.
- The home page's `og:title` is still the Webflow template's ("Business - Webflow HTML website
  template"). It is content, so it was left for you to change in `src/pages/index.astro`.
- The 404 page renders blank, as the live one does.

## The Studio (`studio/`)

A Sanity Studio for the site's content, hosted at https://stasiosdesign.sanity.studio (project `9k36yeeg`, dataset
`staging`), built on the shared CMS package `@stasiosdesign/sanity-cms`
(private, GitHub Packages; the `sanity-cms` repository). It models the
site's pages (Home, Work, Let's Talk, About) and its case studies.

### How the site reads it (`src/cms/`)

- **Build time.** Each page reads its document from the deployment's dataset
  (`src/cms/content.ts`): `production` on `main`, `staging` on the `staging`
  branch. Every bound element keeps its own words as a fallback
  (`src/cms/defaults.ts`, the exact text the pages had), so an empty or missing
  field changes nothing. The site stays fully static.
- **Visual editor.** In the Studio's iframe only, `Layout.astro` loads
  `src/cms/live-preview.ts`. The hosted Studio shows the staging site; the
  script reads the `staging` drafts through the Studio's own login (live
  mode, no token in the browser) and writes them into the elements marked
  `data-page-doc` / `data-page-field`, with click-to-edit overlays. Staging
  sits behind Vercel Authentication: the Studio gets through with the
  *Protection Bypass for Automation* secret saved in its Vercel Protection
  Bypass tool (`/vercel-protection-bypass`).
- **Publishing.** The Studio's publishing control calls `api/publish.ts`, a
  Vercel Function on the production deployment. **Publish to Staging**
  publishes the document in `staging` and calls the `staging` branch's deploy
  hook, so the static staging site is rebuilt; **Publish Live…** (after a
  confirmation) also copies it to `production` and calls the `main` deploy
  hook. The Studio watches `/build.json` (the build stamp) to tell when the
  live rebuild is done. The route needs three Production environment
  variables in Vercel: `SANITY_API_WRITE_TOKEN` (a Sanity token with the
  Editor role), `VERCEL_DEPLOY_HOOK_URL` (the `main` hook) and
  `VERCEL_STAGING_DEPLOY_HOOK_URL` (the `staging` hook).
- `npm run check` type-checks `src/cms/` and `api/`.

It is also where the shared CMS is developed: `npm run dev` in `studio/`
(http://localhost:3334) runs the package's local source from
`../shared-sanity-cms`, so CMS changes show immediately; `npm run dev:released`
runs the installed release. See CLAUDE.md, "The CMS".

First time on a machine: give npm read access to GitHub Packages (see the
sanity-cms README, "Access"), then `npm install` in `studio/`.
