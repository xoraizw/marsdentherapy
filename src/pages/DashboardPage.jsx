import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

// ── Dummy Data ────────────────────────────────────────────────────────────────

const TEAL = '#2a9d8f'
const TEAL_DARK = '#1d7a6e'
const TEAL_MID = '#4db8aa'
const TEAL_LIGHT = '#e6f5f3'
const NAVY = '#1a3a4a'

const statCards = [
  { label: 'Page Visits', value: '3,284', change: '+12.4%', up: true, icon: '🌐', sub: 'Last 30 days' },
  { label: 'Chatbot Opens', value: '847', change: '+8.1%', up: true, icon: '💬', sub: 'Last 30 days' },
  { label: 'Booking Requests', value: '64', change: '+21.3%', up: true, icon: '📅', sub: 'Last 30 days' },
  { label: 'Avg. Response Time', value: '1.2s', change: '-0.3s', up: true, icon: '⚡', sub: 'Chatbot speed' },
  { label: 'NDIS Enquiries', value: '38', change: '+5.6%', up: true, icon: '✅', sub: 'Last 30 days' },
  { label: 'Conversion Rate', value: '7.6%', change: '+1.2%', up: true, icon: '📈', sub: 'Visits → Bookings' },
]

const visitsData = [
  { day: 'Mon', visits: 420, chatbot: 98, bookings: 8 },
  { day: 'Tue', visits: 380, chatbot: 84, bookings: 6 },
  { day: 'Wed', visits: 510, chatbot: 127, bookings: 11 },
  { day: 'Thu', visits: 490, chatbot: 112, bookings: 9 },
  { day: 'Fri', visits: 560, chatbot: 142, bookings: 14 },
  { day: 'Sat', visits: 280, chatbot: 60, bookings: 5 },
  { day: 'Sun', visits: 210, chatbot: 41, bookings: 3 },
]

const monthlyData = [
  { month: 'Jan', visits: 2100, bookings: 38 },
  { month: 'Feb', visits: 2340, bookings: 44 },
  { month: 'Mar', visits: 2800, bookings: 52 },
  { month: 'Apr', visits: 2600, bookings: 48 },
  { month: 'May', visits: 3100, bookings: 58 },
  { month: 'Jun', visits: 3284, bookings: 64 },
]

const serviceBreakdown = [
  { name: 'Speech Therapy', value: 32, color: TEAL },
  { name: 'Occupational Therapy', value: 24, color: TEAL_MID },
  { name: 'Psychology', value: 18, color: '#52b69a' },
  { name: 'PBS / BSP', value: 12, color: '#76c893' },
  { name: 'CBT', value: 8, color: '#99d98c' },
  { name: 'Joint OT / Speech', value: 6, color: '#b5e48c' },
]

const topQuestions = [
  { q: 'What is occupational therapy?', count: 48 },
  { q: 'Do you accept NDIS funding?', count: 41 },
  { q: 'How do I book an appointment?', count: 37 },
  { q: 'What areas do you service?', count: 29 },
  { q: 'Do you offer telehealth?', count: 24 },
  { q: 'What age groups do you treat?', count: 19 },
  { q: 'What is PBS / BSP?', count: 15 },
  { q: 'How long are sessions?', count: 11 },
]

const recentBookings = [
  { id: 'BK-1041', name: 'Sarah M.', service: 'Speech Therapy', location: 'Marsden Park NSW', day: 'Monday', time: '9:00 AM', funding: 'NDIS — Plan Managed', status: 'Confirmed' },
  { id: 'BK-1040', name: 'James T.', service: 'Occupational Therapy', location: 'Cannington WA', day: 'Wednesday', time: '2:30 PM', funding: 'Private', status: 'Pending' },
  { id: 'BK-1039', name: 'Aisha R.', service: 'Psychology', location: 'Marsden Park NSW', day: 'Friday', time: '11:00 AM', funding: 'NDIS — Self Managed', status: 'Confirmed' },
  { id: 'BK-1038', name: 'Liam C.', service: 'PBS / BSP', location: 'Marsden Park NSW', day: 'Tuesday', time: '1:00 PM', funding: 'NDIS — Agency Managed', status: 'Confirmed' },
  { id: 'BK-1037', name: 'Priya N.', service: 'CBT', location: 'Telehealth', day: 'Thursday', time: '3:00 PM', funding: 'Medicare', status: 'Pending' },
  { id: 'BK-1036', name: 'Oliver K.', service: 'Joint Speech / OT', location: 'Marsden Park NSW', day: 'Monday', time: '10:30 AM', funding: 'NDIS — Plan Managed', status: 'Confirmed' },
  { id: 'BK-1035', name: 'Emma W.', service: 'Speech Therapy', location: 'Cannington WA', day: 'Wednesday', time: '9:30 AM', funding: 'Private', status: 'Cancelled' },
  { id: 'BK-1034', name: 'Noah F.', service: 'Occupational Therapy', location: 'Marsden Park NSW', day: 'Friday', time: '4:00 PM', funding: 'NDIS — Self Managed', status: 'Confirmed' },
]

const locationSplit = [
  { name: 'Marsden Park NSW', value: 68 },
  { name: 'Cannington WA', value: 22 },
  { name: 'Telehealth', value: 10 },
]

const fundingTypes = [
  { name: 'NDIS Plan Managed', value: 38, color: TEAL },
  { name: 'NDIS Self Managed', value: 22, color: TEAL_MID },
  { name: 'NDIS Agency Managed', value: 18, color: '#52b69a' },
  { name: 'Private', value: 14, color: '#76c893' },
  { name: 'Medicare', value: 8, color: '#99d98c' },
]

const VIEWS = ['Overview', 'Bookings', 'Chatbot', 'Analytics']

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeView, setActiveView] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4faf9', fontFamily: "'Inter', 'Segoe UI', sans-serif", color: NAVY }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        minHeight: '100vh',
        background: '#fff',
        borderRight: '1px solid #d4ede9',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #d4ede9', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>🌿</span>
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: NAVY, lineHeight: 1.2 }}>Marsden Therapy</div>
              <div style={{ fontSize: 11, color: TEAL, fontWeight: 600 }}>Admin Dashboard</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {VIEWS.map(v => (
            <button key={v} onClick={() => setActiveView(v)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              marginBottom: 4, textAlign: 'left', fontSize: 13, fontWeight: 600,
              background: activeView === v ? TEAL_LIGHT : 'transparent',
              color: activeView === v ? TEAL_DARK : '#5a7a72',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>
                {v === 'Overview' ? '📊' : v === 'Bookings' ? '📅' : v === 'Chatbot' ? '💬' : '📈'}
              </span>
              {sidebarOpen && v}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #d4ede9' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600,
            color: '#5a7a72', background: 'transparent',
          }}>
            <span style={{ fontSize: 16 }}>←</span>
            {sidebarOpen && 'Back to Site'}
          </Link>
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: '#5a7a72', background: 'transparent', marginTop: 4,
          }}>
            <span style={{ fontSize: 16 }}>{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #d4ede9', padding: '16px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: NAVY }}>
              {activeView === 'Overview' && '📊 Overview'}
              {activeView === 'Bookings' && '📅 Bookings'}
              {activeView === 'Chatbot' && '💬 Chatbot Analytics'}
              {activeView === 'Analytics' && '📈 Site Analytics'}
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: '#7a9e98', marginTop: 2 }}>
              Marsden Therapy · June 2026 · Dummy data for demonstration
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: TEAL_LIGHT, color: TEAL_DARK, fontSize: 11, fontWeight: 700,
              padding: '4px 10px', borderRadius: 20, border: `1px solid #a8ddd7`,
            }}>● Live</span>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14,
            }}>A</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {activeView === 'Overview' && <OverviewView />}
          {activeView === 'Bookings' && <BookingsView />}
          {activeView === 'Chatbot' && <ChatbotView />}
          {activeView === 'Analytics' && <AnalyticsView />}
        </main>
      </div>
    </div>
  )
}

// ── Views ─────────────────────────────────────────────────────────────────────

function OverviewView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Weekly chart + service breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <Card title="Weekly Traffic" subtitle="Visits, chatbot opens & bookings">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={visitsData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6f5f3" />
              <XAxis dataKey="day" tick={{ fill: '#7a9e98', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7a9e98', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid #d4ede9`, borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="visits" fill={TEAL_LIGHT} radius={[4,4,0,0]} name="Visits" />
              <Bar dataKey="chatbot" fill={TEAL_MID} radius={[4,4,0,0]} name="Chatbot Opens" />
              <Bar dataKey="bookings" fill={TEAL_DARK} radius={[4,4,0,0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Service Breakdown" subtitle="Booking requests by service">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={serviceBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {serviceBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid #d4ede9`, borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
            {serviceBreakdown.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                  <span style={{ color: '#5a7a72' }}>{s.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: NAVY }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card title="Recent Booking Requests" subtitle="Latest submissions from the chatbot form">
        <BookingsTable rows={recentBookings.slice(0, 5)} />
      </Card>
    </div>
  )
}

function BookingsView() {
  const [filter, setFilter] = useState('All')
  const statuses = ['All', 'Confirmed', 'Pending', 'Cancelled']
  const filtered = filter === 'All' ? recentBookings : recentBookings.filter(b => b.status === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total Bookings" value="64" change="+21.3%" up icon="📅" sub="This month" />
        <StatCard label="Confirmed" value="48" change="+18%" up icon="✅" sub="75% of total" />
        <StatCard label="Pending" value="12" change="+3" up icon="⏳" sub="Awaiting confirm" />
        <StatCard label="Cancelled" value="4" change="-2" up={false} icon="❌" sub="vs last month" />
      </div>

      {/* Funding breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="Funding Type Breakdown" subtitle="How clients fund their sessions">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fundingTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e6f5f3" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#7a9e98', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#5a7a72', fontSize: 11 }} width={130} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid #d4ede9`, borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {fundingTypes.map((f, i) => <Cell key={i} fill={f.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Location Split" subtitle="Where clients prefer to be seen">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {locationSplit.map(l => (
              <div key={l.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                  <span style={{ color: NAVY }}>{l.name}</span>
                  <span style={{ color: TEAL_DARK }}>{l.value}%</span>
                </div>
                <div style={{ height: 8, background: '#e6f5f3', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${l.value}%`, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_MID})`, borderRadius: 4, transition: 'width 0.6s' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Full bookings table */}
      <Card title="All Booking Requests" subtitle={`${filtered.length} records`}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '5px 14px', borderRadius: 20, border: `1px solid ${filter === s ? TEAL : '#d4ede9'}`,
              background: filter === s ? TEAL_LIGHT : '#fff', color: filter === s ? TEAL_DARK : '#7a9e98',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{s}</button>
          ))}
        </div>
        <BookingsTable rows={filtered} />
      </Card>
    </div>
  )
}

function ChatbotView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Chatbot Opens" value="847" change="+8.1%" up icon="💬" sub="This month" />
        <StatCard label="Messages Sent" value="2,341" change="+11%" up icon="✉️" sub="User messages" />
        <StatCard label="Booking CTAs Shown" value="312" change="+24%" up icon="📅" sub="Book btn renders" />
        <StatCard label="CTA → Booking Rate" value="20.5%" change="+3.2%" up icon="🎯" sub="Of CTA shown" />
      </div>

      {/* Top questions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="Top User Questions" subtitle="Most asked in the chatbot">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topQuestions.map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                  color: '#fff', fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: NAVY, fontWeight: 600, marginBottom: 3 }}>{q.q}</div>
                  <div style={{ height: 5, background: '#e6f5f3', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(q.count / topQuestions[0].count) * 100}%`, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_MID})`, borderRadius: 3 }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEAL_DARK, flexShrink: 0 }}>{q.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Daily Chatbot Activity" subtitle="Opens vs messages this week">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={visitsData}>
              <defs>
                <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TEAL} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6f5f3" />
              <XAxis dataKey="day" tick={{ fill: '#7a9e98', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7a9e98', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid #d4ede9`, borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="chatbot" stroke={TEAL} strokeWidth={2.5} fill="url(#chatGrad)" name="Chatbot Opens" />
              <Area type="monotone" dataKey="bookings" stroke={TEAL_DARK} strokeWidth={2.5} fill="none" name="Bookings via Chat" strokeDasharray="4 3" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Conversion funnel */}
      <Card title="Chatbot Conversion Funnel" subtitle="From open to booking this month">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 8 }}>
          {[
            { label: 'Opened Chat', value: 847, pct: 100 },
            { label: 'Sent a Message', value: 612, pct: 72 },
            { label: 'Asked About Service', value: 394, pct: 47 },
            { label: 'Saw Book Button', value: 312, pct: 37 },
            { label: 'Submitted Booking', value: 64, pct: 7.6 },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                height: `${Math.max(f.pct * 2, 20)}px`, background: `linear-gradient(180deg, ${TEAL}, ${TEAL_DARK})`,
                borderRadius: 8, marginBottom: 8, opacity: 0.3 + (f.pct / 100) * 0.7,
                transition: 'height 0.5s',
              }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{f.value}</div>
              <div style={{ fontSize: 10, color: '#7a9e98', fontWeight: 600, marginTop: 2 }}>{f.label}</div>
              <div style={{ fontSize: 10, color: TEAL_DARK, fontWeight: 700 }}>{f.pct}%</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function AnalyticsView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total Visits" value="3,284" change="+12.4%" up icon="🌐" sub="This month" />
        <StatCard label="Unique Visitors" value="1,847" change="+9.8%" up icon="👤" sub="This month" />
        <StatCard label="Avg. Session" value="2m 41s" change="+18s" up icon="⏱️" sub="Time on site" />
        <StatCard label="Bounce Rate" value="38.2%" change="-3.1%" up icon="↩️" sub="Lower is better" />
      </div>

      {/* Monthly trend */}
      <Card title="Monthly Growth" subtitle="Page visits and booking requests over 6 months">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyData}>
            <defs>
              <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TEAL} stopOpacity={0.15} />
                <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6f5f3" />
            <XAxis dataKey="month" tick={{ fill: '#7a9e98', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: '#7a9e98', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#7a9e98', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: `1px solid #d4ede9`, borderRadius: 10, fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="visits" stroke={TEAL} strokeWidth={3} dot={{ fill: TEAL, r: 5 }} name="Page Visits" />
            <Line yAxisId="right" type="monotone" dataKey="bookings" stroke={TEAL_DARK} strokeWidth={3} dot={{ fill: TEAL_DARK, r: 5 }} name="Bookings" strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top pages */}
        <Card title="Top Pages" subtitle="Most visited sections">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e6f5f3' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#7a9e98', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Page</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#7a9e98', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Visits</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#7a9e98', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {[
                { page: '/ (Home)', visits: 1240, pct: 37.8 },
                { page: '/occupational-therapy', visits: 580, pct: 17.7 },
                { page: '/speech-therapy', visits: 490, pct: 14.9 },
                { page: '/book-now', visits: 380, pct: 11.6 },
                { page: '/ndis', visits: 280, pct: 8.5 },
                { page: '/psychology', visits: 180, pct: 5.5 },
                { page: '/about-us', visits: 134, pct: 4.1 },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f4faf9' }}>
                  <td style={{ padding: '10px 0', color: NAVY, fontWeight: 600 }}>{r.page}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#5a7a72' }}>{r.visits.toLocaleString()}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: TEAL_DARK, fontWeight: 700 }}>{r.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Traffic sources */}
        <Card title="Traffic Sources" subtitle="Where visitors come from">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            {[
              { source: 'Organic Search', value: 48, color: TEAL },
              { source: 'Direct', value: 24, color: TEAL_MID },
              { source: 'Referral', value: 14, color: '#52b69a' },
              { source: 'Social Media', value: 10, color: '#76c893' },
              { source: 'Paid Ads', value: 4, color: '#99d98c' },
            ].map(s => (
              <div key={s.source}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                  <span style={{ color: NAVY }}>{s.source}</span>
                  <span style={{ color: s.color }}>{s.value}%</span>
                </div>
                <div style={{ height: 7, background: '#e6f5f3', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.value}%`, background: s.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BookingsTable({ rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e6f5f3' }}>
            {['ID', 'Client', 'Service', 'Location', 'Day & Time', 'Funding', 'Status'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#7a9e98', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(b => (
            <tr key={b.id} style={{ borderBottom: '1px solid #f4faf9' }}>
              <td style={{ padding: '12px', color: TEAL_DARK, fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>{b.id}</td>
              <td style={{ padding: '12px', color: NAVY, fontWeight: 700 }}>{b.name}</td>
              <td style={{ padding: '12px', color: '#5a7a72' }}>{b.service}</td>
              <td style={{ padding: '12px', color: '#5a7a72', whiteSpace: 'nowrap' }}>{b.location}</td>
              <td style={{ padding: '12px', color: '#5a7a72', whiteSpace: 'nowrap' }}>{b.day} · {b.time}</td>
              <td style={{ padding: '12px', color: '#5a7a72' }}>{b.funding}</td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: b.status === 'Confirmed' ? '#e6f5f3' : b.status === 'Pending' ? '#fff8e1' : '#fde8e8',
                  color: b.status === 'Confirmed' ? TEAL_DARK : b.status === 'Pending' ? '#b45309' : '#b91c1c',
                  border: `1px solid ${b.status === 'Confirmed' ? '#a8ddd7' : b.status === 'Pending' ? '#fde68a' : '#fca5a5'}`,
                }}>{b.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #d4ede9',
      padding: 20, boxShadow: '0 2px 12px rgba(42,157,143,0.06)',
    }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: NAVY }}>{title}</h2>
        {subtitle && <p style={{ margin: 0, fontSize: 11, color: '#7a9e98', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function StatCard({ label, value, change, up, icon, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #d4ede9',
      padding: '18px 20px', boxShadow: '0 2px 12px rgba(42,157,143,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#7a9e98', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: NAVY, marginBottom: 6 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: up ? '#059669' : '#dc2626', fontWeight: 700 }}>
          {up ? '▲' : '▼'} {change}
        </span>
        <span style={{ fontSize: 10, color: '#a0b4b0' }}>{sub}</span>
      </div>
    </div>
  )
}
