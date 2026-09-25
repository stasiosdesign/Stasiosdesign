/* ---------------------------------------------------------------------------
   APP LIFECYCLE

   The one place that knows how a page comes to life and how it is torn down.
   Everything else is either a feature (features/), which only knows how to
   set itself up inside a container, or the transition (transition.js), which
   only knows how to animate two containers.

   Four phases, and every page goes through the same ones whether it was
   loaded directly or reached through Barba:

     boot          once per document: Lenis, the shell features (menu, cursor,
                   scroll lock), Barba itself.
     mount(page)   the container is in the DOM, possibly still off-screen:
                   apply the page's shell state (body class, cursor labels,
                   current links), start Webflow's interactions for this page,
                   run every feature's mount() inside a GSAP context.
     ready(page)   the container is in normal flow at the top of the viewport:
                   run the work that needs real layout (scroll triggers), then
                   fire Webflow's page-load interactions.
     unmount(page) the container is gone: run feature cleanups, kill the GSAP
                   context (every tween and ScrollTrigger the page created).
--------------------------------------------------------------------------- */
import barba from '@barba/core';
import Lenis from '@studio-freight/lenis';
import { gsap, ScrollTrigger } from './lib/gsap.js';
import { webflow } from './webflow.js';
import * as transition from './transition.js';
import { shellFeatures, pageFeatures } from './features/index.js';

let lenis = null;
const shellHooks = [];    // returned by shell features: { pageWillChange() }
let activePage = null;
let leavingPage = null;

// -------------------------------------------------------------------------
// PAGE META - the per-page state that lives outside the Barba container
// -------------------------------------------------------------------------
function pageMeta(doc) {
  const view = doc.querySelector('.cursor-viewproject');
  const start = doc.querySelector('.cursor-startproject');
  return {
    pageId: doc.documentElement.getAttribute('data-wf-page') || '',
    bodyClass: doc.body ? doc.body.className : '',
    cursorView: view ? view.innerHTML : null,
    cursorStart: start ? start.innerHTML : null,
  };
}

function applyShell(meta) {
  // Page-level styling hangs off the body class (body-2, body-8, body-9 ...).
  if (document.body.className !== meta.bodyClass) document.body.className = meta.bodyClass;
  // The magnetic-cursor labels differ per page ("[View Project]", "[Start Your Project]" ...).
  setLabel('.cursor-viewproject', meta.cursorView);
  setLabel('.cursor-startproject', meta.cursorStart);
}

function setLabel(selector, content) {
  const el = document.querySelector(selector);
  if (el && content !== null && el.innerHTML !== content) el.innerHTML = content;
}

function normalizePath(path) {
  path = path.replace(/\/index\.html?$/i, '/');
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}

// Marks the links that point at the current page, in the shell and the
// container alike. The layout renders the same state for a direct load; this
// is the page-swap equivalent and also keeps aria-current honest.
function syncCurrentLinks() {
  const here = normalizePath(window.location.pathname);
  for (const a of document.querySelectorAll('a[href]')) {
    const raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#') continue;
    let url;
    try { url = new URL(raw, window.location.href); } catch (e) { continue; }
    if (url.origin !== window.location.origin) continue;
    const current = !url.hash && normalizePath(url.pathname) === here;
    a.classList.toggle('w--current', current);
    if (current) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

// The home page's black .cover is its first-load intro: IX2's initial state
// shows it, and the page-load interaction fades it out. On a swap the
// parallax transition is the intro, so the cover is parked in its resting
// state as soon as IX2 has applied its initial styles.
function parkCover() {
  const cover = document.querySelector('body > .cover');
  if (!cover) return;
  cover.style.display = 'none';
  cover.style.opacity = '0';
}

// -------------------------------------------------------------------------
// PAGE LIFECYCLE
// -------------------------------------------------------------------------
function createPage(container, meta, firstLoad) {
  const page = {
    container,
    meta,
    firstLoad,
    // Every tween and ScrollTrigger a feature creates for this page is
    // recorded here, so unmount can kill them all in one call.
    ctx: gsap.context(() => {}, container),
    isReady: false,
    // A page that mounts after the document has finished loading will never
    // see a readystatechange, so it gets IX2_PAGE_UPDATE when it settles.
    needsPageUpdate: document.readyState === 'complete',
    readyFns: [],
    cleanups: [],
    onReady(fn) {
      if (page.isReady) page.ctx.add(fn);
      else page.readyFns.push(fn);
    },
    onUnmount(fn) {
      page.cleanups.push(fn);
    },
  };
  return page;
}

function mountPage(container, meta, firstLoad) {
  const page = createPage(container, meta, firstLoad);
  activePage = page;

  applyShell(meta);
  syncCurrentLinks();
  webflow.mount(meta.pageId);
  if (!firstLoad) parkCover();

  pageFeatures.forEach((feature) => {
    page.ctx.add(() => {
      const cleanup = feature.mount(container, page);
      if (typeof cleanup === 'function') page.cleanups.push(cleanup);
    });
  });

  return page;
}

function readyPage(page) {
  if (page.isReady) return;
  page.isReady = true;
  const fns = page.readyFns;
  page.readyFns = [];
  page.ctx.add(() => {
    fns.forEach((fn) => fn());
  });
}

function unmountPage(page) {
  if (!page) return;
  page.cleanups.forEach((fn) => {
    try { fn(); } catch (e) { console.error('[app] page cleanup failed:', e); }
  });
  page.cleanups = [];
  page.readyFns = [];
  // kill(), not revert(): the container is already out of the document, and
  // reverting would touch styles for nothing.
  page.ctx.kill();
}

// The current page is about to be swapped out: freeze scrolling, put the
// persistent shell back to rest (menu closed, scroll lock released) and stop
// its interactions. Its container stays on screen for the transition.
function beginLeave() {
  leavingPage = activePage;
  activePage = null;
  lenis.stop();
  shellHooks.forEach((hooks) => {
    if (hooks.pageWillChange) hooks.pageWillChange();
  });
  webflow.unmount();
}

// The page is in normal flow and is the only container in the document.
function settlePage(page) {
  lenis.start();
  // Through Lenis as well as natively: Lenis owns the scroll position, and
  // moving it behind Lenis's back leaves the two disagreeing.
  window.scrollTo(0, 0);
  lenis.scrollTo(0, { immediate: true, force: true });
  lenis.resize();

  readyPage(page);
  ScrollTrigger.refresh();

  if (page.needsPageUpdate) webflow.pageUpdate();
}

// -------------------------------------------------------------------------
// BARBA
// -------------------------------------------------------------------------
function initBarba() {
  // beforeEnter runs for the first load as well as for every swap, once the
  // incoming container is in the DOM and before anything is painted.
  barba.hooks.beforeEnter((data) => {
    const swapping = !!(data.current && data.current.container);
    if (!swapping) {
      mountPage(data.next.container, pageMeta(document), true);
      return;
    }
    beginLeave();
    transition.pin(data.next.container);
    const nextDoc = new DOMParser().parseFromString(data.next.html, 'text/html');
    mountPage(data.next.container, pageMeta(nextDoc), false);
  });

  barba.init({
    debug: false,
    timeout: 7000,
    preventRunning: true,
    // Leave anything that is not a same-site page navigation to the browser.
    prevent({ el }) {
      if (!el) return false;
      if (el.classList.contains('no-transition')) return true;
      if (el.getAttribute('target') === '_blank') return true;
      const raw = el.getAttribute('href') || '';
      if (/^(mailto:|tel:|#)/i.test(raw)) return true;
      if (raw.indexOf('#') !== -1) return true;
      return false;
    },
    transitions: [{
      name: 'parallax',
      sync: true,

      // First load: the page is already in flow; play the intro loader.
      once() {
        transition.intro();
        settlePage(activePage);
      },

      // The transition moves both containers together, so it lives in one
      // place. Barba still awaits enter() before finishing the swap.
      leave() {},

      enter(data) {
        const page = activePage;
        return transition.swap(data.current.container, data.next.container).then(() => {
          // Out of the document before the new container rejoins normal
          // flow, or both would briefly stack and the scroll reset would
          // land on the old page.
          data.current.container.remove();
          unmountPage(leavingPage);
          leavingPage = null;
          transition.unpin(data.next.container);
          settlePage(page);
        });
      },
    }],
  });
}

// -------------------------------------------------------------------------
// BOOT - once per document
// -------------------------------------------------------------------------
export function boot() {
  history.scrollRestoration = 'manual';

  // The site's original Lenis settings.
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  shellFeatures.forEach((feature) => {
    const hooks = feature.mount();
    if (hooks) shellHooks.push(hooks);
  });

  initBarba();

  // Small read-only surface for debugging and tests.
  window.App = {
    page: () => activePage,
    lenis: () => lenis,
  };
}
