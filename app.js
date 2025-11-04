
// Minimal JS for multi-page version: load shared partials, form validation, mobile nav, external links
document.addEventListener('DOMContentLoaded', function () {
  injectSharedPartials();
  // Delay mobile nav setup to ensure partials are injected
  setTimeout(function() {
    setupMobileNavigation();
  }, 50);
  setActiveNavLink();
  setupExternalLinks();
  setupPageRouting();
  setupFormValidation();
  setupBackToTop();
  hidePreloader();
});

function injectSharedPartials() {
  if (!window.SITE_PARTIALS) {
    console.warn('[Includes] Shared partials are not defined.');
    return;
  }
  document.querySelectorAll('[data-partial]').forEach(function (node) {
    const key = node.getAttribute('data-partial');
    if (!key || !window.SITE_PARTIALS[key]) return;
    node.innerHTML = window.SITE_PARTIALS[key];
  });
}

function setupExternalLinks() {
  document.querySelectorAll('a[href^="http"]').forEach(function (link) {
    if (!link.getAttribute('target')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

function setupMobileNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (!navToggle || !navMenu) return;

  var toggleMenu = function (state) {
    const open = state !== undefined ? state : !navToggle.classList.contains('active');
    navToggle.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  navToggle.addEventListener('click', function (e) {
    e.preventDefault();
    toggleMenu();
  });
  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      toggleMenu(false);
    });
  });
  document.addEventListener('click', function (event) {
    const isClickInside = navToggle.contains(event.target) || navMenu.contains(event.target);
    if (!isClickInside) {
      toggleMenu(false);
    }
  });
}

function setupPageRouting() {
  // Only for index.html (SPA-like) where multiple sections exist
  const pages = document.querySelectorAll('.page-content');
  const navMenu = document.getElementById('navMenu');
  if (!pages || pages.length === 0) return; // no multi-section structure, skip

  const showPage = function (pageName) {
    const targetId = 'page-' + pageName;
    let found = false;
    pages.forEach(function (sec) {
      if (sec.id === targetId) {
        sec.classList.remove('hidden');
        found = true;
      } else {
        sec.classList.add('hidden');
      }
    });
    setActiveNavLink(pageName);
    if (found) console.info('[Routing] Switched to', pageName);
  };

  // Wire clicks for data-page
  document.querySelectorAll('[data-page]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const pageName = a.getAttribute('data-page');
      if (!pageName) return;
      e.preventDefault();
      showPage(pageName);
      // Close mobile menu if open
      const navToggle = document.getElementById('navToggle');
      if (navToggle && navMenu) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
      // Scroll to top after switching
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Wire contact action scroll
  document.querySelectorAll('[data-action="contact"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const contact = document.getElementById('contact-form');
      if (contact) {
        contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.info('[Routing] Scrolled to contact form');
      }
    });
  });
}

function setActiveNavLink(forcedSlug) {
  const navLinks = document.querySelectorAll('.nav-link[data-nav]');
  if (!navLinks.length) return;

  let slug = forcedSlug;
  if (!slug) {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    switch (path) {
      case 'erpnext.html':
        slug = 'erpnext';
        break;
      case 'crm.html':
        slug = 'crm';
        break;
      case 'helpdesk.html':
        slug = 'helpdesk';
        break;
      default:
        slug = window.location.hash === '#contact-form' ? 'contact' : 'home';
    }
  }

  navLinks.forEach(function (link) {
    if (link.getAttribute('data-nav') === slug) link.classList.add('active');
    else link.classList.remove('active');
  });
}

function setupFormValidation() {
  const form = document.getElementById('contactForm');
  const successMessage = document.getElementById('successMessage');
  if (!form || !successMessage) return;

  const fields = [
    'organization',
    'firstName',
    'lastName',
    'email',
    'phone',
    'website',
    'noOfEmployees',
    'details'
  ];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let ok = true;
    fields.forEach(function(id){ if (!validateSingleField(id)) ok = false; });
    if (ok) {
      // Reliable Variant B: redirect to Web Form with prefilled params
      const baseUrl = 'https://system.erptech.cloud/zgloszenie-kontaktowe/new';
      const params = new URLSearchParams();
      const map = {
        organization: 'organization',
        firstName: 'first_name',
        lastName: 'last_name',
        email: 'email',
        phone: 'phone',
        website: 'website',
        noOfEmployees: 'no_of_employees',
        details: 'details'
      };
      Object.keys(map).forEach(function(localId){
        const el = document.getElementById(localId);
        if (el && el.value) params.set(map[localId], el.value.trim());
      });
      const target = baseUrl + '?' + params.toString();
      window.location.href = target;
    }
  });

  fields.forEach(function(id){
    const el = document.getElementById(id);
    el && el.addEventListener('input', function(){ clearFieldError(id); });
    el && el.addEventListener('blur', function(){ validateSingleField(id); });
  });
}

function validateSingleField(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return true;
  const value = input.value.trim();
  let err = '';

  switch (fieldId) {
    case 'firstName':
      if (!value) err = 'Podaj imie.';
      break;
    case 'lastName':
      if (!value) err = 'Podaj nazwisko.';
      break;
    case 'email':
      if (!value) err = 'Podaj adres e-mail.';
      else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(value)) err = 'Podaj poprawny e-mail.';
      break;
    case 'phone':
      if (value && !/^([+]?[0-9]{1,3}[\s-]?)?([0-9]{9,12})$/.test(value.replace(/\s+/g, ''))) err = 'Podaj poprawny numer telefonu.';
      break;
    case 'website':
      if (value && !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i.test(value)) err = 'Podaj poprawny adres strony WWW (np. https://firma.pl).';
      break;
    case 'details':
      if (value && value.length < 10) err = 'Szczegoly powinny miec co najmniej 10 znakow.';
      break;
  }
  if (err) { showFieldError(fieldId, err); return false; }
  clearFieldError(fieldId); return true;
}

function showFieldError(fieldId, msg){
  const e = document.getElementById(fieldId+'Error');
  const i = document.getElementById(fieldId);
  if (e){ e.textContent = msg; e.style.display='block'; }
  if (i){ i.classList.add('error'); }
}
function clearFieldError(fieldId){
  const e = document.getElementById(fieldId+'Error');
  const i = document.getElementById(fieldId);
  if (e){ e.textContent=''; e.style.display='none'; }
  if (i){ i.classList.remove('error'); }
}

/* Back to Top Button */
function setupBackToTop() {
  const backToTop = document.createElement('div');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '↑';
  backToTop.setAttribute('aria-label', 'Powrót na górę strony');
  backToTop.setAttribute('role', 'button');
  backToTop.setAttribute('tabindex', '0');
  document.body.appendChild(backToTop);

  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  backToTop.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/* Hide Preloader */
function hidePreloader() {
  const preloader = document.querySelector('.page-preloader');
  if (preloader) {
    setTimeout(function() {
      preloader.classList.add('hidden');
      setTimeout(function() {
        preloader.remove();
      }, 500);
    }, 500);
  }
}
