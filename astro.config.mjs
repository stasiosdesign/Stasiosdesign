// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
  ],

  // The Sanity Studio in studio/ is its own app: its rebuilds while it runs
  // beside the site must not reload the site's dev server (development only).
  vite: { server: { watch: { ignored: ['**/studio/**'] } } },
});
