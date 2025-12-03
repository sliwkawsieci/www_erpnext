# Konfiguracja Matomo dla erpnext.pl

## Problem
Matomo jest zainstalowany na `www.vh13224.vh.net.pl`, ale strona działa na `erpnext.pl` (GitHub Pages z HTTPS).

## Wymagane kroki konfiguracji

### 1. Sprawdź Site ID w Matomo

1. Zaloguj się do Matomo: `https://www.vh13224.vh.net.pl/`
2. Przejdź do **Administration** → **Websites** → **Manage**
3. Sprawdź **Site ID** dla `erpnext.pl`
4. Jeśli nie ma jeszcze strony `erpnext.pl`, dodaj ją:
   - Kliknij **Add a new website**
   - Name: `ERPNext.pl`
   - URLs: `https://erpnext.pl`
   - Timezone: `Europe/Warsaw`
   - Zapisz i zanotuj **Site ID**

### 2. Site ID jest już skonfigurowany

Aktualnie używany Site ID: **`2`** (dla erpnext.pl)

Jeśli kiedykolwiek będziesz chciał zmienić Site ID, edytuj `app.js`:

```javascript
_paq.push(['setSiteId', 'TWOJ_SITE_ID']); // Zamień na właściwy ID
```

### 3. Skonfiguruj CORS na serwerze Matomo

Matomo musi zezwalać na requesty z `erpnext.pl`. Dodaj do `.htaccess` w katalogu Matomo:

```apache
# Allow CORS for erpnext.pl
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://erpnext.pl"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>
```

**Lub** w konfiguracji Matomo (`config/config.ini.php`):

```ini
[General]
cors_domains[] = "https://erpnext.pl"
```

### 4. Dodaj Trusted Hosts w Matomo

W pliku `config/config.ini.php` dodaj:

```ini
[General]
trusted_hosts[] = "www.vh13224.vh.net.pl"
trusted_hosts[] = "erpnext.pl"
```

### 5. Sprawdź SSL/HTTPS

Upewnij się, że Matomo działa na HTTPS:
- Sprawdź: `https://www.vh13224.vh.net.pl/matomo.php`
- Jeśli nie działa, skonfiguruj certyfikat SSL (Let's Encrypt)

### 6. Testowanie

Po wdrożeniu na GitHub Pages:

1. Otwórz `https://erpnext.pl` w przeglądarce
2. Otwórz DevTools (F12) → **Console**
3. Sprawdź logi:
   ```
   [Matomo] Initialized with URL: https://www.vh13224.vh.net.pl/
   [Matomo] Script loaded successfully
   ```
4. Sprawdź **Network** → poszukaj requestów do `matomo.php`
5. W panelu Matomo → **Visitors** → **Real-time** → powinieneś zobaczyć swoją wizytę

### 7. Alternatywa: Matomo Cloud

Jeśli problemy z CORS się utrzymują, rozważ:
- **Matomo Cloud** (https://matomo.org/matomo-cloud/) - bez problemów z CORS
- **Self-hosted Matomo na tym samym serwerze** co strona
- **Subdomena**: `analytics.erpnext.pl` → wskazująca na Matomo

## Sprawdzanie błędów

### Błąd: "Failed to load script"
- Sprawdź czy `https://www.vh13224.vh.net.pl/matomo.js` jest dostępny
- Sprawdź certyfikat SSL
- Sprawdź CORS headers

### Błąd: "Mixed Content"
- GitHub Pages wymaga HTTPS
- Upewnij się, że używasz `https://` w URL Matomo

### Brak danych w Matomo
- Sprawdź Site ID
- Sprawdź czy strona jest dodana w Matomo
- Sprawdź firewall/blokowanie skryptów (AdBlock)

## Aktualna konfiguracja w app.js

```javascript
var u = 'https://www.vh13224.vh.net.pl/';
_paq.push(['setTrackerUrl', u + 'matomo.php']);
_paq.push(['setSiteId', '2']);  // Site ID dla erpnext.pl
```

## Kontakt z supportem Matomo

Jeśli problemy się utrzymują:
- Forum: https://forum.matomo.org/
- Dokumentacja: https://matomo.org/docs/
