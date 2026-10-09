import {getCliClient} from 'sanity/cli'

/* Fills the staging dataset with the site's own words as they are on its
   pages today (src/pages/), so the Studio opens on real content:
   `npm run seed` in studio/. Only creates what isn't there yet
   (createIfNotExists), so it never overwrites anything edited in the Studio,
   and it never touches the production dataset. */

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({dataset: 'staging'})

const documents: {_id: string; _type: string; [field: string]: unknown}[] = [
  {
    _id: 'homePage',
    _type: 'homePage',
    hero: {words: ['creative', 'website', 'designer'], primaryButton: 'View work', secondaryButton: 'Get a Free Quote'},
    statement: {
      heading: 'Standout websites that turn visitors into clients.',
      text: 'I design and develop standout websites that turn visitors into clients.',
      button: 'Get a Free Quote',
    },
    offer: {
      heading: 'High-end websites for future driven companies',
      lead: 'Amplify your brand, stand out, and attract more clients.',
      text: 'I build websites that combine strong design with business strategy - to make your brand the one clients want and competitors envy.',
      button: 'Schedule a call',
      note: 'To see if we’re a good fit, no pressure no sales pitch.',
    },
    recentWorks: {heading: 'Recent Works', label: 'website design & development'},
    expectations: {
      heading: 'What to Expect',
      label: 'working with me',
      points: ['Fast turnaround time', 'High quality designs', '100% custom', 'SEO optimised', 'Clean code'],
    },
    about: {
      heading: 'I’m Anastasios – but you can call me Stas.',
      text: 'I started in architecture, now I create bespoke websites that sharpen brand positioning and drive growth, using AI to move faster without losing the human touch.',
    },
    design: {
      heading: 'Distinct Design',
      text: 'I uncover what makes your business unique, crafting a website that not only sets you apart from competitors but also earns trust and turns visitors into loyal clients.',
    },
    copy: {
      heading: 'Copy that Converts',
      lead: 'Good design grabs attention, but great copywriting keeps it.',
      text: 'I write sharp, purposeful messaging that speaks to your audience and captures your brand.',
    },
  },
  {_id: 'workPage', _type: 'workPage', hero: {heading: 'my work'}},
  {_id: 'aboutPage', _type: 'aboutPage', hero: {heading: 'Page coming soon'}},
  {
    _id: 'letsTalkPage',
    _type: 'letsTalkPage',
    intro: {
      heading: 'Let’s talk',
      text: 'I’m Anastasios. I’m happy to help with your project, get a free quote or send me an email.',
    },
    contact: {email: 'stas@stasiosdesign.com', phone: '07468493102', bookButton: 'Book a call'},
    form: {
      heading: 'Free quote & audit',
      success: 'Thanks for your submission! I’ll get back to you within 24 hours with a quote and an audit of your current site.',
    },
  },
  {
    _id: 'caseStudy-csj-architects',
    _type: 'caseStudy',
    title: 'CSJ Architects',
    slug: {_type: 'slug', current: 'work-csj-architects'},
    sortOrder: 1,
    service: 'Website Design',
    sector: 'Architecture Firm',
    year: '2025',
    headline: 'Redesigning a website to embody architectural vision and brand identity',
    summary:
      'Caruso St John Architects blend modern design with historical context. This concept redesign introduces a bold visual style that mirrors the studio’s ethos, integrating brand and layout into a cohesive, authentic digital presence.',
    problems: ['Overwhelming', 'Poor UX', 'No Cohesion'],
    outcomes: ['Visual Identity', 'Brand Alignment', 'UI UX', 'Structure', 'Copywriting'],
  },
  {
    _id: 'caseStudy-mikhail-riches',
    _type: 'caseStudy',
    title: 'Mikhail Riches',
    slug: {_type: 'slug', current: 'mikhail-riches'},
    sortOrder: 2,
    service: 'Website Design',
    sector: 'Architecture Firm',
    year: '2025',
    headline: 'Refining a digital presence to reflect sustainability and environmental design',
    problems: ['Unfocused', 'Unbranded', 'Poor UX'],
    outcomes: ['Clarity', 'Brand Alignment', 'User Journey', 'Hierarchy'],
  },
  {
    _id: 'caseStudy-architectural-works',
    _type: 'caseStudy',
    title: 'Architectural Works',
    slug: {_type: 'slug', current: 'work-architectural-works'},
    sortOrder: 3,
    service: 'Architecture',
    sector: 'London, Nottingham',
    year: '2020-22',
    headline: 'A selection of architectural projects from university and professional work.',
    summary:
      'These architectural projects from both my university studies and professional work demonstrate my approach to design, problem-solving, and visual thinking—all of which carry over into my digital design work.',
    problems: ['Overwhelming', 'Poor UX', 'No Cohesion'],
    outcomes: ['Plans', 'Sections', 'Dissertation', 'Thesis', 'Axonometrics'],
  },
]

const transaction = client.transaction()
for (const doc of documents) transaction.createIfNotExists(doc)
const result = await transaction.commit()
console.log(`Seeded ${documents.length} documents into staging (existing ones left as they were): ${result.transactionId}`)
