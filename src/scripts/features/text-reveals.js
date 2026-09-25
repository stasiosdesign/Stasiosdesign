// TEXT SCROLL ANIMATIONS  (SplitType + GSAP ScrollTrigger) - page feature
import SplitType from 'split-type';
import { gsap, ScrollTrigger } from '../lib/gsap.js';

// Scroll-triggered reveals, keyed by the attribute Webflow put on the element.
// Each entry animates .char or .word from the given state once the element
// scrolls into view, and rewinds when it leaves past the bottom.
const REVEALS = [
  ['words-slide-up',          '.char', { opacity: 0, yPercent: 100,  duration: 0.4,  ease: 'back.out(2)', stagger: { amount: 0.35 } }],
  ['sentence-slide-up',       '.word', { opacity: 0, yPercent: 100,  duration: 0.6,  ease: 'back.out(2)', stagger: { amount: 0 } }],
  ['words-rotate-in',         '.word', { rotationX: -90,             duration: 0.6,  ease: 'power2.out',  stagger: { amount: 0.6 } }, { transformPerspective: 1000 }],
  ['words-slide-from-right',  '.word', { opacity: 0, x: '1em',       duration: 0.8,  ease: 'power2.out',  stagger: { amount: 0.2 } }],
  ['letters-slide-up',        '.char', { yPercent: 100,              duration: 0.2,  ease: 'power1.out',  stagger: { amount: 0.6 } }],
  ['letters-slide-down',      '.char', { yPercent: -120,             duration: 0.3,  ease: 'power1.out',  stagger: { amount: 0.7 } }],
  ['letters-fade-in',         '.char', { opacity: 0,                 duration: 0.2,  ease: 'power1.out',  stagger: { amount: 0.8 } }],
  ['letters-fade-in-random',  '.char', { opacity: 0,                 duration: 0.05, ease: 'power1.out',  stagger: { amount: 0.4, from: 'random' } }],
];

// Reveals tied directly to scroll position rather than played on entry.
const SCRUBS = [
  ['scrub-each-word',        '.char', { opacity: 0.1, duration: 4,  ease: 'power1.out', stagger: { each: 1.5 } }, { start: 'top 76%', end: 'top center', scrub: true }],
  ['scrub-each-word-slower', '.char', { opacity: 0.1, duration: 15, ease: 'power2.out', stagger: { each: 1.2 } }, { start: 'top 80%', end: 'top 30%',   scrub: 1.5 }],
];

export const textReveals = {
  name: 'textReveals',
  mount(root, page) {
    const targets = root.querySelectorAll('[text-split]');
    if (!targets.length) return;

    const split = new SplitType(targets, { types: 'words, chars', tagName: 'span' });
    const reveals = [];   // [element, paused timeline]
    const scrubs = [];    // [element, paused timeline, trigger config]

    // The timelines are built now so the text sits in its pre-animation
    // state from the moment the page is visible (from() renders at once).
    REVEALS.forEach(([attr, target, vars, preset]) => {
      root.querySelectorAll(`[${attr}]`).forEach((el) => {
        const parts = el.querySelectorAll(target);
        if (!parts.length) return;
        const tl = gsap.timeline({ paused: true });
        if (preset) tl.set(parts, preset);
        tl.from(parts, vars);
        reveals.push([el, tl]);
      });
    });

    SCRUBS.forEach(([attr, target, vars, trigger]) => {
      root.querySelectorAll(`[${attr}]`).forEach((el) => {
        const parts = el.querySelectorAll(target);
        if (!parts.length) return;
        scrubs.push([el, gsap.timeline({ paused: true }).from(parts, vars), trigger]);
      });
    });

    // Avoid flash of unstyled content: the stylesheet hides [text-split]
    // until the split has happened.
    gsap.set(targets, { opacity: 1 });

    // Triggers are created once the page is in normal flow, so their start
    // positions are measured against the real layout.
    page.onReady(() => {
      reveals.forEach(([el, tl]) => {
        // Play on enter, rewind once scrolled back past the bottom of the screen.
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          onLeaveBack: () => { tl.progress(0); tl.pause(); },
        });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          onEnter: () => { tl.play(); },
        });
      });

      scrubs.forEach(([el, tl, trigger]) => {
        ScrollTrigger.create({
          trigger: el,
          start: trigger.start,
          end: trigger.end,
          scrub: trigger.scrub,
          animation: tl,
        });
      });
    });

    return () => { split.revert(); };
  },
};
