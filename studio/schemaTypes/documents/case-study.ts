import {defineArrayMember, defineField, defineType} from 'sanity'
import {ProjectsIcon} from '@sanity/icons/Projects'
import {FIXED_LENGTH, lineField} from '../shared/fields'

// A case study: one of the works, each with a page of its own at /<slug>
// (/work-csj-architects, /mikhail-riches...), a row in the Work page's list
// and, as the "Next" project, a name at the end of another case study. The
// CMS collection "Case studies" (project.ts). Each page is designed for its
// project, so the lists are as long as that page shows; the photos and the
// page's layout stay in the site's code.
export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case study',
  type: 'document',
  icon: ProjectsIcon,
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', description: 'The large heading of its page, and its name as the next project.', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The page’s address: /<slug>. The pages keep their addresses (work-csj-architects, mikhail-riches...).',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'sortOrder', title: 'Order', type: 'number', description: 'Its place in the Studio’s list.'}),
    lineField('service', 'Service', 'The first line under the heading, e.g. "Website Design".'),
    lineField('sector', 'Sector', 'The second, e.g. "Architecture Firm".'),
    lineField('year', 'Year', 'The third: a year or a span.'),
    lineField('listTitle', 'List name', 'Its name in the Work page’s list, e.g. "MK Architects".'),
    lineField('listYear', 'List year', 'Its year in the Work page’s list.'),
    defineField({name: 'headline', title: 'Headline', type: 'string', description: 'The large line revealed word by word.'}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 4, description: 'Under Read More.'}),
    defineField({
      name: 'problems',
      title: 'Problems',
      type: 'array',
      description: 'The words under "Problem".',
      of: [defineArrayMember({type: 'string'})],
      options: {disableActions: [...FIXED_LENGTH]},
    }),
    lineField('outcomesLabel', 'Outcomes heading', '"Key Outcomes", or "Summary".'),
    defineField({
      name: 'outcomes',
      title: 'Outcomes',
      type: 'array',
      description: 'The words under that heading.',
      of: [defineArrayMember({type: 'string'})],
      options: {disableActions: [...FIXED_LENGTH]},
    }),
    defineField({
      name: 'awards',
      title: 'Awards',
      type: 'array',
      description: 'Awards & Recognitions, where the page shows them (Architectural Works).',
      options: {disableActions: [...FIXED_LENGTH]},
      of: [
        defineArrayMember({
          type: 'object',
          fields: [lineField('by', 'From', 'e.g. "Lathams"'), lineField('kind', 'Kind', '"Award" or "Nomination"'), lineField('title', 'Title', 'e.g. "Best Drawing"')],
          preview: {select: {title: 'title', subtitle: 'by'}},
        }),
      ],
    }),
  ],
  orderings: [{title: 'Order', name: 'sortOrder', by: [{field: 'sortOrder', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'year'}},
})
