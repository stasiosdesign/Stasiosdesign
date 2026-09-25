/* ---------------------------------------------------------------------------
   PAGE TRANSITION  (visuals only)

   Osmo's "Overlapping Parallax Page Transition", plus the site's first-load
   intro (the Webflow Lottie wipe, which is the site's loader rather than a
   page-to-page transition). This file animates containers and nothing else;
   app.js decides when a page mounts, settles and unmounts around it.

     pin(next)             fix the incoming container over the page
     swap(current, next)   play the transition; resolves once both have moved
     unpin(next)           hand the container back to normal flow
     intro()               first-load loader

   The incoming page slides up the full 100vh while the outgoing page moves
   up only 25vh, so the incoming page appears to pass over it; a dark overlay
   fades to 80% over the outgoing page to deepen that. Both run on the
   "parallax" custom ease over 1.2s. Reduced motion swaps immediately.
--------------------------------------------------------------------------- */
(function (window, document) {
  'use strict';

  var DURATION = 1.2;
  // Scroll lock while the loader plays, carried over from the original site.
  var INTRO_LOCK_MS = 1600;

  gsap.registerPlugin(CustomEase);
  CustomEase.create('osmo', '0.625, 0.05, 0, 1');
  CustomEase.create('parallax', '0.7, 0.05, 0.13, 1');
  gsap.defaults({ ease: 'osmo', duration: 0.6 });

  var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function pin(next) {
    gsap.set(next, { position: 'fixed', top: 0, left: 0, right: 0 });
  }

  function unpin(next) {
    gsap.set(next, { clearProps: 'position,top,left,right' });
  }

  function swap(current, next) {
    if (reducedMotionQuery.matches) {
      gsap.set(current, { autoAlpha: 0 });
      gsap.set(next, { autoAlpha: 1 });
      return Promise.resolve();
    }

    var wrap = document.querySelector('[data-transition-wrap]');
    var dark = wrap && wrap.querySelector('[data-transition-dark]');

    return new Promise(function (resolve) {
      var tl = gsap.timeline({ onComplete: resolve });

      if (wrap) tl.set(wrap, { zIndex: 2 }, 0);
      if (dark) tl.fromTo(dark, { autoAlpha: 0 }, { autoAlpha: 0.8, duration: DURATION, ease: 'parallax' }, 0);
      tl.fromTo(current, { y: '0vh' }, { y: '-25vh', duration: DURATION, ease: 'parallax' }, 0);

      tl.set(next, { zIndex: 3 }, 0);
      tl.fromTo(next, { y: '100vh' }, { y: '0vh', duration: DURATION, ease: 'parallax', clearProps: 'all' }, 0);

      if (dark) tl.set(dark, { autoAlpha: 0 }, DURATION);
    });
  }

  // The wipe is a Webflow interaction on the trigger's click, so it needs the
  // Webflow runtime to be ready.
  function intro() {
    var trigger = document.querySelector('.transition-trigger');
    if (!trigger) return;

    if (window.Webflow && typeof window.Webflow.push === 'function') {
      window.Webflow.push(function () { trigger.click(); });
    } else {
      trigger.click();
    }

    document.body.classList.add('no-scroll-transition');
    setTimeout(function () { document.body.classList.remove('no-scroll-transition'); }, INTRO_LOCK_MS);
  }

  window.PageTransition = {
    DURATION: DURATION,
    pin: pin,
    unpin: unpin,
    swap: swap,
    intro: intro
  };
})(window, document);
