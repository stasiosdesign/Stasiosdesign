import {defineArrayMember, defineField, type FieldDefinition} from 'sanity'

// The fields this site's pages are made of. Each page's file
// (schemaTypes/pages) lists its sections (pageSection, from the CMS package)
// with these inside, in the order the page shows them, so it reads as an
// outline of the page. Each field is shown by an element of the same name on
// the page (data-page-field in src/pages); a field left empty keeps the
// page's own words, so nothing here is required.

/** A short line: a label, a heading, a button's words */
export const lineField = (name: string, title: string, description?: string) => defineField({name, title, type: 'string', description})

/** A few sentences */
export const textField = (name: string, title: string, description?: string, rows = 3) =>
  defineField({name, title, type: 'text', rows, description})

/** The array actions to hide on a list whose layout is built for a set number of items: each can be edited, none added or removed */
export const FIXED_LENGTH = ['add', 'addBefore', 'addAfter', 'remove', 'duplicate'] as const

/** A set number of short lines, in order */
export const linesField = (name: string, title: string, description: string) =>
  defineField({name, title, type: 'array', description, of: [defineArrayMember({type: 'string'})], options: {disableActions: [...FIXED_LENGTH]}})

/** A set number of small blocks of the same shape (the What to Expect points, the process steps...) */
export const blocksField = (name: string, title: string, description: string, fields: FieldDefinition[], preview: string) =>
  defineField({
    name,
    title,
    type: 'array',
    description,
    options: {disableActions: [...FIXED_LENGTH]},
    of: [defineArrayMember({type: 'object', fields, preview: {select: {title: preview}}})],
  })
