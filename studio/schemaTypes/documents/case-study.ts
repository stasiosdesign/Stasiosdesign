import {defineArrayMember, defineField, defineType} from 'sanity'
import {ProjectsIcon} from '@sanity/icons/Projects'

// A case study: one of the works, each with a page of its own at /<slug>
// (/work-csj-architects, /mikhail-riches...) and a card on Work and on the
// home page's Recent Works. The CMS collection "Case studies" (project.ts).
export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case study',
  type: 'document',
  icon: ProjectsIcon,
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The page’s address: /<slug>. The site’s pages keep their addresses (work-csj-architects, mikhail-riches...).',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'sortOrder', title: 'Order', type: 'number', description: 'Position on the Work page, 1 first.'}),
    defineField({name: 'service', title: 'Service', type: 'string', description: 'What was done, e.g. "Website Design".'}),
    defineField({name: 'sector', title: 'Sector', type: 'string', description: 'Who it was for, e.g. "Architecture Firm".'}),
    defineField({name: 'year', title: 'Year', type: 'string', description: 'A year or a span: "2025", "2020-22".'}),
    defineField({name: 'headline', title: 'Headline', type: 'string', description: 'The one-line summary under the title.'}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 4}),
    defineField({
      name: 'problems',
      title: 'Problems',
      type: 'array',
      description: 'The words under "Problem": "Overwhelming", "Poor UX"...',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'outcomes',
      title: 'Key outcomes',
      type: 'array',
      description: 'The words under "Key Outcomes".',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({name: 'cover', title: 'Cover image', type: 'image', options: {hotspot: true}}),
  ],
  orderings: [{title: 'Order', name: 'sortOrder', by: [{field: 'sortOrder', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'year', media: 'cover'}},
})
