import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Analytics tracking functions
export const trackPageVisit = async (sessionId, page) => {
  try {
    const { error } = await supabase
      .from('page_visits')
      .insert([
        {
          session_id: sessionId,
          page: page,
          timestamp: new Date().toISOString()
        }
      ])
    if (error) console.error('Error tracking page visit:', error)
  } catch (err) {
    console.error('Error:', err)
  }
}

export const trackSectionView = async (sessionId, section) => {
  try {
    const { error } = await supabase
      .from('section_views')
      .insert([
        {
          session_id: sessionId,
          section: section,
          timestamp: new Date().toISOString()
        }
      ])
    if (error) console.error('Error tracking section view:', error)
  } catch (err) {
    console.error('Error:', err)
  }
}

export const trackChatbotOpen = async (sessionId) => {
  try {
    const { error } = await supabase
      .from('chatbot_interactions')
      .insert([
        {
          session_id: sessionId,
          interaction_type: 'opened',
          timestamp: new Date().toISOString()
        }
      ])
    if (error) console.error('Error tracking chatbot open:', error)
  } catch (err) {
    console.error('Error:', err)
  }
}

export const trackConversation = async (sessionId, userMessage, botResponse, topic) => {
  try {
    const { error } = await supabase
      .from('conversations')
      .insert([
        {
          session_id: sessionId,
          user_message: userMessage,
          bot_response: botResponse,
          topic: topic,
          timestamp: new Date().toISOString()
        }
      ])
    if (error) console.error('Error tracking conversation:', error)
  } catch (err) {
    console.error('Error:', err)
  }
}

export const trackLead = async (sessionId, name, email, phone, interest) => {
  try {
    const { error } = await supabase
      .from('leads')
      .insert([
        {
          session_id: sessionId,
          name: name,
          email: email,
          phone: phone,
          interest: interest,
          timestamp: new Date().toISOString()
        }
      ])
    if (error) console.error('Error tracking lead:', error)
  } catch (err) {
    console.error('Error:', err)
  }
}

export const updateLeadDealtWith = async (leadId, dealtWith) => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ dealt_with: dealtWith })
      .eq('id', leadId)
    if (error) {
      console.error('Error updating lead:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Error:', err)
    return false
  }
}

export const trackAppointment = async (sessionId, leadId, appointmentDetails) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .insert([
        {
          session_id: sessionId,
          lead_id: leadId,
          appointment_details: appointmentDetails,
          timestamp: new Date().toISOString()
        }
      ])
    if (error) console.error('Error tracking appointment:', error)
  } catch (err) {
    console.error('Error:', err)
  }
}

// Generate session ID
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get or create session ID
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('conscious_solutions_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('conscious_solutions_session_id', sessionId)
  }
  return sessionId
}

