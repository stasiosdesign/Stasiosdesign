/* ---------------------------------------------------------------------------
   WEBFLOW ADAPTER

   Webflow is treated as one component with two halves.

   The runtime (src/vendor/webflow-runtime.js) is document-scoped vendor code:
   links, forms, Lottie, touch and focus handling, bound once at DOM ready and
   never touched again. Its trailing `Webflow.require("ix2").init({...})` call
   was removed so that the second half can be driven from here.

   The IX2 interaction engine is page-scoped: element targets are
   "<pageId>|<elementId>", resolved against <html data-wf-page>. It is
   (re)initialised from the raw export in src/data/webflow-interactions.json on
   every page mount - exactly what Webflow's own runtime did at the end of a
   full page load - and destroyed when the page leaves.
--------------------------------------------------------------------------- */
import './lib/jquery-global.js';
import '../vendor/webflow-runtime.js';
import ix2Data from '../data/webflow-interactions.json';

const html = document.documentElement;
const Webflow = window.Webflow;
const ix2 = Webflow && Webflow.require && Webflow.require('ix2');

export const webflow = {
  // init() stops any running engine first.
  mount(pageId) {
    if (pageId) html.setAttribute('data-wf-page', pageId);
    if (ix2) ix2.init(ix2Data);
  },

  unmount() {
    if (ix2) ix2.destroy();
  },

  // IX2 evaluates its page-load (PAGE_START / PAGE_FINISH) and scroll-driven
  // events on readystatechange and on this event. A full load gets the former
  // from the browser; a swapped-in page gets this instead.
  pageUpdate() {
    document.dispatchEvent(new CustomEvent('IX2_PAGE_UPDATE'));
  },

  // Runs fn once the runtime's document-level modules are bound.
  ready(fn) {
    if (Webflow && typeof Webflow.push === 'function') Webflow.push(fn);
    else fn();
  },
};
