# 🎓 ElectiveOS — Intelligent University Elective Decision Engine

ElectiveOS is a next-generation elective choice dashboard and advising platform for universities. It replaces static, chaotic Google Forms with an intelligent, clash-free, prerequisite-aware course allocation pipeline and an AI Academic Advisor powered by LLMs.

---

## ⚡ Key Highlights & Architecture

- **Predictive AI Advisor**: Tailored elective recommendations using LLMs (`MiniMax M3` / `Google Gemini`) with real-time seat probability calculations.
- **Server-Side Validation Engine**:
  - Strict prerequisite verification against completed student coursework.
  - Overlap/clash detection across weekly time blocks.
  - Automated waitlist routing when course capacity is reached.
- **Admin Real-Time Analytics**: Visual departmental choice distribution, capacity demand tracking, and waitlist metrics.

---

## 🛡️ 3-Layer Security Architecture

> *"Security runs at three layers — database-level RLS so students can only touch their own data, server-side Zod validation, and a prompt-injection guard on the LLM endpoint."*

1. **Database-Level Row Level Security (RLS)**:
   - Supabase/PostgreSQL policies enforce that students can only read and mutate their own choices.
   - Admin-only role escalations strictly isolated via security-definer database functions.
2. **Server-Side Validation (Zod & Transactional Logic)**:
   - All client inputs are strictly parsed through Zod schemas.
   - Prerequisite checking, time-clash detection, and seat increment operations execute server-side via service role privileges to prevent race conditions and client tampering.
3. **Prompt Injection & LLM Defenses**:
   - All student goals and freeform inputs are treated strictly as untrusted data.
   - Guard filters neutralize instruction overriding tokens (`system prompt`, `ignore previous instructions`).
   - Catalog data is passed structured with strict JSON-schema output enforcement.
4. **Secret Hygiene**:
   - No secrets are committed. All service keys and LLM tokens are held strictly in server-side environment variables.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router, React 19, TypeScript)
- **Styling & UI**: Tailwind CSS v4, shadcn/ui, Lucide Icons, Recharts, dnd-kit
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **AI Engine**: OpenRouter (`minimax/minimax-m3:free` / Google Gemini)
- **Schema Validation**: Zod

---

## 🚀 Setup & Execution

### 1. Environment Variables
Copy `.env.example` to `.env.local` and populate keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_api_key
AI_MODEL=minimax/minimax-m3:free
```

### 2. Database Initialization (Supabase SQL Editor)
Execute the SQL files in order in your Supabase SQL editor:
1. `supabase/schema.sql` (Creates students, electives, and choices tables)
2. `supabase/rls.sql` (Enforces Row Level Security policies)

### 3. Seed Database
Populate sample electives, demo student profiles, and simulated analytics data:
```bash
npx tsx scripts/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 👥 Demo Accounts

| Account | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student 1** | `student1@demo.edu` | `demo123` | Has *"Machine Learning Fundamentals"* |
| **Student 2** | `student2@demo.edu` | `demo123` | Lacks ML prerequisite (triggers blocker) |
| **Dean / Admin** | `admin@demo.edu` | `demo123` | Full administrative analytics access |
