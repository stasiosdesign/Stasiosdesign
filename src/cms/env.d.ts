/** Which deployment this build is for, fixed at build time from Vercel's VERCEL_ENV (astro.config.mjs). */
declare const __DEPLOYMENT__: 'production' | 'staging' | 'development';
