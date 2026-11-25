/* ==========================================================================
   Zharif Asyam Ghani - Home Page Interactions
   1. Radial "bubble-in" (menggelembung masuk) Light/Dark theme switch
   2. Mobile menu drawer & scroll-spy navigation
   3. Button ripple micro-interaction & Email copy action
   4. About Me photo loading/error states + Biodata tabs skeleton shimmer
   ========================================================================== */

(function () {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeButtons = document.querySelectorAll('[data-theme-choice]');
  const bubbleOverlay = document.getElementById('theme-bubble-overlay');

  const TAB_DATA = {
    identitas: [
      { label: 'Nama Lengkap', value: 'Zharif Asyam Ghani' },
      { label: 'Kelas & Absen', value: 'XI TEK 3, Nomor 35' },
      { label: 'Kota Kelahiran', value: 'Semarang' }
    ],
    teknologi: [
      { label: 'Bidang Utama', value: 'Pemrograman (Coding)' },
      { label: 'Perangkat Keras', value: 'Desain PCB' },
      { label: 'Tujuan', value: 'Meningkatkan kemampuan & kreativitas teknologi' }
    ],
    hobi: [
      { label: 'Waktu Luang', value: 'Bermain Game' },
      { label: 'Relaksasi', value: 'Mendengarkan Musik' },
      { label: 'Kebiasaan', value: 'Senang mempelajari hal-hal baru' }
    ]
  };

  function getCurrentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncThemeButtons(theme) {
    themeButtons.forEach(function (btn) {
      const active = btn.getAttribute('data-theme-choice') === theme;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function persistTheme(theme) {
    try {
      localStorage.setItem('zharif-theme', theme);
    } catch (e) {}
  }

  function applyThemeState(theme) {
    root.setAttribute('data-theme', theme);
    syncThemeButtons(theme);
    persistTheme(theme);
  }

  function getOriginPoint(triggerEl) {
    if (!triggerEl) {
      return { x: window.innerWidth / 2, y: 36 };
    }
    const rect = triggerEl.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function switchThemeWithBubble(nextTheme, triggerEl) {
    if (getCurrentTheme() === nextTheme) {
      return;
    }

    if (prefersReducedMotion.matches) {
      applyThemeState(nextTheme);
      return;
    }

    const origin = getOriginPoint(triggerEl);
    const maxRadius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y)
    );

    if (typeof document.startViewTransition === 'function') {
      const transition = document.startViewTransition(function () {
        applyThemeState(nextTheme);
      });

      transition.ready.then(function () {
        document.documentElement.animate(
          {
            clipPath: [
              'circle(0px at ' + origin.x + 'px ' + origin.y + 'px)',
              'circle(' + maxRadius + 'px at ' + origin.x + 'px ' + origin.y + 'px)'
            ]
          },
          {
            duration: 620,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      }).catch(function () {});
      return;
    }

    if (bubbleOverlay && typeof bubbleOverlay.animate === 'function') {
      bubbleOverlay.style.backgroundColor = nextTheme === 'dark' ? '#0E1116' : '#F5F3EE';
      bubbleOverlay.classList.add('is-animating');

      const expand = bubbleOverlay.animate(
        [
          { clipPath: 'circle(0px at ' + origin.x + 'px ' + origin.y + 'px)', opacity: 1 },
          { clipPath: 'circle(' + maxRadius + 'px at ' + origin.x + 'px ' + origin.y + 'px)', opacity: 1 }
        ],
        {
          duration: 460,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards'
        }
      );

      expand.onfinish = function () {
        applyThemeState(nextTheme);
        const fadeOut = bubbleOverlay.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 220, easing: 'ease-out', fill: 'forwards' }
        );
        fadeOut.onfinish = function () {
          bubbleOverlay.classList.remove('is-animating');
          bubbleOverlay.getAnimations().forEach(function (a) { a.cancel(); });
        };
      };
      return;
    }

    applyThemeState(nextTheme);
  }

  themeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const chosen = btn.getAttribute('data-theme-choice');
      if (chosen === 'light' || chosen === 'dark') {
        switchThemeWithBubble(chosen, btn);
      }
    });
  });

  syncThemeButtons(getCurrentTheme());

  /* ------------------------------------------------------------------------
     Mobile Navigation Menu
     ------------------------------------------------------------------------ */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function setMobileMenuOpen(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    mobileMenu.hidden = !open;
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      setMobileMenuOpen(!isOpen);
    });

    mobileNavLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setMobileMenuOpen(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMobileMenuOpen(false);
        menuToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     Active Menu Highlighting
     ------------------------------------------------------------------------ */
  const allNavLinks = document.querySelectorAll('[data-nav]');
  const sections = ['home', 'connect', 'about']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActiveNav(id) {
    allNavLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('data-nav') === id);
    });
  }

  if ('IntersectionObserver' in window && sections.length > 0) {
    const navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (sec) { navObserver.observe(sec); });
  }

  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      setActiveNav(link.getAttribute('data-nav'));
    });
  });

  /* ------------------------------------------------------------------------
     Button Click Ripple Micro-Interaction
     ------------------------------------------------------------------------ */
  document.addEventListener('click', function (event) {
    if (prefersReducedMotion.matches) return;
    const target = event.target.closest('.btn-anim');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    const x = event.clientX ? event.clientX - rect.left - size / 2 : rect.width / 2 - size / 2;
    const y = event.clientY ? event.clientY - rect.top - size / 2 : rect.height / 2 - size / 2;
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    target.appendChild(ripple);
    ripple.addEventListener('animationend', function () {
      ripple.remove();
    });
  });

  /* ------------------------------------------------------------------------
     Copy Email Action
     ------------------------------------------------------------------------ */
  const copyBtn = document.getElementById('copy-email-btn');
  const copyStatus = document.getElementById('copy-status');

  if (copyBtn && copyStatus) {
    copyBtn.addEventListener('click', function () {
      const email = copyBtn.getAttribute('data-email');
      if (!email) return;

      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(email).then(
          function () {
            copyStatus.textContent = 'Alamat email disalin: ' + email;
          },
          function () {
            copyStatus.textContent = 'Email Zharif: ' + email;
          }
        );
      } else {
        copyStatus.textContent = 'Email Zharif: ' + email;
      }
    });
  }

  /* ------------------------------------------------------------------------
     About Photo Skeleton Shimmer + Error Fallback
     ------------------------------------------------------------------------ */
  const aboutFrame = document.getElementById('about-photo-frame');
  const aboutPhoto = document.getElementById('about-photo');
  const aboutPhotoError = document.getElementById('about-photo-error');
  const retryPhotoBtn = document.getElementById('retry-photo-btn');

  function markPhotoLoaded() {
    if (!aboutFrame || !aboutPhoto || !aboutPhotoError) return;
    aboutPhotoError.hidden = true;
    aboutPhoto.hidden = false;
    aboutFrame.classList.add('is-loaded');
  }

  function markPhotoError() {
    if (!aboutFrame || !aboutPhoto || !aboutPhotoError) return;
    aboutFrame.classList.add('is-loaded');
    aboutPhoto.hidden = true;
    aboutPhotoError.hidden = false;
  }

  if (aboutPhoto) {
    if (aboutPhoto.complete) {
      if (aboutPhoto.naturalWidth > 0) {
        markPhotoLoaded();
      } else {
        markPhotoError();
      }
    } else {
      aboutPhoto.addEventListener('load', markPhotoLoaded);
      aboutPhoto.addEventListener('error', markPhotoError);
    }
  }

  if (retryPhotoBtn && aboutPhoto && aboutFrame) {
    retryPhotoBtn.addEventListener('click', function () {
      aboutFrame.classList.remove('is-loaded');
      aboutPhotoError.hidden = true;
      aboutPhoto.hidden = false;
      const baseSrc = 'assets/zharif-about.jpg';
      aboutPhoto.src = baseSrc + '?retry=' + Date.now();
    });
  }

  /* ------------------------------------------------------------------------
     Biodata Tabs with Skeleton Shimmer Transition
     ------------------------------------------------------------------------ */
  const focusTabs = Array.from(document.querySelectorAll('.focus-tab'));
  const focusPanel = document.getElementById('focus-tabpanel');
  const focusSkeleton = document.getElementById('focus-skeleton');
  const focusContent = document.getElementById('focus-content');
  const replayBtn = document.getElementById('replay-shimmer-btn');

  let activeTabKey = 'identitas';
  let shimmerTimer = null;

  function renderFactRows(rows) {
    const dl = document.createElement('dl');
    dl.className = 'fact-list';

    rows.forEach(function (item) {
      const row = document.createElement('div');
      row.className = 'fact-row';

      const dt = document.createElement('dt');
      dt.textContent = item.label;

      const dd = document.createElement('dd');
      dd.textContent = item.value;

      row.appendChild(dt);
      row.appendChild(dd);
      dl.appendChild(row);
    });

    return dl;
  }

  function activateTab(tabKey, withShimmer) {
    const rows = TAB_DATA[tabKey];
    if (!rows || !focusPanel || !focusContent || !focusSkeleton) return;

    activeTabKey = tabKey;

    focusTabs.forEach(function (tab) {
      const isSelected = tab.getAttribute('data-tab') === tabKey;
      tab.classList.toggle('is-active', isSelected);
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      if (isSelected) {
        focusPanel.setAttribute('aria-labelledby', tab.id);
      }
    });

    if (shimmerTimer) {
      clearTimeout(shimmerTimer);
    }

    if (!withShimmer || prefersReducedMotion.matches) {
      focusSkeleton.hidden = true;
      focusContent.hidden = false;
      focusContent.replaceChildren(renderFactRows(rows));
      return;
    }

    focusContent.hidden = true;
    focusSkeleton.hidden = false;

    shimmerTimer = setTimeout(function () {
      focusContent.replaceChildren(renderFactRows(rows));
      focusSkeleton.hidden = true;
      focusContent.hidden = false;
    }, 280);
  }

  focusTabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      const key = tab.getAttribute('data-tab');
      if (key) {
        activateTab(key, true);
      }
    });

    tab.addEventListener('keydown', function (event) {
      let nextIndex = null;
      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % focusTabs.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + focusTabs.length) % focusTabs.length;
      }
      if (nextIndex !== null) {
        event.preventDefault();
        const nextTab = focusTabs[nextIndex];
        nextTab.focus();
        activateTab(nextTab.getAttribute('data-tab'), true);
      }
    });
  });

  if (replayBtn) {
    replayBtn.addEventListener('click', function () {
      activateTab(activeTabKey, true);
    });
  }
})();
