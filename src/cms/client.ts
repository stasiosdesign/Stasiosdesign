/* The site's Sanity client: published content only, no token.

   Two datasets (see CLAUDE.md, "The CMS"): `production`, which only holds
   what has been published live and which the production build reads, and
   `staging`, which the Studio edits and the staging build reads. Which one
   a build reads follows the deployment (astro.config.mjs, __DEPLOYMENT__:
   `main` on Vercel is production, every other branch staging), never a
   hostname, so a custom domain changes nothing. The build reads straight
   from the API rather than the CDN, so a rebuild right after a publish
   always sees it. PUBLIC_SANITY_DATASET can point a build elsewhere (a local
   build against staging, say). Nothing here is secret, so the browser code
   (live-preview.ts) uses it too. */
import { createClient } from '@sanity/client';

export const projectId = '9k36yeeg';

/** The dataset the Studio edits; the staging site and the Visual editor's live drafts come from it */
export const STUDIO_DATASET = 'staging';

export const dataset = import.meta.env?.PUBLIC_SANITY_DATASET || (__DEPLOYMENT__ === 'production' ? 'production' : STUDIO_DATASET);

export const apiVersion = '2025-02-19';

export const sanityClient = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: 'published', stega: false });
