
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

  const fields = ['firstName','lastName','email','phone','message'];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let ok = true;
    fields.forEach(function(id){ if (!validateSingleField(id)) ok = false; });
    if (ok) {
      form.classList.add('hidden');
      successMessage.classList.remove('hidden');
      successMessage.scrollIntoView({behavior:'smooth'});
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
      else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) err = 'Podaj poprawny e-mail.';
      break;
    case 'phone':
      if (value && !/^([+]?\d{1,3}[\s-]?)?(\d{9,12})$/.test(value.replace(/\s+/g,''))) err='Podaj poprawny numer telefonu.';
      break;
    case 'message':
      if (!value) err='Krótko opisz swoją potrzebę.';
      else if (value.length < 10) err='Opis musi mieć conajmniej 10 znaków.';
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
