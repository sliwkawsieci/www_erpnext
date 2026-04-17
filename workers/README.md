# Cloudflare Worker for erpnext.pl Contact Form

## Deployment

### 1. Install Wrangler
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Set Secrets
```bash
cd workers
wrangler secret put ERPNEXT_URL
# Enter: https://system.erptech.cloud

wrangler secret put API_KEY
# Enter: your-erpnext-api-key

wrangler secret put API_SECRET
# Enter: your-erpnext-api-secret
```

### 4. Deploy Worker
```bash
wrangler deploy
```

### 5. Configure Routes in Cloudflare Dashboard
Go to: Workers & Pages → erpnext-pl-contact-worker → Triggers → Routes

Add:
- `erpnext.pl/api/contact`
- `www.erpnext.pl/api/contact`

## Testing

```bash
curl -X POST https://erpnext.pl/api/contact \
  -H "Origin: https://erpnext.pl" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message from curl"}'
```

## Worker URL
After deployment, note the worker URL (e.g., `https://erpnext-pl-contact-worker.your-account.workers.dev`)
Update the handler in `../scripts.js` with this URL.
