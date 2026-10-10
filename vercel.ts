/* How Vercel builds and serves the site: vercel.json's settings, as code that
   runs at the start of each build, so a setting can depend on the deployment.
   (Vercel reads this or a vercel.json, never both.)

   The same for production and staging: the Astro build, clean URLs (Vercel
   serves dist/work.html at /work) and the two /index redirects. Production is
   `main` (VERCEL_ENV "production"); every other deployment, staging included,
   is "preview". */
import type { VercelConfig } from '@vercel/config/v1';

const staging = process.env.VERCEL_ENV === 'preview';

export const config: VercelConfig = {
  framework: 'astro',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  // Commits that change nothing the site is built from (only the Studio,
  // GitHub's workflows or these notes; a CMS release records its version on
  // both branches) don't rebuild it: the Hobby plan allows few deployments a
  // day. Exit 0 skips the build; anything else builds, including when the
  // last deployed commit can't be compared.
  ignoreCommand:
    'git diff --quiet "${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}" HEAD -- . ":(exclude)studio" ":(exclude).github" ":(exclude).claude" ":(exclude)CLAUDE.md" ":(exclude)README.md"',
  cleanUrls: true,
  trailingSlash: false,
  redirects: [
    { source: '/index.html', destination: '/', permanent: true },
    { source: '/index', destination: '/', permanent: true },
  ],
  headers: [
    // The build stamp (astro.config.mjs): read by the Studio, on another
    // origin, and never from a cache, so it always says when the site was
    // last built
    {
      source: '/build.json',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Cache-Control', value: 'no-store' },
      ],
    },
    // Staging is never indexed: every response says so, files and images
    // too, on any domain. The pages say it again themselves (Layout.astro).
    ...(staging ? [{ source: '/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }] : []),
  ],
};
