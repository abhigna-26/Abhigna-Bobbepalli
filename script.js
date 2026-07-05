/**
 * Personal Portfolio Interactive Behaviors
 * Includes: Phrase Cycling, Ambient Glow Drift, Scroll-Tied Handoff, 
 * Custom Cursor Follow, Section Scroll Reveal, Magnetic CTA Hover, and Mobile Menu.
 */

// Global constant checkers for user hardware/preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modular components
  initPhraseCycling();
  initAmbientGlowDrift();
  initCustomCursor();
  initScrollHandoff();
  initScrollReveal();
  initMagneticButtons();
  initMobileMenu();
  initMusicScrollLink();
});

/* ==========================================================================
   1. Looping Phrase Cycling
   ========================================================================== */
function initPhraseCycling() {
  const phrases = document.querySelectorAll('#looping-phrases .phrase');
  if (phrases.length === 0) return;

  if (prefersReducedMotion) {
    // Show only the first phrase statically
    phrases.forEach((phrase, idx) => {
      if (idx === 0) {
        phrase.classList.add('active');
      } else {
        phrase.style.display = 'none';
      }
    });
    return;
  }

  // Set the first phrase active initially
  phrases[0].classList.add('active');
  let currentIndex = 0;

  setInterval(() => {
    const current = phrases[currentIndex];
    current.classList.remove('active');
    current.classList.add('exit');

    // Clean up exit state after slide/fade out completes (700ms)
    setTimeout(() => {
      current.classList.remove('exit');
    }, 700);

    currentIndex = (currentIndex + 1) % phrases.length;
    phrases[currentIndex].classList.add('active');
  }, 3000); // Cycles every 3 seconds
}

/* ==========================================================================
   2. Ambient Background Drift
   ========================================================================== */
function initAmbientGlowDrift() {
  const glow = document.getElementById('ambient-glow');
  if (!glow || prefersReducedMotion) return;

  let angle = 0;
  function drift() {
    angle += 0.001; // slow drifting increment
    const x = Math.sin(angle) * 60; // 60px max horizontal drift
    const y = Math.cos(angle * 0.7) * 40; // 40px max vertical drift
    const scale = 1 + Math.sin(angle * 0.4) * 0.08; // subtle scale pulsing

    // Translate and scale the glow element
    glow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
    requestAnimationFrame(drift);
  }
  requestAnimationFrame(drift);
}

/* ==========================================================================
   3. Scroll-Tied HOME → LANDING Handoff
   ========================================================================== */
function initScrollHandoff() {
  const name = document.getElementById('transition-name');
  const logo = document.getElementById('header-logo');
  const statusBadge = document.getElementById('header-status-badge');
  const navLinks = document.querySelector('#nav-menu .nav-links');
  const taglineSpans = document.querySelectorAll('.hero-kinetic span');
  const toggle = document.getElementById('menu-toggle');

  if (!name || !logo) return;

  let deltaX = 0;
  let deltaY = 0;
  let scaleFactor = 1;

  // Calculates starting (home center) and target (nav logo) coordinates
  function calculatePositions() {
    // Reset temporary inline styles to measure baseline rects
    name.style.transform = 'none';
    name.style.position = 'static';
    name.style.opacity = '1';
    logo.style.opacity = '1';

    const logoRect = logo.getBoundingClientRect();
    const nameRect = name.getBoundingClientRect();

    // Re-lock centered fixed positioning
    name.style.position = 'fixed';
    name.style.top = `${nameRect.top + nameRect.height / 2}px`;
    name.style.left = `${nameRect.left + nameRect.width / 2}px`;
    name.style.transform = 'translate(-50%, -50%)';
    logo.style.opacity = '0';

    // Target positions based on center points
    const targetX = logoRect.left + logoRect.width / 2;
    const targetY = logoRect.top + logoRect.height / 2;
    const startX = nameRect.left + nameRect.width / 2;
    const startY = nameRect.top + nameRect.height / 2;

    deltaX = targetX - startX;
    deltaY = targetY - startY;
    scaleFactor = logoRect.width / nameRect.width;
  }

  // Updates layout styles based on scrolling progress
  function updateScroll() {
    // On tablet/mobile, we skip the choreographed handoff because the hamburger menu triggers layout shifts
    if (window.innerWidth <= 1024) {
      name.style.position = 'static';
      name.style.transform = 'none';
      name.style.opacity = '1';
      
      const scrollY = window.scrollY;
      const progress = Math.max(0, Math.min(1, scrollY / 80)); // Fades in over the first 80px of scroll
      
      logo.style.opacity = progress;
      if (statusBadge) statusBadge.style.opacity = progress;
      if (toggle) {
        toggle.style.opacity = progress;
        toggle.style.pointerEvents = progress > 0.1 ? 'auto' : 'none';
      }
      
      taglineSpans.forEach(span => {
        span.style.opacity = '1';
        span.style.transform = 'none';
      });
      return;
    }

    const scrollY = window.scrollY;
    const height = window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrollY / height));

    if (prefersReducedMotion) {
      // Simple cross-fade between HOME section and LANDING logo/tagline
      const home = document.getElementById('home');
      if (home) {
        home.style.opacity = `${1 - progress}`;
      }
      logo.style.opacity = progress > 0.5 ? '1' : '0';
      if (statusBadge) statusBadge.style.opacity = progress > 0.5 ? '1' : '0';
      if (navLinks) navLinks.style.opacity = progress > 0.5 ? '1' : '0';
      taglineSpans.forEach(span => {
        span.style.opacity = progress > 0.5 ? '1' : '0';
        span.style.transform = 'none';
      });
      return;
    }

    // Dynamic scale and translate transition
    const currentX = deltaX * progress;
    const currentY = deltaY * progress;
    const currentScale = 1 + (scaleFactor - 1) * progress;

    if (progress >= 0.99) {
      // Hand over rendering to static header logo at bottom limits
      name.style.opacity = '0';
      name.style.pointerEvents = 'none';
      logo.style.opacity = '1';
      if (statusBadge) statusBadge.style.opacity = '1';
    } else {
      name.style.opacity = '1';
      name.style.pointerEvents = 'auto';
      name.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(${currentScale})`;
      logo.style.opacity = '0';
      if (statusBadge) statusBadge.style.opacity = '0';
    }

    // Fade nav links in proportion to scroll
    if (navLinks) {
      navLinks.style.opacity = `${progress}`;
    }

    // Stagger tagline fade-ins based on scroll sections
    taglineSpans.forEach((span, index) => {
      const start = 0.2 + index * 0.15;
      const end = 0.7 + index * 0.15;
      let spanProgress = (progress - start) / (end - start);
      spanProgress = Math.max(0, Math.min(1, spanProgress));

      span.style.opacity = `${spanProgress}`;
      span.style.transform = `translateY(${12 * (1 - spanProgress)}px)`;
    });
  }

  // Run initial positioning calculations once fonts/images are fully resolved
  window.addEventListener('load', () => {
    calculatePositions();
    updateScroll();
  });

  window.addEventListener('resize', () => {
    calculatePositions();
    updateScroll();
  });

  window.addEventListener('scroll', updateScroll);
}

/* ==========================================================================
   4. Cursor-Follow Logic
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');

  if (!cursor || prefersReducedMotion || isTouchDevice) {
    return;
  }

  // Active cursor class on body
  document.body.classList.add('has-custom-cursor');

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let cursorScale = 1;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Smooth position trailing using linear interpolation (lerp)
  function updateCursor() {
    const ease = 0.15; // trailing ease (150-200ms trailing)
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;

    // Direct hardware-accelerated position and scale mapping
    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${cursorScale})`;

    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Global hover interactions via event delegation
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .project-card, .music-card, [role="button"], .project-btn')) {
      cursorScale = 1.4;
      cursor.style.opacity = '0.25';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .project-card, .music-card, [role="button"], .project-btn')) {
      cursorScale = 1;
      cursor.style.opacity = '0.15';
    }
  });

  // Auto-hide custom cursor if cursor leaves the window bounds
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '0.15';
  });
}

/* ==========================================================================
   5. One-Time Section Scroll Reveal (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
  if (prefersReducedMotion) {
    // Instantly reveal all sections and items
    document.querySelectorAll('.reveal-section, .reveal-stagger').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.08 // triggers when 8% of the section is visible
  };

  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target;
        section.classList.add('revealed');

        // Stagger reveal child elements (cards, headers, stack grids)
        const staggerChildren = section.querySelectorAll('.reveal-stagger');
        staggerChildren.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('revealed');
          }, index * 80); // 80ms stagger delay
        });

        // Cease observing once triggered (one-time animation)
        observer.unobserve(section);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-section').forEach(section => {
    sectionObserver.observe(section);
  });
}

/* ==========================================================================
   6. Magnetic CTA / Link Hover Effect
   ========================================================================== */
function initMagneticButtons() {
  if (prefersReducedMotion || isTouchDevice) return;

  // Apply to primary CTA triggers, phone, email, enter scrolls, and project buttons
  const magneticItems = document.querySelectorAll('.project-btn, .contact-cta a, .contact-val, #enter-btn');

  magneticItems.forEach(item => {
    // Do not apply magnetic movement to full-width mobile buttons
    if (window.innerWidth <= 640 && item.classList.contains('project-btn')) return;

    item.addEventListener('mousemove', (e) => {
      const bounds = item.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left - bounds.width / 2;
      const mouseY = e.clientY - bounds.top - bounds.height / 2;

      // Restrict pull translation to max 8px
      const pull = 0.25; 
      const shiftX = mouseX * pull;
      const shiftY = mouseY * pull;

      item.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
      item.style.transition = 'none'; // direct mouse tracking
    });

    item.addEventListener('mouseleave', () => {
      // Spring bounce back to baseline position
      item.style.transform = 'translate3d(0, 0, 0)';
      item.style.transition = 'transform 350ms cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });
  });
}

/* ==========================================================================
   7. Mobile Menu Drawer Toggle
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    if (isOpen) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('span').textContent = 'MENU';
    } else {
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('span').textContent = 'CLOSE';
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('span').textContent = 'MENU';
    }
  });

  // Close menu on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('span').textContent = 'MENU';
    });
  });
}

/* ==========================================================================
   8. Music Section Horizontal Auto-Scroll Linked to Vertical Page Scroll
   ========================================================================== */
function initMusicScrollLink() {
  const musicRow = document.querySelector('.music-row');
  const musicSection = document.getElementById('music');
  
  if (!musicRow || !musicSection || prefersReducedMotion) return;

  function updateMusicScroll() {
    const rect = musicSection.getBoundingClientRect();
    const viewHeight = window.innerHeight;

    // Check if the music section is currently intersecting the viewport
    if (rect.top < viewHeight && rect.bottom > 0) {
      // Calculate scroll progress (0 when section enters bottom, 1 when section leaves top)
      const totalScrollRange = viewHeight + rect.height;
      const progress = (viewHeight - rect.top) / totalScrollRange;

      // Calculate max horizontal scrollable width
      const maxScroll = musicRow.scrollWidth - musicRow.clientWidth;

      // Scroll horizontal row proportionally
      musicRow.scrollLeft = progress * maxScroll;
    }
  }

  window.addEventListener('scroll', updateMusicScroll);
  window.addEventListener('resize', updateMusicScroll);
  // Run once initially to set correct position
  updateMusicScroll();
}
