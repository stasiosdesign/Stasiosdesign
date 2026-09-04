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
  site.initTextAnimations = function (root) {
    root = root || document;
    if (typeof SplitType === 'undefined' || typeof gsap === 'undefined') return;

    var splitTargets = root.querySelectorAll('[text-split]');
    if (splitTargets.length) {
      new SplitType(splitTargets, { types: 'words, chars', tagName: 'span' });
    }

    // Scope every selector to the incoming container: during a transition the
    // outgoing page is still in the DOM and would otherwise match too.
    var $root = window.jQuery(root);
    var find = function (sel) { return $root.find(sel); };

    function createScrollTrigger(triggerElement, timeline) {
      ScrollTrigger.create({
        trigger: triggerElement,
        start: 'top bottom',
        onLeaveBack: function () { timeline.progress(0); timeline.pause(); }
      });
      ScrollTrigger.create({
        trigger: triggerElement,
        start: 'top 80%',
        onEnter: function () { timeline.play(); }
      });
    }

    find('[words-slide-up]').each(function () {
      var tl = gsap.timeline({ paused: true });
      tl.from(window.jQuery(this).find('.char'), { opacity: 0, yPercent: 100, duration: 0.4, ease: 'back.out(2)', stagger: { amount: 0.35 } });
      createScrollTrigger(window.jQuery(this), tl);
    });
    find('[sentence-slide-up]').each(function () {
      var tl = gsap.timeline({ paused: true });
      tl.from(window.jQuery(this).find('.word'), { opacity: 0, yPercent: 100, duration: 0.6, ease: 'back.out(2)', stagger: { amount: 0 } });
      createScrollTrigger(window.jQuery(this), tl);
    });
    find('[words-rotate-in]').each(function () {
      var tl = gsap.timeline({ paused: true });
      tl.set(window.jQuery(this).find('.word'), { transformPerspective: 1000 });
      tl.from(window.jQuery(this).find('.word'), { rotationX: -90, duration: 0.6, ease: 'power2.out', stagger: { amount: 0.6 } });
      createScrollTrigger(window.jQuery(this), tl);
    });
    find('[words-slide-from-right]').each(function () {
      var tl = gsap.timeline({ paused: true });
      tl.from(window.jQuery(this).find('.word'), { opacity: 0, x: '1em', duration: 0.8, ease: 'power2.out', stagger: { amount: 0.2 } });
      createScrollTrigger(window.jQuery(this), tl);
    });
    find('[letters-slide-up]').each(function () {
      var tl = gsap.timeline({ paused: true });
      tl.from(window.jQuery(this).find('.char'), { yPercent: 100, duration: 0.2, ease: 'power1.out', stagger: { amount: 0.6 } });
      createScrollTrigger(window.jQuery(this), tl);
    });
    find('[letters-slide-down]').each(function () {
      var tl = gsap.timeline({ paused: true });
      tl.from(window.jQuery(this).find('.char'), { yPercent: -120, duration: 0.3, ease: 'power1.out', stagger: { amount: 0.7 } });
      createScrollTrigger(window.jQuery(this), tl);
    });
    find('[letters-fade-in]').each(function () {
      var tl = gsap.timeline({ paused: true });
      tl.from(window.jQuery(this).find('.char'), { opacity: 0, duration: 0.2, ease: 'power1.out', stagger: { amount: 0.8 } });
      createScrollTrigger(window.jQuery(this), tl);
    });
    find('[letters-fade-in-random]').each(function () {
      var tl = gsap.timeline({ paused: true });
      tl.from(window.jQuery(this).find('.char'), { opacity: 0, duration: 0.05, ease: 'power1.out', stagger: { amount: 0.4, from: 'random' } });
      createScrollTrigger(window.jQuery(this), tl);
    });
    find('[scrub-each-word]').each(function () {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: window.jQuery(this), start: 'top 76%', end: 'top center', scrub: true }
      });
      tl.from(window.jQuery(this).find('.char'), { opacity: 0.1, duration: 4, ease: 'power1.out', stagger: { each: 1.5 } });
    });
    find('[scrub-each-word-slower]').each(function () {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: window.jQuery(this), start: 'top 80%', end: 'top 30%', scrub: 1.5 }
      });
      tl.from(window.jQuery(this).find('.char'), { opacity: 0.1, duration: 15, ease: 'power2.out', stagger: { each: 1.2 } });
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
    });
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

    window.addEventListener('scroll', function () {
      setTimeout(function () {
        var scrollY = window.scrollY || window.pageYOffset;
        var triggerPoint = window.innerHeight * 2.2;
        if (scrollY >= triggerPoint && !isMenuVisible && !isScrollDisabled()) {
          showMenu();
        } else if (scrollY < triggerPoint && isMenuVisible && !isScrollDisabled()) {
          hideMenu();
        }
      }, 50);
    });

    hamburgerMenu.addEventListener('click', function () {
      if (isMenuVisible && isScrollDisabled()) showMenu();
    });

    // A new page starts at the top, so reset to hidden after each navigation.
    site.resetHamburger = hideMenu;
  };

  window.SiteBehaviours = site;
})(window, document);
