/* ============================================
   ВІКТОРІЯ — Більярдний клуб
   main.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================
     1. CURSOR TRAIL (canvas, gold glowing dots)
     ============================================ */
  (function cursorTrail() {
    const canvas = document.getElementById('cursor-canvas');
    if (!canvas) return;

    // Disable on touch devices for performance
    if (window.matchMedia('(pointer: coarse)').matches) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -100, y: -100 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      for (let i = 0; i < 2; i++) {
        particles.push({
          x: mouse.x + (Math.random() - 0.5) * 6,
          y: mouse.y + (Math.random() - 0.5) * 6,
          size: Math.random() * 2.5 + 1,
          speedX: (Math.random() - 0.5) * 0.6,
          speedY: (Math.random() - 0.5) * 0.6 - 0.3,
          life: 1
        });
      }

      if (particles.length > 120) {
        particles.splice(0, particles.length - 120);
      }
    });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.018;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${p.life * 0.55})`;
        ctx.shadowColor = 'rgba(201, 168, 76, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }
    animate();
  })();


  /* ============================================
     2. NAV — scroll state + active link highlight
     ============================================ */
  (function navScroll() {
    const nav = document.getElementById('main-nav');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    function onScroll() {
      if (window.scrollY > 30) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      let current = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 120;
        if (window.scrollY >= top) {
          current = sec.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.toggle('active-link', link.getAttribute('href') === `#${current}`);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();


  /* ============================================
     3. MOBILE MENU (burger toggle)
     ============================================ */
  (function mobileMenu() {
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    menu.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  })();


  /* ============================================
     4. HERO PARTICLES (floating gold dust)
     ============================================ */
  (function heroParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const COUNT = 22;

    function spawnParticle() {
      const dot = document.createElement('div');
      dot.className = 'particle';

      const size = Math.random() * 3 + 1;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.bottom = `${Math.random() * 30}%`;
      dot.style.animationDuration = `${Math.random() * 4 + 4}s`;
      dot.style.animationDelay = `${Math.random() * 4}s`;

      container.appendChild(dot);
    }

    for (let i = 0; i < COUNT; i++) {
      spawnParticle();
    }
  })();


  /* ============================================
     5. SCROLL REVEAL ANIMATIONS
     ============================================ */
  (function scrollReveal() {
    const targets = document.querySelectorAll('[data-animate]');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // If this is a stagger container, reveal its children with a delay
          if (entry.target.dataset.animate === 'stagger') {
            const items = entry.target.querySelectorAll('[data-animate-item]');
            items.forEach((item, i) => {
              setTimeout(() => item.classList.add('visible'), i * 120);
            });
          }

          // Trigger counters once visible (for hero stats)
          if (entry.target.dataset.animate === 'stat' || entry.target.dataset.animate === 'hero') {
            entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
            if (entry.target.matches('[data-count]')) animateCounter(entry.target);
          }

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    targets.forEach((el) => observer.observe(el));
  })();


  /* ============================================
     6. ANIMATED COUNTERS (data-count)
     ============================================ */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target) || el.dataset.counted) return;
    el.dataset.counted = 'true';

    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(tick);
  }

  // Also kick off any counters already in view on load (e.g. hero on first paint)
  document.querySelectorAll('[data-count]').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      animateCounter(el);
    }
  });


  /* ============================================
     7. WORKING HOURS — live "open / closed" status
     Графік: Пн–Пт 10:00–21:00, Сб–Нд 12:00–22:00
     ============================================ */
  (function workingHours() {
    const statusEl = document.getElementById('open-status');
    const labelEl = document.getElementById('open-label');
    const rowEl = document.getElementById('open-status-row');
    if (!statusEl) return;

    const now = new Date();
    const day = now.getDay(); // 0 = Sunday ... 6 = Saturday
    const hours = now.getHours() + now.getMinutes() / 60;

    let openTime, closeTime;
    if (day === 0 || day === 6) {
      openTime = 12;
      closeTime = 22;
    } else {
      openTime = 10;
      closeTime = 21;
    }

    const isOpen = hours >= openTime && hours < closeTime;

    if (isOpen) {
      labelEl.textContent = 'Зараз відкрито';
      statusEl.textContent = `до ${closeTime}:00`;
      rowEl.classList.add('open-now');
      rowEl.classList.remove('closed-now');
    } else {
      labelEl.textContent = 'Зараз зачинено';
      let nextOpenLabel;
      if (day === 5 || day === 6) {
        // Friday evening or Saturday closed -> opens at weekend hours (12:00) or Sunday
        nextOpenLabel = `Сб–Нд з 12:00`;
      } else if (day === 0) {
        nextOpenLabel = `Пн з 10:00`;
      } else {
        nextOpenLabel = `сьогодні з ${openTime}:00`;
      }
      statusEl.textContent = nextOpenLabel;
      rowEl.classList.remove('open-now');
      rowEl.classList.add('closed-now');
    }
  })();


  /* ============================================
     8. HALL MAP — interactive table tooltips
     ============================================ */
  (function hallMapInteractive() {
    const svg = document.querySelector('.hall-map-svg');
    if (!svg) return;

    // Any rect that has a sibling text label acts as a "table"
    const tableGroups = {};

    svg.querySelectorAll('text').forEach((text) => {
      const label = text.textContent.trim();
      // Match short table labels like "1", "7", "A1", "A3" etc.
      if (/^[A-Za-zА-Яа-я]?\d+$/.test(label) && label.length <= 3) {
        const x = parseFloat(text.getAttribute('x'));
        const y = parseFloat(text.getAttribute('y'));

        // Find the nearest preceding rect/ellipse as the table shape
        let shape = text.previousElementSibling;
        while (shape && shape.tagName !== 'rect' && shape.tagName !== 'ellipse') {
          shape = shape.previousElementSibling;
        }
        if (!shape) return;

        shape.style.transition = 'transform 0.3s ease, filter 0.3s ease, opacity 0.3s ease';
        shape.style.transformOrigin = `${x}px ${y}px`;
        shape.style.cursor = 'pointer';

        const hoverIn = () => {
          shape.style.transform = 'scale(1.06)';
          shape.style.filter = 'drop-shadow(0 0 8px rgba(201,168,76,0.45))';
          text.style.transition = 'fill 0.3s ease';
        };
        const hoverOut = () => {
          shape.style.transform = 'scale(1)';
          shape.style.filter = 'none';
        };

        shape.addEventListener('mouseenter', hoverIn);
        shape.addEventListener('mouseleave', hoverOut);
        text.addEventListener('mouseenter', hoverIn);
        text.addEventListener('mouseleave', hoverOut);

        // Click -> jump to booking section with table info
        const clickHandler = () => {
          const phone = document.querySelector('.phone-link');
          const target = document.getElementById('booking');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        };
        shape.addEventListener('click', clickHandler);
        text.addEventListener('click', clickHandler);
      }
    });
  })();


  /* ============================================
     9. CONTACT FORM — AJAX submit (Formspree)
     ============================================ */
  (function contactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('form-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    const successEl = document.getElementById('form-success');
    const errorEl = document.getElementById('form-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      successEl.style.display = 'none';
      errorEl.style.display = 'none';
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      btnSpinner.style.display = 'inline';

      const data = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          successEl.style.display = 'block';
          form.reset();
        } else {
          errorEl.style.display = 'block';
        }
      } catch (err) {
        errorEl.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
      }
    });
  })();


  /* ============================================
     10. SMOOTH ANCHOR SCROLL (offset for fixed nav)
     ============================================ */
  (function smoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id.length <= 1) return;
        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        const navHeight = document.getElementById('main-nav')?.offsetHeight || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - (navHeight - 1);

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  })();


  /* ============================================
     11. TABLE CARD TILT EFFECT (subtle 3D hover)
     ============================================ */
  (function cardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.table-card').forEach((card) => {
      card.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
      card.style.willChange = 'transform';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateX = ((y / rect.height) - 0.5) * -6;
        const rotateY = ((x / rect.width) - 0.5) * 6;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.35)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        card.style.boxShadow = 'none';
      });
    });
  })();

});
