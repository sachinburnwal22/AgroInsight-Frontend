# ⚛️ AgroInsight Frontend Client

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black.svg?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-v12-0055FF.svg?logo=framer&logoColor=white)](https://www.framer.com/motion/)

A high-fidelity, cybernetic React client for **AgroInsight** featuring interactive maps, dynamic charts, real-time news tickers, and AI translations.

---

## 🎨 Visual Highlights & Core Features

### 📡 Real-Time AgriIntel Dashboard
- **Horizontal Marquee Ticker**: Slowly animations critical notices (MSP rates, cyclone warnings) at `70s` per loop.
- **Trending News Carousel**: Automatic fades and transitions showcasing hot agricultural articles.
- **Glassmorphism Panels**: Modern UI layout with glowing neon borders (`hover:border-primary/50`), translucent cards, and custom cursor animations.

### 🌐 Instant Localization (Multi-Language)
- Dynamic UI language toggles for **English, Hindi, Punjabi, Bengali, and Tamil**.
- Transcripts, scheme directions, and advisor cards automatically adapt to the farmer's dialect.

### 🔊 Text-To-Speech (TTS) Narrator
- Localized hands-free reader on the News Detail pages.
- Leverages the browser's native **Web Speech API (`window.speechSynthesis`)** to read AI-simplified advisories aloud in the selected language.

---

## 📂 Frontend Directory Details

```
frontend/
 ├── app/
 │    ├── layout.tsx           # Global layouts, cursors, and custom toast providers
 │    ├── page.tsx             # Standard analytics landing dashboard
 │    ├── agri-intel/
 │    │    ├── page.tsx        # Main AgriIntel dashboard (news tabs, schemes lists, AI explainers)
 │    │    └── news/
 │    │         └── [id]/
 │    │              └── page.tsx # News detailed view with TTS Audio Player & AI cards
 │    └── crop-recommendation/ # Dynamic cropadvisor recommendations forms
 │
 ├── components/
 │    ├── ui/
 │    │    ├── FloatingNavbar.tsx # Header navigation featuring interactive Alert Dropdown
 │    │    ├── CustomCursor.tsx   # Cyberpunk custom cursor particle generator
 │    │    └── BackgroundWrapper.tsx # Dynamic layout wrapper
 │    └── map/                 # India Map, Leaflet widgets, and layers
 │
 └── context/                  # AuthContext and CartContext states managers
```

---

## 🚀 Setup & Installation

### 1. Configure backend connection
Ensure `.env` contains the API reference:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 2. Install package libraries
```bash
npm install
```

### 3. Run development build
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🧠 Dynamic Audio Narration Flow (TTS)

```
 [User Clicks Play] ---> [Check Browser Speech Synth Support]
                                 |
                                 v
                     [Clean Markdown Tags from Text]
                                 |
                                 v
                     [Map Chosen UI Language to Voice]
                      (EN-IN, HI-IN, PA-IN, TA-IN, etc.)
                                 |
                                 v
                     [Invoke window.speechSynthesis.speak()]
```
*Note: This synthesis runs natively in Chrome, Safari, and Edge without external API requirements.*
