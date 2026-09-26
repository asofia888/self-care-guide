<div align="center">
<img width="1200" height="475" alt="Self-Care Guide for Wellness" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Self-Care Guide for Wellness 🌿

> An AI-powered integrative medicine reference application combining Kampo (traditional Japanese medicine) and Western herbal traditions with modern wellness practices.

**Live Demo:** https://self-care-guide.vercel.app

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.2-purple?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Local Development](#local-development)
- [Development Guide](#development-guide)
  - [Project Structure](#project-structure)
  - [Available Scripts](#available-scripts)
  - [Code Quality Tools](#code-quality-tools)
- [API Documentation](#api-documentation)
  - [POST /api/compendium](#post-apicompendium)
- [Architecture](#architecture)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

Self-Care Guide for Wellness is a modern web application that leverages Google's Gemini AI to provide evidence-based recommendations combining:

- **漢方 (Kampo)**: Traditional Japanese herbal medicine formulas
- **Western Herbs**: European and American medicinal herbs
- **Modern Supplements**: Contemporary nutritional and health supplements

The application supports **bilingual content** (日本語 and English) and includes comprehensive accessibility features.

### Key Benefits

✅ **AI-Powered Recommendations** - Get personalized health guidance using advanced AI
✅ **Dual Medical Traditions** - Combine East and West medical approaches
✅ **Bilingual Support** - Full support for Japanese and English
✅ **Accessible Design** - WCAG 2.1 compliant with screen reader support
✅ **Privacy-First** - No user data collection, all requests are stateless
✅ **Production-Ready** - Enterprise-grade security and performance

---

## Features

### 🔍 Integrative Medicine Guide

- Search for specific herbs, supplements, or health conditions
- Get detailed information about remedies:
  - Active compounds and constituent herbs
  - Clinical applications and research evidence
  - Contraindications and safety warnings
  - Integrative viewpoint combining Eastern and Western perspectives

### 🌐 Multi-Language Support

- **日本語 (Japanese)** - Medical professional level
- **English** - Medical professional level
- Real-time language switching

### 🎨 Accessibility Features

- WCAG 2.1 Level AA compliant
- Screen reader support (ARIA)
- Keyboard navigation
- Adjustable font sizes (Standard / Large)
- High contrast support

### 📱 Responsive Design

- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Cross-browser compatible

### 🖨️ Print Support

- Print-friendly layouts
- PDF export capability

### 📚 Educational Content

- Instruction Manual
- Privacy Policy
- Terms of Service
- Disclaimer

---

## Tech Stack

### Frontend

- **React 19** - Modern UI framework with concurrent features
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 6.2** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend

- **Vercel Functions** - Serverless API endpoints
- **Google Gemini AI API** - Advanced language model for recommendations
- **Node.js 18+** - JavaScript runtime

### Development & Testing

- **Vitest 2.0** - Fast unit test framework
- **React Testing Library** - Component testing
- **Playwright** - E2E testing (Chromium, Firefox, WebKit)
- **ESLint 9** - Code quality linting
- **Prettier 3** - Code formatting
- **TypeScript** - Static type checking

### DevOps & Deployment

- **Vercel** - Hosting and serverless functions
- **GitHub Actions** - CI pipeline

---

## Getting Started

### Prerequisites

- **Node.js 18+** (recommended: 20.x LTS)
- **npm 9+** or **yarn**
- **Git**
- Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/asofia888/self-care-guide-for-wellness.git
   cd self-care-guide-for-wellness
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create `.env.local` in the project root:

   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   ```

   Replace `your_actual_api_key_here` with your actual Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

   ⚠️ **Important**: Never commit `.env.local` to version control

### Local Development

1. **Start development server:**

   ```bash
   npm run dev
   ```

   The app will open at http://localhost:5173

2. **View in browser:**
   - Navigate to http://localhost:5173
   - The page will hot-reload when you make changes

3. **Test the Compendium:**
   - Try searching for "ginger", "insomnia", or "トンカットアリ"
   - Switch between Japanese and English
   - Adjust font size
   - Test on mobile devices

---

## Development Guide

### Project Structure

```
self-care-guide-for-wellness/
├── api/                       # Vercel Serverless Functions
│   └── compendium.ts         # AI-powered compendium API endpoint
├── components/                # React UI Components
│   ├── Compendium.tsx        # Main search and results component
│   ├── Header.tsx            # Navigation header
│   ├── ErrorBoundary.tsx     # Error fallback component
│   ├── ErrorDisplay.tsx      # Error message display
│   ├── LoadingSpinner.tsx    # Loading state indicator
│   └── ...other components
├── contexts/                  # React Context & State Management
│   └── AppContext.tsx        # Global app state (language, theme, etc.)
├── services/                  # API Service Layer
│   └── geminiService.ts      # Gemini API integration with retry logic
├── utils/                     # Utility Functions
│   ├── errorHandler.ts       # Centralized error handling
│   └── ...other utilities
├── i18n/                      # Internationalization
│   ├── i18n.ts              # i18n configuration
│   ├── ja.json              # Japanese translations
│   └── en.json              # English translations
├── types.ts                   # TypeScript type definitions
├── App.tsx                    # Root component
├── index.tsx                  # Application entry point
├── index.css                  # Global styles
├── constants/                 # Application constants
│   └── index.ts
├── .github/
│   └── workflows/             # GitHub Actions CI/CD
│       └── ci.yml            # Automated testing & deployment
├── e2e/                       # End-to-End Tests (Playwright)
├── __tests__/                 # Unit Tests (Vitest)
├── .eslintrc.json            # ESLint configuration
├── .prettierrc                # Prettier configuration
├── eslint.config.js          # ESLint flat config (v9+)
├── vercel.json               # Vercel deployment config
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── package.json              # Project dependencies
```

### Available Scripts

#### Development

```bash
npm run dev              # Start development server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build locally
```

#### Code Quality

```bash
npm run lint             # Run ESLint checks
npm run lint:fix         # Automatically fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check if code is formatted correctly
npm run type-check       # Check TypeScript types
```

#### Testing

```bash
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once (CI mode)
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run end-to-end tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:headed  # Run E2E tests with visible browser
npm run test:e2e:debug   # Debug E2E tests
npm run test:e2e:report  # View E2E test report
```

### Code Quality Tools

#### ESLint

Ensures code quality and catches common mistakes:

```bash
npm run lint
npm run lint:fix
```

**Configuration:** `.eslintrc.json` and `eslint.config.js`

- React hooks rules
- TypeScript best practices
- Accessibility (jsx-a11y) checks
- Prettier integration

#### Prettier

Automatically formats code for consistency:

```bash
npm run format
npm run format:check
```

**Configuration:** `.prettierrc`

- 100-character line width
- 2-space indentation
- Single quotes
- Trailing commas (ES5)

#### TypeScript

Static type checking:

```bash
npm run type-check
```

---

## API Documentation

### POST /api/compendium

Retrieve AI-generated compendium information about herbs, supplements, or health conditions.

#### Request

**URL:** `POST https://self-care-guide.vercel.app/api/compendium`

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "query": "ginger",
  "language": "en"
}
```

| Parameter  | Type   | Required | Description                                                                                                               |
| :--------- | :----- | :------- | :------------------------------------------------------------------------------------------------------------------------ |
| `query`    | string | Yes      | Search query (max 500 characters). Can be a specific substance (e.g., "ginger") or a symptom/condition (e.g., "insomnia") |
| `language` | string | Yes      | Response language: `"ja"` (Japanese) or `"en"` (English)                                                                  |

#### Response

**Success (200 OK):**

```json
{
  "integrativeViewpoint": "Ginger combines warming properties from both Eastern and Western traditions...",
  "kampoEntries": [
    {
      "name": "生姜 (Shokyo)",
      "category": "漢方処方",
      "summary": "Fresh ginger used in warming formulas",
      "actions": ["Warm the stomach", "Stop nausea"],
      "indications": ["Cold limbs", "Nausea"],
      "constituentHerbs": "Gingerol, shogaol",
      "clinicalNotes": "Fresh ginger is more warming than dried",
      "contraindications": "Avoid in heat conditions"
    }
  ],
  "westernHerbEntries": [
    {
      "name": "Ginger",
      "category": "Western Herb",
      "summary": "Warming spice with digestive benefits",
      "actions": ["Support digestion", "Reduce inflammation"],
      "indications": ["Nausea", "Poor digestion"],
      "constituentHerbs": "Gingerol, shogaol, zingerone",
      "clinicalNotes": "Traditional use supported by modern research",
      "contraindications": "Generally safe in normal culinary amounts"
    }
  ],
  "supplementEntries": [
    {
      "name": "Ginger Extract",
      "category": "Supplement",
      "summary": "Concentrated form for convenient dosing",
      "actions": ["Support digestive health"],
      "indications": ["Occasional nausea"],
      "constituentHerbs": "Ginger rhizome extract",
      "clinicalNotes": "Standardized extracts provide consistent potency",
      "contraindications": "Well-tolerated by most people"
    }
  ]
}
```

**Error (400 Bad Request):**

```json
{
  "error": "Query must be less than 500 characters"
}
```

**Error (429 Too Many Requests):**

```json
{
  "error": "Service temporarily unavailable due to high demand. Please try again later."
}
```

**Error (500 Internal Server Error):**

```json
{
  "error": "Failed to process request. Please try again."
}
```

#### Rate Limiting

- **Limit:** 10 requests per minute per IP address (sliding window)
- **Status Code:** 429 Too Many Requests when exceeded
- **Backend:** Distributed via Upstash Redis / Vercel KV when configured (see
  [Environment Variables](#environment-variables-required)). Falls back to a
  per-instance in-memory limiter when no Redis store is set.

#### CORS

**Allowed Origins:**

- `https://self-care-guide.vercel.app`
- `https://self-care-guide-git-main-asofia888.vercel.app`
- `http://localhost:5173`

#### Example Usage

**cURL:**

```bash
curl -X POST https://self-care-guide.vercel.app/api/compendium \
  -H "Content-Type: application/json" \
  -d '{"query": "ginger", "language": "en"}'
```

**JavaScript/Fetch:**

```javascript
const response = await fetch('/api/compendium', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'ginger', language: 'en' }),
});
const data = await response.json();
console.log(data);
```

**Python:**

```python
import requests

response = requests.post(
    'https://self-care-guide.vercel.app/api/compendium',
    json={'query': 'ginger', 'language': 'en'}
)
data = response.json()
print(data)
```

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  React 19 Application                                   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Compendium Component (Search & Results)        │   │   │
│  │  │  - Language Toggle (ja/en)                       │   │   │
│  │  │  - Font Size Adjustment                         │   │   │
│  │  │  - Print Functionality                          │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Other Pages (Manual, Privacy, Terms, etc.)     │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│         ↓ (HTTP POST)                                           │
└─────────────────────────────────────────────────────────────────┘
         │
         │ (HTTPS, CORS, Rate Limited)
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Vercel Edge Network                             │
│         (Global CDN with edge caching)                           │
└─────────────────────────────────────────────────────────────────┘
         │
         │
         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Vercel Serverless Function                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  api/compendium.ts                                       │  │
│  │  - Request Validation                                    │  │
│  │  - Rate Limiting (10 req/min per IP)                    │  │
│  │  - Error Handling                                        │  │
│  │  - Security Headers                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│         │                                                        │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Google Gemini AI API                                    │  │
│  │  - Generate compendium entries                           │  │
│  │  - Combine Kampo & Western herbs                         │  │
│  │  - Structured Output (JSON Schema)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │
         │ (JSON Response)
         ↓
      Client Browser (Parse & Display Results)
```

### Data Flow

1. **User Input** → Search query in Compendium component
2. **API Call** → POST request to `/api/compendium`
3. **Validation** → Input sanitization and rate limiting check
4. **AI Processing** → Gemini API generates recommendations
5. **Response** → Structured JSON with Kampo, Western herbs, supplements
6. **Display** → React component renders results

---

## Security

This application implements enterprise-grade security measures:

### Headers

- ✅ **Content Security Policy (CSP)** - Prevents XSS attacks
- ✅ **Strict-Transport-Security (HSTS)** - Forces HTTPS
- ✅ **X-Frame-Options: DENY** - Prevents clickjacking
- ✅ **X-Content-Type-Options: nosniff** - Prevents MIME sniffing

### API Security

- ✅ **CORS** - Whitelist allowed origins only
- ✅ **Rate Limiting** - 10 requests/minute per IP
- ✅ **Input Validation** - Max 500 character queries
- ✅ **API Key Management** - Environment variable based

### Data Protection

- ✅ **No User Data Tracking** - Stateless requests only
- ✅ **No Cookies** - No persistent storage
- ✅ **No Analytics** - Privacy-first by design

For detailed security information, see [SECURITY.md](SECURITY.md).

---

## Testing

### Unit Tests

```bash
npm run test              # Watch mode
npm run test:run          # Single run (CI mode)
npm run test:coverage     # With coverage report
```

Test coverage targets: **70%+** across branches, functions, lines, and statements

### End-to-End Tests

```bash
npm run test:e2e          # Run all browsers
npm run test:e2e:headed   # Show browser window
npm run test:e2e:debug    # Debug mode
```

**Browsers tested:**

- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

**Mobile devices tested:**

- Pixel 5
- iPhone 12

### Testing Best Practices

- ✅ Test user interactions, not implementation details
- ✅ Use semantic queries (getByRole, getByLabelText)
- ✅ Test accessibility features
- ✅ Mock external APIs
- ✅ Maintain >70% coverage

---

## Deployment

### Automatic Deployment (GitHub)

1. Push to `main` branch
2. GitHub Actions runs type checking, ESLint & Prettier checks, unit tests, and a production build
3. Vercel deploys `main` through its GitHub integration (the CI workflow does not deploy)

### Manual Deployment to Vercel

1. **Create Vercel account** at https://vercel.com

2. **Import repository:**
   - Click "New Project"
   - Select GitHub repository
   - Vercel auto-detects settings

3. **Set environment variables:**
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY`
   - Value: Your actual Gemini API key

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Environment Variables Required

| Variable                   | Value                                           | Required                     |
| :------------------------- | :---------------------------------------------- | :--------------------------- |
| `GEMINI_API_KEY`           | Your Google Gemini API key                      | Yes (production)             |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST URL (distributed rate limit) | No (falls back to in-memory) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token                        | No (falls back to in-memory) |

> Vercel KV stores work too — the function also reads `KV_REST_API_URL` /
> `KV_REST_API_TOKEN`. Without any of these, rate limiting uses a per-instance
> in-memory fallback (fine for low traffic, but not shared across instances).

**Get your API key:**

1. Visit https://aistudio.google.com/apikey
2. Click "Get API Key"
3. Create new API key
4. Copy and paste into Vercel

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- ✅ Follow ESLint rules
- ✅ Format with Prettier
- ✅ Pass type checking
- ✅ Write tests for new features
- ✅ Keep test coverage >70%
- ✅ Update documentation

---

## Troubleshooting

### Common Issues

#### Issue: "GEMINI_API_KEY is not configured"

**Solution:**

1. Check `.env.local` exists in project root
2. Verify `GEMINI_API_KEY=` has your actual key (not PLACEHOLDER_API_KEY)
3. Restart dev server: `npm run dev`

#### Issue: "Port 5173 is already in use"

**Solution:**

```bash
# Use different port
npm run dev -- --port 3000
```

#### Issue: API returns 429 (Too Many Requests)

**Solution:**

- Wait 1 minute (rate limit: 10 req/min)
- Check if multiple tabs are making requests
- In production, implement request queuing

#### Issue: Tests fail with "Cannot find module"

**Solution:**

```bash
npm install
npm run test
```

#### Issue: TypeScript errors in IDE but code runs

**Solution:**

```bash
npm run type-check
# And ensure your IDE is using the workspace TypeScript version
```

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Support

Need help? Check these resources:

- 📖 **Documentation:** See [SECURITY.md](SECURITY.md) for security details
- 🐛 **Report Issues:** GitHub Issues
- 💬 **Discussions:** GitHub Discussions
- 📧 **Contact:** Open an issue with your question

---

## Acknowledgments

Built with:

- React 19 & Vite
- Google Gemini AI API
- Tailwind CSS
- Playwright for E2E testing
- Vercel for deployment

---

**Happy developing! 🚀**

Made with ❤️ for health and wellness
