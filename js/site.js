/* ---------------------------------------------------------------------------
   SITE FEATURES

   The site's own behaviours, as self-contained features that app.js mounts.
   Two kinds:

   Page features  - mount(container, page). Scoped to one Barba container.
                    Anything GSAP they create is recorded in the page's GSAP
                    context and killed on unmount; anything else they clean up
                    themselves by returning a function. Work that needs real
                    layout (scroll triggers) goes through page.onReady(), which
                    runs once the container is in normal flow at the top.

   Shell features - mount(). Bound once to the persistent shell outside the
                    container (menu, cursor). They may return
                    { pageWillChange } to put the shell back to rest before a
                    page swap.

   Behaviour and timings are the original inline scripts', unchanged.
--------------------------------------------------------------------------- */
(function (window, document) {
  'use strict';

  // =========================================================================
  // PAGE FEATURES
  // =========================================================================

  // -------------------------------------------------------------------------
  // TEXT SCROLL ANIMATIONS  (SplitType + GSAP ScrollTrigger)
  // -------------------------------------------------------------------------
  // Scroll-triggered reveals, keyed by the attribute Webflow put on the element.
  // Each entry animates .char or .word from the given state once the element
  // scrolls into view, and rewinds when it leaves past the bottom.
  var REVEALS = [
    ['words-slide-up',          '.char', { opacity: 0, yPercent: 100,  duration: 0.4,  ease: 'back.out(2)', stagger: { amount: 0.35 } }],
    ['sentence-slide-up',       '.word', { opacity: 0, yPercent: 100,  duration: 0.6,  ease: 'back.out(2)', stagger: { amount: 0 } }],
    ['words-rotate-in',         '.word', { rotationX: -90,             duration: 0.6,  ease: 'power2.out',  stagger: { amount: 0.6 } }, { transformPerspective: 1000 }],
    ['words-slide-from-right',  '.word', { opacity: 0, x: '1em',       duration: 0.8,  ease: 'power2.out',  stagger: { amount: 0.2 } }],
    ['letters-slide-up',        '.char', { yPercent: 100,              duration: 0.2,  ease: 'power1.out',  stagger: { amount: 0.6 } }],
    ['letters-slide-down',      '.char', { yPercent: -120,             duration: 0.3,  ease: 'power1.out',  stagger: { amount: 0.7 } }],
    ['letters-fade-in',         '.char', { opacity: 0,                 duration: 0.2,  ease: 'power1.out',  stagger: { amount: 0.8 } }],
    ['letters-fade-in-random',  '.char', { opacity: 0,                 duration: 0.05, ease: 'power1.out',  stagger: { amount: 0.4, from: 'random' } }]
  ];

  // Reveals tied directly to scroll position rather than played on entry.
  var SCRUBS = [
    ['scrub-each-word',        '.char', { opacity: 0.1, duration: 4,  ease: 'power1.out', stagger: { each: 1.5 } }, { start: 'top 76%', end: 'top center', scrub: true }],
    ['scrub-each-word-slower', '.char', { opacity: 0.1, duration: 15, ease: 'power2.out', stagger: { each: 1.2 } }, { start: 'top 80%', end: 'top 30%',   scrub: 1.5 }]
  ];

  var textReveals = {
    name: 'textReveals',
    mount: function (root, page) {
      var targets = root.querySelectorAll('[text-split]');
      if (!targets.length) return;

      var split = new SplitType(targets, { types: 'words, chars', tagName: 'span' });
      var reveals = [];   // [element, paused timeline]
      var scrubs = [];    // [element, paused timeline, trigger config]

      // The timelines are built now so the text sits in its pre-animation
      // state from the moment the page is visible (from() renders at once).
      REVEALS.forEach(function (cfg) {
        var attr = cfg[0], target = cfg[1], vars = cfg[2], preset = cfg[3];
        root.querySelectorAll('[' + attr + ']').forEach(function (el) {
          var parts = el.querySelectorAll(target);
          if (!parts.length) return;
          var tl = gsap.timeline({ paused: true });
          if (preset) tl.set(parts, preset);
          tl.from(parts, vars);
          reveals.push([el, tl]);
        });
      });

      SCRUBS.forEach(function (cfg) {
        var attr = cfg[0], target = cfg[1], vars = cfg[2], trigger = cfg[3];
        root.querySelectorAll('[' + attr + ']').forEach(function (el) {
          var parts = el.querySelectorAll(target);
          if (!parts.length) return;
          scrubs.push([el, gsap.timeline({ paused: true }).from(parts, vars), trigger]);
        });
      });

      // Avoid flash of unstyled content: the stylesheet hides [text-split]
      // until the split has happened.
      gsap.set(targets, { opacity: 1 });

      // Triggers are created once the page is in normal flow, so their start
      // positions are measured against the real layout.
      page.onReady(function () {
        reveals.forEach(function (r) {
          var el = r[0], tl = r[1];
          // Play on enter, rewind once scrolled back past the bottom of the screen.
          ScrollTrigger.create({
            trigger: el,
            start: 'top bottom',
            onLeaveBack: function () { tl.progress(0); tl.pause(); }
          });
          ScrollTrigger.create({
            trigger: el,
            start: 'top 80%',
            onEnter: function () { tl.play(); }
          });
        });

        scrubs.forEach(function (s) {
          ScrollTrigger.create({
            trigger: s[0],
            start: s[2].start,
            end: s[2].end,
            scrub: s[2].scrub,
            animation: s[1]
          });
        });
      });

      return function () { split.revert(); };
    }
  };

  // -------------------------------------------------------------------------
  // IPHONE DUAL SLIDE-IN  (home page)
  // -------------------------------------------------------------------------
  var phoneSlideIn = {
    name: 'phoneSlideIn',
    mount: function (root, page) {
      var leftPhone = root.querySelector('.iphone-left');
      var rightPhone = root.querySelector('.iphone-right');
      var trigger = root.querySelector('.work-hover_trigger');
      if (!leftPhone || !rightPhone || !trigger) return;

      gsap.set(leftPhone, { xPercent: 125, opacity: 0 });
      gsap.set(rightPhone, { xPercent: -125, opacity: 0 });

      var phones = gsap.timeline({ paused: true })
        .to(leftPhone, { xPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0)
        .to(rightPhone, { xPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0);

      page.onReady(function () {
        ScrollTrigger.create({
          trigger: trigger,
          start: 'top 65%',
          end: 'bottom top',
          onEnter: function () { phones.play(0); },
          onEnterBack: function () { phones.play(0); },
          onLeave: function () { phones.reverse(); },
          onLeaveBack: function () { phones.reverse(); }
        });
      });
    }
  };

  // =========================================================================
  // SHELL FEATURES
  // =========================================================================

  // -------------------------------------------------------------------------
  // MAGNET CURSOR
  // -------------------------------------------------------------------------
  var magnetCursor = {
    name: 'magnetCursor',
    mount: function () {
      var labels = [
        document.querySelector('.cursor-viewproject'),
        document.querySelector('.cursor-startproject')
      ].filter(Boolean);
      if (!labels.length) return;

      gsap.set(labels, { xPercent: 10, yPercent: 50 });

      var movers = labels.map(function (el) {
        return [
          gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' }),
          gsap.quickTo(el, 'y', { duration: 1, ease: 'power3' })
        ];
      });

      window.addEventListener('mousemove', function (e) {
        for (var i = 0; i < movers.length; i++) {
          movers[i][0](e.clientX);
          movers[i][1](e.clientY);
        }
      }, { passive: true });
    }
  };

  // -------------------------------------------------------------------------
  // SCROLL LOCK TOGGLE ON CLICK  ([scroll="both"] - the menu buttons)
  // Delegated, so it covers any such element in the shell or in a page.
  // -------------------------------------------------------------------------
  var scrollLock = {
    name: 'scrollLock',
    mount: function () {
      var body = document.body;
      var scrollPosition = 0;

      function isLocked() {
        return window.getComputedStyle(body).overflow === 'hidden';
      }

      function lock() {
        var oldWidth = body.clientWidth;
        scrollPosition = window.pageYOffset;
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = '-' + scrollPosition + 'px';
        body.style.width = oldWidth + 'px';
      }

      function unlock(restoreScroll) {
        body.style.overflow = '';
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        if (restoreScroll) window.scrollTo(0, scrollPosition);
      }

      document.addEventListener('click', function (e) {
        var target = e.target && e.target.closest ? e.target.closest('[scroll="both"]') : null;
        if (!target) return;
        if (isLocked()) unlock(true);
        else lock();
      });

      return {
        // The menu can be open, with the body scroll-locked, when a link is clicked.
        pageWillChange: function () { if (isLocked()) unlock(false); }
      };
    }
  };

  // -------------------------------------------------------------------------
  // SHOW/HIDE HAMBURGER MENU AFTER SCROLLING
  // -------------------------------------------------------------------------
  var hamburgerAutoHide = {
    name: 'hamburgerAutoHide',
    mount: function () {
      var hamburgerMenu = document.querySelector('#hamburger-menu');
      if (!hamburgerMenu) return;
      var body = document.body;

      hamburgerMenu.style.opacity = '0';
      hamburgerMenu.style.transform = 'scale(0)';
      hamburgerMenu.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

      var isMenuVisible = false;
      var pending = 0;

      function showMenu() {
        hamburgerMenu.style.opacity = '1';
        hamburgerMenu.style.transform = 'scale(1)';
        isMenuVisible = true;
      }
      function hideMenu() {
        hamburgerMenu.style.opacity = '0';
        hamburgerMenu.style.transform = 'scale(0)';
        isMenuVisible = false;
      }
      function isScrollDisabled() { return body.style.overflow === 'hidden'; }

      function update() {
        pending = 0;
        var scrollY = window.scrollY || window.pageYOffset;
        var triggerPoint = window.innerHeight * 2.2;
        if (scrollY >= triggerPoint && !isMenuVisible && !isScrollDisabled()) {
          showMenu();
        } else if (scrollY < triggerPoint && isMenuVisible && !isScrollDisabled()) {
          hideMenu();
        }
      }

      // Lenis emits scroll continuously, so keep at most one pending check.
      window.addEventListener('scroll', function () {
        if (!pending) pending = setTimeout(update, 50);
      }, { passive: true });

      hamburgerMenu.addEventListener('click', function () {
        if (isMenuVisible && isScrollDisabled()) showMenu();
      });

      return {
        // A new page starts at the top.
        pageWillChange: hideMenu
      };
    }
  };

  window.SiteFeatures = {
    shell: [magnetCursor, scrollLock, hamburgerAutoHide],
    page: [textReveals, phoneSlideIn]
  };
})(window, document);
