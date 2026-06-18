import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, ShoppingBag, Sparkles, HelpCircle, Phone, ExternalLink, Sun } from 'lucide-react'
import { ChatbotService } from '../services/chatbotService'
import { trackChatbotOpen, trackConversation, trackLead, getSessionId } from '../lib/supabase'
import { trackOpen, trackOption, trackChat, trackCta, trackLeadEvent } from '../lib/analytics'

const chatbotService = new ChatbotService()

const SHOP_URL = 'https://theshinehopestore.com/'
const MEASURE_URL = 'https://theshinehopecompany.com/measure-your-hope/'

const CHAT_OPTIONS = [
  { id: 'general', label: 'Ask About Hope', icon: HelpCircle, description: 'Programs, science, courses & more' },
  { id: 'measure', label: 'Measure Your Hope', icon: Sparkles, description: 'Take the free Hope Score assessment' },
  { id: 'shop', label: 'Visit the Hope Shop', icon: ShoppingBag, description: 'Books, gear & gifts that spread hope' },
  { id: 'newsletter', label: 'Stay Connected', icon: Phone, description: 'Get hope resources in your inbox' }
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(getSessionId())
  const [currentWorkflow, setCurrentWorkflow] = useState(null)
  const [showOptions, setShowOptions] = useState(true)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: '' })
  const messagesEndRef = useRef(null)
  const hasTrackedOpen = useRef(false)

  useEffect(() => {
    if (isOpen && !hasTrackedOpen.current) {
      trackChatbotOpen(sessionId)
      trackOpen(sessionId)
      hasTrackedOpen.current = true

      setMessages([{
        id: Date.now(),
        text: "Hi sunshine! ☀️ Welcome to The Shine Hope Company. Hope is a skill — and I'm here to help you build it. What would you like to do today?",
        sender: 'bot',
        showOptions: true
      }])
    }
  }, [isOpen, sessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const openExternal = (url, ctaType, source = 'inline') => {
    if (ctaType) trackCta(sessionId, ctaType, source)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleOptionSelect = (optionId) => {
    setCurrentWorkflow(optionId)
    setShowOptions(false)

    const optLabel = CHAT_OPTIONS.find(o => o.id === optionId)?.label
    trackOption(sessionId, optionId, optLabel)

    const userMsg = {
      id: Date.now(),
      text: optLabel,
      sender: 'user'
    }
    setMessages(prev => [...prev, userMsg])

    setTimeout(() => {
      if (optionId === 'general') {
        const botMsg = {
          id: Date.now() + 1,
          text: "Wonderful! ✨ I can tell you about our Hopeful Minds programs (for kids, teens & schools), Hopeful Cities, courses, books, the science of hope, or our International Day of Hope. What's on your mind?",
          sender: 'bot'
        }
        setMessages(prev => [...prev, botMsg])
      } else if (optionId === 'measure') {
        const botMsg = {
          id: Date.now() + 1,
          text: "Hope can be measured — and once you know your score, you can grow it. 🌱 Take the free Hope Score assessment to see where you stand and get personalized next steps.",
          sender: 'bot',
          action: { type: 'link', label: 'Measure Your Hope', url: MEASURE_URL, icon: 'sparkles' },
          showOptions: true
        }
        setMessages(prev => [...prev, botMsg])
        setShowOptions(true)
      } else if (optionId === 'shop') {
        const botMsg = {
          id: Date.now() + 1,
          text: "Spread the hope! 💛 Our shop has books, journals, apparel and gifts designed to remind you (and the people you love) that hope is a strategy.",
          sender: 'bot',
          action: { type: 'link', label: 'Visit the Hope Shop', url: SHOP_URL, icon: 'shop' },
          showOptions: true
        }
        setMessages(prev => [...prev, botMsg])
        setShowOptions(true)
      } else if (optionId === 'newsletter') {
        const botMsg = {
          id: Date.now() + 1,
          text: "Love it! Drop your details below and we'll send hope resources, event invites and program news your way. ✉️",
          sender: 'bot'
        }
        setMessages(prev => [...prev, botMsg])
        setShowLeadForm(true)
        setFormData({ name: '', email: '', phone: '', interest: '' })
      }
    }, 400)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMsg = inputMessage.trim()
    const userMessageObj = {
      id: Date.now(),
      text: userMsg,
      sender: 'user'
    }

    setMessages(prev => [...prev, userMessageObj])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await chatbotService.chat(userMsg, null)

      const botMessageObj = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'bot',
        action: response.action || null,
        showOptions: ['contact_info', 'shop', 'measure'].includes(response.intent)
      }

      setMessages(prev => [...prev, botMessageObj])

      await trackConversation(sessionId, userMsg, response.message, response.topic)
      trackChat(sessionId, userMsg, response.message, response.topic, response.intent)

      if (response.intent === 'newsletter' || response.intent === 'lead') {
        setCurrentWorkflow('newsletter')
        setTimeout(() => {
          setShowLeadForm(true)
          setShowOptions(false)
        }, 600)
      } else if (response.showMenu) {
        setShowOptions(true)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Whoops — I'm having trouble right now. Please try again, or visit theshinehopecompany.com. ☀️",
        sender: 'bot'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLeadSubmit = async (e) => {
    e.preventDefault()

    try {
      await trackLead(sessionId, formData.name, formData.email, formData.phone, formData.interest || 'Newsletter / Hope updates')
      trackLeadEvent(sessionId, formData.name, formData.email, formData.phone, formData.interest || 'Newsletter / Hope updates')

      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `You're in, ${formData.name}! 🎉 We'll send hope resources to ${formData.email}. In the meantime, want to measure your hope or check out the shop?`,
        sender: 'bot',
        showOptions: true
      }])
      setShowLeadForm(false)
      setShowOptions(true)
      setFormData({ name: '', email: '', phone: '', interest: '' })
      setCurrentWorkflow(null)
    } catch (error) {
      console.error('Error submitting lead:', error)
    }
  }

  const resetChat = () => {
    setCurrentWorkflow(null)
    setShowOptions(true)
    setShowLeadForm(false)
    setMessages([{
      id: Date.now(),
      text: "What else can I help you discover about hope? ☀️",
      sender: 'bot',
      showOptions: true
    }])
  }

  const ActionButton = ({ action }) => {
    if (!action || action.type !== 'link') return null
    const Icon = action.icon === 'sparkles' ? Sparkles : action.icon === 'shop' ? ShoppingBag : ExternalLink
    return (
      <button
        onClick={() => openExternal(action.url, action.url === MEASURE_URL ? 'measure' : action.url === SHOP_URL ? 'shop' : null, 'inline')}
        className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-bold text-sm px-5 py-3 rounded-full shadow-lg shadow-amber-200 hover:shadow-amber-300 active:scale-95 transition-all"
      >
        <Icon size={16} />
        {action.label}
        <ExternalLink size={14} className="opacity-70" />
      </button>
    )
  }

  return (
    <>
      {/* Chatbot Toggle Button + Popout */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 flex items-end gap-0 z-50">
          <div className="mb-1 mr-2 px-4 py-3 bg-white rounded-2xl rounded-br-md shadow-xl border-2 border-amber-300 max-w-[240px] animate-in fade-in slide-in-from-right-4 duration-500">
            <p className="text-sm font-extrabold text-slate-900 leading-snug">Need a little hope today? ☀️</p>
            <p className="text-xs text-slate-600 mt-0.5">Chat with us — we&apos;d love to help.</p>
            <p className="text-[11px] text-amber-600 font-bold mt-2 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Tap to open
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-br from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-900 rounded-full p-4 shadow-2xl hover:scale-110 active:scale-105 transition-all duration-200 ring-4 ring-amber-300/40"
            aria-label="Open Hope chatbot"
          >
            <Sun size={28} strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 bg-white text-amber-600 text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-lg font-bold border-2 border-amber-500">
              !
            </span>
          </button>
        </div>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[650px] bg-gradient-to-b from-amber-50 via-white to-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(255,170,0,0.35)] flex flex-col z-50 border-2 border-amber-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-300 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-2xl shadow-md">
                <Sun size={24} className="text-amber-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight">Shine Hope Assistant</h3>
                <p className="text-xs text-slate-800 flex items-center gap-1.5 font-bold mt-0.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Hope IS a Strategy
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/40 rounded-full p-2 transition-all duration-200 text-slate-800"
              aria-label="Close chatbot"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((message) => (
              <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-[1.25rem] px-5 py-3.5 ${message.sender === 'user'
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-300 text-slate-900 rounded-br-none shadow-md font-medium'
                      : 'bg-white text-slate-800 shadow-sm rounded-bl-none border border-amber-100'
                      }`}
                  >
                    <p className="text-[0.925rem] leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                    {message.action && message.sender === 'bot' && (
                      <ActionButton action={message.action} />
                    )}
                  </div>
                </div>

                {/* Show options after message */}
                {message.showOptions && showOptions && (
                  <div className="mt-5 grid grid-cols-1 gap-2.5 ml-1">
                    {CHAT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        className="w-full bg-white hover:bg-amber-50 border-2 border-amber-100 hover:border-amber-300 rounded-2xl p-3.5 text-left transition-all duration-300 hover:shadow-md group active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-amber-300 to-yellow-200 p-2.5 rounded-xl group-hover:from-amber-400 group-hover:to-yellow-300 transition-colors shadow-sm">
                            <option.icon size={18} className="text-slate-900" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1">
                            <p className="font-extrabold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">{option.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white text-slate-800 rounded-2xl rounded-bl-none px-5 py-3.5 shadow-sm border border-amber-100">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Lead Form */}
            {showLeadForm && (
              <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-amber-100 animate-in zoom-in-95 duration-300">
                <h4 className="font-extrabold mb-4 text-slate-900 text-center text-lg">
                  ☀️ Stay Connected with Hope
                </h4>
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-amber-100 rounded-2xl text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-amber-100 rounded-2xl text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Phone (optional)</label>
                    <input
                      type="tel"
                      placeholder="+1 555 555 5555"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-amber-100 rounded-2xl text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">I&apos;m most interested in</label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-amber-100 rounded-2xl text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all outline-none bg-white"
                    >
                      <option value="">— Select —</option>
                      <option value="Hopeful Minds (K–8 / Teens)">Hopeful Minds (K–8 / Teens)</option>
                      <option value="Hopeful Cities">Hopeful Cities</option>
                      <option value="Workplace Hope">Workplace Hope</option>
                      <option value="Higher Education">Higher Education</option>
                      <option value="Veterans / Recovery">Veterans / Recovery</option>
                      <option value="Hope Courses & Books">Hope Courses & Books</option>
                      <option value="International Day of Hope">International Day of Hope</option>
                      <option value="General Updates">General Updates</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-900 py-4 rounded-2xl transition-all duration-300 text-sm font-extrabold shadow-lg shadow-amber-200 active:scale-[0.98] mt-2"
                  >
                    Send Me Hope ☀️
                  </button>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Bar — always visible */}
          <div className="px-4 py-3 bg-amber-50/60 border-t border-amber-100 flex gap-2">
            <button
              onClick={() => openExternal(MEASURE_URL, 'measure', 'quickbar')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-amber-100 border border-amber-200 text-slate-900 text-xs font-bold px-3 py-2 rounded-full transition-all active:scale-95"
            >
              <Sparkles size={14} className="text-amber-500" />
              Measure Hope
            </button>
            <button
              onClick={() => openExternal(SHOP_URL, 'shop', 'quickbar')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-900 text-xs font-bold px-3 py-2 rounded-full shadow-md active:scale-95 transition-all"
            >
              <ShoppingBag size={14} />
              Hope Shop
            </button>
          </div>

          {/* Input Area */}
          {(!showLeadForm && messages.length > 0) && (
            <div className="p-4 border-t border-amber-100 bg-white">
              <div className="flex gap-3 items-end">
                <div className="flex-1 bg-amber-50/70 rounded-2xl px-4 py-2 border-2 border-transparent focus-within:border-amber-300 focus-within:bg-white transition-all">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about hope..."
                    rows="1"
                    className="w-full py-2 bg-transparent focus:outline-none text-[0.925rem] resize-none overflow-hidden"
                    disabled={isLoading}
                    style={{
                      minHeight: '24px',
                      maxHeight: '120px'
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-br from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-900 rounded-xl p-3.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95"
                  aria-label="Send message"
                >
                  <Send size={18} strokeWidth={2.5} />
                </button>
              </div>
              <button
                onClick={resetChat}
                className="w-full mt-3 text-xs text-slate-400 hover:text-amber-600 transition-colors font-bold uppercase tracking-wider"
              >
                ← Back to Main Menu
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
