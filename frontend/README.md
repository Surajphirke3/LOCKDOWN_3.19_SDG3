# CoughLock - Web Frontend

> **Lock TB early. Act faster.**

A Next.js web application for TB screening through audio analysis and medical risk prediction.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Pages & Routing](#pages--routing)
- [Components](#components)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Configuration](#configuration)
- [Build & Run](#build--run)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

The CoughLock web frontend provides a browser-based interface for TB screening capabilities. Built with **Next.js 16** and **React 19**, it offers:

- File-based audio upload with WebSocket streaming
- Medical questionnaire with real-time risk prediction
- AI-powered health assistant with location services
- WebSocket debugging utility for backend connectivity testing

### Why Next.js?

- **App Router**: Modern file-based routing with server components
- **API Routes**: Built-in backend proxy for CORS handling
- **Performance**: Automatic code splitting and optimization
- **TypeScript**: First-class type safety support

---

## Features

- 📁 **Drag & Drop Audio Upload** - Support for WAV and MP3 files
- 📊 **Interactive Risk Prediction** - Real-time form validation and submission
- 🤖 **AI Health Assistant** - Natural language Q&A with hospital recommendations
- 📍 **Geolocation** - Automatic location detection via browser API
- 🔌 **WebSocket Debugger** - Test backend connectivity
- 🎨 **Dark Mode Support** - Automatic theme based on system preference
- ⚡ **Framer Motion Animations** - Smooth UI transitions

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.1.6 |
| Runtime | React | 19.2.3 |
| Language | TypeScript | ^5 |
| Styling | TailwindCSS | ^4 |
| Animations | Framer Motion | ^12.29.2 |
| Utilities | clsx, tailwind-merge | Latest |

---

## Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App (App Router)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Layout (RootLayout)                     ││
│  │               Fonts, Global CSS, Metadata                    ││
│  └──────────────────────────┬──────────────────────────────────┘│
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────────┐│
│  │                        Pages                                 ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            ││
│  │  │     /       │ │/audio-upload│ │/cough-      │            ││
│  │  │  (Home)     │ │             │ │ prediction  │            ││
│  │  │             │ │ WebSocket   │ │             │            ││
│  │  │ Navigation  │ │ Audio       │ │ REST API    │            ││
│  │  │ Hub         │ │ Upload      │ │ Form        │            ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘            ││
│  │                                                              ││
│  │  ┌─────────────┐ ┌─────────────┐                            ││
│  │  │/health-     │ │/api/predict │                            ││
│  │  │ assistant   │ │ (API Route) │                            ││
│  │  │             │ │             │                            ││
│  │  │ AI Chat     │ │ Proxy to    │                            ││
│  │  │ Hospitals   │ │ Backend     │                            ││
│  │  └─────────────┘ └─────────────┘                            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     Components                               ││
│  │  ┌───────────────────┐  ┌────────────────────────────────┐  ││
│  │  │  WebSocketClient  │  │           UI Library           │  ││
│  │  │  (Backend Debug)  │  │  Button, Card, Input, Label,   │  ││
│  │  │                   │  │  Badge, Textarea               │  ││
│  │  └───────────────────┘  └────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Patterns

| Pattern | Usage | Implementation |
|---------|-------|----------------|
| Client-Side Fetch | Audio Upload, Prediction, Assistant | `fetch()` with `'use client'` directive |
| WebSocket | Audio streaming | `new WebSocket()` in client component |
| API Route | Prediction proxy | Next.js Route Handler (`route.ts`) |
| Geolocation | Location detection | Browser Navigator API |

---

## Folder Structure

```
frontend/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout with fonts
│   │   ├── page.tsx                   # Home page (/)
│   │   ├── globals.css                # Global styles + Tailwind
│   │   ├── favicon.ico                # Site favicon
│   │   │
│   │   ├── audio-upload/              # Audio upload feature
│   │   │   └── page.tsx               # WebSocket audio upload UI
│   │   │
│   │   ├── cough-prediction/          # Risk prediction feature
│   │   │   └── page.tsx               # Medical form UI
│   │   │
│   │   ├── health-assistant/          # AI assistant feature
│   │   │   └── page.tsx               # Chat interface UI
│   │   │
│   │   └── api/                       # API Route Handlers
│   │       └── predict/
│   │           └── route.ts           # Proxy to backend
│   │
│   ├── components/                    # React components
│   │   ├── WebSocketClient.tsx        # Debug/testing utility
│   │   └── ui/                        # UI component library
│   │       ├── button.tsx             # Button variants
│   │       ├── card.tsx               # Card containers
│   │       ├── input.tsx              # Form inputs
│   │       ├── label.tsx              # Form labels
│   │       ├── badge.tsx              # Status badges
│   │       └── textarea.tsx           # Multi-line input
│   │
│   └── lib/                           # Utility functions
│       └── utils.ts                   # cn() for class merging
│
├── public/                            # Static assets
│
├── .env.local                         # Environment variables
├── next.config.ts                     # Next.js configuration
├── tailwind.config.ts                 # Tailwind configuration (v4)
├── postcss.config.mjs                 # PostCSS configuration
├── tsconfig.json                      # TypeScript configuration
└── package.json                       # Dependencies
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Pages using App Router conventions |
| `src/app/api/` | Server-side API route handlers |
| `src/components/ui/` | Reusable UI components (shadcn-style) |
| `src/lib/` | Utility functions |
| `public/` | Static assets served at root |

---

## Pages & Routing

### Route Overview

| Route | File | Description | Type |
|-------|------|-------------|------|
| `/` | `app/page.tsx` | Home/navigation page | Server Component |
| `/audio-upload` | `app/audio-upload/page.tsx` | Audio file upload | Client Component |
| `/cough-prediction` | `app/cough-prediction/page.tsx` | Medical form | Client Component |
| `/health-assistant` | `app/health-assistant/page.tsx` | AI assistant | Client Component |
| `/api/predict` | `app/api/predict/route.ts` | Backend proxy | API Route |

### Page Details

#### Home Page (`/`)

**File**: `src/app/page.tsx`

The landing page with navigation cards to all features.

```tsx
// Features:
- CoughLock branding and tagline
- Navigation cards for each feature
- WebSocket status indicator
- Dark mode support
```

#### Audio Upload (`/audio-upload`)

**File**: `src/app/audio-upload/page.tsx`

File-based audio upload with WebSocket streaming.

| Feature | Description |
|---------|-------------|
| File Selection | Click to select or drag-and-drop |
| Validation | WAV/MP3 only, max 10MB |
| Upload | Chunked WebSocket transfer |
| Progress | Real-time progress bar |
| Results | Risk label, confidence, spectrogram |

**WebSocket Protocol**:
```javascript
// 1. Send metadata
ws.send(JSON.stringify({
  type: 'metadata',
  filename: file.name,
  size: file.size,
  mimeType: file.type
}));

// 2. Send binary chunks (64KB each)
ws.send(chunk);

// 3. Signal completion
ws.send(JSON.stringify({ type: 'complete' }));
```

#### Cough Prediction (`/cough-prediction`)

**File**: `src/app/cough-prediction/page.tsx`

Medical questionnaire with real-time prediction.

| Field | Type | Validation |
|-------|------|------------|
| Age | Number input | Required, numeric |
| Cough Days | Number input | Required, numeric |
| Fever | Yes/No toggle | Required |
| Smoker | Yes/No toggle | Required |

**API Integration**:
```typescript
const response = await fetch('https://[backend]/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ age, cough_days, fever, smoker })
});
```

#### Health Assistant (`/health-assistant`)

**File**: `src/app/health-assistant/page.tsx`

AI-powered health guidance with geolocation.

| Feature | Description |
|---------|-------------|
| Risk Level | LOW / MEDIUM / HIGH selector with color coding |
| Location | Auto-detect via browser + manual entry |
| Query Input | Multi-line textarea |
| Suggestions | Quick-select query buttons |
| Response | AI text, recommendations, hospital cards |

**Geolocation Flow**:
```typescript
// Get coordinates
navigator.geolocation.getCurrentPosition(...)

// Reverse geocode via OpenStreetMap
fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
```

---

## Components

### UI Component Library

The project uses a shadcn/ui-style component library with consistent styling.

#### Button

**File**: `src/components/ui/button.tsx`

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Danger</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

**Variants**:
- `default` - Primary action (zinc background)
- `destructive` - Danger action (red)
- `outline` - Bordered button
- `secondary` - Secondary action
- `ghost` - Minimal styling
- `link` - Text link style

#### Card

**File**: `src/components/ui/card.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Input

**File**: `src/components/ui/input.tsx`

```tsx
import { Input } from '@/components/ui/input';

<Input type="number" placeholder="Enter age" />
```

#### Label

**File**: `src/components/ui/label.tsx`

```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="age">Age</Label>
```

#### Badge

**File**: `src/components/ui/badge.tsx`

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">High Risk</Badge>
<Badge variant="outline">LOW</Badge>
```

#### Textarea

**File**: `src/components/ui/textarea.tsx`

```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea rows={3} placeholder="Enter your question..." />
```

### WebSocketClient

**File**: `src/components/WebSocketClient.tsx`

A debugging utility for testing WebSocket connections.

| Feature | Description |
|---------|-------------|
| URL Input | Configurable WebSocket endpoint |
| Connect/Disconnect | Toggle connection state |
| Message Log | Timestamped message history |
| Send Message | Interactive message sending |
| Error Display | Connection error details |

---

## API Integration

### Backend Endpoints

| Endpoint | Method | Usage |
|----------|--------|-------|
| `wss://[backend]/ws/audio` | WebSocket | Audio file analysis |
| `POST https://[backend]/api/predict` | REST | Medical prediction |
| `POST https://[backend]/assistant` | REST | Health assistant |

### API Route Handler

**File**: `src/app/api/predict/route.ts`

A Next.js API route that proxies requests to the backend (can be used to avoid CORS issues).

```typescript
// Proxies POST requests to backend /api/predict
export async function POST(request: Request) {
  const body = await request.text();
  
  const upstreamResponse = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  
  return new NextResponse(responseBody, { status: upstreamResponse.status });
}
```

### Type Definitions

```typescript
// Audio Analysis
interface ServerResponse {
  label?: string;
  confidence?: number;
  spectrogram_shape?: number[];
}

// Medical Prediction
interface PredictionResult {
  risk_score: number;
  risk_level: string;
}

// Health Assistant
interface Hospital {
  name: string;
  address?: string;
  distance?: string;
  phone?: string;
}

interface AssistantResponse {
  response?: string;
  hospitals?: Hospital[];
  recommendations?: string[];
}
```

---

## Styling

### TailwindCSS v4

The project uses TailwindCSS v4 with PostCSS integration.

**Configuration**: `src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### Design System

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Background | `#ffffff` | `#0a0a0a` | Page backgrounds |
| Foreground | `#171717` | `#ededed` | Text color |
| Zinc-50 | `#fafafa` | - | Cards, containers |
| Zinc-800 | - | `#27272a` | Dark mode surfaces |
| Teal-500 | `#14b8a6` | `#14b8a6` | Accent color |

### Utility Function

**File**: `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Combines conditional classes and resolves Tailwind conflicts.

---

## Configuration

### Environment Variables

**File**: `.env.local`

```env
# Currently not used - URLs are hardcoded
# Future: Add backend URL configuration
# NEXT_PUBLIC_BACKEND_URL=https://your-backend.com
```

### Next.js Configuration

**File**: `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Default configuration
};

export default nextConfig;
```

### TypeScript Configuration

**File**: `tsconfig.json`

Key settings:
- `strict: true` - Full type checking
- Path alias: `@/*` → `./src/*`
- Target: ES2017

---

## Build & Run

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Development server with HMR |
| `build` | `next build` | Production build |
| `start` | `next start` | Production server |
| `lint` | `eslint` | Code linting |

---

## Deployment

### Vercel (Recommended)

1. Push repository to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically

```bash
# Or deploy via CLI
npm i -g vercel
vercel
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Static Export

```bash
# For static hosting (if applicable)
npm run build
# Note: API routes won't work with static export
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom**: "Failed to fetch" or CORS policy errors

**Solutions**:
- Use the API route proxy (`/api/predict`)
- Ensure backend allows your origin
- Check if backend Codespace is running

#### 2. WebSocket Connection Issues

**Symptom**: WebSocket stays in "Connecting" state

**Solutions**:
- Verify backend WebSocket endpoint is running
- Ensure Codespace port is set to PUBLIC
- Check for HTTPS/WSS protocol mismatch
- Use the WebSocketClient component to debug

#### 3. Dark Mode Flicker

**Symptom**: Flash of wrong theme on page load

**Solution**: System preference is used by default. For manual control, implement a theme provider.

#### 4. Build Errors

**Symptom**: TypeScript or ESLint errors during build

**Solutions**:
```bash
# Check for type errors
npx tsc --noEmit

# Fix ESLint issues
npm run lint -- --fix

# Clear cache
rm -rf .next
npm run build
```

#### 5. Audio Upload Fails

**Symptom**: "File type not supported" or upload fails

**Solutions**:
- Ensure file is WAV or MP3 format
- Check file size is under 10MB
- Try a different browser

### Development Tips

1. **Hot Reload**: File changes auto-refresh the browser
2. **Error Overlay**: Development mode shows detailed error overlays
3. **React DevTools**: Install browser extension for debugging
4. **Network Tab**: Use browser DevTools to inspect API calls

---

## Contributing

1. Follow existing code patterns
2. Use TypeScript with strict mode
3. Use UI components from `src/components/ui/`
4. Add pages to `src/app/` using App Router conventions
5. Test with `npm run build` before committing

---

*For overall system documentation, see [/documentation.md](../documentation.md)*
