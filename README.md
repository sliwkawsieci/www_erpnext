# Podstrona case study – Komfort Meble

Pliki:
- wdrozenie-producent-mebli.html – gotowa strona HTML.
- case-study.css – dedykowane style (mobile-first, breakpoints 768/1024/1440).
- scripts.js – interaktywne elementy (ROI, akordeony, lazy-load, walidacja formularza, GA events).
- images/ – placeholdery opisujące wymagane grafiki: 
  - case-study-meble-hero.webp (hala produkcyjna, 1920x1080)
  - case-study-portal.webp (mockup portalu B2B, 1200x800)
  - case-study-meble-og.jpg (grafika OG 1200x630 z metrykami)

## Integracja
1. Umieść pliki w głównym katalogu serwisu (www_erpnext).
2. Podlinkuj stronę w spisie wdrożeń casestudies.html jeśli potrzebne.
3. Podmień placeholdery w images/ prawdziwymi grafikami (zachowaj nazwy).
4. Upewnij się, że partials/site-partials.js i pp.js ładują nagłówek/stopkę jak na pozostałych podstronach.

## Tracking / GA
- Zdarzenia push do dataLayer: cta_consultation_click, pdf_case_study_download, oi_calculator_used, ccordion_open, contact_form_submit (customEvent w scripts.js).
- Dodaj odpowiednie tagi w GTM jeśli nie istnieją.

## Test checklist
- Responsywność: 320–1440px.
- Kontrast i focus states (WCAG 2.1 AA).
- Lazy loading obrazów poza foldem.
- Formularz wymaga zgody; po submit pokazuje komunikat.
- Kalkulator: zmiana sliderów aktualizuje etykiety, oblicza ROI.
- Linki do PDF/webinar/ebook działają lub prowadzą do realnych zasobów.

## Build/Performance
- Brak bundlera wymagany. CSS/JS już zminifikowane nie są – można przepuścić przez minifier przed produkcją.
- Font Inter ładowany z Google Fonts z preload.
