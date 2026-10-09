/* Every field's own words: what the pages showed before they read Sanity,
   kept exactly (typos included, e.g. "Poeple", "Heirachy", "Copywritting":
   fix them in the Studio, not here). The pages fall back to these while a
   field is empty (content.ts), and the Studio's seed script
   (studio/scripts/seed.ts) fills the staging dataset with them, so the two
   always agree. Where a layout shows different words for the same field (the
   tablet "BOOK A CALL" button, say), the page passes its own fallback for
   that element. The shape of each document is its schema's
   (studio/schemaTypes). */

type Doc = { _id: string; _type: string; [field: string]: unknown };

export const homePage = {
  _id: 'homePage',
  _type: 'homePage',
  hero: {
    line1: 'creative',
    line2: 'website',
    line3: 'designer',
    viewWork: 'VIEW WORK',
    quoteButton: 'Get a Free Quote',
    readMoreButton: 'Read More',
    statement: 'Standout *websites* that turn *visitors* into *clients.*',
    tabletLines: ['For', 'websites', 'Poeple ', 'Remember.'],
    tabletLead: 'I design and develop standout websites that turn visitors into clients.',
  },
  intro: {
    lines: ['High-end websites', 'for future driven', 'companies', 'amplify your', 'brand, stand out,', 'and attract more', 'clients.'],
    button: 'Get a \nFree quote',
  },
  offer: {
    text: 'I build websites that combine strong design with business strategy - to make your brand the one clients want and competitors envy.',
    button: 'schedule a call ',
    note: 'to see if we’re a good fit, no pressure no sales pitch.',
  },
  recentWorks: { heading: 'Recent Works', subheading: 'website design & development' },
  expectations: {
    heading: 'What to Expect',
    subheading: 'working with me',
    points: [
      { _key: 'fast', value: 'Fast', label: 'turnaround time' },
      { _key: 'quality', value: 'High', label: 'quality designs' },
      { _key: 'custom', value: '100%', label: 'custom' },
      { _key: 'seo', value: 'SEO', label: 'optimised' },
    ],
    aboutIntro: 'I’m Anastasios – but you can call me Stas.',
    aboutText:
      'I started in architecture, now I create bespoke websites that sharpen brand positioning and drive growth, using AI to move faster without losing the human touch.',
    aboutPhone:
      'I’m Anastasios – but you can call me Stas. I started in architecture, now I build websites that combine strong design with clear business strategy. A great website should be both beautiful and built to sell.',
    cleanCode: 'Clean Code',
    cleanCodeButton: 'schedule a call ',
  },
  design: {
    text: 'I uncover what makes your business unique, crafting a website that not only sets you apart from competitors but also earns trust and turns visitors into loyal clients',
    title: 'Distinct',
    subtitle: 'Design',
    questions: ['Competitors?', 'Outdated?', 'Lack of Identity?', 'Poor UX?'],
  },
  copy: {
    heading: 'Copy that Converts',
    lead: 'Good design grabs attention, but great copywriting keeps it.',
    text: 'I write sharp, purposeful messaging that speaks to your audience and captures your brand',
    textPhone: 'I craft sharp, purposeful messaging that speaks to your audience and captures your brand',
  },
  solutions: {
    cards: [
      { _key: 'beautiful', subheading: 'Site feels basic and uninspired.', text: 'I’ll create a stunning website showcasing your work, boosting your business and attracting the clients you want' },
      { _key: 'leads', subheading: 'Visitors scroll past; Not reach out.', text: 'Conversion based strategies that captivate your audience, showcase your talent, and turn clicks into clients' },
      { _key: 'kind', subheading: 'Not standing out; Your blending in', text: 'A fully custom website, aligned with your brand, built to stand out and keep you ahead of the competition.' },
    ],
    button: 'Get a free quote',
  },
  process: {
    heading: 'The Process',
    steps: [
      { _key: 'design', duration: '2 weeks', name: 'Design', text: 'I’ll design a stunning website that prioritizes user experience, functionality, and reflects your brand’s identity' },
      { _key: 'develop', duration: '2 weeks', name: 'Develop', text: 'Once you\'re happy with the design, I’ll build a fast, smooth site optimized for SEO and ready to perform on any device.' },
      { _key: 'deploy', duration: '∞', name: 'Deploy', text: 'I don’t just launch and leave I’ll stick around, making sure everything keeps running smoothly and stays up to date.' },
    ],
  },
  closing: { tagline: 'Ready . Set . Grow', heading: 'Lets Talk', button: 'Schedule a Call' },
  footer: {
    heading: 'contact me',
    contactButton: 'Contact Page',
    callButton: 'Schedule a Call',
    instagram: '@stasiosdesign',
    linkedin: 'Anastasios',
    email: 'stas@stasiosdesign.com',
    phone: '07468493102',
    getInContact: 'Get in contact',
    bookCall: 'Book a call',
    quoteButton: 'Get a free quote',
    socials: 'SOCIALS',
  },
} satisfies Doc;

export const workPage = { _id: 'workPage', _type: 'workPage', hero: { line1: 'my', line2: 'work' } } satisfies Doc;

export const aboutPage = { _id: 'aboutPage', _type: 'aboutPage', hero: { heading: 'Page coming soon' } } satisfies Doc;

export const letsTalkPage = {
  _id: 'letsTalkPage',
  _type: 'letsTalkPage',
  intro: {
    message: 'I\'m happy to help with your project, get a free quote or send me an email at',
    cardMessage: 'I\'m happy to help with your project, send me an email at',
    hello: 'Hello,',
  },
  contact: { email: 'stas@stasiosdesign.com', phone: '07468493102', bookButton: 'book a call', socialLabel: 'Social media', callLabel: 'Schedule a call' },
  form: {
    heading: 'Get Started',
    subheading: 'Free quote & audit',
    successHeading: 'Done!',
    success: 'Thanks for your submission! I’ll get back to you within 24 hours with a quote and an audit of your current site.',
    successButton: 'Schedule a Call',
    error: 'Hmm... something\'s missing',
  },
} satisfies Doc;

export const csjArchitects = {
  _id: 'caseStudy-csj-architects',
  _type: 'caseStudy',
  title: 'CSJ Architects',
  slug: { _type: 'slug', current: 'work-csj-architects' },
  sortOrder: 1,
  service: 'Website Design',
  sector: 'Architecture Firm',
  year: '2025',
  listTitle: 'Architect',
  listYear: '2025',
  headline: 'Redesigning a website to embody architectural vision and brand identity',
  summary:
    'Caruso St John Architects blend modern design with historical context. This concept redesign introduces a bold visual style that mirrors the studio’s ethos, integrating brand and layout into a cohesive, authentic digital presence.',
  problems: ['Overwhelming', 'Poor UX', 'No Cohesion'],
  outcomesLabel: 'Key Outcomes',
  outcomes: ['Visual Identity', 'Brand Alignment', 'UI UX', 'Structure', 'Copywritting'],
} satisfies Doc;

export const mikhailRiches = {
  _id: 'caseStudy-mikhail-riches',
  _type: 'caseStudy',
  title: 'Mikhail Riches',
  slug: { _type: 'slug', current: 'mikhail-riches' },
  sortOrder: 2,
  service: 'Website Design',
  sector: 'Architecture Firm',
  year: '2025',
  listTitle: 'MK Architects',
  listYear: '2025',
  headline: 'Refining a digital presence to reflect sustainability and environmental design',
  problems: ['\'Template Site\'', 'Unfocused', 'Unbranded', 'Poor UX'],
  outcomesLabel: 'Key Outcomes',
  outcomes: ['Clarity', 'Brand Alignment', 'User Journey', 'Heirachy'],
} satisfies Doc;

export const architecturalWorks = {
  _id: 'caseStudy-architectural-works',
  _type: 'caseStudy',
  title: 'Architectural Works',
  slug: { _type: 'slug', current: 'work-architectural-works' },
  sortOrder: 3,
  service: 'London',
  sector: 'Nottingham',
  year: '2020 -22',
  listTitle: 'Architectural Work',
  listYear: '2021-23',
  headline: 'A selection of architectural projects from university and professional work.',
  summary:
    'These architectural projects from both my university studies and professional work demonstrate my approach to design, problem-solving, and visual thinking—all of which carry over into my digital design work',
  problems: ['Overwhelming', 'Poor UX', 'No Cohesion'],
  outcomesLabel: 'Summary',
  outcomes: ['Plans', 'Sections', 'Dissertation', 'Thesis', 'Axonometrics'],
  awards: [
    { _key: 'lathams', by: 'Lathams', kind: 'Award', title: 'Best Drawing' },
    { _key: 'rogan', by: 'Peter Rogan & Assoc', kind: 'Award', title: 'Best Dissertation' },
    { _key: 'riba-dissertation', by: 'RIBA.com', kind: 'Nomination', title: 'RIBA Dissertation Nominee' },
    { _key: 'riba-part-1', by: 'RIBA..com', kind: 'Nomination', title: 'RIBA Part 1 Nominee' },
    { _key: 'ndsa', by: 'NDSA', kind: 'Nomination', title: 'NDSA Student Award Nominee' },
  ],
} satisfies Doc;

/** Every document the site reads, for the seed script */
export const ALL: Doc[] = [homePage, workPage, aboutPage, letsTalkPage, csjArchitects, mikhailRiches, architecturalWorks];
