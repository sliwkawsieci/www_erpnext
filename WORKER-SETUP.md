# Konfiguracja Cloudflare Worker dla erpnext.pl

## Stworzone pliki

| Plik | Opis |
|------|------|
| `workers/contact-form.js` | Kod workera (Cloudflare Worker) |
| `workers/wrangler.toml` | Konfiguracja deploymentu |
| `workers/README.md` | Dokumentacja workera |
| `dziekujemy.html` | Strona podziękowania po wysłaniu formularza |
| `scripts.js` (zaktualizowany) | Handler formularza po stronie klienta |

## Kroki wdrożenia

### 1. Zainstaluj Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Zaloguj się do Cloudflare
```bash
wrangler login
```

### 3. Ustaw zmienne środowiskowe (sekrety)
```bash
cd workers

wrangler secret put ERPNEXT_URL
# Wprowadź: https://system.erptech.cloud

wrangler secret put API_KEY
# Wprowadź: twój-api-key-z-erpnext

wrangler secret put API_SECRET
# Wprowadź: twój-api-secret-z-erpnext
```

### 4. Wdróż workera
```bash
wrangler deploy
```

Po deploymencie otrzymasz URL workera, np.:
`https://erpnext-pl-contact-worker.krzysztof-20a.workers.dev`

### 5. Zaktualizuj URL w scripts.js
W pliku `scripts.js` zmień linię 69:
```javascript
return 'https://erpnext-pl-contact-worker.TWÓJ-ACCOUNT.workers.dev/api/contact';
```

### 6. Skonfiguruj Route w Cloudflare Dashboard (opcjonalnie)
Jeśli chcesz używać `erpnext.pl/api/contact` zamiast bezpośredniego URL workera:

1. Wejdź w [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Workers & Pages → `erpnext-pl-contact-worker`
3. Settings → Triggers → Routes
4. Dodaj:
   - `erpnext.pl/api/contact`
   - `www.erpnext.pl/api/contact`

## Testowanie

### Lokalnie (wymaga wrangler):
```bash
cd workers
wrangler dev
```
Otwórz `http://localhost:8787` w przeglądarce.

### Na produkcji:
```bash
curl -X POST https://erpnext.pl/api/contact \
  -H "Origin: https://erpnext.pl" \
  -d "name=Test User" \
  -d "email=test@example.com" \
  -d "message=Test message" \
  -d "consent=yes"
```

## Mapowanie pól formularza

Worker obsługuje zarówno stare (legacy) jak i nowe nazewnictwo pól:

| Formularz (stare) | Formularz (nowe) | ERPNext CRM |
|-------------------|------------------|-------------|
| `name` | `first_name` + `last_name` | `first_name`, `last_name` |
| `email` | `email_id` | `email` |
| `phone` | `mobile_no` | `mobile_no` |
| `company` | `company_name` | `organization` |
| `message` | `message` | `content` (Note) |

## Uwagi

- Worker automatycznie dzieli `name` na `first_name` i `last_name`
- Tworzy Lead w ERPNext CRM + dodaje notatkę z wiadomością
- Obsługuje CORS dla domen `erpnext.pl` i `www.erpnext.pl`
- Walidacja: email, wymagane pola, min. 10 znaków w wiadomości
