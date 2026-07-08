# MyShelf - Digital Bookshelf

MyShelf is a mobile-first web app for building a digital replica of your physical book collection. Scan ISBN barcodes or add books manually, track your reading progress, and view statistics about your library.

## 🌟 Features

### 📷 Barcode Scanning
- Fast 15 FPS scanning with `html5-qrcode`
- Haptic feedback on successful scan
- Batch scanning with minimal cooldown

### 📚 Library Management
- **Grid & List Views** - Toggle between visual layouts
- **Reading Status** - Track Unread, Reading, Read, Wishlist
- **Ratings** - 5-star rating system
- **Notes** - Personal notes for each book
- **Favorites** - Mark your favorite books
- **Search & Filter** - Filter by status, search by title/author
- **Sort** - By date added, title, author, or rating

### ✏️ Manual Entry
- Add books without scanning via ISBN search or manual form
- Supports books without barcodes

### 📊 Statistics Dashboard
- Reading progress percentage
- Books by genre breakdown
- Top authors
- Rating distribution

### 🎨 Theming
- **Teal** color scheme
- Dark mode (default) & Light mode
- Glassmorphic UI elements
- System preference detection

### ⚙️ Settings
- Theme toggle
- Export library as JSON/CSV
- Import from backup
- Clear all data

### 🔐 Security
- API keys are **server-side only** (Vercel serverless)
- Book lookups go through `/api/book` endpoint
- No sensitive data in client bundle

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS + CSS Variables
- **Scanner**: `html5-qrcode`
- **API**: Open Library (primary), OpenRouter LLM (fallback)
- **Backend**: Vercel Serverless Functions
- **Storage**: Vercel KV (shared library) + browser localStorage for client state

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- OpenRouter API key (for LLM fallback)

### Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your OPENROUTER_API_KEY + shared login + Vercel KV credentials

# Start dev server
npm run dev

# For API testing + serverless endpoints, run Vercel dev
npx vercel dev
```

### Deployment

```bash
# Build
npm run build

# Deploy to Vercel
npx vercel --prod
```

**Important:** Add the following to Vercel Environment Variables:
- `OPENROUTER_API_KEY`
- `APP_USER`
- `APP_PASS`
- `DATABASE_URL` (added automatically when you connect Neon Postgres via Vercel Storage)

### Environment Variables

```bash
# Book lookup (LLM fallback)
OPENROUTER_API_KEY=your_key_here

# Shared beta login
APP_USER=Mybooks
APP_PASS=quickscan123

# Neon Postgres connection string (auto-injected by the Vercel Neon integration)
DATABASE_URL=
```

### Database setup

Storage is Neon Postgres (free tier). In the Vercel dashboard:
1. Open your project → **Storage** → **Create Database** → **Neon** (Postgres)
2. Connect it to this project — Vercel injects `DATABASE_URL` automatically
3. Redeploy. The `books` table is created automatically on first use.

## 📋 Requirements

- Modern browser (Chrome/Edge/Safari)
- HTTPS (required for camera access)
- Camera permissions

## 📁 Project Structure

```
├── api/                 # Vercel serverless functions
│   ├── book.ts          # Book lookup API (secure)
│   ├── login.ts         # Shared login auth
│   └── library.ts       # Shared library backed by Vercel KV
├── components/          # React components
├── contexts/            # React contexts (Theme)
├── hooks/               # Custom hooks
├── services/            # API services
├── styles/              # CSS (theme variables)
└── utils/               # Utilities (export, ISBN)
```

  ## 🔮 Future Plans

### Core Infrastructure
- [ ] Firebase Auth (Google + Email/Password)
- [ ] Real-time cloud sync
- [ ] Collections (custom book groups)
- [ ] Payment integration

### Differentiation Strategy: Personal Reader's Journal
- [ ] **Reading session tracking** - Start/stop timer per book
- [ ] **Quote/Highlight capture** - Save favorite passages
- [ ] **Reading streaks & achievements** - Gamification without social pressure
- [ ] **Mood/context logging** - How did this book make you feel?
- [ ] **Monthly reading reports** - AI-generated insights ("You read 3x more sci-fi this quarter")
- [ ] **Private reading goals** - Set and track personal reading targets

### Enhanced Library Management
- [ ] **Series tracking** - Read order, missing volumes
- [ ] **Cross-reference suggestions** - "You have 5 unread books by this author"
- [ ] **Smart deduplication** - Merge multiple editions of same work
- [ ] **Physical shelf organization** - Tag books by actual shelf location
- [ ] **Collection value tracking** - Calculate library worth with book prices
- [ ] **Export integrations** - Calibre, Goodreads, LibraryThing

### Scanner Enhancements
- [ ] **Batch scanning mode** - "Hold and scan" for rapid cataloging
- [ ] **AI-powered auto-categorization** - Genre tagging based on content
- [ ] **Cover image enhancement** - Higher quality covers via additional sources
- [ ] **Multi-barcode support** - Scan multiple barcodes before processing

## 📄 License

MIT
