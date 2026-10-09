/* How a field's value becomes an element's content, the same at build time
   (src/pages, through content.ts) and in the Visual editor (live-preview.ts),
   so a draft shows exactly as the built page will. An element names its
   format in data-page-format; without one its value is plain text.

   - text     the value as the element's text
   - styled   words in *asterisks* become the element's highlighted spans, in
              order, with the classes in data-page-classes ("Standout
              *websites* that turn…": the design styles each highlight)
   - lines    a line break in the value becomes <br>
   - spans    a list of lines, each in its own <span>, separated by spaces
              (the word-by-word reveal animates each span) */

export type Format = 'text' | 'styled' | 'lines' | 'spans';

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function styled(text: string, classes: string[]): string {
  let n = 0;
  return text
    .split(/(\*[^*]+\*)/)
    .map((part) => {
      if (/^\*[^*]+\*$/.test(part)) {
        const cls = classes[Math.min(n++, classes.length - 1)];
        return `<span${cls ? ` class="${escape(cls)}"` : ''}>${escape(part.slice(1, -1))}</span>`;
      }
      return escape(part);
    })
    .join('');
}

export const lines = (text: string): string => text.split('\n').map(escape).join('<br>');

export const spans = (items: string[]): string => items.map((item) => `<span>${escape(item)}</span>`).join(' ');

/** The HTML for a value in a format; null when the value doesn't fit it */
export function render(value: unknown, format: Format, classes: string[] = []): string | null {
  if (format === 'spans') return Array.isArray(value) && value.every((v) => typeof v === 'string') && value.length > 0 ? spans(value) : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  if (format === 'styled') return styled(value, classes);
  if (format === 'lines') return lines(value);
  return escape(value);
}
