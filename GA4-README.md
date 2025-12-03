# Google Analytics 4 - Dokumentacja

## Jak to działa

Kod GA4 jest **automatycznie ładowany przez `app.js`** na wszystkich stronach. Nie musisz dodawać żadnych skryptów w `<head>` nowych podstron.

## Struktura plików

```
www_erpnext/
├── app.js                          # Główny plik - ładuje GA4 dynamicznie
├── partials/
│   └── ga4-head.html              # Backup: kod GA4 (opcjonalny)
└── scripts/
    └── inject-ga4.js              # Backup: skrypt do wstawiania GA4 (opcjonalny)
```

## Dla nowych podstron HTML

Wystarczy dodać w `<head>`:

```html
<link rel="stylesheet" href="style.css?v=20251104b" />
<!-- GA4 loaded dynamically by app.js -->
</head>
```

**To wszystko!** GA4 załaduje się automatycznie przez `app.js`.

## Co jest trackowane

### Automatyczne eventy:
- **`page_view`** - każde wejście na stronę
- **`cta_click`** - kliknięcia w przyciski CTA ("Umów darmową konsultację", "Zobacz moduły")
- **`product_click`** - kliknięcia w karty produktów (ERPNext, CRM, Helpdesk)
- **`form_submit`** - wysłanie formularza kontaktowego
- **`case_study_click`** - kliknięcia w case studies

### Cookie Consent (RODO/GDPR):
- Banner pojawia się przy pierwszej wizycie
- Użytkownik może zaakceptować lub odrzucić tracking
- Wybór zapamiętywany przez **365 dni**
- Zgodne z **Google Consent Mode v2**

## Zmiana ID trackingu

Jeśli chcesz zmienić ID GA4 (obecnie `G-E6J3XF4YDF`):

1. Otwórz `app.js`
2. Znajdź linię:
   ```javascript
   script.src = 'https://www.googletagmanager.com/gtag/js?id=G-E6J3XF4YDF';
   ```
3. Zamień `G-E6J3XF4YDF` na nowe ID
4. Znajdź:
   ```javascript
   gtag('config', 'G-E6J3XF4YDF');
   ```
5. Zamień na nowe ID

## Testowanie

1. Otwórz stronę w przeglądarce
2. Otwórz DevTools (F12) → zakładka **Console**
3. Powinieneś zobaczyć:
   ```
   [GA4] Loaded and initialized
   [GA4] cta_click {button_text: "...", ...}
   ```
4. W GA4 → **Realtime** → sprawdź, czy eventy przychodzą

## Backup: Alternatywne metody

Jeśli z jakiegoś powodu nie chcesz używać dynamicznego ładowania przez `app.js`, możesz:

### Opcja A: Server-Side Include (SSI)
```html
<!--#include virtual="/partials/ga4-head.html" -->
```

### Opcja B: PHP Include
```php
<?php include 'partials/ga4-head.html'; ?>
```

### Opcja C: Build script
```bash
node scripts/inject-ga4.js
```

---

**Pytania?** Sprawdź kod w `app.js` (funkcja `injectGA4Scripts()`)
