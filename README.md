# PaiseWise — AI Personal Money Coach

A privacy-first, chat-based personal finance tracker built for Indian users. Log expenses in natural language (English + Hinglish), get AI-powered insights, weekly reports, and a Money Health Score — all without ever sharing your bank details.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 7 |
| Styling | Vanilla CSS (custom design system) |
| State | localStorage (no backend) |
| Font | Inter (Google Fonts) |
| Mobile | Capacitor (Android + iOS) |

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd paisewise
npm install

# Development
npm run dev          # starts at localhost:5173

# Production build
npm run build        # outputs to /dist
npm run preview      # preview production build
```

## Mobile App Build

```bash
# Prerequisites
# Android: Android Studio + SDK
# iOS: macOS + Xcode 15+

# Build web assets
npm run build

# Sync to native platforms
npx cap sync

# Open in IDE
npx cap open android    # opens Android Studio
npx cap open ios        # opens Xcode

# Live reload during development
npx cap run android --livereload --external
npx cap run ios --livereload --external
```

## Project Structure

```
src/
├── App.jsx                 # Root with routing + context
├── index.css               # Design system (colors, spacing, components)
├── components/
│   ├── Layout.jsx          # Collapsible sidebar + bottom nav
│   ├── HealthScoreGauge.jsx
│   ├── ProgressRing.jsx
│   └── TiltCard.jsx        # 3D perspective hover effect
├── pages/
│   ├── LandingPage.jsx     # Marketing landing
│   ├── DashboardPage.jsx   # Score ring, stats, goals, categories
│   ├── ChatPage.jsx        # NLP expense logging
│   ├── ReportsPage.jsx     # Weekly breakdown + AI tips
│   ├── GoalsPage.jsx       # Savings goal tracking
│   ├── PricingPage.jsx     # Plan comparison
│   ├── SettingsPage.jsx    # Profile, notifications, data export
│   └── OnboardingPage.jsx  # 2-step setup flow
└── engine/
    ├── expenseParser.js    # Hinglish NLP expense extraction
    ├── healthScore.js      # Composite 0-100 money health score
    ├── insightEngine.js    # Spending analysis + report generation
    ├── personalityEngine.js # AI response templates
    └── store.js            # localStorage persistence layer
```

## Design System

- **Palette**: `#0D1117` (bg) · `#161B22` (cards) · `#00D09C` (accent) · `#FF6B6B` (danger)
- **Font**: Inter (300–800 weights)
- **Spacing**: 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
- **Radius**: 8px (buttons/inputs) · 12px (cards) · 20px (chips)
- **Breakpoints**: Mobile <768 · Tablet 768–1023 · Desktop 1024+

## Key Features

- **Chat-based logging** — type "swiggy 350" or "auto me 80 gaye"
- **Hinglish NLP** — understands 300+ Indian spending phrases
- **Money Health Score** — composite 0–100 based on savings, goals, streak
- **Weekly reports** — AI summary, bar chart, category breakdown
- **Privacy-first** — zero bank/SMS access, all data stays on device
- **Category learning** — correct once, AI remembers forever
- **CSV export** — download all your data anytime

## Environment

No environment variables needed. All data is stored in `localStorage`.

## Setting Up on a New System

```bash
# 1. Ensure Node.js 18+ is installed
node --version

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. (Optional) For mobile builds, install Capacitor platforms
npx cap add android
npx cap add ios
```

## License

MIT
