// IPHONE DUAL SLIDE-IN  (home page) - page feature
import { gsap, ScrollTrigger } from '../lib/gsap.js';

export const phoneSlideIn = {
  name: 'phoneSlideIn',
  mount(root, page) {
    const leftPhone = root.querySelector('.iphone-left');
    const rightPhone = root.querySelector('.iphone-right');
    const trigger = root.querySelector('.work-hover_trigger');
    if (!leftPhone || !rightPhone || !trigger) return;

    gsap.set(leftPhone, { xPercent: 125, opacity: 0 });
    gsap.set(rightPhone, { xPercent: -125, opacity: 0 });

    const phones = gsap.timeline({ paused: true })
      .to(leftPhone, { xPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0)
      .to(rightPhone, { xPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0);

    page.onReady(() => {
      ScrollTrigger.create({
        trigger,
        start: 'top 65%',
        end: 'bottom top',
        onEnter: () => { phones.play(0); },
        onEnterBack: () => { phones.play(0); },
        onLeave: () => { phones.reverse(); },
        onLeaveBack: () => { phones.reverse(); },
      });
    });
  },
};
