import {defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'
import {pageSection} from '@stasiosdesign/sanity-cms'
import {buttonField, headingField, labelField, linesField, textField} from '../shared/fields'

// The home page, section by section in the order it shows them. A singleton
// with the fixed ID "homePage". The case studies under Recent Works are the
// Case studies collection.
export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  fields: [
    pageSection('hero', 'Hero', 'The three words of the opening, and its two buttons.', [
      linesField('One word a line: "creative", "website", "designer".', 'words', 'Words'),
      buttonField('Goes to the work.', 'primaryButton', 'First button'),
      buttonField('Goes to Let’s Talk.', 'secondaryButton', 'Second button'),
    ]),
    pageSection('statement', 'Statement', 'The large statement under the hero and the line beneath it.', [
      headingField('Broken into lines on the page.'),
      textField('The line under the statement.'),
      buttonField('Goes to Let’s Talk.'),
    ]),
    pageSection('offer', 'Offer', 'High-end websites: the heading, what they do, and the call to book.', [
      headingField(),
      textField('The short line under the heading.', 'lead', 'Standfirst', 2),
      textField('The paragraph beside it.'),
      buttonField('Opens the booking page.'),
      textField('The note beside the button.', 'note', 'Note', 2),
    ]),
    pageSection('recentWorks', 'Recent works', 'The heading over the case studies, which are a collection.', [
      headingField(),
      labelField('The line under the heading.'),
    ]),
    pageSection('expectations', 'What to expect', 'Working with me: the heading and the points under it.', [
      headingField(),
      labelField('The line under the heading.'),
      linesField('One point a line: "Fast turnaround time", "High quality designs"...', 'points', 'Points'),
    ]),
    pageSection('about', 'About', 'The introduction: who I am and how I work.', [headingField(), textField()]),
    pageSection('design', 'Distinct design', 'The heading and paragraph on design.', [headingField(), textField()]),
    pageSection('copy', 'Copy that converts', 'The heading and paragraphs on copywriting.', [
      headingField(),
      textField('The line under the heading.', 'lead', 'Standfirst', 2),
      textField(),
    ]),
  ],
  preview: {prepare: () => ({title: 'Home page'})},
})
