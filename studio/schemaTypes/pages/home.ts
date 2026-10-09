import {defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'
import {pageSection} from '@stasiosdesign/sanity-cms'
import {blocksField, lineField, linesField, textField} from '../shared/fields'

// The home page, section by section in the order it shows them, and the
// footer that ends every page but Let's Talk. A singleton with the fixed ID
// "homePage". Where the phone layout has its own wording, it has its own
// field ("on phones"); otherwise one field serves every layout. The
// animated word-art (Generic → Beautiful Site, the copy that crosses words
// out, [STASIOS DESIGN]) and the navigation stay in the site's code.
export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  fields: [
    pageSection('hero', 'Hero', 'The opening: the three large words and the buttons, and the tablet and phone version of it.', [
      lineField('line1', 'First word', 'The top line: "creative".'),
      lineField('line2', 'Second word', 'The middle line, in the script face: "website".'),
      lineField('line3', 'Third word', 'The bottom line: "designer".'),
      lineField('viewWork', 'View work button', 'Shown in brackets: [VIEW WORK]. Goes to the Work page.'),
      lineField('quoteButton', 'Quote button', 'Goes to Let’s Talk.'),
      lineField('readMoreButton', 'Read more button'),
      textField('statement', 'Statement', 'The line under the hero. Words in *asterisks* are the highlighted ones: Standout *websites* that turn *visitors* into *clients.*', 2),
      linesField('tabletLines', 'Tablet and phone headline', 'The four large lines on tablets and phones, one per line: "For", "websites", "People", "Remember."'),
      textField('tabletLead', 'Tablet and phone line', 'The sentence under that headline.', 2),
    ]),
    pageSection('intro', 'Introduction', 'The large statement under the hero on tablets and phones, revealed word by word, and its round button.', [
      linesField('lines', 'Statement', 'Each line is revealed on its own, in order.'),
      textField('button', 'Round button', 'Two lines: start a new line where it breaks.', 2),
    ]),
    pageSection('offer', 'Offer', 'Under the hero: what the websites do, and the call to book.', [
      textField('text', 'Text'),
      lineField('button', 'Button', 'Opens the booking page (Calendly).'),
      textField('note', 'Note', 'Beside the button.', 2),
    ]),
    pageSection('recentWorks', 'Recent works', 'The heading over the case studies.', [
      lineField('heading', 'Heading'),
      lineField('subheading', 'Line under the heading'),
    ]),
    pageSection('expectations', 'What to expect', 'Working with me: the heading, the four points, the about card and Clean Code.', [
      lineField('heading', 'Heading'),
      lineField('subheading', 'Line under the heading'),
      blocksField(
        'points',
        'Points',
        'The four cards: a large word and the line under it.',
        [lineField('value', 'Large word', 'e.g. "Fast"'), lineField('label', 'Line under it', 'e.g. "turnaround time"')],
        'value',
      ),
      lineField('aboutIntro', 'About: first sentence', 'Shown in bold: "I’m Anastasios – but you can call me Stas."'),
      textField('aboutText', 'About: the rest', 'After the first sentence, on larger screens.'),
      textField('aboutPhone', 'About, on phones', 'The whole text of the about card on phones.', 4),
      lineField('cleanCode', 'Clean Code card'),
      lineField('cleanCodeButton', 'Clean Code button', 'Opens the booking page (Calendly).'),
    ]),
    pageSection('design', 'Distinct design', 'The card with the circles.', [
      textField('text', 'Text'),
      lineField('title', 'Title', 'In the middle circle: "Distinct".'),
      lineField('subtitle', 'Line under the title', '"Design".'),
      linesField('questions', 'Questions', 'The four around the circle: top, right, bottom, left.'),
    ]),
    pageSection('copy', 'Copy that converts', 'The copywriting card. The animation of crossed-out words stays in the site’s code.', [
      lineField('heading', 'Heading'),
      lineField('lead', 'First sentence', 'Shown in bold.'),
      textField('text', 'The rest', 'After the first sentence, on larger screens.'),
      textField('textPhone', 'The rest, on phones'),
    ]),
    pageSection('solutions', 'Frustrations and solutions', 'The three cards under Frustrations → Solutions. Their animated titles stay in the site’s code.', [
      blocksField(
        'cards',
        'Cards',
        'Generic → Beautiful site, Losing → Driving leads, One of many → a kind.',
        [lineField('subheading', 'The frustration'), textField('text', 'The solution', undefined, 3)],
        'subheading',
      ),
      lineField('button', 'Button', 'Goes to Let’s Talk.'),
    ]),
    pageSection('process', 'The process', 'The three steps: design, develop, deploy.', [
      lineField('heading', 'Heading'),
      blocksField(
        'steps',
        'Steps',
        'Each with how long it takes, its name and what happens.',
        [lineField('duration', 'How long', 'e.g. "2 weeks", or "∞"'), lineField('name', 'Name'), textField('text', 'What happens')],
        'name',
      ),
    ]),
    pageSection('closing', 'Closing call', 'The end of the page: Ready . Set . Grow and the call to talk.', [
      lineField('tagline', 'Tagline', '"Ready . Set . Grow"'),
      lineField('heading', 'Heading', '"Lets Talk"'),
      lineField('button', 'Button', 'Opens the booking page (Calendly).'),
    ]),
    pageSection('footer', 'Footer', 'The "contact me" footer that ends every page but Let’s Talk.', [
      lineField('heading', 'Heading', '"contact me"'),
      lineField('contactButton', 'Contact page button'),
      lineField('callButton', 'Call button'),
      lineField('instagram', 'Instagram handle'),
      lineField('linkedin', 'LinkedIn name'),
      lineField('email', 'Email address', 'Shown in the footer; the email links use it too.'),
      lineField('phone', 'Phone number', 'Shown in the footer; the phone links use it too.'),
      lineField('getInContact', 'Get in contact heading'),
      lineField('bookCall', 'Book a call button'),
      lineField('quoteButton', 'Quote button'),
      lineField('socials', 'Socials heading'),
    ]),
  ],
  preview: {prepare: () => ({title: 'Home page'})},
})
