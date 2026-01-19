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
- **Storage**: Browser localStorage

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
# Add your OPENROUTER_API_KEY

# Start dev server
npm run dev

# For API testing, run Vercel dev
npx vercel dev
```

### Deployment

```bash
# Build
npm run build

# Deploy to Vercel
npx vercel --prod
```

**Important:** Add `OPENROUTER_API_KEY` to Vercel Environment Variables.

## 📋 Requirements

- Modern browser (Chrome/Edge/Safari)
- HTTPS (required for camera access)
- Camera permissions

## 📁 Project Structure

```
├── api/                 # Vercel serverless functions
│   └── book.ts          # Book lookup API (secure)
├── components/          # React components
├── contexts/            # React contexts (Theme)
├── hooks/               # Custom hooks
├── services/            # API services
├── styles/              # CSS (theme variables)
└── utils/               # Utilities (export, ISBN)
```

## 🔮 Future Plans

- [ ] Firebase Auth (Google + Email/Password)
- [ ] Real-time cloud sync
- [ ] Collections (custom book groups)
- [ ] Payment integration

## 📄 License

MIT
