# Analytics - Dokumentacja (GA4 + Matomo)

## Jak to działa

Kody **Google Analytics 4** i **Matomo** są **automatycznie ładowane przez `app.js`** na wszystkich stronach. Nie musisz dodawać żadnych skryptów w `<head>` nowych podstron.

Oba systemy analityczne działają równolegle i trackują te same eventy.

## Struktura plików

```
www_erpnext/
├── app.js                          # Główny plik - ładuje GA4 i Matomo dynamicznie
├── ANALYTICS-README.md             # Ta dokumentacja
├── partials/
│   ├── ga4-head.html              # Backup: kod GA4 (opcjonalny)
│   └── matomo-head.html           # Backup: kod Matomo (opcjonalny)
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

**To wszystko!** GA4 i Matomo załadują się automatycznie przez `app.js`.

## Co jest trackowane

### Automatyczne eventy (GA4 + Matomo):
- **`page_view`** - każde wejście na stronę
- **`cta_click`** - kliknięcia w przyciski CTA ("Umów darmową konsultację", "Zobacz moduły")
- **`product_click`** - kliknięcia w karty produktów (ERPNext, CRM, Helpdesk)
- **`form_submit`** - wysłanie formularza kontaktowego
- **`case_study_click`** - kliknięcia w case studies

Wszystkie eventy są wysyłane **jednocześnie** do GA4 i Matomo.

### Cookie Consent (RODO/GDPR):
- Banner pojawia się przy pierwszej wizycie
- Użytkownik może zaakceptować lub odrzucić tracking
- Wybór zapamiętywany przez **365 dni**
- Zgodne z **Google Consent Mode v2**

## Zmiana ID trackingu

### Google Analytics 4

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

### Matomo

Jeśli chcesz zmienić konfigurację Matomo (obecnie `//www.vh13224.vh.net.pl/` + Site ID `1`):

1. Otwórz `app.js`
2. Znajdź funkcję `injectMatomoScripts()`
3. Zmień URL:
   ```javascript
   var u = '//www.vh13224.vh.net.pl/';  // Twój URL Matomo
   ```
4. Zmień Site ID:
   ```javascript
   _paq.push(['setSiteId', '1']);  // Twój Site ID
   ```

## Testowanie

1. Otwórz stronę w przeglądarce
2. Otwórz DevTools (F12) → zakładka **Console**
3. Powinieneś zobaczyć:
   ```
   [GA4] Loaded and initialized
   [Matomo] Loaded and initialized
   [GA4] cta_click {button_text: "...", ...}
   [Matomo] cta click Umów darmową konsultację hero_section
   ```
4. W GA4 → **Realtime** → sprawdź, czy eventy przychodzą
5. W Matomo → **Visitors** → **Real-time** → sprawdź tracking

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
