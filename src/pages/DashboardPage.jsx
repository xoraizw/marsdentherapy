import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun, MessageCircle, MessageSquare, Sparkles, ShoppingBag, Users, ArrowLeft,
  RefreshCw, Trash2, TrendingUp, Activity, ExternalLink, Mail, Calendar, Heart
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { getEvents, clearEvents, seedIfEmpty } from '../lib/analytics'

const PALETTE = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#f97316', '#fb923c', '#fdba74', '#facc15']
const SHOP_URL = 'https://theshinehopestore.com/'
const MEASURE_URL = 'https://theshinehopecompany.com/measure-your-hope/'

export default function DashboardPage() {
  const [events, setEvents] = useState([])
  const [activeView, setActiveView] = useState('overview')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    seedIfEmpty()
    setEvents(getEvents())
    const handler = () => setEvents(getEvents())
    window.addEventListener('hope-events-updated', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('hope-events-updated', handler)
      window.removeEventListener('storage', handler)
    }
  }, [tick])

  const refresh = () => {
    setEvents(getEvents())
    setTick(t => t + 1)
  }

  const handleClear = () => {
    if (confirm('Clear all dashboard data? This cannot be undone.')) {
      clearEvents()
      setEvents([])
    }
  }

  const data = useMemo(() => analyze(events), [events])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 text-slate-900">
      {/* Decorative sun blobs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[40vw] h-[40vw] bg-yellow-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[35vw] h-[35vw] bg-amber-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white/80 backdrop-blur-xl border-r-2 border-amber-100 sticky top-0 h-screen flex flex-col shadow-xl">
          <div className="p-6 flex items-center gap-3 border-b-2 border-amber-100">
            <div className="bg-gradient-to-br from-amber-400 to-yellow-300 p-2.5 rounded-2xl shadow-md">
              <Sun size={22} className="text-slate-900" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 leading-tight">Shine Hope</p>
              <p className="text-xs text-amber-600 font-bold">Dashboard</p>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1.5">
            <NavItem icon={Activity} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
            <NavItem icon={MessageSquare} label="Conversations" active={activeView === 'conversations'} onClick={() => setActiveView('conversations')} />
            <NavItem icon={Users} label="Leads" active={activeView === 'leads'} onClick={() => setActiveView('leads')} />
            <NavItem icon={TrendingUp} label="Engagement" active={activeView === 'engagement'} onClick={() => setActiveView('engagement')} />
          </nav>

          <div className="p-3 border-t-2 border-amber-100 space-y-1.5">
            <Link to="/" className="flex items-center gap-3 text-slate-600 hover:text-amber-700 hover:bg-amber-50 p-3 rounded-xl transition-all font-semibold text-sm">
              <ArrowLeft size={18} />
              Back to Site
            </Link>
            <button onClick={handleClear} className="w-full flex items-center gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all font-semibold text-sm">
              <Trash2 size={18} />
              Clear Data
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-h-screen">
          <header className="bg-white/70 backdrop-blur-xl border-b-2 border-amber-100 px-8 py-5 flex justify-between items-center sticky top-0 z-30 shadow-sm">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 capitalize flex items-center gap-2">
                {activeView === 'overview' && <>☀️ Hope at a Glance</>}
                {activeView === 'conversations' && <>💬 Conversations</>}
                {activeView === 'leads' && <>💛 Hope Community</>}
                {activeView === 'engagement' && <>✨ Engagement</>}
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">Stored locally in your browser · {events.length} events tracked</p>
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-900 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-amber-200 active:scale-95 transition-all"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </header>

          <div className="p-8 space-y-6">
            {activeView === 'overview' && <OverviewView data={data} />}
            {activeView === 'conversations' && <ConversationsView data={data} />}
            {activeView === 'leads' && <LeadsView data={data} />}
            {activeView === 'engagement' && <EngagementView data={data} />}
          </div>
        </main>
      </div>
    </div>
  )
}

// =============================================================================
// VIEWS
// =============================================================================

function OverviewView({ data }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={MessageCircle} label="Chats Opened" value={data.opens} accent="amber" />
        <StatCard icon={Users} label="Unique Visitors" value={data.uniqueSessions} accent="orange" />
        <StatCard icon={MessageSquare} label="Conversations" value={data.conversations.length} accent="yellow" />
        <StatCard icon={Sparkles} label="Measure Clicks" value={data.measureClicks} accent="amber" />
        <StatCard icon={ShoppingBag} label="Shop Clicks" value={data.shopClicks} accent="orange" />
        <StatCard icon={Heart} label="Hope Community" value={data.leads.length} accent="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topics Bar Chart */}
        <Card title="Topics Asked About" icon={MessageSquare}>
          {data.topics.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topics} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
                <XAxis type="number" stroke="#92400e" tick={{ fill: '#92400e', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="#92400e" tick={{ fill: '#1e293b', fontSize: 11 }} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#fffbeb', border: '2px solid #fcd34d', borderRadius: '12px', color: '#1e293b' }} />
                <Bar dataKey="value" fill="url(#sunGradient)" radius={[0, 8, 8, 0]} />
                <defs>
                  <linearGradient id="sunGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#fcd34d" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty>No topics tracked yet.</Empty>}
        </Card>

        {/* Conversion Funnel */}
        <Card title="Conversion Funnel" icon={TrendingUp}>
          <FunnelStep label="Chatbot Opened" value={data.opens} max={data.opens} color="from-amber-400 to-yellow-300" />
          <FunnelStep label="Selected an Option" value={data.optionSelects} max={data.opens} color="from-amber-500 to-yellow-400" />
          <FunnelStep label="Sent a Message" value={data.conversations.length} max={data.opens} color="from-orange-400 to-amber-400" />
          <FunnelStep label="Clicked CTA (Measure / Shop)" value={data.measureClicks + data.shopClicks} max={data.opens} color="from-orange-500 to-amber-500" />
          <FunnelStep label="Joined Hope Community" value={data.leads.length} max={data.opens} color="from-rose-400 to-orange-400" />
        </Card>
      </div>

      {/* Activity over time */}
      <Card title="Activity Over Time (last 7 days)" icon={Activity}>
        {data.byDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
              <XAxis dataKey="day" stroke="#92400e" tick={{ fill: '#92400e', fontSize: 12 }} />
              <YAxis stroke="#92400e" tick={{ fill: '#92400e', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fffbeb', border: '2px solid #fcd34d', borderRadius: '12px', color: '#1e293b' }} />
              <Line type="monotone" dataKey="opens" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} name="Opens" />
              <Line type="monotone" dataKey="conversations" stroke="#fb923c" strokeWidth={3} dot={{ fill: '#fb923c', r: 5 }} name="Conversations" />
              <Line type="monotone" dataKey="leads" stroke="#e11d48" strokeWidth={3} dot={{ fill: '#e11d48', r: 5 }} name="Leads" />
            </LineChart>
          </ResponsiveContainer>
        ) : <Empty>No activity yet.</Empty>}
      </Card>
    </div>
  )
}

function ConversationsView({ data }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Topic Distribution" icon={MessageSquare}>
          {data.topics.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:w-1/2 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.topics} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value">
                      {data.topics.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fffbeb', border: '2px solid #fcd34d', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-1.5">
                {data.topics.map((t, i) => (
                  <div key={t.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                      <span className="text-sm font-medium text-slate-700">{t.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <Empty>No conversations yet.</Empty>}
        </Card>

        <Card title="Top User Questions" icon={Sparkles}>
          {data.topQuestions.length > 0 ? (
            <ul className="space-y-2.5">
              {data.topQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="bg-gradient-to-br from-amber-400 to-yellow-300 text-slate-900 text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-slate-800 leading-snug">{q}</p>
                </li>
              ))}
            </ul>
          ) : <Empty>No questions tracked yet.</Empty>}
        </Card>
      </div>

      <Card title="Recent Conversations" icon={MessageSquare}>
        {data.conversations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50">
                <tr className="text-left">
                  <Th>User Said</Th>
                  <Th>Bot Replied</Th>
                  <Th>Topic</Th>
                  <Th>When</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {data.conversations.slice(0, 25).map(c => (
                  <tr key={c.id} className="hover:bg-amber-50/50">
                    <Td><span className="text-slate-900 font-medium">{truncate(c.userMessage, 60)}</span></Td>
                    <Td><span className="text-slate-600">{truncate(c.botResponse, 80)}</span></Td>
                    <Td><Pill>{c.topic || '—'}</Pill></Td>
                    <Td><span className="text-xs text-slate-500">{new Date(c.timestamp).toLocaleString()}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No conversations yet.</Empty>}
      </Card>
    </div>
  )
}

function LeadsView({ data }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Heart} label="Total Members" value={data.leads.length} accent="rose" />
        <StatCard icon={Mail} label="With Email" value={data.leads.filter(l => l.email).length} accent="amber" />
        <StatCard icon={TrendingUp} label="Conversion Rate" value={data.opens ? `${((data.leads.length / data.opens) * 100).toFixed(1)}%` : '0%'} accent="orange" />
      </div>

      <Card title="Most Requested Interests" icon={Sparkles}>
        {data.interests.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.interests}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
              <XAxis dataKey="name" stroke="#92400e" tick={{ fill: '#92400e', fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#92400e" tick={{ fill: '#92400e', fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#fffbeb', border: '2px solid #fcd34d', borderRadius: '12px' }} />
              <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty>No interests captured yet.</Empty>}
      </Card>

      <Card title="Hope Community Members" icon={Users}>
        {data.leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50">
                <tr className="text-left">
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Interest</Th>
                  <Th>Joined</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {data.leads.slice(0, 50).map(l => (
                  <tr key={l.id} className="hover:bg-amber-50/50">
                    <Td><span className="font-bold text-slate-900">{l.name || '—'}</span></Td>
                    <Td><span className="text-slate-700">{l.email || '—'}</span></Td>
                    <Td><span className="text-slate-700">{l.phone || '—'}</span></Td>
                    <Td><Pill>{l.interest || '—'}</Pill></Td>
                    <Td><span className="text-xs text-slate-500">{new Date(l.timestamp).toLocaleString()}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No members yet — when someone signs up via the chatbot, they appear here.</Empty>}
      </Card>
    </div>
  )
}

function EngagementView({ data }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="CTA Click Performance" icon={ExternalLink}>
          <div className="grid grid-cols-2 gap-4">
            <CtaCard
              icon={Sparkles}
              label="Measure Your Hope"
              count={data.measureClicks}
              url={MEASURE_URL}
              gradient="from-amber-400 to-yellow-300"
            />
            <CtaCard
              icon={ShoppingBag}
              label="Hope Shop"
              count={data.shopClicks}
              url={SHOP_URL}
              gradient="from-orange-400 to-amber-300"
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
              <p className="font-bold text-slate-700 mb-1">Quick Bar</p>
              <p className="text-slate-600">{data.ctaBySource.quickbar} clicks</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
              <p className="font-bold text-slate-700 mb-1">Inline Buttons</p>
              <p className="text-slate-600">{data.ctaBySource.inline} clicks</p>
            </div>
          </div>
        </Card>

        <Card title="Most-Picked Menu Options" icon={MessageCircle}>
          {data.optionStats.length > 0 ? (
            <div className="space-y-3">
              {data.optionStats.map((o, i) => (
                <div key={o.label} className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-amber-400 to-yellow-300 text-slate-900 text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">{o.label}</span>
                      <span className="text-xs font-bold text-amber-700">{o.count}</span>
                    </div>
                    <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full" style={{ width: `${(o.count / Math.max(...data.optionStats.map(s => s.count))) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty>No option clicks yet.</Empty>}
        </Card>
      </div>

      <Card title="Activity Heatmap by Hour" icon={Calendar}>
        <div className="grid grid-cols-12 md:grid-cols-24 gap-1.5">
          {data.byHour.map((h, i) => (
            <div
              key={i}
              className="aspect-square rounded-md flex items-center justify-center text-[10px] font-bold border border-amber-100"
              style={{
                background: h.count === 0
                  ? '#fffbeb'
                  : `rgba(245, 158, 11, ${Math.min(0.15 + (h.count / Math.max(1, data.maxHour)) * 0.85, 1)})`,
                color: h.count > data.maxHour * 0.5 ? 'white' : '#92400e'
              }}
              title={`${h.hour}:00 — ${h.count} events`}
            >
              {h.hour}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">Hours with the most chatbot activity (0–23, your local time).</p>
      </Card>
    </div>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

function analyze(events) {
  const opens = events.filter(e => e.type === 'chatbot_open').length
  const optionSelectsArr = events.filter(e => e.type === 'option_select')
  const optionSelects = optionSelectsArr.length
  const conversationsArr = events.filter(e => e.type === 'conversation').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const leadsArr = events.filter(e => e.type === 'lead').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const ctaArr = events.filter(e => e.type === 'cta_click')

  const measureClicks = ctaArr.filter(e => e.ctaType === 'measure').length
  const shopClicks = ctaArr.filter(e => e.ctaType === 'shop').length

  const ctaBySource = {
    quickbar: ctaArr.filter(e => e.source === 'quickbar').length,
    inline: ctaArr.filter(e => e.source === 'inline').length
  }

  const uniqueSessions = new Set(events.map(e => e.sessionId).filter(Boolean)).size

  // Topics
  const topicMap = {}
  conversationsArr.forEach(c => {
    if (c.topic) topicMap[c.topic] = (topicMap[c.topic] || 0) + 1
  })
  const topics = Object.entries(topicMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  // Top questions (most recent unique-ish)
  const seen = new Set()
  const topQuestions = []
  for (const c of conversationsArr) {
    const key = (c.userMessage || '').toLowerCase().slice(0, 40)
    if (!seen.has(key) && c.userMessage) {
      seen.add(key)
      topQuestions.push(c.userMessage)
    }
    if (topQuestions.length >= 8) break
  }

  // Interests
  const interestMap = {}
  leadsArr.forEach(l => {
    const k = l.interest || 'Not specified'
    interestMap[k] = (interestMap[k] || 0) + 1
  })
  const interests = Object.entries(interestMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  // Option stats
  const optionMap = {}
  optionSelectsArr.forEach(o => {
    const k = o.label || o.optionId
    optionMap[k] = (optionMap[k] || 0) + 1
  })
  const optionStats = Object.entries(optionMap).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)

  // By day (last 7)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const byDay = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const dayKey = d.toDateString()
    const opensCount = events.filter(e => e.type === 'chatbot_open' && new Date(e.timestamp).toDateString() === dayKey).length
    const conversationsCount = events.filter(e => e.type === 'conversation' && new Date(e.timestamp).toDateString() === dayKey).length
    const leadsCount = events.filter(e => e.type === 'lead' && new Date(e.timestamp).toDateString() === dayKey).length
    byDay.push({
      day: d.toLocaleDateString(undefined, { weekday: 'short' }),
      opens: opensCount,
      conversations: conversationsCount,
      leads: leadsCount
    })
  }

  // By hour (24)
  const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }))
  events.forEach(e => {
    const h = new Date(e.timestamp).getHours()
    byHour[h].count += 1
  })
  const maxHour = Math.max(1, ...byHour.map(h => h.count))

  return {
    opens,
    optionSelects,
    uniqueSessions,
    measureClicks,
    shopClicks,
    ctaBySource,
    topics,
    topQuestions,
    conversations: conversationsArr,
    leads: leadsArr,
    interests,
    optionStats,
    byDay,
    byHour,
    maxHour
  }
}

function truncate(s, n) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n) + '…' : s
}

// =============================================================================
// SMALL COMPONENTS
// =============================================================================

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-semibold text-sm ${
        active
          ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-900 shadow-md'
          : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
      }`}
    >
      <Icon size={18} strokeWidth={2.5} />
      {label}
    </button>
  )
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border-2 border-amber-100 shadow-lg shadow-amber-100/50">
      <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
        <div className="bg-gradient-to-br from-amber-300 to-yellow-200 p-2 rounded-xl">
          <Icon size={16} className="text-slate-900" strokeWidth={2.5} />
        </div>
        {title}
      </h2>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent = 'amber' }) {
  const gradients = {
    amber: 'from-amber-400 to-yellow-300',
    orange: 'from-orange-400 to-amber-300',
    yellow: 'from-yellow-400 to-amber-200',
    rose: 'from-rose-400 to-orange-300'
  }
  return (
    <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl border-2 border-amber-100 shadow-lg shadow-amber-100/40 hover:shadow-amber-200 hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${gradients[accent]} shadow-md`}>
          <Icon size={16} className="text-slate-900" strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
  )
}

function FunnelStep({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-extrabold text-slate-900">{value}</span>
      </div>
      <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function CtaCard({ icon: Icon, label, count, url, gradient }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-5 rounded-2xl bg-gradient-to-br ${gradient} hover:shadow-xl hover:-translate-y-0.5 transition-all text-slate-900 group`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} strokeWidth={2.5} />
        <span className="text-xs font-extrabold uppercase tracking-wider">{label}</span>
        <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 ml-auto" />
      </div>
      <p className="text-3xl font-extrabold">{count}</p>
      <p className="text-xs font-semibold mt-1">total clicks</p>
    </a>
  )
}

function Th({ children }) {
  return <th className="px-4 py-3 text-xs font-extrabold text-amber-800 uppercase tracking-wider">{children}</th>
}

function Td({ children }) {
  return <td className="px-4 py-3 align-top">{children}</td>
}

function Pill({ children }) {
  return <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">{children}</span>
}

function Empty({ children }) {
  return <div className="text-center py-12 text-slate-500 text-sm">{children}</div>
}
