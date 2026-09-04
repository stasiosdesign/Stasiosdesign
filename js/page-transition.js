/* ---------------------------------------------------------------------------
   OVERLAPPING PARALLAX PAGE TRANSITION

   Osmo's Barba.js boilerplate + "Overlapping Parallax Page Transition",
   adapted to this site. Replaces the previous Webflow transition, which
   intercepted link clicks, played a Lottie wipe and then did a full page load.

   The new page slides up the full 100vh while the outgoing page moves up only
   25vh, so the incoming page appears to pass over it; a dark overlay fades to
   80% over the outgoing page to deepen that. Both run on the "parallax" custom
   ease over 1.2s.

   Site-specific adaptations, all in syncShellFromNextPage() and the Webflow
   hooks below:

   * Webflow's IX2 scopes its element selectors by <html data-wf-page>, so that
     attribute has to be swapped to the incoming page's id before IX2 is
     re-initialised, or the new page's interactions never bind.
   * IX2 is re-initialised with the raw data already in its store, since Barba
     never re-runs webflow.js.
   * A few parts of the persistent shell differ per page and would otherwise be
     stuck on whichever page was loaded first: the <body> class, the .cover
     overlay (home page only - IX2 resets it to opaque black, which blanks the
     site if it is left behind), and the two magnetic-cursor labels.

   The first-load Webflow intro (the Lottie wipe) is deliberately kept - it is
   the site's loader, not part of the page-to-page transition. It runs once,
   from initOnceFunctions().
--------------------------------------------------------------------------- */

gsap.registerPlugin(CustomEase, ScrollTrigger);

history.scrollRestoration = 'manual';

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== 'undefined';
const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

const rmMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.('change', e => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);

let durationDefault = 0.6;

CustomEase.create('osmo', '0.625, 0.05, 0, 1');
CustomEase.create('parallax', '0.7, 0.05, 0.13, 1');
gsap.defaults({ ease: 'osmo', duration: durationDefault });

// Intro loader timing, carried over from the original transition script.
const introDurationMS = 1600;

// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;

  captureIx2RawData();

  // Bound to the persistent shell, so these only ever need binding once.
  SiteBehaviours.initMagnetCursor();
  SiteBehaviours.initScrollLockToggle();
  SiteBehaviours.initHamburgerAutoHide();

  playIntroLoader();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;

  // Built before the page slides in, so text starts in its pre-animation state.
  SiteBehaviours.initTextAnimations(nextPage);
  if (has('.iphone-left')) SiteBehaviours.initPhoneSlideIn(nextPage);
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  if (hasLenis && lenis) lenis.resize();
  if (hasScrollTrigger) ScrollTrigger.refresh();
}

// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
  const tl = gsap.timeline({ paused: true });

  tl.call(() => {
    resetPage(next);
  }, null, 0);

  // Run it now rather than waiting on a ticker frame, and resolve immediately.
  // The once "animation" is a zero-duration reset, but requestAnimationFrame is
  // suspended in a background tab - and with preventRunning on, an unfinished
  // once leaves Barba thinking a transition is still running, which silently
  // swallows every link click until the tab is focused.
  tl.progress(1);

  return Promise.resolve();
}

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector('[data-transition-wrap]');
  const transitionDark = transitionWrap.querySelector('[data-transition-dark]');

  const tl = gsap.timeline({
    onComplete: () => {
      current.remove();
    }
  });

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(current, { autoAlpha: 0 });
  }

  tl.set(transitionWrap, {
    zIndex: 2
  });

  tl.fromTo(transitionDark, {
    autoAlpha: 0
  }, {
    autoAlpha: 0.8,
    duration: 1.2,
    ease: 'parallax'
  }, 0);

  tl.fromTo(current, {
    y: '0vh'
  }, {
    y: '-25vh',
    duration: 1.2,
    ease: 'parallax'
  }, 0);

  tl.set(transitionDark, {
    autoAlpha: 0
  });

  return tl;
}

function runPageEnterAnimation(next) {
  const tl = gsap.timeline();

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add('pageReady');
    tl.call(resetPage, [next], 'pageReady');
    return new Promise(resolve => tl.call(resolve, null, 'pageReady'));
  }

  tl.add('startEnter', 0);

  tl.set(next, {
    zIndex: 3
  });

  tl.fromTo(next, {
    y: '100vh'
  }, {
    y: '0vh',
    duration: 1.2,
    clearProps: 'all',
    ease: 'parallax'
  }, 'startEnter');

  tl.add('pageReady');
  tl.call(resetPage, [next], 'pageReady');

  return new Promise(resolve => {
    tl.call(resolve, null, 'pageReady');
  });
}

// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter(data => {
  // Position new container on top - only when there is an outgoing page to
  // overlap. Doing it on first load collapses the document height, which
  // leaves Webflow's scroll-driven interactions stuck at full progress (the
  // home page hero would load already zoomed in).
  if (data.current && data.current.container) {
    gsap.set(data.next.container, {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0
    });
  }

  if (lenis && typeof lenis.stop === 'function') {
    lenis.stop();
  }

  // Only on a real page swap. On first load webflow.js has just wired
  // everything up correctly, and tearing that down would leave IX2 dead.
  if (data.current && data.current.container) {
    // Must happen before IX2 is re-initialised: it decides which elements to
    // bind from <html data-wf-page>.
    syncShellFromNextPage(data);
    reinitWebflow();
  }

  // Retire the outgoing page's ScrollTriggers here rather than in afterLeave.
  // This transition is sync, so afterLeave runs *after* beforeEnter - killing
  // them there would wipe the triggers initBeforeEnterFunctions is about to
  // create for the incoming page, leaving it with no scroll animations at all.
  if (hasScrollTrigger) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  initBeforeEnterFunctions(data.next.container);
});

barba.hooks.enter(data => {
  initBarbaNavUpdate(data);
});

barba.hooks.afterEnter(data => {
  // Run page functions
  initAfterEnterFunctions(data.next.container);

  // Settle
  if (hasLenis && lenis) {
    lenis.resize();
    lenis.start();
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

barba.init({
  debug: false,
  timeout: 7000,
  preventRunning: true,
  // Leave anything that is not a same-site page navigation to the browser.
  prevent: ({ el, href }) => {
    if (!el) return false;
    if (el.classList.contains('no-transition')) return true;
    if (el.getAttribute('target') === '_blank') return true;
    const raw = el.getAttribute('href') || '';
    if (/^(mailto:|tel:|#)/i.test(raw)) return true;
    if (raw.indexOf('#') !== -1) return true;
    return false;
  },
  transitions: [
    {
      name: 'default',
      sync: true,

      // First load. The beforeEnter/afterEnter hooks also run for `once`, so
      // the page init functions are left to them rather than called twice.
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimation(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      }
    }
  ]
});

// -----------------------------------------
// WEBFLOW INTEGRATION
// -----------------------------------------

let ix2RawData = null;

// IX2's init() needs the raw interaction data, and webflow.js only supplies it
// once at load. It survives on the store, so keep a reference to replay later.
function captureIx2RawData() {
  const ix2 = window.Webflow && window.Webflow.require && window.Webflow.require('ix2');
  if (!ix2 || !ix2.store) return;
  ix2RawData = ix2.store.getState().ixData;
}

function reinitWebflow() {
  if (!window.Webflow) return;

  // Belt and braces: never tear Webflow down without the data needed to
  // rebuild IX2.
  if (!ix2RawData) captureIx2RawData();
  if (!ix2RawData) return;

  // Rebinds the Webflow modules (forms, links / w--current, lottie) against the
  // new DOM.
  try { window.Webflow.destroy(); } catch (e) {}
  try { window.Webflow.ready(); } catch (e) {}

  const ix2 = window.Webflow.require && window.Webflow.require('ix2');
  if (ix2 && ix2RawData) {
    try {
      ix2.destroy();
      ix2.init(ix2RawData);
    } catch (e) {
      console.warn('[page-transition] IX2 re-init failed:', e);
    }
  }

  // The contact form lives inside the container, so its handler has to be
  // rebound after every swap.
  if (window.SiteForms && typeof window.SiteForms.init === 'function') {
    window.SiteForms.init();
  }
}

// Parts of the persistent shell that differ per page.
function syncShellFromNextPage(data) {
  const html = data && data.next && data.next.html;
  if (!html) return;

  const doc = new DOMParser().parseFromString(html, 'text/html');

  // IX2 scopes element selectors by page id.
  const wfPage = doc.documentElement.getAttribute('data-wf-page');
  if (wfPage) document.documentElement.setAttribute('data-wf-page', wfPage);

  // Page-level styling hangs off the body class (body-2, body-8, body-9 ...).
  document.body.className = doc.body.className;

  // .cover only exists on the home page. IX2 resets it to opaque black at
  // full z-index, so a leftover one blanks every other page.
  const nextCover = doc.querySelector('body > .cover');
  const currentCover = document.querySelector('body > .cover');
  if (nextCover && !currentCover) {
    document.body.insertBefore(document.importNode(nextCover, true), document.body.firstChild);
  } else if (!nextCover && currentCover) {
    currentCover.remove();
  } else if (nextCover && currentCover) {
    currentCover.replaceWith(document.importNode(nextCover, true));
  }

  // The magnetic-cursor labels are per page ("[View Project]", "[View Next
  // Project]", "[Start Your Project]" ...).
  ['.cursor-viewproject', '.cursor-startproject'].forEach(sel => {
    const nextEl = doc.querySelector(sel);
    const curEl = document.querySelector(sel);
    if (nextEl && curEl) curEl.innerHTML = nextEl.innerHTML;
  });

  // The menu can be open, with the body scroll-locked, when a link is clicked.
  SiteBehaviours.releaseScrollLock();
  if (typeof SiteBehaviours.resetHamburger === 'function') SiteBehaviours.resetHamburger();
}

// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

// The site's original Lenis settings, kept as they were.
function initLenis() {
  if (lenis) return; // already created
  if (!hasLenis) return;

  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.9
  });

  if (hasScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
  // Put the container back in normal flow before measuring or scrolling.
  gsap.set(container, { clearProps: 'position,top,left,right' });

  if (hasLenis && lenis) {
    lenis.resize();
    lenis.start();
    // Reset through Lenis, not window.scrollTo: Lenis owns the scroll position,
    // and setting it behind Lenis's back leaves it and Webflow's scroll-driven
    // interactions disagreeing - which strands the home page hero mid-zoom.
    lenis.scrollTo(0, { immediate: true, force: true });
  } else {
    window.scrollTo(0, 0);
  }

  // Webflow's scroll-driven interactions only recompute on a scroll event, so
  // nudge them to settle at the new position.
  window.dispatchEvent(new Event('scroll'));
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
  var currentNodes = document.querySelectorAll('nav [data-barba-update]');

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;

    // Aria-current sync
    var newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) {
      curr.setAttribute('aria-current', newStatus);
    } else {
      curr.removeAttribute('aria-current');
    }

    // Class list sync
    var newClassList = next.getAttribute('class') || '';
    curr.setAttribute('class', newClassList);
  });
}

// -----------------------------------------
// FIRST-LOAD LOADER (kept from the original site)
// -----------------------------------------

function playIntroLoader() {
  const $ = window.jQuery;
  const trigger = $ && $('.transition-trigger');
  if (!trigger || !trigger.length) return;

  window.Webflow && window.Webflow.push(function () {
    trigger.click();
  });

  $('body').addClass('no-scroll-transition');
  setTimeout(() => { $('body').removeClass('no-scroll-transition'); }, introDurationMS);
}
