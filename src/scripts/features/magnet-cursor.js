// MAGNET CURSOR - shell feature
// The "[View Project]" style labels that trail the pointer.
import { gsap } from '../lib/gsap.js';

export const magnetCursor = {
  name: 'magnetCursor',
  mount() {
    const labels = [
      document.querySelector('.cursor-viewproject'),
      document.querySelector('.cursor-startproject'),
    ].filter(Boolean);
    if (!labels.length) return;

    gsap.set(labels, { xPercent: 10, yPercent: 50 });

    const movers = labels.map((el) => [
      gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' }),
      gsap.quickTo(el, 'y', { duration: 1, ease: 'power3' }),
    ]);

    window.addEventListener('mousemove', (e) => {
      for (const [moveX, moveY] of movers) {
        moveX(e.clientX);
        moveY(e.clientY);
      }
    }, { passive: true });
  },
};
