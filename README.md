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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
