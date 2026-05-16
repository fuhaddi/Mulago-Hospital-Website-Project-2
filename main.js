/*mulago national referral hospital main.js that enhances the existing CSS with
 interactive behaviour and works alongside style.css*/

(function () {
  'use strict';


/*1. mobile navigation toggle that adds a hamburger menu button on small screens so the nav
collapses neatly instead of wrapping awkwardly*/
  function initMobileNav() {
    const header  = document.querySelector('header');
    const navInner = header && header.querySelector('.nav-inner');
    const nav      = header && header.querySelector('nav');
    if (!navInner || !nav) return;

    // building the toggle button
    const btn = document.createElement('button');
    btn.className   = 'nav-toggle';
    btn.setAttribute('aria-label', 'Toggle navigation');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML   =
      '<span></span><span></span><span></span>';

    // injecting styles for the button
    const style = document.createElement('style');
    style.textContent = `
      .nav-toggle {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        z-index: 200;
      }
      .nav-toggle span {
        display: block;
        width: 26px;
        height: 2px;
        background: var(--navy);
        border-radius: 2px;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      .nav-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      .nav-toggle.open span:nth-child(2) { opacity: 0; }
      .nav-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

      @media (max-width: 768px) {
        .nav-toggle { display: flex; }
        nav { width: 100%; }
        nav ul {
          display: none;
          flex-direction: column;
          width: 100%;
          background: var(--white);
          padding: 12px 0;
          border-top: 1px solid var(--border);
        }
        nav ul.nav-open { display: flex; }
        nav ul li a { padding: 10px 20px; border-radius: 0; }
      }
    `;
    document.head.appendChild(style);

    navInner.appendChild(btn);

    btn.addEventListener('click', function () {
      const ul       = nav.querySelector('ul');
      const isOpen   = ul.classList.toggle('nav-open');
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    //to close the menu when a link is tapped
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.querySelector('ul').classList.remove('nav-open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /*2. sticky header shadow that adds a subtle class to the header once the user scrolls
  down, giving the sticky bar more visual depth*/
  function initStickyHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    const style = document.createElement('style');
    style.textContent = `
      header.scrolled {
        box-shadow: 0 4px 28px rgba(10,35,66,0.18);
      }
    `;
    document.head.appendChild(style);

    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /*3. scroll-in animations that fade and slide elements into view as you scroll down the 
  page. works with any element that has a data-animate attribute, or automatically targets
  cards, section titles, stats, and the two-column layout.*/
  
  function initScrollAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      .will-animate {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.55s ease, transform 0.55s ease;
      }
      .will-animate.animated {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    // elements to animate
    const selectors = [
      '.card',
      '.stat-item',
      '.section-header',
      '.col-text',
      '.col-image',
      '.notice-bar',
      '.timeline-item',
      '.info-box',
      '.contact-info-item',
      '.form-card',
      '.page-hero',
    ].join(', ');

    const targets = document.querySelectorAll(selectors);

    targets.forEach(function (el) {
      el.classList.add('will-animate');
    });

    // add staggered delay for grid children
    document.querySelectorAll('.cards-grid').forEach(function (grid) {
      Array.from(grid.querySelectorAll('.card')).forEach(function (card, i) {
        card.style.transitionDelay = (i * 80) + 'ms';
      });
    });

    document.querySelectorAll('.stats-grid').forEach(function (grid) {
      Array.from(grid.querySelectorAll('.stat-item')).forEach(function (item, i) {
        item.style.transitionDelay = (i * 80) + 'ms';
      });
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }


  /*4. animated stat counters that create a dynamic counting effect for the stats section
  on the homepage.*/
  function initCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    function parseValue(text) {
      // strips non-numeric characters and returns the number
      return parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
    }

    function getSuffix(text) {
      // extracts any trailing symbol like +, K+, etc.
      return text.replace(/[0-9,]/g, '').trim();
    }

    function animateCounter(el) {
      const original = el.textContent.trim();
      const target   = parseValue(original);
      const suffix   = getSuffix(original);
      if (!target) return;

      const duration = 1600;
      const step     = 16;
      const steps    = duration / step;
      let current    = 0;

      // if target is a year (like 1913), start close to it
      const start = target > 1000 && suffix === '' ? target - 50 : 0;
      current = start;

      const increment = (target - start) / steps;

      const timer = setInterval(function () {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      }, step);
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    statNumbers.forEach(function (el) {
      observer.observe(el);
    });
  }


  /*5. active nav link highlighting that automatically marks the correct nav link as "active" 
  based on the current page URL, so you don't have to manually set the class in every HTML file*/

  function initActiveNav() {
    const links    = document.querySelectorAll('nav ul li a:not(.nav-emergency)');
    const current  = window.location.pathname.split('/').pop() || 'index.html';

    links.forEach(function (link) {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }


  /*6. contact form validation feedback adds friendly real-time validation and a success message
  to the contact form (contact.html), even if it's without submitting data anywhere*/

  function initContactForm() {
    const form = document.querySelector('form');
    if (!form) return;

    const style = document.createElement('style');
    style.textContent = `
      .field-error {
        color: #c0392b;
        font-size: 0.82rem;
        margin-top: 4px;
        display: block;
      }
      .form-group input.invalid,
      .form-group select.invalid,
      .form-group textarea.invalid {
        border-color: #c0392b !important;
        box-shadow: 0 0 0 3px rgba(192,57,43,0.10) !important;
      }
      .form-success {
        background: rgba(26,122,138,0.10);
        border: 1px solid var(--teal);
        border-radius: var(--radius);
        padding: 20px 24px;
        text-align: center;
        color: var(--teal);
        font-weight: 600;
        font-size: 1rem;
        margin-top: 20px;
      }
    `;
    document.head.appendChild(style);

    function showError(input, msg) {
      input.classList.add('invalid');
      let err = input.parentElement.querySelector('.field-error');
      if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        input.parentElement.appendChild(err);
      }
      err.textContent = msg;
    }

    function clearError(input) {
      input.classList.remove('invalid');
      const err = input.parentElement.querySelector('.field-error');
      if (err) err.textContent = '';
    }

    // live validation on blur
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('blur', function () {
        validateField(field);
      });
      field.addEventListener('input', function () {
        if (field.classList.contains('invalid')) validateField(field);
      });
    });

    function validateField(field) {
      const val = field.value.trim();
      if (field.hasAttribute('required') && !val) {
        showError(field, 'This field is required.');
        return false;
      }
      if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        showError(field, 'Please enter a valid email address.');
        return false;
      }
      if (field.type === 'tel' && val && !/^\+?[\d\s\-()]{7,20}$/.test(val)) {
        showError(field, 'Please enter a valid phone number.');
        return false;
      }
      clearError(field);
      return true;
    }

    function validateAll() {
      let valid = true;
      form.querySelectorAll('input[required], select[required], textarea[required]')
        .forEach(function (field) {
          if (!validateField(field)) valid = false;
        });
      return valid;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateAll()) return;

      // show success message and hide form (since we're not actually submitting anywhere)
      const successMsg = document.createElement('div');
      successMsg.className = 'form-success';
      successMsg.innerHTML =
        '&#10003; Thank you! Your message has been received. We will get back to you shortly.';

      form.style.display = 'none';
      form.parentElement.appendChild(successMsg);
    });
  }


  /*7.simple back-to-top button that enhances navigation on long pages. a small button appears 
  after scrolling 400 px and takes the user back to the top of the page smoothly.*/ 

  function initBackToTop() {
    const btn = document.createElement('button');
    btn.id          = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.textContent = '↑';
    document.body.appendChild(btn);

    const style = document.createElement('style');
    style.textContent = `
      #back-to-top {
        position: fixed;
        bottom: 32px;
        right: 28px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--teal);
        color: #fff;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background 0.3s ease;
        box-shadow: 0 4px 16px rgba(10,35,66,0.20);
        z-index: 999;
        line-height: 1;
      }
      #back-to-top.visible {
        opacity: 1;
        visibility: visible;
      }
      #back-to-top:hover {
        background: var(--navy);
        transform: translateY(-3px);
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /*8. card hover effects that add a subtle elevation and shadow to cards 
  when hovered, making them feel more interactive*/

  function initCardEffects() {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.style.boxShadow = '0 12px 36px rgba(10,35,66,0.16)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.boxShadow = '';
      });
    });
  }


  /*9.current year in footer. keeps the copyright year always up to date automatically.*/

  function initCopyrightYear() {
    const footerBottom = document.querySelector('.footer-bottom');
    if (!footerBottom) return;
    const year = new Date().getFullYear();
    footerBottom.innerHTML = footerBottom.innerHTML.replace(/\d{4}(?= Mulago)/, year);
  }


  /*init*/
  function init() {
    initMobileNav();
    initStickyHeader();
    initScrollAnimations();
    initCounters();
    initActiveNav();
    initContactForm();
    initBackToTop();
    initCardEffects();
    initCopyrightYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
