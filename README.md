# YNOW Waitlist 🚀

> **Uber for Mechanics.** Instant bookings. Verified experts. Roadside rescue in minutes.

The official waitlist portal for **YNOW**, featuring a high-conversion "Dark Industrial" design, smart data collection, and real-time social proof.

![YNOW Preview](https://via.placeholder.com/1200x600/000000/00FF94?text=YNOW+Waitlist+Preview)

## ✨ Features

- **Dual Funnel System**: Seamlessly toggles between "I Need a Mechanic" (Drivers) and "I Am a Mechanic" (Service Providers).
- **Smart Data Collection**:
  - **Drivers**: Auto-detects Email or WhatsApp (Low friction).
  - **Mechanics**: Enforces WhatsApp number for instant job dispatch alerts (High utility).
- **Dynamic Live Counter**: Real-time "People Waiting" ticker powered by Supabase RPC.
- **Viral Referral Loop**: Generates unique referral links (`?ref=CODE`) to track viral growth.
- **Ultra-Modern UI**: Glassmorphism, neon accents (`#00FF94`), and responsive typography.

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (Variables + Design Tokens)
- **Backend**: Supabase (Database + Edge Functions)
- **Icons**: Phosphor Icons / Heroicons (via SVGs)

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/zoecyber001/ynow-waitlist.git
cd ynow-waitlist
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Locally
```bash
pnpm run dev
```

## 🗄️ Database Schema (Supabase)

Run this SQL in your Supabase SQL Editor to set up the table and secure counting function:

```sql
-- Create Waitlist Table
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique,
  phone text unique,
  user_type text not null check (user_type in ('driver', 'mechanic')),
  referral_code text unique not null,
  referred_by text,
  constraint email_or_phone_required check (email is not null or phone is not null)
);

-- Enable RLS
alter table waitlist enable row level security;

-- Allow public inserts (Signups)
create policy "Enable insert for all users" on waitlist for insert with check (true);

-- Secure Count Function (prevents data leakage)
create or replace function get_waitlist_count()
returns integer
language sql
security definer
as $$
  select count(*)::integer from waitlist;
$$;
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
