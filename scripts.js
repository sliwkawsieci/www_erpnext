// Interakcje dla strony case study
const formatPL = (val) => Number(val || 0).toLocaleString('pl-PL');

function calculateROI() {
  const adminHours = Number(document.getElementById('admin-hours').value || 0);
  const hourlyRate = Number(document.getElementById('hourly-rate').value || 0);
  const monthlyOrders = Number(document.getElementById('monthly-orders').value || 0);

  const timeSavings = (adminHours * 0.6) * 4.33 * hourlyRate;
  const errorSavings = (monthlyOrders * 0.15) * 50;
  const annualSavings = (timeSavings + errorSavings) * 12;
  const implementation = 28500;
  const annualCost = 9576;
  const monthlyReturn = annualSavings / 12 || 1;
  const roiMonths = Math.ceil((implementation + annualCost) / monthlyReturn);

  document.getElementById('annual-savings').textContent = formatPL(annualSavings.toFixed(0));
  document.getElementById('roi-months').textContent = roiMonths;
  document.getElementById('year-two-profit').textContent = formatPL((annualSavings - annualCost).toFixed(0));
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

function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const consent = document.getElementById('consent');
    if (!consent.checked) {
      alert('Proszę zaznaczyć zgodę na kontakt');
      return;
    }
    // TODO: podłączyć do backendu / API
    const success = form.querySelector('.success-message');
    if (success) success.classList.add('show');
    form.dispatchEvent(new CustomEvent('contact_form_submit'));
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

  document.querySelectorAll('.btn-primary').forEach(btn => btn.addEventListener('click', () => {
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
