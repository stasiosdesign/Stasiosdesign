// SCROLL LOCK TOGGLE ON CLICK  ([scroll="both"] - the menu buttons) - shell feature
// Delegated, so it covers any such element in the shell or in a page.

export const scrollLock = {
  name: 'scrollLock',
  mount() {
    const body = document.body;
    let scrollPosition = 0;

    function isLocked() {
      return window.getComputedStyle(body).overflow === 'hidden';
    }

    function lock() {
      const oldWidth = body.clientWidth;
      scrollPosition = window.pageYOffset;
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollPosition}px`;
      body.style.width = `${oldWidth}px`;
    }

    function unlock(restoreScroll) {
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      if (restoreScroll) window.scrollTo(0, scrollPosition);
    }

    document.addEventListener('click', (e) => {
      const target = e.target && e.target.closest ? e.target.closest('[scroll="both"]') : null;
      if (!target) return;
      if (isLocked()) unlock(true);
      else lock();
    });

    return {
      // The menu can be open, with the body scroll-locked, when a link is clicked.
      pageWillChange() { if (isLocked()) unlock(false); },
    };
  },
};
