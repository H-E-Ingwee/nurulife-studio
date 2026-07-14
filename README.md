# NuruLife Production Studio

> **"Shining Light, Transforming Lives." — Matthew 5:14–16**

The in-house production management platform for **NuruLife Productions** — built by Brian Ingwee, CEO & Lead Developer.

---

## 🚀 Quick Start (VS Code)

### Prerequisites
- Node.js 18+ installed
- VS Code installed
- Git installed
- Supabase account (free) — already configured

### Step 1: Open in VS Code
```bash
cd nurulife-studio
code .
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Database
The `.env.local` file is already configured with your Supabase credentials.

You need to add your **Supabase database password** to the `DATABASE_URL` in `.env.local`:
```
DATABASE_URL=postgresql://postgres.hpwqfpaqpqkfjalabzjl:[YOUR-DB-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Find your DB password in: Supabase Dashboard → Project Settings → Database → Database Password

### Step 4: Push Database Schema
```bash
npm run db:push
```

This creates all tables in your Supabase database automatically.

### Step 5: Generate Prisma Client
```bash
npm run db:generate
```

### Step 6: Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Team Setup

After starting the server, each team member registers at `/register`:

| Team Member | Role to Select |
|---|---|
| Brian Ingwee | Admin |
| Grace Kanyiri | Creative Director |
| Esther Karimeri | Head of Productions |
| Sandra Mutanu | Head of Creative Arts |
| John Mwadown | Head of Media & Technology |
| David Testimony | Head of Communications |

---

## 🏗️ Project Structure

```
nurulife-studio/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login & Register pages
│   │   ├── (dashboard)/     # All 6 modules
│   │   └── api/             # All API routes + AI endpoints
│   ├── components/          # UI components per module
│   ├── lib/                 # Supabase, Prisma, AI, Email, Cloudinary
│   └── types/               # TypeScript types
├── prisma/
│   └── schema.prisma        # Complete database schema
├── public/
│   └── logo/                # NuruLife logo
├── .env.local               # Your credentials (never commit)
└── README.md
```

---

## 🎬 The 6 Modules

| Module | URL | Purpose |
|---|---|---|
| Command Room | `/command-room` | Projects, tasks, analytics |
| Word Room | `/word-room` | Scripts, AV scripts, documents |
| Breakdown Room | `/breakdown-room` | Scene elements, reports |
| Schedule Room | `/schedule-room` | Stripboard, shooting schedule |
| Vision Room | `/vision-room` | Mood boards, shot lists, storyboards |
| Call Room | `/call-room` | Contacts, call sheets, prayer focus |

---

## 🤖 AI Features

All 15 AI features are pre-configured with your API keys:

- ✅ AI Script Assistant (streaming)
- ✅ Biblical Narrative Analyzer
- ✅ Cultural Authenticity Checker (Kenyan context)
- ✅ Auto Element Tagger
- ✅ Budget Estimator (KES)
- ✅ Smart Scheduler
- ✅ AI Storyboard Generator (African visual styles)
- ✅ AI Shot List Generator
- ✅ Prayer Focus Generator 🙏
- ✅ Production Health Monitor

---

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial NuruLife Production Studio"
git remote add origin https://github.com/yourusername/nurulife-studio.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Click "Deploy"

Your platform will be live at `nurulife-studio.vercel.app`

### Step 3: Custom Domain (Optional)
In Vercel dashboard → Domains → Add `studio.nurulifeproductions.com`

---

## 🛠️ Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema to Supabase
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:generate  # Regenerate Prisma client
npm run lint         # Run ESLint
```

---

## 📧 Email (Call Sheets)

Call sheets are sent via **Resend** (3,000 free emails/month).

To send from a custom domain (e.g. `production@nurulifeproductions.com`):
1. Go to [resend.com](https://resend.com) → Domains
2. Add `nurulifeproductions.com`
3. Add the DNS records to your domain registrar
4. Update `RESEND_FROM_EMAIL` in `.env.local`

Until then, emails send from `onboarding@resend.dev` (Resend's default).

---

## 🖼️ Images (Cloudinary)

Mood board images, storyboard panels, and AI-generated concept art are stored in **Cloudinary**.

Your Cloudinary account is pre-configured:
- Cloud Name: `gvx88r8d`
- Free tier: 25GB storage + 25GB bandwidth

---

## 🙏 Faith Foundation

> *"You are the light of the world. A city set on a hill cannot be hidden."*
> — Matthew 5:14

NuruLife Production Studio is built to serve the mission of NuruLife Productions:
**Shining Light, Transforming Lives** through transformative African Christian media.

Every call sheet includes a Prayer Focus. Every script can be analyzed for biblical depth.
Every storyboard can be generated in authentic African visual styles.

This platform is not just a tool. It is infrastructure for influence.

---

**NuruLife Productions** | Nairobi, Kenya | nurulifeproduction@gmail.com | @NuruLifeProductions

*Built with faith, excellence, and love for African Christian storytelling.*