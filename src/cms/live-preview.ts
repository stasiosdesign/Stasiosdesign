/* Visual editing in the Studio's Visual editor (Sanity's Presentation tool).

   Loaded only when a page is open in a frame (Layout.astro), so visitors
   never download it. With the Studio as the parent it:
   - connects the click-to-edit outlines (enableVisualEditing);
   - asks the Studio for each document on the page in live mode
     (enableLiveMode): the Studio runs the queries with the editor's own
     login, drafts included, and sends every change as it is typed, so no
     token reaches the browser and the site can stay fully static;
   - writes those drafts into the elements that show them, and again
     whenever Barba brings a page in.

   What it reads from the page (content.ts): each element naming a field
   (data-page-field="hero.line1", in data-page-format: format.ts) inside an
   element naming its document (data-page-doc, data-page-type). A field a
   draft leaves empty keeps the page's own words. The same approach as
   Tomrow Studios' src/sanity/live-preview.ts. */
import barba from '@barba/core';
import { createClient } from '@sanity/client';
import { createQueryStore } from '@sanity/core-loader';
import { createDataAttribute, enableVisualEditing } from '@sanity/visual-editing-standalone';
import { apiVersion, projectId, STUDIO_DATASET } from './client';
import { valueAt, type Doc } from './content';
import { render, type Format } from './format';

type Path = Parameters<typeof createDataAttribute>[0]['path'];
type Ref = { id: string; type: string };

// The Studio's own dataset: the drafts being edited are there
const client = createClient({ projectId, dataset: STUDIO_DATASET, apiVersion, useCdn: false, perspective: 'drafts', stega: false });

// The Studio framing this page; its outlines open documents there
const studioUrl = (() => {
  try {
    return new URL(document.referrer).origin;
  } catch {
    return 'https://stasiosdesign.sanity.studio';
  }
})();

// A path into a document, with list positions as numbers ("problems.0")
const toPath = (field: string): Path => field.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part)) as Path;

function renderDoc(ref: Ref, doc: Doc) {
  document.querySelectorAll<HTMLElement>('[data-page-field]').forEach((el) => {
    const holder = el.closest<HTMLElement>('[data-page-doc]');
    if (holder?.dataset.pageDoc !== ref.id || !el.dataset.pageField) return;
    const path = el.dataset.pageField;
    el.dataset.sanity = createDataAttribute({ baseUrl: studioUrl, id: ref.id, type: ref.type, path: toPath(path) }).toString();
    const format = (el.dataset.pageFormat ?? 'text') as Format;
    const classes = (el.dataset.pageClasses ?? '').split(' ').filter(Boolean);
    const value = valueAt(doc, path);
    if (format === 'text') {
      if (typeof value === 'string' && value.trim() !== '' && el.textContent !== value) el.textContent = value;
      return;
    }
    const html = render(value, format, classes);
    if (html != null && el.innerHTML !== html) el.innerHTML = html;
  });
}

// One live query per document, made the first time a page shows it; its
// latest draft is drawn in on arrival and again on every page Barba brings in
const { createFetcherStore, enableLiveMode } = createQueryStore({ client, ssr: false });
const live = new Map<string, { ref: Ref; latest?: Doc }>();

function update() {
  const refs = new Map<string, Ref>();
  document.querySelectorAll<HTMLElement>('[data-page-doc]').forEach((el) => {
    const id = el.dataset.pageDoc;
    if (id) refs.set(id, { id, type: el.dataset.pageType || id });
  });
  refs.forEach((ref, id) => {
    const known = live.get(id);
    if (known) {
      if (known.latest) renderDoc(ref, known.latest);
      return;
    }
    const entry: { ref: Ref; latest?: Doc } = { ref };
    live.set(id, entry);
    createFetcherStore<Doc | null>('*[_id == $id][0]', { id }).subscribe(({ data }) => {
      if (!data) return;
      entry.latest = data;
      renderDoc(ref, data);
    });
  });
}

// The Studio's address bar follows the page: every page Barba brings in is
// reported, and a page the Studio asks for is opened through Barba, keeping
// its transitions. Same-page moves are ignored.
const samePage = (url: string) => new URL(url, location.href).pathname === location.pathname;
enableVisualEditing({
  zIndex: 10000, // above the site's own layers
  history: {
    subscribe: (navigate) => {
      const report = () => navigate({ type: 'replace', url: `${location.pathname}${location.search}${location.hash}` });
      report();
      barba.hooks.after(report);
      window.addEventListener('popstate', report);
      return () => window.removeEventListener('popstate', report);
    },
    update: (change) => {
      if (change.type === 'pop') return history.back();
      if (samePage(change.url)) return;
      barba.go(change.url);
    },
  },
});
enableLiveMode({ client });
update();
barba.hooks.after(update);

// Opening a section in the Studio's side panel scrolls the page to it: the
// Studio posts the section's field name (SHOW_SECTION_MESSAGE in
// @stasiosdesign/sanity-cms/protocol), and the first element showing a
// field of that section is brought into view, through Lenis when the site
// scrolls smoothly
const SHOW_SECTION = new Set(['sanity-cms/show-section', 'tomrow/show-section']);
type Lenis = { scrollTo: (target: Element, options?: { offset?: number }) => void };
window.addEventListener('message', (event) => {
  if (event.source !== window.parent || !SHOW_SECTION.has(event.data?.type) || typeof event.data.section !== 'string') return;
  const name = CSS.escape(event.data.section);
  const part = [...document.querySelectorAll(`[data-page-field="${name}"], [data-page-field^="${name}."]`)].find(
    (el) => (el as HTMLElement).offsetParent !== null,
  );
  if (!part) return;
  const target = part.closest('section') ?? part;
  const lenis = (window as unknown as { lenis?: Lenis }).lenis;
  if (lenis) lenis.scrollTo(target);
  else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
