# BillWise — Naye Features Setup Guide

Maine 2 cheezein add ki hain:
1. **Login Authentication** (email + password, Supabase Auth)
2. **Real Voice Assistant** (asli mic se speech-to-text + Claude AI ke real jawab)

Deploy karne se pehle neeche diye steps follow karo — warna app run to hogi
magar login/voice assistant kaam nahi karenge.

---

## 1. Supabase Dashboard mein Email Auth on karo

1. https://supabase.com/dashboard par apne project (`nwiwjaiopmxcpbpuhmez`) mein jao
2. **Authentication → Providers → Email** — confirm ye already ON hai
3. **Authentication → Settings** mein agar testing kar rahe ho aur baar baar email
   confirm nahi karna chahte to "Confirm email" ko temporarily OFF kar do
   (production mein wapas ON kar lena)

## 2. Database Migration Chalao (user_id + naye security rules)

Naya migration file yahan hai:
`supabase/migrations/20260718120000_002_add_authentication.sql`

Isko chalane ke 2 tareeqe hain:

**Option A — Supabase CLI se (recommended):**
```bash
npx supabase login
npx supabase link --project-ref nwiwjaiopmxcpbpuhmez
npx supabase db push
```

**Option B — Dashboard se manually:**
1. Supabase Dashboard → **SQL Editor**
2. `supabase/migrations/20260718120000_002_add_authentication.sql` ki puri
   content copy karo aur paste karke **Run** karo

## 3. Voice Assistant ke liye Edge Function Deploy karo

Ye function Claude API ko securely call karta hai (API key frontend mein
kabhi expose nahi hoti).

```bash
npx supabase functions deploy voice-assistant
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

`sk-ant-...` ki jagah apni Anthropic API key daalo
(console.anthropic.com se milegi — agar nahi hai to account bana ke lo,
thodi si cost lagti hai per-message).

> **Note:** Agar ye function deploy nahi kiya to voice assistant automatically
> offline mode (preset answers) mein chala jayega — app crash nahi hogi,
> bas AI wale smart jawab nahi milenge.

## 4. Local Development

```bash
npm install
npm run dev
```

`.env` file already Supabase URL/key ke sath maujood hai, kuch change karne ki
zaroorat nahi.

---

## Kya Naya Hai

### Login / Signup
- App khulte hi login/signup screen dikhegi
- Email + password se signup/login
- Har user ka data (bills, appliances, solar calculations) sirf usi ko dikhega
  — database level par (`RLS` policies) enforce hota hai, koi bhi user
  dusre ka data nahi dekh sakta
- Sidebar/mobile menu ke neeche logout button hai

### Voice Assistant
- Mic button ab **real** hai — browser ka Web Speech API use karta hai
  (Chrome/Edge mein best kaam karta hai), jo bhi bolo wahi text ban ke aata hai
- Chat ka jawab ab ek **Supabase Edge Function** se aata hai jo asli Claude AI
  ko call karta hai — matlab koi bhi naya sawal poocho, generic "samajh nahi
  aya" wala jawab nahi aayega
- Agar AI backend down ho ya deploy na ho, app automatically purane preset
  answers dikha degi (graceful fallback), crash nahi hogi
