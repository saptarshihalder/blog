(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');

  const closeNav = ({ restoreFocus = false } = {}) => {
    if (!toggle || !nav) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('span').textContent = 'menu';
    document.body.classList.remove('nav-open');
    if (restoreFocus) toggle.focus();
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('span').textContent = open ? 'close' : 'menu';
      document.body.classList.toggle('nav-open', open);
    });

    nav.addEventListener('click', () => closeNav());

    window.addEventListener('resize', () => {
      if (window.innerWidth > 760 && nav.classList.contains('is-open')) {
        closeNav();
      }
    });
  }

  const bar = document.querySelector('#reading-progress-bar');
  if (bar) {
    const updateProgress = () => {
      const root = document.documentElement;
      const total = root.scrollHeight - root.clientHeight;
      const progress = total > 0 ? Math.min(1, root.scrollTop / total) : 0;
      bar.style.width = `${progress * 100}%`;
    };

    updateProgress();
    document.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
      closeNav({ restoreFocus: true });
    }
  });
})();
