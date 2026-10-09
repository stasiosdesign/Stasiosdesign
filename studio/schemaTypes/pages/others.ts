import {defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'
import {CommentIcon} from '@sanity/icons/Comment'
import {UserIcon} from '@sanity/icons/User'
import {pageSection} from '@stasiosdesign/sanity-cms'
import {lineField, textField} from '../shared/fields'

// The site's other fixed pages, one document each (ID = type). Each field
// is shown by the element of the same name on the page; empty, the page
// keeps its own words.

/** Work: the heading over the projects. The case studies' names and years in its list are each case study's own (List name, List year). */
export const workPage = defineType({
  name: 'workPage',
  title: 'Work page',
  type: 'document',
  icon: CaseIcon,
  fields: [
    pageSection('hero', 'Heading', 'The two large words over the projects: "my" and "work".', [
      lineField('line1', 'First word'),
      lineField('line2', 'Second word'),
    ]),
  ],
  preview: {prepare: () => ({title: 'Work page'})},
})

/** Let's Talk: the introduction, the ways to get in touch, and the quote form's words. The large LETS TALK and the styled name stay in the site's code. */
export const letsTalkPage = defineType({
  name: 'letsTalkPage',
  title: 'Let’s Talk page',
  type: 'document',
  icon: CommentIcon,
  fields: [
    pageSection('intro', 'Introduction', 'After "I’m Anastasios.": the line inviting a message, on the page and on the contact card.', [
      textField('message', 'On the page', 'Followed by the email address.', 2),
      textField('cardMessage', 'On the contact card', 'Followed by the email address.', 2),
      lineField('hello', 'Card greeting', '"Hello,"'),
    ]),
    pageSection('contact', 'Contact', 'The phone number, the email address and the buttons beside them.', [
      lineField('email', 'Email address', 'Shown on the page; the email links use it too.'),
      lineField('phone', 'Phone number', 'Shown on the page; the phone links use it too.'),
      lineField('bookButton', 'Book a call button', 'Opens the booking page (Calendly).'),
      lineField('socialLabel', 'Social media label', 'Under the social buttons on the card.'),
      lineField('callLabel', 'Schedule a call label', 'Under the call button on the card.'),
    ]),
    pageSection('form', 'Quote form', 'The form’s heading, and what it says once sent or when something is missing. The field labels stay in the site’s code.', [
      lineField('heading', 'Heading', '"Get Started"'),
      lineField('subheading', 'Line under the heading', '"Free quote & audit"'),
      lineField('successHeading', 'Sent: heading', '"Done!"'),
      textField('success', 'Sent: message', undefined, 2),
      lineField('successButton', 'Sent: button', 'Opens the booking page (Calendly).'),
      lineField('error', 'Something missing', 'Shown when the form can’t be sent.'),
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
  fields: [pageSection('hero', 'Opening', 'The page’s heading. The page is a placeholder for now.', [lineField('heading', 'Heading')])],
  preview: {prepare: () => ({title: 'About page'})},
})
