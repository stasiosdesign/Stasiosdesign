/* The pages' content, read once at build time from the production dataset.

   A page asks for the documents it shows (getDocument) and reads each field
   with a fallback: the words the page has always had (field). A field that
   is empty in Sanity, or a document not published yet, keeps the page's own
   words, so the site looks exactly as before until something is published,
   and a field emptied in the Studio goes back to them.

   Each element that shows a field names it (data-page-field="hero.line1")
   inside an element naming its document (data-page-doc, data-page-type:
   pageDoc below), so the Visual editor can outline it and write drafts into
   it (live-preview.ts). */
import { render, type Format } from './format';
import { sanityClient } from './client';

export type Doc = Record<string, unknown>;

const documents = new Map<string, Promise<Doc | null>>();

/** A published document by ID (each read once per build). A failed read fails the build in production, so a site is never rebuilt without its content. */
export function getDocument(id: string): Promise<Doc | null> {
  let found = documents.get(id);
  if (!found) {
    found = sanityClient.fetch<Doc | null>('*[_id == $id][0]', { id }).catch((error: unknown) => {
      if (import.meta.env.PROD) throw error;
      console.warn(`[cms] ${id} could not be read; the page shows its own words`, error);
      return null;
    });
    documents.set(id, found);
  }
  return found;
}

export const valueAt = (doc: Doc | null | undefined, path: string): unknown =>
  path.split('.').reduce<unknown>((at, key) => (at && typeof at === 'object' ? (at as Record<string, unknown>)[key] : undefined), doc);

/** A field's value as text, or the fallback while it is empty */
export const field = (doc: Doc | null | undefined) => (path: string, fallback: string): string => {
  const value = valueAt(doc, path);
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
};

/** A field's HTML in a format (format.ts), or the fallback's */
export const html = (doc: Doc | null | undefined) => (path: string, format: Format, fallback: string | string[], classes: string[] = []): string =>
  render(valueAt(doc, path), format, classes) ?? (render(fallback, format, classes) as string);

/**
 * A page's readers for one document: t(path) its text and h(path, format) its
 * HTML, each falling back to the field's own words in defaults.ts, or to the
 * words given (an element whose layout words them differently).
 */
export function reader(doc: Doc | null | undefined, defaults: Doc) {
  const own = (path: string) => valueAt(defaults, path);
  return {
    t: (path: string, fallback?: string) => field(doc)(path, fallback ?? String(own(path) ?? '')),
    h: (path: string, format: Format, classes: string[] = [], fallback?: string | string[]) =>
      html(doc)(path, format, fallback ?? (own(path) as string | string[]), classes),
  };
}

/** The attributes that name a document, for the element that holds its fields */
export const pageDoc = (id: string, type = id) => ({ 'data-page-doc': id, 'data-page-type': type });
