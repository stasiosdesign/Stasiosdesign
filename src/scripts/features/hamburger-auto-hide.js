// SHOW/HIDE HAMBURGER MENU AFTER SCROLLING - shell feature

export const hamburgerAutoHide = {
  name: 'hamburgerAutoHide',
  mount() {
    const hamburgerMenu = document.querySelector('#hamburger-menu');
    if (!hamburgerMenu) return;
    const body = document.body;

    hamburgerMenu.style.opacity = '0';
    hamburgerMenu.style.transform = 'scale(0)';
    hamburgerMenu.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

    let isMenuVisible = false;
    let pending = 0;

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
      const scrollY = window.scrollY || window.pageYOffset;
      const triggerPoint = window.innerHeight * 2.2;
      if (scrollY >= triggerPoint && !isMenuVisible && !isScrollDisabled()) {
        showMenu();
      } else if (scrollY < triggerPoint && isMenuVisible && !isScrollDisabled()) {
        hideMenu();
      }
    }

    // Lenis emits scroll continuously, so keep at most one pending check.
    window.addEventListener('scroll', () => {
      if (!pending) pending = setTimeout(update, 50);
    }, { passive: true });

    hamburgerMenu.addEventListener('click', () => {
      if (isMenuVisible && isScrollDisabled()) showMenu();
    });

    return {
      // A new page starts at the top.
      pageWillChange: hideMenu,
    };
  },
};
