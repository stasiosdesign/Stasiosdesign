/**
 * The route of the page being rendered, in the form its links use ("/",
 * "/work"). Astro.url.pathname is "/work" on the dev server but "/work.html"
 * in a `build.format: 'file'` build, so both are normalised.
 */
export function currentPage(url: URL): string {
  const path = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}
