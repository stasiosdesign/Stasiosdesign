import {defineArrayMember, defineField} from 'sanity'

// The fields this site's pages are made of: a small line, a heading, a run
// of text, a button's words, a list of short lines. Each page's file
// (schemaTypes/pages) lists its sections (pageSection, from the CMS package)
// with these inside, so it reads as an outline of the page. They are
// optional: the site's pages still hold their own words, and these say what
// the CMS can change once the site reads them.

/** The small line above or below a heading */
export const labelField = (description = 'The small line beside the heading.', name = 'label', title = 'Label') =>
  defineField({name, title, type: 'string', description})

/** A heading, on one or more lines */
export const headingField = (description?: string, name = 'heading', title = 'Heading') =>
  defineField({name, title, type: 'string', description})

/** A few sentences */
export const textField = (description?: string, name = 'text', title = 'Text', rows = 3) =>
  defineField({name, title, type: 'text', rows, description})

/** The words on a button; where it leads stays in the site's code */
export const buttonField = (description: string, name = 'button', title = 'Button label') =>
  defineField({name, title, type: 'string', description})

/** Short lines in order (a heading broken over lines, a list of points) */
export const linesField = (description: string, name = 'lines', title = 'Lines') =>
  defineField({name, title, type: 'array', description, of: [defineArrayMember({type: 'string'})]})
