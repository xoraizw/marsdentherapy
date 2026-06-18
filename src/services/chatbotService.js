import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

const SHOP_URL = 'https://theshinehopestore.com/'
const MEASURE_URL = 'https://theshinehopecompany.com/measure-your-hope/'

const SYSTEM_PROMPT = `You are the Shine Hope Assistant for The Shine Hope Company (theshinehopecompany.com). Tone: warm, bright, encouraging, hopeful — never clinical. Use short sentences (2-3 max). A sun emoji ☀️ or sparkle ✨ now and then is welcome but don't overdo it.

CORE MESSAGE: Hope is a measurable, teachable skill — not a feeling. Hopelessness is learned, but so is hope. "Hope IS a Strategy."

WHAT WE OFFER:
- Hopeful Minds: K-8 educator guides, parent guides, teen programs
- Hopeful Cities: city-wide hope initiatives (hopefulcities.org)
- Hopeful Mindsets: programs for college, workplace, veterans, recovery, incarcerated individuals
- Hope Courses (hopecourses.com): Mastering Moments of Hopelessness, From Hopelessness to Hope (suicide prevention), My Shine Hope Story, 5 Days to Shine Hope Challenge, Hopeful Mindsets Overview
- Books on hope as a strategy
- International Day of Hope (internationaldayofhope.org)
- Hope Science: research across cities, healthcare, sports, workplace, youth, veterans
- Free Hope Score assessment: ${MEASURE_URL}
- Hope Shop (books, journals, apparel, gifts): ${SHOP_URL}

WHEN TO POINT PEOPLE SOMEWHERE:
- Anyone curious about their own hope level → Measure Your Hope (${MEASURE_URL})
- Anyone wanting books, journals, gifts, apparel → Hope Shop (${SHOP_URL})
- Anyone wanting newsletter / updates / to be contacted → ask for their details

DO NOT offer to book appointments or schedule calls — we don't do that here. Direct them to the website, the shop, the assessment, or the newsletter signup instead.`

export class ChatbotService {
  constructor() {
    this.conversationHistory = []
  }

  async chat(userMessage) {
    try {
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      })

      const intent = this.detectIntent(userMessage)

      // Hard-coded fast paths for high-intent actions — saves tokens & guarantees CTAs
      if (intent === 'measure') {
        return {
          message: "Measuring your hope is the first step to growing it. 🌱 Take our free Hope Score assessment — it only takes a few minutes and you'll get personalized insights.",
          intent: 'measure',
          topic: 'Measure Your Hope',
          action: { type: 'link', label: 'Measure Your Hope', url: MEASURE_URL, icon: 'sparkles' }
        }
      }

      if (intent === 'shop') {
        return {
          message: "The Hope Shop is full of books, journals, apparel and gifts that spread hope wherever they go. ☀️",
          intent: 'shop',
          topic: 'Hope Shop',
          action: { type: 'link', label: 'Visit the Hope Shop', url: SHOP_URL, icon: 'shop' }
        }
      }

      if (intent === 'newsletter' || intent === 'lead') {
        return {
          message: "Wonderful — let's keep hope coming your way. ✉️ Drop your details and I'll add you to our community.",
          intent: 'newsletter',
          topic: 'Newsletter Signup'
        }
      }

      if (intent === 'appointment') {
        return {
          message: "We don't book individual appointments here, but you can take our free Hope Score assessment, browse our courses, or join our community to stay connected. ☀️",
          intent: 'measure',
          topic: 'Redirect',
          action: { type: 'link', label: 'Measure Your Hope', url: MEASURE_URL, icon: 'sparkles' }
        }
      }

      // Free-form OpenAI response
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...this.conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 180
      })

      const botMessage = response.choices[0].message.content

      this.conversationHistory.push({
        role: 'assistant',
        content: botMessage
      })

      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10)
      }

      // Smart-attach a CTA when the model mentions the assessment/shop
      const lower = botMessage.toLowerCase()
      let action = null
      if (lower.includes('measure') || lower.includes('assessment') || lower.includes('hope score')) {
        action = { type: 'link', label: 'Measure Your Hope', url: MEASURE_URL, icon: 'sparkles' }
      } else if (lower.includes('shop') || lower.includes('store') || lower.includes('book') || lower.includes('journal')) {
        action = { type: 'link', label: 'Visit the Hope Shop', url: SHOP_URL, icon: 'shop' }
      }

      return {
        message: botMessage,
        intent: intent,
        topic: this.extractTopic(userMessage),
        action,
        showMenu: true
      }
    } catch (error) {
      console.error('Chatbot error:', error)
      return {
        message: "Whoops — I'm having trouble right now. Please try again in a moment, or visit theshinehopecompany.com. ☀️",
        intent: 'error',
        topic: 'error'
      }
    }
  }

  detectIntent(message) {
    const m = message.toLowerCase()

    if (m.includes('measure') || m.includes('hope score') || m.includes('assessment') || m.includes('test my hope') || m.includes('how hopeful')) {
      return 'measure'
    }

    if (m.includes('shop') || m.includes('store') || m.includes('buy') || m.includes('merch') || m.includes('apparel') || m.includes('journal') || m.includes('gift')) {
      return 'shop'
    }

    if (m.includes('newsletter') || m.includes('subscribe') || m.includes('updates') || m.includes('email me') || m.includes('sign me up') || m.includes('stay in touch')) {
      return 'newsletter'
    }

    if (m.includes('appointment') || m.includes('book a call') || m.includes('schedule') || m.includes('meeting')) {
      return 'appointment'
    }

    if (m.includes('contact') || m.includes('phone') || m.includes('email') || m.includes('reach you')) {
      return 'contact_info'
    }

    return 'general'
  }

  extractTopic(message) {
    const m = message.toLowerCase()
    if (m.includes('measure') || m.includes('score') || m.includes('assessment')) return 'Measure Your Hope'
    if (m.includes('shop') || m.includes('store') || m.includes('book') || m.includes('journal')) return 'Hope Shop'
    if (m.includes('teen') || m.includes('kid') || m.includes('school') || m.includes('child')) return 'Hopeful Minds'
    if (m.includes('city') || m.includes('cities')) return 'Hopeful Cities'
    if (m.includes('workplace') || m.includes('work')) return 'Workplace Hope'
    if (m.includes('veteran')) return 'Veterans'
    if (m.includes('college') || m.includes('campus') || m.includes('university')) return 'Higher Education'
    if (m.includes('course')) return 'Hope Courses'
    if (m.includes('research') || m.includes('science') || m.includes('study')) return 'Hope Science'
    if (m.includes('international day')) return 'International Day of Hope'
    if (m.includes('newsletter') || m.includes('subscribe')) return 'Newsletter'
    return 'General Inquiry'
  }

  reset() {
    this.conversationHistory = []
  }
}
