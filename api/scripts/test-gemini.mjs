/**
 * Teste local: node --env-file=../.env scripts/test-gemini.mjs
 * (a partir da pasta api/)
 */
const key = process.env.GEMINI_API_KEY?.trim()
const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'

if (!key) {
  console.error('❌ GEMINI_API_KEY não definida')
  process.exit(1)
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
const headers = { 'Content-Type': 'application/json' }
const fetchUrl = key.startsWith('AIza') ? `${url}?key=${encodeURIComponent(key)}` : url
if (!key.startsWith('AIza')) headers['x-goog-api-key'] = key

const res = await fetch(fetchUrl, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Responda apenas: OK' }] }],
  }),
})

const data = await res.json()
if (!res.ok) {
  console.error('❌ Gemini erro:', res.status, data.error?.message ?? data)
  process.exit(1)
}

const text = data.candidates?.[0]?.content?.parts?.[0]?.text
console.log('✅ Gemini OK:', text?.slice(0, 80))
