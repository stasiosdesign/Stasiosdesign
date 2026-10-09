# stasiosdesign.com: instructions for Claude

The stasiosdesign.com website (Astro, repository root, deployed by Vercel
from `main`) and its Sanity Studio (`studio/`). README.md explains the site.

This repository is also **the development environment for the shared CMS**:
its Studio runs the shared package's local source, so CMS changes are made
and previewed from here.

## The CMS: three repositories, side by side

```
3 - Claude/
  sanity-cms/      @stasiosdesign/sanity-cms: the shared CMS (every Studio's layout,
                   navigation, editors, publishing UI, design). Its own CLAUDE.md.
  Stasiosdesign/   this repository: this site and its Studio (studio/)
  Tomrowstudios/   Tomrow Studios: a client site and its Studio, on a released version
```

| Kind of change | Where |
| --- | --- |
| How every Studio looks or works: navigation, layout, the Content tool, the Visual editor's controls, editors, form components, publishing UI and logic, the theme, new general features | `../sanity-cms/src/` |
| This site's content model: pages, sections, fields, collections, references | `studio/schemaTypes/` |
| This site's Studio setup: pages and collections listed, routes, brand, Visual editor locations, publishing | `studio/project.ts` |
| A bespoke editor only this site needs | `studio/components/`, used from its schema |
| A reusable editor (a map editor any site could use) | the component in `../sanity-cms/src/` (exported from its `index.ts`); its use and data model here |
| Tomrow Studios' content or setup | `../Tomrowstudios/studio/` (its own CLAUDE.md) |

Shared code never names a site or its types; if it needs to know something
new about a site, it gets a typed option in `../sanity-cms/src/config.ts`
that this site's `project.ts` sets.

## Developing the shared CMS here

- `npm run dev` in `studio/` (port 3334; the launch config "studio") runs
  this Studio on `../sanity-cms/src/` directly: edits there show at once.
  The terminal says `@stasiosdesign/sanity-cms: LOCAL source`. Without the
  sibling checkout it falls back to the installed release, with a warning.
- `npm run dev:released` (launch config "studio-released") runs the
  installed release instead, to compare.
- The site itself: `npm run dev` at the root (port 4321), which the Visual
  editor shows.
- Nothing reaches other Studios until a release. Tomrow and future clients
  stay on their pinned versions; this Studio's hosted copy too (builds and
  deploys never use the local source).
- Check shared changes in `../sanity-cms`: `npm run check` and `npm run build`.
  Commit and push them there (its `main`), with a line under `## Unreleased`
  in its CHANGELOG.md. A change to this site's own Studio is committed here.
- A change that needs both (a new shared option this site uses): make the
  shared part in `../sanity-cms`, use it here while developing; commit this
  repository's part only once a release with it exists and `studio/` depends
  on it, or `npm run check` here fails against the installed version.

## Releasing and updating

- Release only when the user asks: `npm run release -- patch|minor|major`
  in `../sanity-cms` (its README.md, "Versions"). It tags; GitHub Actions
  publishes to GitHub Packages.
- Each website then gets a Dependabot pull request bumping
  `studio/package.json` to the new version, checked by its Studio workflow.
  Merging is the user's approval; never merge or deploy one without it.
- To take a release here by hand: `npm install --save-exact
  @stasiosdesign/sanity-cms@<version>` in `studio/`, `npm run check`, commit.
- The hosted Studio (https://stasiosdesign.sanity.studio) is deployed by hand (`npm run deploy` in `studio/`),
  only from a commit whose `studio/package.json` pins a release.

## Rules

- `main` deploys the live site through Vercel. Don't push unfinished site
  changes; the Studio (`studio/`) is not part of the Vercel deployment
  (`.vercelignore`).
- The site doesn't read Sanity yet: its pages hold their own words. Wiring a
  page to Sanity changes the live site: plan it with the user first.
  Publishing is `publishing: false` until the site has a publishing route
  (see `../sanity-cms/README.md`, "What a website must provide").
- Never commit tokens. The package is private; `studio/.npmrc` names its
  registry only. Access: `../sanity-cms/README.md`, "Access".
- Sanity project `9k36yeeg`: `staging` (the Studio edits it), `production`
  (for the site, once it reads Sanity). `npm run seed` in `studio/` adds the
  site's current words to `staging` (it never overwrites).
- Sanity upgrades are deliberate and start here: `autoUpdates` is off.
