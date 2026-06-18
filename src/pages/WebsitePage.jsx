import { useEffect } from 'react'
import { trackPageVisit, getSessionId } from '../lib/supabase'

export default function WebsitePage() {
  const sessionId = getSessionId()

  useEffect(() => {
    trackPageVisit(sessionId, 'home')
  }, [sessionId])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <iframe
        src="/marsdentherapy-webpage.html"
        className="w-full h-full border-0"
        title="Marsden Therapy"
        id="website-iframe"
      />
    </div>
  )
}
