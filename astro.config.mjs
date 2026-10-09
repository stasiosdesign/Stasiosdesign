// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// A build stamp, dist/build.json, saying when the site was built. The Studio's
// publishing progress reads it (vercel.json lets it, across origins) to tell
// when a live publish has reached the site: the rebuild api/publish.ts asks for.
/** @returns {import('astro').AstroIntegration} */
const buildStamp = () => ({
  name: 'stasiosdesign:build-stamp',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const { writeFile } = await import('node:fs/promises');
      const stamp = { builtAt: new Date().toISOString(), deployment: process.env.VERCEL_ENV ?? 'local' };
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

  // The Sanity Studio in studio/ is its own app: its rebuilds while it runs
  // beside the site must not reload the site's dev server (development only).
  vite: { server: { watch: { ignored: ['**/studio/**'] } } },
});
