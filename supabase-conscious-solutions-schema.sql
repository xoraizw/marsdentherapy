-- Conscious Solutions CRM Database Schema
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Page Visits Table
CREATE TABLE IF NOT EXISTS page_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    page TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_visits_session ON page_visits(session_id);
CREATE INDEX idx_page_visits_timestamp ON page_visits(timestamp);

-- Section Views Table
CREATE TABLE IF NOT EXISTS section_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    section TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_section_views_session ON section_views(session_id);
CREATE INDEX idx_section_views_section ON section_views(section);

-- Chatbot Interactions Table
CREATE TABLE IF NOT EXISTS chatbot_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chatbot_interactions_session ON chatbot_interactions(session_id);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    topic TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_topic ON conversations(topic);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp DESC);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    interest TEXT,
    dealt_with BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For existing databases, run: ALTER TABLE leads ADD COLUMN IF NOT EXISTS dealt_with BOOLEAN DEFAULT false;
CREATE INDEX idx_leads_session ON leads(session_id);
CREATE INDEX idx_leads_dealt_with ON leads(dealt_with);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_timestamp ON leads(timestamp DESC);

-- Appointments Table
-- Note: Appointments are for Dr. Doris (NLP) programs/trainings
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    lead_id UUID REFERENCES leads(id),
    specialist_name TEXT DEFAULT 'Dr. Doris', -- Main specialist
    appointment_details JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_session ON appointments(session_id);
CREATE INDEX idx_appointments_lead ON appointments(lead_id);
CREATE INDEX idx_appointments_timestamp ON appointments(timestamp DESC);
CREATE INDEX idx_appointments_specialist ON appointments(specialist_name);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous access (for demo purposes)
-- In production, implementation of proper authentication and authorization is required

CREATE POLICY "Allow all operations on page_visits" ON page_visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on section_views" ON section_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on chatbot_interactions" ON chatbot_interactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);

-- Create a view for analytics summary
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    COUNT(DISTINCT pv.session_id) as total_visitors,
    COUNT(DISTINCT ci.session_id) as chatbot_users,
    COUNT(c.id) as total_conversations,
    COUNT(l.id) as total_leads,
    COUNT(a.id) as total_appointments
FROM page_visits pv
LEFT JOIN chatbot_interactions ci ON pv.session_id = ci.session_id
LEFT JOIN conversations c ON pv.session_id = c.session_id
LEFT JOIN leads l ON pv.session_id = l.session_id
LEFT JOIN appointments a ON pv.session_id = a.session_id;
