import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'
import {CommentIcon} from '@sanity/icons/Comment'
import {UserIcon} from '@sanity/icons/User'
import {pageSection} from '@stasiosdesign/sanity-cms'
import {buttonField, headingField, textField} from '../shared/fields'

// The site's other fixed pages, one document each (ID = type).

/** Work: the heading over the list of case studies (the Case studies collection) */
export const workPage = defineType({
  name: 'workPage',
  title: 'Work page',
  type: 'document',
  icon: CaseIcon,
  fields: [pageSection('hero', 'Opening', 'The heading over the case studies.', [headingField('Broken into lines on the page: "my work".')])],
  preview: {prepare: () => ({title: 'Work page'})},
})

/** Let's Talk: the introduction, the ways to get in touch, and the quote form's words */
export const letsTalkPage = defineType({
  name: 'letsTalkPage',
  title: 'Let’s Talk page',
  type: 'document',
  icon: CommentIcon,
  fields: [
    pageSection('intro', 'Introduction', 'The heading and the line under it.', [headingField(), textField()]),
    pageSection('contact', 'Contact', 'The email address, the phone number and the booking button.', [
      defineField({name: 'email', title: 'Email', type: 'string', validation: (rule) => rule.email()}),
      defineField({name: 'phone', title: 'Phone', type: 'string'}),
      buttonField('Opens the booking page.', 'bookButton', 'Booking button'),
    ]),
    pageSection('form', 'Quote form', 'The form’s heading, and what it says once sent.', [
      headingField(),
      textField('Shown after the form is sent.', 'success', 'Thank-you message', 2),
    ]),
  ],
  preview: {prepare: () => ({title: 'Let’s Talk page'})},
})

/** About: a placeholder page for now ("Page coming soon") */
export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  icon: UserIcon,
  fields: [pageSection('hero', 'Opening', 'The page’s heading. The page is a placeholder for now.', [headingField()])],
  preview: {prepare: () => ({title: 'About page'})},
})
