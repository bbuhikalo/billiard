/* ============================================
   ВІКТОРІЯ — Більярдний клуб
   main.js (Оновлена інтерактивна логіка)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================
     1. ЕЛІТНИЙ КУРСОРНИЙ ШЛЕЙФ (Золотий пил)
     ============================================ */
  (function cursorTrail() {
    const canvas = document.getElementById('cursor-canvas');
    if (!canvas) return;

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
          x: mouse.x + (Math.random() - 0.5) * 4,
          y: mouse.y + (Math.random() - 0.5) * 4,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5 - 0.2,
          life: 1
        });
      }

      if (particles.length > 100) {
        particles.splice(0, particles.length - 100);
      }
    });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.02;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${p.life * 0.6})`;
        ctx.shadowColor = 'rgba(201, 168, 76, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fill();
      }
      requestAnimationFrame(animate);
    }
    animate();
  })();

  /* ============================================
     2. НАВІГАЦІЯ — Scroll state & Active Links
     ============================================ */
  (function navScroll() {
    const nav = document.getElementById('main-nav');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    function onScroll() {
      if (window.scrollY > 40) {
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
     3. ПЛАВНІ ПОЯВИ ПРИ СКРОЛІ (Intersection Observer)
     ============================================ */
  (function scrollReveal() {
    const targets = document.querySelectorAll('[data-animate]');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach((el) => observer.observe(el));
  })();

  /* ============================================
     4. ІНТЕРАКТИВНА КАРТА СТОЛІВ (SVG Hall Map)
     ============================================ */
  (function hallMapInteractive() {
    const svg = document.querySelector('.hall-map-svg');
    if (!svg) return;

    svg.querySelectorAll('text').forEach((text) => {
      const label = text.textContent.trim();
      const isPyramid = label.startsWith('R');
      const isPool = label.startsWith('A');

      if (isPyramid || isPool) {
        let shape = text.previousElementSibling;
        while (shape && shape.tagName !== 'rect') {
          shape = shape.previousElementSibling;
        }
        if (!shape) return;

        shape.style.transition = 'all 0.3s ease';
        shape.style.cursor = 'pointer';

        const activeColor = isPyramid ? '#5CAA60' : '#5A8ACA';
        const shadowColor = isPyramid ? 'rgba(92,170,96,0.4)' : 'rgba(90,138,202,0.4)';

        const hoverIn = () => {
          shape.style.fill = activeColor;
          shape.style.filter = `drop-shadow(0 0 10px ${shadowColor})`;
          text.style.fill = '#fff';
        };

        const hoverOut = () => {
          shape.style.fill = isPyramid ? '#0d1c10' : '#00101c';
          shape.style.filter = 'none';
          text.style.fill = activeColor;
        };

        shape.addEventListener('mouseenter', hoverIn);
        shape.addEventListener('mouseleave', hoverOut);
        text.addEventListener('mouseenter', hoverIn);
        text.addEventListener('mouseleave', hoverOut);

        const clickToBook = () => {
          const bookingSection = document.getElementById('contacts');
          if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
            const textarea = bookingSection.querySelector('textarea');
            if (textarea) {
              textarea.value = `Доброго дня! Бажаю забронювати стіл ${isPyramid ? 'Руської Піраміди' : 'Американського Пулу'} під номером ${label}. `;
              textarea.focus();
            }
          }
        };

        shape.addEventListener('click', clickToBook);
        text.addEventListener('click', clickToBook);
      }
    });
  })();

  /* ============================================
     5. ФОРМА ЗВ'ЯЗКУ (AJAX Submit Formspree)
     ============================================ */
  (function contactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('form-submit');
    const successEl = document.getElementById('form-success');
    const errorEl = document.getElementById('form-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      successEl.style.display = 'none';
      errorEl.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').style.display = 'none';
      submitBtn.querySelector('.btn-spinner').style.display = 'inline-block';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          successEl.style.display = 'block';
          form.reset();
        } else {
          errorEl.style.display = 'block';
        }
      } catch {
        errorEl.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').style.display = 'inline-block';
        submitBtn.querySelector('.btn-spinner').style.display = 'none';
      }
    });
  })();

  /* ============================================
     6. ПЛАВНИЙ СКРОЛ ДО СЕКЦІЙ
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const offset = document.getElementById('main-nav').offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================
     7. 3D НАХИЛ КАРТОК ПРИ НАВЕДЕННІ (Tilt Effect)
     ============================================ */
  (function cardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.table-card').forEach((card) => {
      card.style.willChange = 'transform';
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const rotateX = ((y / rect.height) - 0.5) * -8;
        const rotateY = ((x / rect.width) - 0.5) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  })();

});
