/* ---------------------------------------------------------------------------
   SITE BEHAVIOURS

   These are the site's own scripts, previously inlined at the bottom of every
   page. Barba swaps the page container without reloading the document, so the
   ones that touch page content have to be re-runnable and scoped to the
   container being swapped in - otherwise they would either stop working after
   the first navigation, or (during a transition, when both the outgoing and
   incoming containers are in the DOM at once) bind to the wrong page.

   Behaviour and timings are unchanged from the original inline scripts.

   Per page   : initTextAnimations, initPhoneSlideIn  - take the new container
   Once only  : initMagnetCursor, initScrollLockToggle, initHamburgerAutoHide
                - these bind to the persistent shell outside the container
--------------------------------------------------------------------------- */
(function (window, document) {
  'use strict';

  var site = {};

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

  site.initTextAnimations = function (root) {
    root = root || document;
    if (typeof SplitType === 'undefined' || typeof gsap === 'undefined') return;

    var splitTargets = root.querySelectorAll('[text-split]');
    if (splitTargets.length) {
      new SplitType(splitTargets, { types: 'words, chars', tagName: 'span' });
    }

    // Play on enter, rewind once scrolled back past the bottom of the screen.
    function playOnEnter(el, timeline) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        onLeaveBack: function () { timeline.progress(0); timeline.pause(); }
      });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: function () { timeline.play(); }
      });
    }

    // Selectors are scoped to the incoming container: during a transition the
    // outgoing page is still in the DOM and would otherwise match too.
    REVEALS.forEach(function (cfg) {
      var attr = cfg[0], target = cfg[1], vars = cfg[2], preset = cfg[3];
      root.querySelectorAll('[' + attr + ']').forEach(function (el) {
        var parts = el.querySelectorAll(target);
        if (!parts.length) return;
        var tl = gsap.timeline({ paused: true });
        if (preset) tl.set(parts, preset);
        tl.from(parts, vars);
        playOnEnter(el, tl);
      });
    });

    SCRUBS.forEach(function (cfg) {
      var attr = cfg[0], target = cfg[1], vars = cfg[2], trigger = cfg[3];
      root.querySelectorAll('[' + attr + ']').forEach(function (el) {
        var parts = el.querySelectorAll(target);
        if (!parts.length) return;
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: trigger.start,
            end: trigger.end,
            scrub: trigger.scrub
          }
        }).from(parts, vars);
      });
    });

    // Avoid flash of unstyled content
    if (splitTargets.length) gsap.set(splitTargets, { opacity: 1 });
  };

  // -------------------------------------------------------------------------
  // IPHONE DUAL SLIDE-IN  (home page)
  // -------------------------------------------------------------------------
  site.initPhoneSlideIn = function (root) {
    root = root || document;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    var leftPhone = root.querySelector('.iphone-left');
    var rightPhone = root.querySelector('.iphone-right');
    var trigger = root.querySelector('.work-hover_trigger');
    if (!leftPhone || !rightPhone || !trigger) return;

    gsap.set(leftPhone, { xPercent: 125, opacity: 0 });
    gsap.set(rightPhone, { xPercent: -125, opacity: 0 });

    var phonesAnimation = gsap.timeline({ paused: true });
    phonesAnimation
      .to(leftPhone, { xPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0)
      .to(rightPhone, { xPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0);

    ScrollTrigger.create({
      trigger: trigger,
      start: 'top 65%',
      end: 'bottom top',
      onEnter: function () { phonesAnimation.play(0); },
      onEnterBack: function () { phonesAnimation.play(0); },
      onLeave: function () { phonesAnimation.reverse(); },
      onLeaveBack: function () { phonesAnimation.reverse(); },
      markers: false
    });
  };

  // -------------------------------------------------------------------------
  // MAGNET CURSOR  (persistent shell - bind once)
  // -------------------------------------------------------------------------
  site.initMagnetCursor = function () {
    if (typeof gsap === 'undefined') return;
    if (!document.querySelector('.cursor-viewproject')) return;

    gsap.set('.cursor-viewproject', { xPercent: 10, yPercent: 50 });
    gsap.set('.cursor-startproject', { xPercent: 10, yPercent: 50 });

    var xToView = gsap.quickTo('.cursor-viewproject', 'x', { duration: 1, ease: 'power3' });
    var yToView = gsap.quickTo('.cursor-viewproject', 'y', { duration: 1, ease: 'power3' });
    var xToStart = gsap.quickTo('.cursor-startproject', 'x', { duration: 1, ease: 'power3' });
    var yToStart = gsap.quickTo('.cursor-startproject', 'y', { duration: 1, ease: 'power3' });

    window.addEventListener('mousemove', function (e) {
      xToView(e.clientX); yToView(e.clientY);
      xToStart(e.clientX); yToStart(e.clientY);
    }, { passive: true });
  };

  // -------------------------------------------------------------------------
  // SCROLL DISABLE TOGGLE ON CLICK  (persistent shell - bind once)
  // Delegated so it keeps working for any [scroll="both"] added later.
  // -------------------------------------------------------------------------
  site.initScrollLockToggle = function () {
    var $ = window.jQuery;
    if (!$) return;
    var $body = $(document.body);
    var scrollPosition = 0;

    $(document).on('click', '[scroll="both"]', function () {
      if ($body.css('overflow') !== 'hidden') {
        var oldWidth = $body.innerWidth();
        scrollPosition = window.pageYOffset;
        $body.css('overflow', 'hidden');
        $body.css('position', 'fixed');
        $body.css('top', '-' + scrollPosition + 'px');
        $body.width(oldWidth);
      } else {
        $body.css('overflow', '');
        $body.css('position', '');
        $body.css('top', '');
        $body.width('');
        $(window).scrollTop(scrollPosition);
      }
    });
  };

  // Release a scroll lock left over when the menu navigates away.
  site.releaseScrollLock = function () {
    var $ = window.jQuery;
    if (!$) return;
    var $body = $(document.body);
    if ($body.css('overflow') === 'hidden') {
      $body.css('overflow', '');
      $body.css('position', '');
      $body.css('top', '');
      $body.width('');
    }
  };

  // -------------------------------------------------------------------------
  // SHOW/HIDE HAMBURGER MENU AFTER SCROLLING  (persistent shell - bind once)
  // -------------------------------------------------------------------------
  site.initHamburgerAutoHide = function () {
    var hamburgerMenu = document.querySelector('#hamburger-menu');
    if (!hamburgerMenu) return;
    var body = document.body;

    hamburgerMenu.style.opacity = '0';
    hamburgerMenu.style.transform = 'scale(0)';
    hamburgerMenu.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

    var isMenuVisible = false;

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

    // The original scheduled a fresh 50ms timer on every scroll event, so a
    // single flick queued hundreds of them. Lenis emits scroll continuously,
    // so keep at most one pending check - same settled result, far less work.
    var pending = 0;
    window.addEventListener('scroll', function () {
      if (!pending) pending = setTimeout(update, 50);
    }, { passive: true });

    hamburgerMenu.addEventListener('click', function () {
      if (isMenuVisible && isScrollDisabled()) showMenu();
    });

    // A new page starts at the top, so reset to hidden after each navigation.
    site.resetHamburger = hideMenu;
  };

  window.SiteBehaviours = site;
})(window, document);
