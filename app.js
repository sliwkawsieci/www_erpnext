/* Google Analytics 4 - Dynamic Injection (Basic Consent Mode)
 * Zgodnie z wytycznymi Google: tag GA4 jest ładowany DOPIERO po wyrażeniu zgody.
 * Przed zgodą - brak ładowania skryptu GA4.
 * Po zgodzie - ładowanie i włączenie zbierania danych.
 */
function injectGA4Scripts() {
  // Skip if already loaded
  if (window.gtagLoaded) return;
  
  // W trybie podstawowym: NIE ładuj GA4 dopóki użytkownik nie wyrazi zgody
  // Sprawdź czy użytkownik już wyraził zgodę
  const consent = getCookie('ga_cookie_consent');
  if (consent !== 'accepted') {
    console.info('[GA4] Oczekiwanie na zgodę użytkownika - tag nie zostanie załadowany');
    return;
  }
  
  // Użytkownik wyraził zgodę - ładuj GA4
  loadGA4WithConsent();
}

/* Ładowanie GA4 po wyrażeniu zgody */
function loadGA4WithConsent() {
  if (window.gtagLoaded) return;
  
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag; // Make gtag globally available
  
  // Ustaw zgodę jako granted (użytkownik już zaakceptował)
  gtag('consent', 'default', {
    'analytics_storage': 'granted',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });
  
  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-E6J3XF4YDF';
  document.head.appendChild(script);
  
  // Initialize GA4
  script.onload = function() {
    gtag('js', new Date());
    gtag('config', 'G-E6J3XF4YDF');
    window.gtagLoaded = true;
    console.info('[GA4] Załadowano i zainicjalizowano po zgodzie użytkownika');
  };
}

/* Matomo Analytics - Dynamic Injection */
function injectMatomoScripts() {
  // Skip if already loaded
  if (window._paq) return;
  
  // Initialize Matomo tracker
  var _paq = window._paq = window._paq || [];
  
  // Tracker methods - called before trackPageView
  _paq.push(['enableLinkTracking']);
  _paq.push(['setDocumentTitle', document.domain + '/' + document.title]);
  
  // Configuration - HTTPS required for GitHub Pages
  var u = 'https://www.vh13224.vh.net.pl/';
  _paq.push(['setTrackerUrl', u + 'matomo.php']);
  _paq.push(['setSiteId', '2']);
  
  // Track page view after configuration
  _paq.push(['trackPageView']);
  
  // Load Matomo script
  var d = document;
  var g = d.createElement('script');
  var s = d.getElementsByTagName('script')[0];
  g.async = true;
  g.src = u + 'matomo.js';
  
  // Error handling for cross-domain issues
  g.onerror = function() {
    console.warn('[Matomo] Failed to load script from', u);
    console.warn('[Matomo] Check CORS settings on Matomo server');
  };
  
  g.onload = function() {
    console.info('[Matomo] Script loaded successfully');
  };
  
  s.parentNode.insertBefore(g, s);
  
  console.info('[Matomo] Initialized with URL:', u);
}

// Minimal JS for multi-page version: load shared partials, form validation, mobile nav, external links
document.addEventListener('DOMContentLoaded', function () {
  injectGA4Scripts(); // Load GA4 dynamically
  injectMatomoScripts(); // Load Matomo dynamically
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
  setupGA4Events();
  setupCookieConsent();
  setupFAQAccordion();
  setupRegulaminAccordion();
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
    
    // Check if it's a case study page
    if (path === 'casestudies.html' || path.startsWith('case-study-')) {
      slug = 'casestudies';
    } else {
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

/* Google Analytics 4 Custom Events */
function setupGA4Events() {
  // Helper function to send GA4 event
  function sendGA4Event(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
      console.info('[GA4]', eventName, params);
    }
  }

  // Helper function to send Matomo event
  function sendMatomoEvent(category, action, name, value) {
    if (window._paq) {
      window._paq.push(['trackEvent', category, action, name, value]);
      console.info('[Matomo]', category, action, name);
    }
  }

  // Combined event sender
  function sendAnalyticsEvent(eventName, params) {
    sendGA4Event(eventName, params);
    
    // Map GA4 events to Matomo format
    var category = eventName.replace('_', ' ');
    var action = params.button_text || params.product_name || params.form_name || 'click';
    var name = params.button_location || params.link_url || '';
    sendMatomoEvent(category, action, name);
  }

  // Track CTA buttons - "Umów darmową konsultację"
  document.querySelectorAll('[data-action="contact"]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      sendAnalyticsEvent('cta_click', {
        button_text: 'Umów darmową konsultację',
        button_location: 'hero_section'
      });
    });
  });

  // Track "Zobacz moduły" buttons
  document.querySelectorAll('a[href="erpnext.html"]').forEach(function(link) {
    link.addEventListener('click', function() {
      sendAnalyticsEvent('cta_click', {
        button_text: link.textContent.trim(),
        button_location: 'hero_section',
        link_url: 'erpnext.html'
      });
    });
  });

  // Track product card buttons (ERPNext, CRM, Helpdesk)
  document.querySelectorAll('.product-card .btn[data-page]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const productName = btn.getAttribute('data-page');
      sendAnalyticsEvent('product_click', {
        product_name: productName,
        button_text: btn.textContent.trim()
      });
    });
  });

  // Track external product links (CRM, Helpdesk pages)
  document.querySelectorAll('a[href="crm.html"], a[href="helpdesk.html"]').forEach(function(link) {
    link.addEventListener('click', function() {
      const page = link.getAttribute('href').replace('.html', '');
      sendAnalyticsEvent('product_click', {
        product_name: page,
        button_text: link.textContent.trim(),
        link_url: link.getAttribute('href')
      });
    });
  });

  // Track form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function() {
      sendAnalyticsEvent('form_submit', {
        form_name: 'contact_form',
        form_location: 'contact_section'
      });
    });
  }

  // Track case study clicks
  document.querySelectorAll('a[href^="case-study-"]').forEach(function(link) {
    link.addEventListener('click', function() {
      sendAnalyticsEvent('case_study_click', {
        case_study: link.getAttribute('href').replace('.html', ''),
        button_text: link.textContent.trim()
      });
    });
  });
}

/* Cookie Consent Banner */
function setupCookieConsent() {
  const COOKIE_NAME = 'ga_cookie_consent';
  const COOKIE_EXPIRY_DAYS = 365;

  // Check if consent already given
  if (getCookie(COOKIE_NAME)) {
    return; // User already consented, banner won't show
  }

  // Create banner HTML
  const banner = document.createElement('div');
  banner.id = 'cookieConsentBanner';
  banner.className = 'cookie-consent-banner';
  banner.innerHTML = `
    <div class="cookie-consent-content">
      <div class="cookie-consent-text">
        <p><strong>Informacja o plikach cookie</strong></p>
        <p>Ta strona używa Google Analytics 4 do analizy ruchu. Korzystamy z plików cookie, aby zrozumieć, jak odwiedzający korzystają z naszej witryny. Dane są anonimowe i pomagają nam ulepszać naszą stronę.</p>
      </div>
      <div class="cookie-consent-actions">
        <button id="acceptCookies" class="btn btn--primary">Akceptuję</button>
        <button id="rejectCookies" class="btn btn--outline">Odrzuć</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  // Show banner with animation
  setTimeout(function() {
    banner.classList.add('visible');
  }, 500);

  // Accept button - ładuj GA4 dopiero po zgodzie (Basic Consent Mode)
  document.getElementById('acceptCookies').addEventListener('click', function() {
    setCookie(COOKIE_NAME, 'accepted', COOKIE_EXPIRY_DAYS);
    loadGA4WithConsent(); // Załaduj GA4 dopiero teraz
    hideBanner();
    console.info('[Cookie Consent] Zgoda wyrażona - Google Analytics załadowany');
  });

  // Reject button - GA4 nie zostanie załadowany
  document.getElementById('rejectCookies').addEventListener('click', function() {
    setCookie(COOKIE_NAME, 'rejected', COOKIE_EXPIRY_DAYS);
    hideBanner();
    console.info('[Cookie Consent] Zgoda odrzucona - Google Analytics nie zostanie załadowany');
  });

  function hideBanner() {
    banner.classList.remove('visible');
    setTimeout(function() {
      banner.remove();
    }, 300);
  }
}

/* Cookie Helper Functions */
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = 'expires=' + date.toUTCString();
  document.cookie = name + '=' + value + ';' + expires + ';path=/';
}

function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/* FAQ Accordion */
function setupFAQAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  if (!faqQuestions.length) return;
  
  faqQuestions.forEach(function(question) {
    question.addEventListener('click', function() {
      const faqItem = this.parentElement;
      const faqAnswer = faqItem.querySelector('.faq-answer');
      const faqIcon = this.querySelector('.faq-icon');
      const isActive = faqItem.classList.contains('active');
      
      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(function(item) {
        item.classList.remove('active');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        if (answer) {
          answer.style.maxHeight = '0px';
          answer.style.opacity = '0';
        }
        if (icon) {
          icon.textContent = '+';
        }
      });
      
      // Toggle current item
      if (!isActive) {
        faqItem.classList.add('active');
        faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
        faqAnswer.style.opacity = '1';
        faqIcon.textContent = '−';
      }
    });
  });
  
  // Initialize closed state
  document.querySelectorAll('.faq-item').forEach(function(item) {
    const answer = item.querySelector('.faq-answer');
    if (answer) {
      answer.style.maxHeight = '0px';
      answer.style.opacity = '0';
      answer.style.overflow = 'hidden';
      answer.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
    }
  });
}

/* Regulamin Accordion */
function setupRegulaminAccordion() {
  const regulaminToggles = document.querySelectorAll('.regulamin-toggle');
  
  if (!regulaminToggles.length) return;
  
  regulaminToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      const regulaminItem = this.parentElement;
      const regulaminContent = regulaminItem.querySelector('.regulamin-content-inner');
      const regulaminIcon = this.querySelector('.regulamin-icon');
      const regulaminSection = this.getAttribute('data-regulamin');
      const isActive = regulaminItem.classList.contains('active');
      
      // Toggle current item
      if (!isActive) {
        regulaminItem.classList.add('active');
        regulaminContent.style.maxHeight = regulaminContent.scrollHeight + 'px';
        regulaminIcon.textContent = '−';
        
        // Track regulamin section opening in GA4
        if (typeof gtag !== 'undefined') {
          gtag('event', 'regulamin_open', {
            'section': regulaminSection,
            'page': window.location.pathname
          });
        }
        
        // Track in Matomo if available
        if (typeof _paq !== 'undefined') {
          _paq.push(['trackEvent', 'Regulamin', 'Open Section', regulaminSection]);
        }
        
        console.log('[Analytics] Regulamin section opened:', regulaminSection);
      } else {
        regulaminItem.classList.remove('active');
        regulaminContent.style.maxHeight = '0px';
        regulaminIcon.textContent = '+';
        
        // Track regulamin section closing in GA4
        if (typeof gtag !== 'undefined') {
          gtag('event', 'regulamin_close', {
            'section': regulaminSection,
            'page': window.location.pathname
          });
        }
        
        // Track in Matomo if available
        if (typeof _paq !== 'undefined') {
          _paq.push(['trackEvent', 'Regulamin', 'Close Section', regulaminSection]);
        }
        
        console.log('[Analytics] Regulamin section closed:', regulaminSection);
      }
    });
  });
  
  // Initialize closed state
  document.querySelectorAll('.regulamin-content-inner').forEach(function(content) {
    content.style.maxHeight = '0px';
    content.style.overflow = 'hidden';
    content.style.transition = 'max-height 0.3s ease';
  });
}
