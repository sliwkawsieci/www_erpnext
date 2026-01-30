# Podstrona case study – Komfort Meble

Pliki:
- wdrozenie-producent-mebli.html – gotowa strona HTML.
- case-study.css – dedykowane style (mobile-first, breakpoints 768/1024/1440).
- scripts.js – interaktywne elementy (ROI, akordeony, lazy-load, walidacja formularza, GA events).
- images/ – placeholdery opisuj¹ce wymagane grafiki: 
  - case-study-meble-hero.webp (hala produkcyjna, 1920x1080)
  - case-study-portal.webp (mockup portalu B2B, 1200x800)
  - case-study-meble-og.jpg (grafika OG 1200x630 z metrykami)

## Integracja
1. Umieœæ pliki w g³ównym katalogu serwisu (www_erpnext).
2. Podlinkuj stronê w spisie wdro¿eñ casestudies.html jeœli potrzebne.
3. Podmieñ placeholdery w images/ prawdziwymi grafikami (zachowaj nazwy).
4. Upewnij siê, ¿e partials/site-partials.js i app.js ³aduj¹ nag³ówek/stopkê jak na pozosta³ych podstronach.

## Tracking / GA
- Zdarzenia push do dataLayer: cta_consultation_click, pdf_case_study_download, roi_calculator_used, accordion_open, contact_form_submit (customEvent w scripts.js).
- Dodaj odpowiednie tagi w GTM jeœli nie istniej¹.

## Test checklist
- Responsywnoœæ: 320–1440px.
- Kontrast i focus states (WCAG 2.1 AA).
- Lazy loading obrazów poza foldem.
- Formularz wymaga zgody; po submit pokazuje komunikat.
- Kalkulator: zmiana sliderów aktualizuje etykiety, oblicza ROI.
- Linki do PDF/webinar/ebook dzia³aj¹ lub prowadz¹ do realnych zasobów.

## Build/Performance
- Brak bundlera wymagany. CSS/JS ju¿ zminifikowane nie s¹ – mo¿na przepuœciæ przez minifier przed produkcj¹.
- Font Inter ³adowany z Google Fonts z preload.

