// Global variables
let currentPage = 'home';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Initialize the application
    initializeApp();
    
    // Set up form validation
    setupFormValidation();
    
    // Set up mobile navigation
    setupMobileNavigation();
    
    // Add click handlers for navigation
    setupNavigationHandlers();
    
    // Set up FAQ functionality
    setupFAQHandlers();
    
    // Setup external links
    setupExternalLinks();
    
    console.log('App initialization complete');
});

// Initialize the application
function initializeApp() {
    // Check URL hash first
    checkUrlHash();
    
    // If no hash or invalid hash, show home page
    if (!window.location.hash || !document.getElementById('page-' + window.location.hash.substring(1))) {
        showPage('home');
    }
}

// Set up navigation click handlers
function setupNavigationHandlers() {
    console.log('Setting up navigation handlers...');
    
    // Navigation menu links
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    console.log('Found nav links:', navLinks.length);
    
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const pageId = this.getAttribute('data-page');
            console.log('Nav link clicked:', pageId);
            if (pageId) {
                showPage(pageId);
            }
        });
    });
    
    // Logo click handler
    const logoLink = document.querySelector('.nav-logo a');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Logo clicked');
            showPage('home');
        });
    }
    
    // Product "Dowiedz się więcej" buttons using data-page attribute
    const productButtons = document.querySelectorAll('button[data-page]');
    console.log('Found product buttons:', productButtons.length);
    
    productButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const pageId = this.getAttribute('data-page');
            console.log('Product button clicked:', pageId);
            if (pageId) {
                showPage(pageId);
            }
        });
    });
    
    // Contact buttons and links using data-action attribute
    const contactButtons = document.querySelectorAll('[data-action="contact"]');
    console.log('Found contact buttons:', contactButtons.length);
    
    contactButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Contact button clicked');
            scrollToContact();
        });
    });
}

// Setup external links
function setupExternalLinks() {
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(function(link) {
        if (!link.getAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

// Set up FAQ accordion functionality
function setupFAQHandlers() {
    console.log('Setting up FAQ handlers...');
    const faqQuestions = document.querySelectorAll('.faq-question');
    console.log('Found FAQ questions:', faqQuestions.length);
    
    faqQuestions.forEach(function(question) {
        question.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('FAQ question clicked');
            
            const faqItem = this.parentElement;
            const faqAnswer = faqItem.querySelector('.faq-answer');
            const isActive = this.classList.contains('active');
            
            // Close all other FAQ items
            faqQuestions.forEach(function(otherQuestion) {
                const otherItem = otherQuestion.parentElement;
                const otherAnswer = otherItem.querySelector('.faq-answer');
                
                otherQuestion.classList.remove('active');
                otherAnswer.classList.remove('active');
            });
            
            // Toggle current item (only open if it wasn't already active)
            if (!isActive) {
                this.classList.add('active');
                faqAnswer.classList.add('active');
            }
        });
    });
}

// Show specific page and hide others
function showPage(pageId) {
    console.log('Switching to page:', pageId);
    
    // Validate pageId
    const validPages = ['home', 'erpnext', 'crm', 'helpdesk'];
    if (!validPages.includes(pageId)) {
        console.error('Invalid page ID:', pageId);
        return;
    }
    
    // Hide all pages first
    const allPages = document.querySelectorAll('.page-content');
    console.log('Found pages:', allPages.length);
    
    allPages.forEach(function(page) {
        page.classList.add('hidden');
        page.style.display = 'none';
    });
    
    // Show selected page
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.style.display = 'block';
        currentPage = pageId;
        
        // Update navigation state
        updateNavigationState(pageId);
        
        // Update browser history and title
        updateHistory(pageId);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Close mobile menu if open
        closeMobileMenu();
        
        console.log('Successfully switched to page:', pageId);
        
        // Force a reflow to ensure the page is visible
        targetPage.offsetHeight;
        
    } else {
        console.error('Page not found:', 'page-' + pageId);
    }
}

// Update navigation active states
function updateNavigationState(activePageId) {
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    navLinks.forEach(function(link) {
        link.classList.remove('active');
        
        // Add active class to current page link
        const linkPage = link.getAttribute('data-page');
        if (linkPage === activePageId) {
            link.classList.add('active');
        }
    });
}

// Scroll to contact form
function scrollToContact() {
    console.log('Scrolling to contact');
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // If not on home page, go to home first
        if (currentPage !== 'home') {
            showPage('home');
            // Wait for page transition then scroll
            setTimeout(function() {
                contactForm.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } else {
            contactForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Close mobile menu if open
    closeMobileMenu();
}

// Mobile navigation functions
function setupMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!navToggle || !navMenu) {
        console.log('Mobile nav elements not found');
        return;
    }
    
    console.log('Setting up mobile navigation');
    
    // Add click event listener to toggle button
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
        
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking on nav links
    const mobileNavLinks = navMenu.querySelectorAll('.nav-link');
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            setTimeout(closeMobileMenu, 100);
        });
    });
}

function toggleMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!navToggle || !navMenu) {
        return;
    }
    
    const isActive = navToggle.classList.contains('active');
    
    if (isActive) {
        closeMobileMenu();
    } else {
        navToggle.classList.add('active');
        navMenu.classList.add('active');
    }
}

function closeMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!navToggle || !navMenu) {
        return;
    }
    
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
}

// Form validation setup
function setupFormValidation() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');

    if (!form || !successMessage) {
        console.log('Form elements not found');
        return;
    }

    console.log('Setting up form validation');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleFormSubmit();
    });

    // Remove error styling on input change
    const inputIds = ['firstName', 'lastName', 'email', 'phone', 'message'];
    inputIds.forEach(function(fieldId) {
        const inputElement = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (inputElement && errorElement) {
            inputElement.addEventListener('input', function() {
                this.classList.remove('error');
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            });
            
            inputElement.addEventListener('blur', function() {
                // Validate single field on blur
                validateSingleField(fieldId);
            });
        }
    });
}

// Validate single field
function validateSingleField(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return true;
    
    const value = input.value.trim();
    let errorMessage = '';
    
    switch(fieldId) {
        case 'firstName':
            if (!value) errorMessage = 'Podaj imię.';
            break;
        case 'lastName':
            if (!value) errorMessage = 'Podaj nazwisko.';
            break;
        case 'email':
            if (!value) {
                errorMessage = 'Podaj adres e-mail.';
            } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
                errorMessage = 'Podaj poprawny e-mail.';
            }
            break;
        case 'phone':
            if (value && !/^([+]?\d{1,3}[\s-]?)?(\d{9,12})$/.test(value.replace(/\s+/g, ''))) {
                errorMessage = 'Podaj poprawny numer telefonu.';
            }
            break;
        case 'message':
            if (!value) {
                errorMessage = 'Krótko opisz swoją potrzebę.';
            } else if (value.length < 10) {
                errorMessage = 'Opis musi mieć conajmniej 10 znaków.';
            }
            break;
    }
    
    if (errorMessage) {
        showFieldError(fieldId, errorMessage);
        return false;
    } else {
        clearFieldError(fieldId);
        return true;
    }
}

// Handle form submission
function handleFormSubmit() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    
    if (!form || !successMessage) {
        return;
    }

    console.log('Handling form submit');

    // Get form values
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const message = form.message.value.trim();

    // Validate form
    const isValid = validateForm(firstName, lastName, email, phone, message);

    // If valid, show success message
    if (isValid) {
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth' });
    }
}

// Form validation function
function validateForm(firstName, lastName, email, phone, message) {
    let isValid = true;

    // Clear all previous errors
    clearAllErrors();

    // Validate each field
    if (!validateSingleField('firstName')) isValid = false;
    if (!validateSingleField('lastName')) isValid = false;
    if (!validateSingleField('email')) isValid = false;
    if (!validateSingleField('phone')) isValid = false;
    if (!validateSingleField('message')) isValid = false;

    return isValid;
}

// Show field error
function showFieldError(fieldId, errorMessage) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '14px';
        errorElement.style.marginTop = '4px';
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

// Clear field error
function clearFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

// Clear all form errors
function clearAllErrors() {
    const errorElements = [
        'firstNameError', 'lastNameError', 'emailError', 'phoneError', 'messageError'
    ];
    
    errorElements.forEach(function(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    });

    // Remove error classes
    const inputElements = ['firstName', 'lastName', 'email', 'phone', 'message'];
    inputElements.forEach(function(inputId) {
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    });
}

// Handle browser back/forward buttons (simple history management)
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
        showPage(event.state.page);
    }
});

// Update browser history when changing pages
function updateHistory(pageId) {
    const pageTitle = getPageTitle(pageId);
    const url = window.location.pathname + '#' + pageId;
    
    if (history.pushState) {
        history.pushState({ page: pageId }, pageTitle, url);
        document.title = pageTitle;
    }
}

// Get page title based on page ID
function getPageTitle(pageId) {
    const titles = {
        'home': 'ERPNext.pl - Darmowy Ekosystem ERP Bez Licencji',
        'erpnext': 'ERPNext - Kompletny System ERP | ERPNext.pl',
        'crm': 'Frappe CRM - Nowoczesne Zarządzanie Sprzedażą | ERPNext.pl',
        'helpdesk': 'Frappe Helpdesk - Profesjonalne Wsparcie Klientów | ERPNext.pl'
    };
    
    return titles[pageId] || 'ERPNext.pl';
}

// Check URL hash on page load to show correct page
function checkUrlHash() {
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'erpnext', 'crm', 'helpdesk'];
    
    if (validPages.includes(hash)) {
        showPage(hash);
    }
}

// Smooth scroll utility (for internal page links)
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Utility function to handle external links
function openExternalLink(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Add some interactive enhancements
function addInteractiveEnhancements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.product-card, .module-card, .feature-detailed-card, .package-card');
    cards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            if (!this.style.transform || this.style.transform === 'translateY(0px)') {
                this.style.transform = 'translateY(-4px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0px)';
        });
    });
}

// Initialize interactive enhancements after DOM load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addInteractiveEnhancements, 200);
});

// Keyboard navigation support
document.addEventListener('keydown', function(event) {
    // ESC key closes mobile menu and FAQ items
    if (event.key === 'Escape') {
        closeMobileMenu();
        
        // Close all FAQ items
        const activeFAQs = document.querySelectorAll('.faq-question.active');
        activeFAQs.forEach(function(faq) {
            const faqAnswer = faq.parentElement.querySelector('.faq-answer');
            faq.classList.remove('active');
            faqAnswer.classList.remove('active');
        });
    }
    
    // Arrow key navigation between pages (with Ctrl/Cmd)
    if (event.ctrlKey || event.metaKey) {
        const pages = ['home', 'erpnext', 'crm', 'helpdesk'];
        const currentIndex = pages.indexOf(currentPage);
        
        if (event.key === 'ArrowRight' && currentIndex < pages.length - 1) {
            event.preventDefault();
            showPage(pages[currentIndex + 1]);
        } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
            event.preventDefault();
            showPage(pages[currentIndex - 1]);
        }
    }
});

// Performance optimization: Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(function(img) {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(function(img) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(lazyLoadImages, 100);
});

// Debug function to check page visibility
function debugPageVisibility() {
    const pages = ['home', 'erpnext', 'crm', 'helpdesk'];
    pages.forEach(function(pageId) {
        const page = document.getElementById('page-' + pageId);
        if (page) {
            const isHidden = page.classList.contains('hidden');
            console.log('Page', pageId, '- Hidden:', isHidden);
        } else {
            console.error('Page element not found:', 'page-' + pageId);
        }
    });
}

// Export functions for debugging (if needed)
if (typeof window !== 'undefined') {
    window.erpNextApp = {
        showPage: showPage,
        scrollToContact: scrollToContact,
        debugPageVisibility: debugPageVisibility,
        currentPage: function() { return currentPage; }
    };
}