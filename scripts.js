// Interakcje dla strony case study
const formatPL = (val) => Number(val || 0).toLocaleString('pl-PL');

function calculateROI() {
  const adminHoursEl = document.getElementById('admin-hours');
  const hourlyRateEl = document.getElementById('hourly-rate');
  const monthlyOrdersEl = document.getElementById('monthly-orders');
  const annualSavingsEl = document.getElementById('annual-savings');
  const roiMonthsEl = document.getElementById('roi-months');
  const yearTwoProfitEl = document.getElementById('year-two-profit');

  if (!adminHoursEl || !hourlyRateEl || !monthlyOrdersEl || !annualSavingsEl || !roiMonthsEl || !yearTwoProfitEl) {
    return;
  }

  const adminHours = Number(adminHoursEl.value || 0);
  const hourlyRate = Number(hourlyRateEl.value || 0);
  const monthlyOrders = Number(monthlyOrdersEl.value || 0);

  const timeSavings = (adminHours * 0.6) * 4.33 * hourlyRate;
  const errorSavings = (monthlyOrders * 0.15) * 50;
  const annualSavings = (timeSavings + errorSavings) * 12;
  const implementation = 28500;
  const annualCost = 9576;
  const monthlyReturn = annualSavings / 12 || 1;
  const roiMonths = Math.ceil((implementation + annualCost) / monthlyReturn);

  annualSavingsEl.textContent = formatPL(annualSavings.toFixed(0));
  roiMonthsEl.textContent = roiMonths;
  yearTwoProfitEl.textContent = formatPL((annualSavings - annualCost).toFixed(0));
}

function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector('.icon');
      content.classList.toggle('active');
      if (content.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = null;
      }
      if (icon) icon.classList.toggle('rotate');
    });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Contact form handler for Cloudflare Worker
function getWorkerApiUrl() {
  const host = window.location.hostname;
  // Local development
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8787/api/contact';
  }
  // Production worker URL - update after deployment
  // Get this from Cloudflare dashboard after deploying the worker
  return 'https://erpnext-pl-contact-worker.your-account.workers.dev/api/contact';
}

function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const successDiv = form.querySelector('.success-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const consent = document.getElementById('consent');
    if (!consent || !consent.checked) {
      alert('Proszę zaznaczyć zgodę na kontakt');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'Wysyłanie...';
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(getWorkerApiUrl(), {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      let result;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result || result.success !== true) {
        const errorMsg = result?.error || `Błąd serwera: ${response.status}`;
        alert('Błąd wysyłki: ' + errorMsg);
        console.error('Form submission error:', result);
        return;
      }

      // Success
      form.reset();
      if (successDiv) {
        successDiv.classList.add('show');
      }

      // Track conversion
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'contact_form_submit_success' });

      // Redirect after short delay if redirect_url provided
      if (result.redirect_url) {
        setTimeout(() => {
          window.location.href = result.redirect_url;
        }, 500);
      }

    } catch (error) {
      console.error('Form submission error:', error);
      alert('Błąd połączenia. Spróbuj ponownie później.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || 'Wyślij';
      }
    }
  });
}

function initLazyImages() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}

function bindSliders() {
  const hours = document.getElementById('admin-hours');
  const orders = document.getElementById('monthly-orders');
  if (hours) {
    const label = document.getElementById('admin-hours-value');
    hours.addEventListener('input', () => { label.textContent = hours.value; });
  }
  if (orders) {
    const label = document.getElementById('monthly-orders-value');
    orders.addEventListener('input', () => { label.textContent = orders.value; });
  }
}

function initEvents() {
  const calcBtn = document.getElementById('calculate-btn');
  if (calcBtn) calcBtn.addEventListener('click', () => {
    calculateROI();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'roi_calculator_used' });
  });

  // Track only explicit consultation CTAs to avoid counting calculator or form buttons
  document.querySelectorAll('[data-cta="consultation"]').forEach(btn => btn.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'cta_consultation_click' });
  }));

  const pdf = document.querySelector('a[href$="case-study-meble.pdf"]');
  if (pdf) pdf.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'pdf_case_study_download' });
  });

  document.querySelectorAll('.accordion-header').forEach((header, idx) => {
    header.addEventListener('click', () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'accordion_open', section: idx + 1 });
    });
  });
}

function init() {
  initAccordion();
  initSmoothScroll();
  initForm();
  initLazyImages();
  bindSliders();
  initEvents();
  calculateROI();
}

document.addEventListener('DOMContentLoaded', init);
