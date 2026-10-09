import {getCliClient} from 'sanity/cli'
import {ALL} from '../../src/cms/defaults'

/* Fills the staging dataset with the site's own words, exactly as its pages
   show them today (src/cms/defaults.ts, the same values the pages fall back
   to): `npm run seed` in studio/. So publishing them changes nothing on the
   site until they are edited.

   A document is written only if nobody has edited it: one that doesn't
   exist yet is created, one still exactly as a seed left it is replaced (to
   follow the current schema), and one that has been edited since, or has a
   draft, is left alone and named. Never touches the production dataset. */

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({dataset: 'staging', perspective: 'raw'})

const ids = ALL.map((doc) => doc._id)
const existing = await client.fetch<{_id: string; _createdAt: string; _updatedAt: string}[]>(
  '*[_id in $ids || _id in $drafts]{_id, _createdAt, _updatedAt}',
  {ids, drafts: ids.map((id) => `drafts.${id}`)},
)
const byId = new Map(existing.map((doc) => [doc._id, doc]))

const transaction = client.transaction()
const written: string[] = []
const kept: string[] = []
for (const doc of ALL) {
  const current = byId.get(doc._id)
  const edited = byId.has(`drafts.${doc._id}`) || (current && current._updatedAt !== current._createdAt)
  if (edited) {
    kept.push(doc._id)
    continue
  }
  transaction.createOrReplace(doc)
  written.push(doc._id)
}
if (written.length) await transaction.commit()
console.log(`Seeded into staging: ${written.join(', ') || 'nothing'}`)
if (kept.length) console.log(`Left as they are (edited in the Studio): ${kept.join(', ')}`)
