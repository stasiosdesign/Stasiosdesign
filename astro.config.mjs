// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/* One codebase, built two ways, both fully static. Which one comes from
   Vercel (VERCEL_ENV), never from a hostname, so a custom domain changes
   nothing here:

   production   `main` on Vercel, and `npm run build` on your machine: built
                from the production dataset, the one only Publish Live writes.
   staging      every other Vercel deployment, the `staging` branch above all:
                built from the staging dataset, the one the Studio edits and
                Publish Staging writes; never indexed (Layout.astro).
   (`npm run dev` is staging's behaviour, on your machine.) */
const { VERCEL_ENV, NODE_ENV } = process.env;
const deployment =
  VERCEL_ENV === 'production' ? 'production'
  : VERCEL_ENV === 'preview' ? 'staging'
  : VERCEL_ENV === 'development' || NODE_ENV === 'development' ? 'development'
  : 'production';

// A build stamp, dist/build.json, saying when the site was built. The Studio's
// publishing progress reads it (vercel.json lets it, across origins) to tell
// when a live publish has reached the site: the rebuild api/publish.ts asks for.
/** @returns {import('astro').AstroIntegration} */
const buildStamp = () => ({
  name: 'stasiosdesign:build-stamp',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const { writeFile } = await import('node:fs/promises');
      const stamp = { builtAt: new Date().toISOString(), deployment };
      await writeFile(new URL('build.json', dir), JSON.stringify(stamp));
    },
  },
});

export default defineConfig({
  site: 'https://www.stasiosdesign.com',

  // The site has always lived at extensionless URLs (/work, /lets-talk). Emitting
  // `work.html` and never a trailing slash keeps them identical on Vercel, whose
  // `cleanUrls` setting in vercel.json maps /work to work.html.
  trailingSlash: 'never',
  build: { format: 'file' },

  // The markup is rendered verbatim; whitespace between inline elements is part
  // of the layout, so it is not collapsed.
  compressHTML: false,

  integrations: [
    sitemap({ filter: (page) => !page.endsWith('/404') }),
    buildStamp(),
  ],

  vite: {
    // The deployment, fixed at build time (src/cms/env.d.ts): which dataset
    // the build reads (src/cms/client.ts), and staging's noindex (Layout.astro)
    define: { __DEPLOYMENT__: JSON.stringify(deployment) },
    // The Sanity Studio in studio/ is its own app: its rebuilds while it runs
    // beside the site must not reload the site's dev server (development only).
    server: { watch: { ignored: ['**/studio/**'] } },
  },
});
