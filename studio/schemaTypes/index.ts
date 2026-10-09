import {caseStudy} from './documents/case-study'
import {homePage} from './pages/home'
import {aboutPage, letsTalkPage, workPage} from './pages/others'

export type PageEntry = {type: string; title: string; route: string}

/** Every fixed page, in the site's navigation order; each a singleton whose _id is its type */
export const PAGES: PageEntry[] = [
  {type: 'homePage', title: 'Home', route: '/'},
  {type: 'workPage', title: 'Work', route: '/work'},
  {type: 'aboutPage', title: 'About', route: '/about'},
  {type: 'letsTalkPage', title: 'Let’s Talk', route: '/lets-talk'},
]

export const schemaTypes = [homePage, workPage, aboutPage, letsTalkPage, caseStudy]
