import {ProjectsIcon} from '@sanity/icons/Projects'
import {defineLocations} from 'sanity/presentation'
import type {CmsProjectConfig} from '@stasiosdesign/sanity-cms'
import {StudioIcon} from './components/StudioIcon'
import {PAGES, schemaTypes} from './schemaTypes'

/* Everything the CMS package (@stasiosdesign/sanity-cms) needs to know about
   stasiosdesign.com: its Sanity project, brand, sites and content model. The
   package builds the Studio from this (sanity.config.ts); nothing in the
   package knows about this site otherwise.

   How the site uses it (src/cms/, CLAUDE.md "The CMS"): the static build
   reads the production dataset, each element falling back to its own words;
   the Visual editor shows the built site with the drafts written in live
   (live mode, so no draft-mode route: previewModeEnable false); publishing
   goes through the site's Vercel Function, api/publish.ts, which also
   triggers the rebuild. */

// The site the Visual editor shows: your dev server locally (.env.development),
// the Vercel build from the hosted Studio (.env.production)
const PREVIEW_ORIGIN = process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? ''
// The live site, built from the production dataset: its links, and the build
// stamp (/build.json) the publishing progress watches
const LIVE_ORIGIN = process.env.SANITY_STUDIO_PRODUCTION_ORIGIN ?? ''

/** The publishing route, on the live site's Vercel deployment, from the hosted and the local Studio alike */
const PUBLISH_ROUTE = 'https://stasiosdesign.vercel.app/api/publish'

export const project: CmsProjectConfig = {
  projectId: '9k36yeeg',
  dataset: 'staging',

  brand: {
    title: 'Stasios Design',
    icon: StudioIcon,
    // Montserrat, the site's text face (Google Fonts, as the site loads it)
    font: {family: '"Montserrat", sans-serif', stylesheet: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap'},
    // The site's green, with dark text on it
    accent: {base: '#04f8a4', hover: '#22f9af', pressed: '#04da90', text: '#08090a'},
  },

  sites: {preview: PREVIEW_ORIGIN, live: LIVE_ORIGIN},

  schema: {types: schemaTypes},

  pages: PAGES,

  pageEditor: [
    {type: 'homePage', title: 'Home', description: 'The hero, the statement, the offer, recent works, what to expect, about, design and copy.'},
    {type: 'workPage', title: 'Work', description: 'The heading over the case studies, which are a collection.'},
    {type: 'letsTalkPage', title: 'Let’s Talk', description: 'The introduction, contact details and the quote form’s words.'},
    {type: 'aboutPage', title: 'About', description: 'A placeholder page for now.'},
  ],

  collections: [
    {
      type: 'caseStudy',
      title: 'Case studies',
      singular: 'case study',
      nameField: 'title',
      orderField: 'sortOrder',
      icon: ProjectsIcon,
      description: 'The works: each with its own page, and a card on Work and the home page.',
      listedOn: 'workPage',
    },
  ],

  // A case study's page is at /<slug>
  documentRoute: (doc) => (doc._type === 'caseStudy' && doc.slug?.current ? `/${doc.slug.current}` : null),

  visualEditor: {
    // The site has no draft-mode route yet
    previewModeEnable: false,
    mainDocuments: [{route: '/:slug', filter: `_type == "caseStudy" && slug.current == $slug`}],
    locations: {
      caseStudy: defineLocations({
        select: {title: 'title', slug: 'slug.current'},
        resolve: (doc) => ({
          locations: [
            {title: doc?.title || 'Untitled', href: `/${doc?.slug}`},
            {title: 'Work', href: '/work'},
          ],
        }),
      }),
    },
  },

  publishing: {
    // An absolute address: the route is on the deployed site even when the
    // Visual editor shows your dev server
    route: PUBLISH_ROUTE,
    rebuildHelp: 'check VERCEL_DEPLOY_HOOK_URL in the Vercel project’s environment variables',
  },
}
