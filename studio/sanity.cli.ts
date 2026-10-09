import {defineCliConfig} from 'sanity/cli'
import {linkLocalCms} from '@stasiosdesign/sanity-cms/cli'

export default defineCliConfig({
  api: {
    projectId: '9k36yeeg',
    // The dataset the Studio edits; the site will read `production`
    dataset: 'staging',
  },
  deployment: {
    /** The hosted Studio, https://stasiosdesign.sanity.studio (`npm run deploy`) */
    appId: 'zqxl2q0uof1iafyen3ycvniq',
    /**
     * Off: a hosted Studio runs exactly the Sanity version package-lock.json
     * pins, not whatever Sanity publishes next (CLAUDE.md, "The CMS").
     */
    autoUpdates: false,
  },
  /**
   * This is the development Studio for the shared CMS package: `npm run dev`
   * compiles @stasiosdesign/sanity-cms from the local checkout beside this
   * repository (../../shared-sanity-cms/src, beside this one in 1 - HQ), so a
   * change there shows here at once.
   * `npm run dev:released` uses the installed release instead. Builds and
   * deploys always use the installed release, never the local source.
   */
  vite: linkLocalCms({scripts: ['dev'], path: '../../shared-sanity-cms'}),
})
