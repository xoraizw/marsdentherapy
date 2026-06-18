import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, updateLeadDealtWith } from '../lib/supabase'
import {
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  Eye,
  MousePointer,
  MessageCircle,
  ArrowLeft,
  RefreshCw,
  Activity,
  Menu,
  X,
  LayoutDashboard,
  Globe,
  PieChart as PieChartIcon,
  Phone
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

export default function CRMPage() {
  const [activeView, setActiveView] = useState('website')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [stats, setStats] = useState({
    totalVisitors: 0,
    chatbotOpens: 0,
    conversations: 0,
    leads: 0,
    appointments: 0
  })

  const [sectionViews, setSectionViews] = useState([])
  const [topTopics, setTopTopics] = useState([])
  const [mostBookedPrograms, setMostBookedPrograms] = useState([])
  const [recentLeads, setRecentLeads] = useState([])
  const [recentConversations, setRecentConversations] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  // Demo: voice-agent call outcome per lead (leadId -> { score, intent, label })
  const [callOutcomes, setCallOutcomes] = useState({})
  const [callDemoLead, setCallDemoLead] = useState(null)
  const [callDemoPhase, setCallDemoPhase] = useState('calling') // 'calling' | 'result'
  const [callDemoResult, setCallDemoResult] = useState(null) // { score, intent, label }

  // Demo: after "calling" phase, show result after short delay
  useEffect(() => {
    if (!callDemoLead || callDemoPhase !== 'calling') return
    const score = 6 + Math.floor(Math.random() * 4) // 6-9 for demo
    const label = score >= 8 ? 'Hot' : score >= 6 ? 'Warm' : 'Cold'
    const intent = `Interested in ${callDemoLead.interest || 'training'}. Open to scheduling a discovery call.`
    const t = setTimeout(() => {
      setCallDemoResult({ score, intent, label })
      setCallDemoPhase('result')
    }, 2200)
    return () => clearTimeout(t)
  }, [callDemoLead, callDemoPhase])

  useEffect(() => {
    fetchAnalytics()

    // Set up real-time subscriptions
    const leadsSubscription = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchAnalytics()
      })
      .subscribe()

    const conversationsSubscription = supabase
      .channel('conversations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchAnalytics()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(leadsSubscription)
      supabase.removeChannel(conversationsSubscription)
    }
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch total unique visitors (sessions)
      const { data: visitors } = await supabase
        .from('page_visits')
        .select('session_id')

      const uniqueVisitors = new Set(visitors?.map(v => v.session_id) || []).size

      // Fetch chatbot opens
      const { data: chatbotOpens } = await supabase
        .from('chatbot_interactions')
        .select('*')
        .eq('interaction_type', 'opened')

      // Fetch conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .order('timestamp', { ascending: false })

      // Fetch leads
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .order('timestamp', { ascending: false })

      // Fetch appointments
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('*')
        .order('timestamp', { ascending: false })

      // Fetch section views
      const { data: sections } = await supabase
        .from('section_views')
        .select('section')

      // Count section views
      const sectionCounts = {}
      sections?.forEach(s => {
        sectionCounts[s.section] = (sectionCounts[s.section] || 0) + 1
      })

      const sectionData = Object.entries(sectionCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        views: value
      }))

      // Count topics
      const topicCounts = {}
      conversations?.forEach(c => {
        if (c.topic) {
          topicCounts[c.topic] = (topicCounts[c.topic] || 0) + 1
        }
      })

      const topicData = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))

      // Most booked programs (from leads by interest)
      const programCounts = {}
      leads?.forEach(l => {
        const program = l.interest || 'Not specified'
        programCounts[program] = (programCounts[program] || 0) + 1
      })
      const mostBookedPrograms = Object.entries(programCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }))

      setStats({
        totalVisitors: uniqueVisitors,
        chatbotOpens: chatbotOpens?.length || 0,
        conversations: conversations?.length || 0,
        leads: leads?.length || 0,
        appointments: appointmentData?.length || 0
      })

      setSectionViews(sectionData)
      setTopTopics(topicData)
      setMostBookedPrograms(mostBookedPrograms)
      setRecentLeads(leads || [])
      setRecentConversations(conversations || [])
      setAppointments(appointmentData || [])

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="animate-spin text-emerald-400" size={48} />
        </div>
      )
    }

    switch (activeView) {
      case 'website':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <StatCard icon={Eye} label="Total Visitors" value={stats.totalVisitors} gradient="from-emerald-500 to-teal-500" />
              <StatCard icon={MessageCircle} label="Chatbot Opens" value={stats.chatbotOpens} gradient="from-emerald-500 to-teal-500" />
              <StatCard icon={MessageSquare} label="Conversations" value={stats.conversations} gradient="from-emerald-500 to-teal-500" />
              <StatCard icon={Users} label="Leads Captured" value={stats.leads} gradient="from-orange-500 to-amber-500" />
              <StatCard icon={Calendar} label="Appointments" value={stats.appointments} gradient="from-rose-500 to-red-500" />
            </div>

            {/* Section Views Chart */}
            <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <MousePointer size={20} className="text-emerald-400" />
                </div>
                Section Engagement
              </h2>
              {sectionViews.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={sectionViews}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="views" fill="url(#emeraldGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-12">No engagement data yet</p>
              )}
            </div>

            {/* Most booked programs */}
            <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <TrendingUp size={20} className="text-orange-400" />
                </div>
                Most Booked Programs
              </h2>
              {mostBookedPrograms.length > 0 ? (
                <div className="space-y-3">
                  {mostBookedPrograms.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                      <span className="text-sm font-medium text-white truncate pr-4">{item.name}</span>
                      <span className="text-sm font-bold text-orange-400 whitespace-nowrap">{item.count} lead{item.count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No program bookings yet</p>
              )}
            </div>
            
          </div>
        )

      case 'leads':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-orange-500/10 to-red-500/10 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Users size={20} className="text-orange-400" />
                  </div>
                  All Leads
                </h2>
                <span className="text-gray-400 text-sm">{recentLeads.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Program</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Dealt with</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Intent</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {recentLeads.map((lead, idx) => {
                      const outcome = lead.id ? callOutcomes[lead.id] : null
                      return (
                      <tr key={lead.id || idx} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{lead.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lead.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lead.phone || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">{lead.interest || '—'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={async () => {
                              if (!lead.id) return
                              const newValue = !lead.dealt_with
                              const ok = await updateLeadDealtWith(lead.id, newValue)
                              if (ok) setRecentLeads(prev => prev.map(l => l.id === lead.id ? { ...l, dealt_with: newValue } : l))
                            }}
                            disabled={!lead.id}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${lead.dealt_with ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-600/50 text-gray-400 hover:bg-gray-600'} ${!lead.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={lead.id ? (lead.dealt_with ? 'Mark as not dealt with' : 'Mark as dealt with') : 'ID required to update'}
                          >
                            {lead.dealt_with ? 'Yes' : 'No'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {outcome ? (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${outcome.label === 'Hot' ? 'bg-red-500/20 text-red-300' : outcome.label === 'Warm' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-500/20 text-gray-400'}`}>
                              {outcome.score}/10 · {outcome.label}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-[200px] truncate" title={outcome?.intent}>{outcome?.intent || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(lead.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            type="button"
                            onClick={() => {
                              setCallDemoLead(lead)
                              setCallDemoPhase('calling')
                              setCallDemoResult(null)
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/80 text-white hover:bg-emerald-500 text-xs font-medium transition-colors"
                            title="Demo: simulate voice agent call"
                          >
                            <Phone size={14} />
                            Call
                          </button>
                        </td>
                      </tr>
                    )})}
                    {recentLeads.length === 0 && (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-gray-400">No leads found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'bookings':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-rose-500/10 to-red-500/10 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="p-2 bg-rose-500/20 rounded-lg">
                    <Calendar size={20} className="text-rose-400" />
                  </div>
                  Appointments
                </h2>
                <span className="text-gray-400 text-sm">{appointments.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Client Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {appointments.map((apt, idx) => (
                      <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{apt.appointment_details?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{apt.appointment_details?.date || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{apt.appointment_details?.time || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-medium">{apt.appointment_details?.type || 'Consultation'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{apt.appointment_details?.email || 'N/A'}</td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No appointments scheduled</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'conversations':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Topics Pie Chart */}
            <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <PieChartIcon size={20} className="text-emerald-400" />
                </div>
                Topic Distribution
              </h2>
              {topTopics.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="w-full md:w-1/2 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topTopics}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {topTopics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2">
                    {topTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-sm text-gray-300">{topic.name}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{topic.value} ({((topic.value / stats.conversations) * 100).toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-12">No conversation data yet</p>
              )}
            </div>

            {/* Conversations Table */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <MessageSquare size={20} className="text-emerald-400" />
                  </div>
                  Recent Conversations
                </h2>
                <span className="text-gray-400 text-sm">{recentConversations.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">User Message</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Bot Response</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Topic</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {recentConversations.map((conv, idx) => (
                      <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-white max-w-xs truncate" title={conv.user_message}>{conv.user_message}</td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate" title={conv.bot_response}>{conv.bot_response}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">{conv.topic}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(conv.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                    {recentConversations.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">No conversations yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex text-gray-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-20'
          } bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <Activity className="text-emerald-500" size={24} />
              <span className="font-bold text-xl text-white">Conscious Solutions</span>
            </div>
          ) : (
            <Activity className="text-emerald-500 mx-auto" size={24} />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem
            icon={Globe}
            label="Website Stats"
            isActive={activeView === 'website'}
            isOpen={isSidebarOpen}
            onClick={() => setActiveView('website')}
          />
          <SidebarItem
            icon={Users}
            label="Leads"
            isActive={activeView === 'leads'}
            isOpen={isSidebarOpen}
            onClick={() => setActiveView('leads')}
          />
          <SidebarItem
            icon={Calendar}
            label="Bookings"
            isActive={activeView === 'bookings'}
            isOpen={isSidebarOpen}
            onClick={() => setActiveView('bookings')}
          />
          <SidebarItem
            icon={MessageSquare}
            label="Conversations"
            isActive={activeView === 'conversations'}
            isOpen={isSidebarOpen}
            onClick={() => setActiveView('conversations')}
          />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800/50 p-3 rounded-xl transition-all">
            <ArrowLeft size={20} />
            {isSidebarOpen && <span>Exit CRM</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 min-h-screen ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40 px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">{activeView}</h1>
            <p className="text-gray-400 text-sm">Real-time overview</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
          >
            <RefreshCw size={18} />
            <span>Refresh Data</span>
          </button>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      {/* Voice agent call demo modal */}
      {callDemoLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Phone size={20} className="text-emerald-400" />
                Voice agent demo
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">Simulated outbound call to lead</p>
            </div>
            <div className="p-6 space-y-4">
              {callDemoPhase === 'calling' ? (
                <>
                  <p className="text-gray-300 text-sm">Calling <span className="font-semibold text-white">{callDemoLead.name || 'Lead'}</span> at <span className="text-emerald-400">{callDemoLead.phone || '—'}</span>...</p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <RefreshCw size={16} className="animate-spin text-emerald-400" />
                    <span>Voice agent connecting · intent detection in progress</span>
                  </div>
                </>
              ) : (
                callDemoResult && (
                  <>
                    <p className="text-emerald-400 text-sm font-medium">Call complete. Lead scored.</p>
                    <div className="rounded-xl bg-gray-700/50 p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Detected intent</p>
                        <p className="text-sm text-white">{callDemoResult.intent}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Lead score (hotness)</p>
                        <p className="text-base font-bold">
                          <span className={`px-2.5 py-1 rounded-lg ${callDemoResult.label === 'Hot' ? 'bg-red-500/20 text-red-300' : callDemoResult.label === 'Warm' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-500/20 text-gray-400'}`}>
                            {callDemoResult.score}/10 · {callDemoResult.label}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">In production, this would be recorded and synced to your CRM.</p>
                  </>
                )
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/30 flex justify-end gap-2">
              {callDemoPhase === 'result' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (callDemoLead?.id && callDemoResult) setCallOutcomes(prev => ({ ...prev, [callDemoLead.id]: callDemoResult }))
                    setCallDemoLead(null)
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500"
                >
                  Save to lead & close
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCallDemoLead(null)}
                  className="px-4 py-2 rounded-lg bg-gray-600 text-gray-300 text-sm font-medium hover:bg-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SidebarItem({ icon: Icon, label, isActive, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive
        ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
    >
      <div className={`${isActive ? 'text-emerald-400' : ''}`}>
        <Icon size={20} />
      </div>
      {isOpen && <span className="font-medium whitespace-nowrap">{label}</span>}
      {isActive && isOpen && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
      )}
    </button>
  )
}

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-2 font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${gradient} opacity-75 group-hover:opacity-100 transition-opacity`}></div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  )
}

