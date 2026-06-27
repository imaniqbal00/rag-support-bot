# BotBase — Setup Guide

## Project structure
```
rag-support-bot/
├── backend/      Express API (port 3001)
├── frontend/     Next.js dashboard (port 3000)
├── widget/       Embeddable JS widget
└── supabase/     Database schema
```

---

## Step 1 — Supabase
1. Go to https://supabase.com and create a free project.
2. Open **SQL Editor** and run the entire contents of `supabase/schema.sql`.
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **service_role** key (backend)
   - **anon** public key (frontend)

---

## Step 2 — Groq API key
1. Sign up at https://console.groq.com (free).
2. Create an API key.

---

## Step 3 — Backend
```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY
npm install
npm run dev
```
Backend starts at http://localhost:3001

> First query will download the ~25 MB embedding model automatically.

---

## Step 4 — Frontend
```bash
cd frontend
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```
Dashboard at http://localhost:3000

---

## Step 5 — Use it
1. Open http://localhost:3000 → Sign up
2. Go to **Documents** → Upload a PDF or text file
3. Wait for status to turn **Ready** (usually 10–30 sec)
4. Go to **Embed** → Copy the script tag
5. Open `widget/demo.html`, paste your token, open in browser
6. Ask a question — the bot answers from your docs!

---

## Widget embed (production)
```html
<script
  src="https://your-backend.com/widget.js"
  data-token="your_api_token_here"
  data-bot-name="Support Bot"
  defer
></script>
```
Paste before `</body>` on any website.
