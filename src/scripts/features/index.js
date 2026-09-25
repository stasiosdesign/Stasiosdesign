/* ---------------------------------------------------------------------------
   SITE FEATURES

   The site's own behaviours, as self-contained features that app.js mounts.

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
--------------------------------------------------------------------------- */
import { textReveals } from './text-reveals.js';
import { phoneSlideIn } from './phone-slide-in.js';
import { forms } from './forms.js';
import { magnetCursor } from './magnet-cursor.js';
import { scrollLock } from './scroll-lock.js';
import { hamburgerAutoHide } from './hamburger-auto-hide.js';

export const shellFeatures = [magnetCursor, scrollLock, hamburgerAutoHide];
export const pageFeatures = [textReveals, phoneSlideIn, forms];
