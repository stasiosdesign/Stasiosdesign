import {defineCmsStudio} from '@stasiosdesign/sanity-cms'
import {project} from './project'

// The stasiosdesign.com Studio: the shared CMS package (@stasiosdesign/sanity-cms,
// the sanity-cms repository) set up for this website (project.ts: its pages,
// collections, brand and sites; schemaTypes/: its content model).

if (!project.sites.preview) {
  throw new Error('SANITY_STUDIO_PREVIEW_ORIGIN is not set: see studio/.env.production and .env.development')
}

export default defineCmsStudio(project)
