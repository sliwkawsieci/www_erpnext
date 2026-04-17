// Cloudflare Worker for erpnext.pl contact forms
// Creates CRM Lead + Note in ERPNext

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx)
  }
}

const ALLOWED_ORIGINS = [
  'https://erpnext.pl',
  'https://www.erpnext.pl',
  'http://localhost:1313',
  'http://127.0.0.1:1313',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
]

function isOriginAllowed(origin) {
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}

function getCORSHeaders(origin) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': isOriginAllowed(origin) ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
}

async function handleRequest(request, env, ctx) {
  const origin = request.headers.get('Origin')

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: getCORSHeaders(origin)
    })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Only POST requests are allowed'
    }), {
      status: 405,
      headers: getCORSHeaders(origin)
    })
  }

  if (origin && !isOriginAllowed(origin)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Origin not allowed'
    }), {
      status: 403,
      headers: getCORSHeaders(origin)
    })
  }

  try {
    let formData
    const contentType = request.headers.get('Content-Type')

    if (contentType && contentType.includes('application/json')) {
      formData = await request.json()
    } else {
      const formDataObj = await request.formData()
      formData = {}
      for (const [key, value] of formDataObj.entries()) {
        formData[key] = value
      }
    }

    const debugEnabled = isDebugEnabled(env)

    if (debugEnabled) {
      console.log('=== CONTACT FORM DEBUG (PII-REDACTED) ===')
      console.log('Timestamp:', new Date().toISOString())
      console.log('Origin:', origin || 'direct')
    }

    normalizeLegacyFields(formData)

    const requiredFields = ['first_name', 'last_name', 'email_id', 'message']

    const missingFields = []
    for (const field of requiredFields) {
      const value = formData[field]
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field)
      }
    }

    if (missingFields.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        details: missingFields
      }), {
        status: 400,
        headers: getCORSHeaders(origin)
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const emailValue = formData.email_id ? String(formData.email_id).trim() : ''
    if (!emailRegex.test(emailValue)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: getCORSHeaders(origin)
      })
    }

    const sanitizedData = sanitizeInput(formData)
    sanitizedData.subject = 'Zapytanie z erpnext.pl'

    if (!sanitizedData.message || sanitizedData.message.trim().length < 10) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Message must be at least 10 characters'
      }), {
        status: 400,
        headers: getCORSHeaders(origin)
      })
    }

    if (sanitizedData.website && sanitizedData.website.trim()) {
      const normalizedWebsite = normalizeWebsiteInput(sanitizedData.website)
      if (!normalizedWebsite) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid website format'
        }), {
          status: 400,
          headers: getCORSHeaders(origin)
        })
      }
      sanitizedData.website = normalizedWebsite
    }

    const erpnextLeadData = {
      status: "New",
      first_name: sanitizedData.first_name,
      last_name: sanitizedData.last_name,
      email: sanitizedData.email_id,
      mobile_no: sanitizedData.mobile_no || "",
      website: sanitizedData.website || "",
      source: "erpnext.pl",
      lead_owner: env.LEAD_OWNER || "biuro@erpnext.pl",
      organization: sanitizedData.company_name || ""
    }

    if (debugEnabled) console.log('Prepared CRM Lead payload (PII-REDACTED):', buildPresenceMap(erpnextLeadData))

    const leadResponse = await createCRMLead(erpnextLeadData, env)

    if (debugEnabled) console.log('CRM Lead created:', { lead_id: leadResponse?.data?.name || null })

    let noteResponse = null
    if (sanitizedData.message && sanitizedData.message.trim()) {
      const noteData = {
        title: sanitizedData.subject || "Info od klienta",
        reference_docname: leadResponse.data.name,
        content: sanitizedData.message,
        reference_doctype: "CRM Lead"
      }

      noteResponse = await createCRMNote(noteData, env)
      if (debugEnabled) console.log('CRM Note created:', { note_id: noteResponse?.data?.name || null })
    }

    await sendAdminNotification(sanitizedData, leadResponse, noteResponse, env)

    if (sanitizedData['marketing-consent'] === 'on' || sanitizedData['marketing-consent'] === 'true') {
      await sendConfirmationEmail(sanitizedData, env)
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Form submitted successfully',
      lead_id: leadResponse.data?.name || null,
      note_id: noteResponse?.data?.name || null,
      redirect_url: '/dziekujemy.html'
    }), {
      status: 200,
      headers: getCORSHeaders(origin)
    })

  } catch (error) {
    if (isDebugEnabled(env)) {
      console.error('Error processing form submission:', error)
      console.error('Error stack:', error.stack)
    } else {
      console.error('Error processing form submission')
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: isDebugEnabled(env) ? error.message : false
    }), {
      status: 500,
      headers: getCORSHeaders(origin)
    })
  }
}

function sanitizeInput(data) {
  const sanitized = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim().replace(/[<>]/g, '')
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

function normalizeLegacyFields(data) {
  if (data && !data.first_name && data.name) {
    const parts = String(data.name).trim().split(/\s+/).filter(Boolean)
    if (parts.length > 0) {
      data.first_name = parts[0]
      data.last_name = parts.slice(1).join(' ') || '-'
    }
  }

  if (data && !data.email_id && data.email) {
    data.email_id = data.email
  }

  if (data && !data.mobile_no && data.phone) {
    data.mobile_no = data.phone
  }

  if (data && !data.company_name && data.company) {
    data.company_name = data.company
  }
}

function normalizeWebsiteInput(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const parsed = new URL(withScheme)
    if (!parsed.hostname || !parsed.hostname.includes('.')) return ''
    return parsed.toString()
  } catch {
    return ''
  }
}

async function createCRMLead(leadData, env) {
  const ERPNEXT_URL = requireEnv(env, 'ERPNEXT_URL')
  const API_KEY = requireEnv(env, 'API_KEY')
  const API_SECRET = requireEnv(env, 'API_SECRET')

  const response = await fetch(`${ERPNEXT_URL}/api/resource/CRM%20Lead`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${API_KEY}:${API_SECRET}`,
      'Accept': 'application/json',
      'Expect': ''
    },
    body: JSON.stringify(leadData)
  })

  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(`CRM Lead API error: ${response.status} ${response.statusText}`)
  }

  try {
    return JSON.parse(responseText)
  } catch (parseError) {
    throw new Error('Invalid response from CRM Lead API')
  }
}

async function createCRMNote(noteData, env) {
  const ERPNEXT_URL = requireEnv(env, 'ERPNEXT_URL')
  const API_KEY = requireEnv(env, 'API_KEY')
  const API_SECRET = requireEnv(env, 'API_SECRET')

  const response = await fetch(`${ERPNEXT_URL}/api/resource/FCRM%20Note`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${API_KEY}:${API_SECRET}`,
      'Accept': 'application/json',
      'Expect': ''
    },
    body: JSON.stringify(noteData)
  })

  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(`CRM Note API error: ${response.status} ${response.statusText}`)
  }

  try {
    return JSON.parse(responseText)
  } catch (parseError) {
    throw new Error('Invalid response from CRM Note API')
  }
}

async function sendAdminNotification(formData, leadResponse, noteResponse, env) {
  const adminEmail = env.ADMIN_EMAIL || 'biuro@erpnext.pl'

  if (isDebugEnabled(env)) {
    console.log('Admin notification (PII-REDACTED):', {
      to: adminEmail,
      lead_id: leadResponse?.data?.name || null,
      has_message: !!formData.message
    })
  }
}

async function sendConfirmationEmail(formData, env) {
  if (isDebugEnabled(env)) {
    console.log('Confirmation email (PII-REDACTED):', {
      to: formData.email_id,
      subject: 'Dziekujemy za kontakt z ERPNext.pl'
    })
  }
}

function requireEnv(env, name) {
  const value = env ? env[name] : undefined
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`Missing required environment binding: ${name}`)
  }
  return value
}

function isDebugEnabled(env) {
  return env && String(env.DEBUG || '').toLowerCase() === 'true'
}

function buildPresenceMap(data) {
  const result = {}
  for (const key of Object.keys(data || {})) {
    const value = data[key]
    result[key] = !!(value && (typeof value !== 'string' || value.trim() !== ''))
  }
  return result
}
