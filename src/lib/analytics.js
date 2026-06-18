const KEY = 'hope_events'

function safeLoad() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function safeSave(events) {
  try {
    localStorage.setItem(KEY, JSON.stringify(events))
    window.dispatchEvent(new CustomEvent('hope-events-updated'))
  } catch (err) {
    console.error('analytics save failed', err)
  }
}

export function logEvent(type, payload = {}) {
  const events = safeLoad()
  events.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type,
    timestamp: new Date().toISOString(),
    ...payload
  })
  safeSave(events)
}

export function getEvents() {
  return safeLoad()
}

export function clearEvents() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent('hope-events-updated'))
}

// Convenience trackers
export const trackOpen = (sessionId) => logEvent('chatbot_open', { sessionId })
export const trackOption = (sessionId, optionId, label) => logEvent('option_select', { sessionId, optionId, label })
export const trackChat = (sessionId, userMessage, botResponse, topic, intent) =>
  logEvent('conversation', { sessionId, userMessage, botResponse, topic, intent })
export const trackCta = (sessionId, ctaType, source) => logEvent('cta_click', { sessionId, ctaType, source })
export const trackLeadEvent = (sessionId, name, email, phone, interest) =>
  logEvent('lead', { sessionId, name, email, phone, interest })

// Seed demo data so the dashboard isn't empty on first load (idempotent)
export function seedIfEmpty() {
  const existing = safeLoad()
  if (existing.length > 0) return
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const sessions = ['demo_s1', 'demo_s2', 'demo_s3', 'demo_s4', 'demo_s5']
  const topics = ['Measure Your Hope', 'Hopeful Minds', 'Hope Shop', 'Hope Courses', 'Hopeful Cities', 'Workplace Hope', 'Hope Science', 'General Inquiry']
  const intents = ['measure', 'shop', 'general', 'newsletter']
  const seed = []
  const push = (offset, type, payload) => seed.push({
    id: `seed_${seed.length}`,
    type,
    timestamp: new Date(now - offset).toISOString(),
    ...payload
  })

  sessions.forEach((sid, i) => {
    push(day * (6 - i) + 1000, 'chatbot_open', { sessionId: sid })
    push(day * (6 - i) + 800, 'option_select', { sessionId: sid, optionId: 'general', label: 'Ask About Hope' })
    for (let j = 0; j < 2 + (i % 3); j++) {
      const topic = topics[(i + j) % topics.length]
      push(day * (6 - i) + 600 - j * 100, 'conversation', {
        sessionId: sid,
        userMessage: `Tell me about ${topic.toLowerCase()}`,
        botResponse: `Sure — here's a quick intro to ${topic}. ☀️`,
        topic,
        intent: intents[j % intents.length]
      })
    }
    if (i % 2 === 0) push(day * (6 - i) + 200, 'cta_click', { sessionId: sid, ctaType: 'measure', source: 'quickbar' })
    if (i % 3 === 0) push(day * (6 - i) + 100, 'cta_click', { sessionId: sid, ctaType: 'shop', source: 'inline' })
    if (i % 2 === 1) push(day * (6 - i), 'lead', {
      sessionId: sid,
      name: `Hope Friend ${i + 1}`,
      email: `friend${i + 1}@example.com`,
      phone: '',
      interest: ['Hopeful Minds (K–8 / Teens)', 'Workplace Hope', 'Hope Courses & Books'][i % 3]
    })
  })

  safeSave(seed)
}
