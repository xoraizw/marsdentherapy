# ManStrong2 Setup Instructions

This guide will help you set up the ManStrong2 chatbot and CRM system.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier works)
- OpenAI API key

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase Database

### 2.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `manstrong2` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to you
5. Wait for the project to be created (takes ~2 minutes)

### 2.2 Run the SQL Schema

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the file `supabase-manstrong2-schema.sql` from this project
4. Copy the entire contents of the SQL file
5. Paste it into the SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. You should see "Success. No rows returned" - this means the tables were created successfully

### 2.3 Get Your Supabase Credentials

1. In Supabase dashboard, go to "Settings" → "API"
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key, not the `service_role` key)

## Step 3: Set Up Environment Variables

1. Create a `.env` file in the root directory of the project
2. Add the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration (for chatbot)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Getting Your OpenAI API Key

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (you won't be able to see it again)
6. Paste it in your `.env` file

**Important:** Never commit your `.env` file to version control!

## Step 4: Verify File Structure

Make sure you have the following structure:

```
ManStrong2/
├── public/
│   └── ManStrong2 - Transform Your Health After 40.html
├── src/
│   ├── components/
│   │   ├── AppointmentCalendar.jsx
│   │   └── Chatbot.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── CRMPage.jsx
│   │   └── WebsitePage.jsx
│   ├── services/
│   │   └── chatbotService.js
│   ├── App.jsx
│   └── main.jsx
├── supabase-manstrong2-schema.sql
├── .env (create this)
└── package.json
```

## Step 5: Start the Development Server

```bash
npm run dev
```

The application should start on `http://localhost:5173` (or another port if 5173 is busy).

## Step 6: Verify Everything Works

1. **Website Page**: Visit `http://localhost:5173/`
   - You should see the ManStrong2 website in an iframe
   - The chatbot button should appear in the bottom right

2. **Chatbot**: Click the chatbot button
   - Try asking: "Tell me about Dr. Naidoo"
   - Try booking an appointment
   - Fill out the form and select a time slot

3. **CRM Dashboard**: Visit `http://localhost:5173/crm`
   - You should see the analytics dashboard
   - Check that leads and conversations are being tracked

## Step 7: Test Database Connection

1. Open the chatbot on the website
2. Have a conversation or book an appointment
3. Go to the CRM dashboard (`/crm`)
4. Verify that:
   - Page visits are being tracked
   - Conversations appear in the "Recent Conversations" table
   - Leads appear in the "Recent Leads" table
   - Appointments appear in the stats

## Troubleshooting

### Issue: "Failed to fetch" errors in console

**Solution:** 
- Check that your Supabase URL and key are correct in `.env`
- Make sure you've run the SQL schema in Supabase
- Verify RLS (Row Level Security) policies are set up correctly

### Issue: Chatbot not responding

**Solution:**
- Check that `VITE_OPENAI_API_KEY` is set correctly
- Verify you have credits in your OpenAI account
- Check browser console for error messages

### Issue: Database tables not found

**Solution:**
- Go to Supabase SQL Editor
- Run the schema file again
- Check the "Table Editor" in Supabase to verify tables exist

### Issue: Website HTML not loading

**Solution:**
- Verify `ManStrong2 - Transform Your Health After 40.html` exists in the `public/` folder
- Check browser console for 404 errors
- Make sure the file name matches exactly (including spaces and capitalization)

## Production Deployment

### Environment Variables for Production

When deploying to production (Vercel, Netlify, etc.), add your environment variables in the platform's settings:

1. **Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file

2. **Netlify:**
   - Go to Site Settings → Environment Variables
   - Add all variables from your `.env` file

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Database Management

### Viewing Data in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Select any table to view its data
3. You can manually edit, add, or delete records here

### Resetting the Database

If you need to start fresh:

1. Go to Supabase SQL Editor
2. Run:
```sql
TRUNCATE TABLE page_visits, section_views, chatbot_interactions, conversations, leads, appointments CASCADE;
```

### Exporting Data

1. Go to Supabase Dashboard → Table Editor
2. Select a table
3. Click "Export" to download as CSV

## Security Notes

1. **Never commit `.env` file** - it contains sensitive keys
2. **Use RLS policies** - The current setup allows all operations for demo purposes. In production, implement proper authentication
3. **Rotate API keys** - If keys are exposed, regenerate them immediately
4. **Monitor usage** - Keep an eye on OpenAI API usage to avoid unexpected charges

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify all environment variables are set correctly
4. Ensure the SQL schema has been run successfully

## Next Steps

- Customize the chatbot responses in `src/services/chatbotService.js`
- Update the website HTML in `public/ManStrong2 - Transform Your Health After 40.html`
- Customize the CRM dashboard in `src/pages/CRMPage.jsx`
- Set up email notifications for new appointments (requires backend)
- Integrate with Google Calendar for real appointment scheduling (requires backend)
