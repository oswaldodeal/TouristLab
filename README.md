# 🌍 TouristLab

**Discover What's Around You**

TouristLab is an independent tourism platform connecting visitors with local businesses — starting in **Manchester, UK**, with a clear path to expand to other cities.

## ✨ Core Features
- 🗺️ Interactive map showing businesses within **1km** of Manchester City Centre
- 🏷️ Flexible categories — easily add new types of places anytime
- 🔐 Two-tier verification system:
  - **🟡 Basic (Free):** Name, category & description visible — contact details hidden
  - **🔵 Full (Paid):** All details public — address, phone, website, hours & directions
- 🔑 Admin review panel — you control what goes live
- 📱 Fully responsive — works on phone, tablet and desktop

## 🚀 Tech Stack
- **Next.js 14** — React framework
- **Leaflet** — interactive maps
- **LocalStorage** — stores data in browser (easily upgraded to database later)
- **Vercel** — instant deployments & previews

## 📋 How It Works
1. Business submits listing → Status: **Pending** (hidden from public)
2. Admin reviews → Approve as **Basic** or **Full**, or **Reject**
3. **Basic** → Public sees name, category, description, distance only
4. **Full** → All contact & location details become visible
5. Upgrade anytime from Basic → Full when payment confirmed

## 🧭 Current Focus
- ✅ **Manchester City Centre** — live & ready
- ➕ More cities coming soon

## 🛠️ For Developers
```bash
# Install dependencies
npm install

# Run local dev server
npm run dev

# Build for production
npm run build
