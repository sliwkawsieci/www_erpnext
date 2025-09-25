
// Minimal JS for multi-page version: form validation + mobile nav + external links
document.addEventListener('DOMContentLoaded', function () {
  setupFormValidation();
  setupMobileNavigation();
  setupExternalLinks();
});

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
  navToggle.addEventListener('click', function (e) {
    e.preventDefault();
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  document.addEventListener('click', function (event) {
    const isClickInside = navToggle.contains(event.target) || navMenu.contains(event.target);
    if (!isClickInside) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
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
      // Variant B: redirect to Frappe Web Form with prefilled params
      const baseUrl = 'https://system.erptech.cloud/zgloszenie-kontaktowe/new';
      const params = new URLSearchParams();
      // Map local field IDs to expected Web Form field names (from provided Web Form setup)
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
      // No default source/status anymore per request
      // If the instance supports an embedded layout param, you can enable it here.
      // params.set('embedded', '1');
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

  switch(fieldId){
    case 'firstName': if (!value) err = 'Podaj imię.'; break;
    case 'lastName': if (!value) err = 'Podaj nazwisko.'; break;
    case 'email':
      if (!value) err = 'Podaj adres e-mail.';
      else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(value)) err = 'Podaj poprawny e-mail.';
      break;
    case 'phone':
      if (value && !/^([+]?\d{1,3}[\s-]?)?(\d{9,12})$/.test(value.replace(/\s+/g,''))) err='Podaj poprawny numer telefonu.';
      break;
    case 'website':
      if (value && !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i.test(value)) err='Podaj poprawny adres strony WWW (np. https://firma.pl).';
      break;
    case 'details':
      if (value && value.length < 10) err='Szczegóły powinny mieć co najmniej 10 znaków.';
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
