/**
 * Teste local: node --env-file=../.env scripts/test-groq.mjs
 * (a partir da pasta api/)
 */
const key = process.env.GROQ_API_KEY?.trim()?.replace(/^['"]+|['"]+$/g, '')
const model = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'

if (!key) {
  console.error('❌ GROQ_API_KEY não definida')
  process.exit(1)
}

const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model,
    messages: [{ role: 'user', content: 'Responda apenas: OK' }],
    max_tokens: 16,
  }),
})

const data = await res.json()
if (!res.ok) {
  console.error('❌ Groq erro:', res.status, data.error?.message ?? data)
  process.exit(1)
}

const text = data.choices?.[0]?.message?.content
console.log('✅ Groq OK:', text?.slice(0, 80))
