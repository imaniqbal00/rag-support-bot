# 🤖 BotBase — AI Support Chatbot Builder

> Add an AI-powered support chatbot to any website in 60 seconds — no coding needed.

![BotBase Demo](https://rag-support-bot-wsq1.vercel.app/demo.html)

## 🌐 Live Links

| | Link |
|---|---|
| 🚀 **Live App** | https://rag-support-bot-wsq1.vercel.app |
| 🎮 **Live Demo** | https://rag-support-bot-wsq1.vercel.app/demo.html |

---

## 📌 What Is BotBase?

BotBase is a full-stack SaaS platform that lets any business create an AI-powered support chatbot from their own documents — without any coding.

**For Business Owners:**
- Upload your FAQ, pricing, policies, or any document
- Get a one-line embed code
- Paste it on your website
- Done — your visitors now have 24/7 AI support

**For Website Visitors:**
- See a chat button on the website
- Click it and ask any question
- Get instant answers from the company's documents

---

## ✨ Features

- 📄 **Document Upload** — PDF, TXT, Markdown support (up to 10MB)
- 🧠 **RAG Pipeline** — Retrieval-Augmented Generation for accurate answers
- 🔍 **Vector Search** — Supabase pgvector similarity search
- 💬 **Embeddable Widget** — One script tag, works on any website
- 📊 **Analytics Dashboard** — Track queries, resolution rate, and trends
- 🔐 **Multi-tenant Auth** — Each user gets their own isolated data
- ⚡ **Fast AI Responses** — Powered by Groq + LLaMA 3.1

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** — App Router, Server Components
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Supabase Auth** — Authentication

### Backend
- **Express.js** — REST API
- **TypeScript** — Type safety
- **Cohere AI** — Document & query embeddings (384 dimensions)
- **Groq + LLaMA 3.1** — AI answer generation
- **Supabase** — PostgreSQL + pgvector

### Infrastructure
- **Vercel** — Frontend & backend deployment
- **Supabase** — Database & auth
- **GitHub** — Version control

---

## 🚀 How It Works

```
User uploads document
        ↓
Text extracted & split into chunks
        ↓
Cohere AI converts chunks to vector embeddings
        ↓
Embeddings stored in Supabase pgvector
        ↓
Visitor asks question on website
        ↓
Question embedded → similar chunks retrieved
        ↓
Groq LLaMA generates answer from chunks
        ↓
Answer shown in chat widget instantly
```

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free)
- Groq API key (free)
- Cohere API key (free)

### 1. Clone the repo
```bash
git clone https://github.com/imaniqbal00/rag-support-bot.git
cd rag-support-bot
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your env variables
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in your env variables
npm run dev
```

### 4. Setup Supabase
Run the SQL from `supabase/schema.sql` in your Supabase SQL editor.

### Environment Variables

**Backend `.env`**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
COHERE_API_KEY=your_cohere_api_key
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
rag-support-bot/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/       # Auth middleware
│   │   └── index.ts         # Express app
│   ├── public/
│   │   └── widget.js        # Embeddable chat widget
│   └── vercel.json
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── public/
│   │   └── demo.html        # Live demo page
│   └── next.config.js
└── supabase/
    └── schema.sql           # Database schema
```

---

## 🎮 Embed The Widget

Add this one line to any website before `</body>`:

```html
<script
  src="https://your-backend.vercel.app/widget.js"
  data-token="YOUR_API_TOKEN"
  data-bot-name="Support Bot"
  data-backend="https://your-backend.vercel.app"
  defer
></script>
```

---

## 📊 Screenshots

### Dashboard Overview
- Track total queries, resolution rate, and weekly activity

### Documents Page  
- Upload and manage your knowledge base documents

### Analytics Page
- See every question asked with AI answers and confidence scores

### Chat Widget
- Beautiful floating chat button that works on any website

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

## 👤 Author

**Iman Iqbal**
- GitHub: [@imaniqbal00](https://github.com/imaniqbal00)
- LinkedIn: [Add your LinkedIn URL here]

---

⭐ **Star this repo if you found it useful!**
