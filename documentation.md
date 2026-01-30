# CoughLock - Technical Documentation

> **Lock TB early. Act faster.**

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Component Responsibilities](#component-responsibilities)
4. [Data Flow](#data-flow)
5. [API Integration](#api-integration)
6. [Configuration & Environment](#configuration--environment)
7. [Security Considerations](#security-considerations)
8. [Extension & Maintenance Guide](#extension--maintenance-guide)

---

## Project Overview

### Vision

**CoughLock** is a health-tech application designed to enable early detection and risk assessment for Tuberculosis (TB) through audio analysis of cough sounds and medical questionnaire data. The system aims to democratize TB screening by providing accessible, AI-powered risk assessment tools.

### Problem Statement

TB remains one of the world's deadliest infectious diseases, with early detection being critical for treatment success. Traditional diagnostic methods require clinical visits and specialized equipment. CoughLock addresses this gap by:

- Enabling remote cough audio analysis for TB risk screening
- Providing symptom-based medical risk prediction
- Connecting users with nearby healthcare facilities through an AI-powered health assistant

### Target Users

- **Primary**: Individuals in TB-endemic regions seeking preliminary screening
- **Secondary**: Healthcare workers in community health programs
- **Tertiary**: Public health organizations monitoring TB prevalence

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Android App** | React Native (Expo), TypeScript |
| **Web Frontend** | Next.js 16, React 19, TypeScript, TailwindCSS |
| **Backend** | External API (hosted on GitHub Codespaces) |
| **Communication** | REST APIs, WebSockets |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CoughLock System                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐                    ┌────────────────────┐           │
│  │   Android App      │                    │   Web Frontend     │           │
│  │   (React Native)   │                    │   (Next.js)        │           │
│  │                    │                    │                    │           │
│  │  • Cough Recording │                    │  • Audio Upload    │           │
│  │  • Medical Form    │                    │  • Risk Prediction │           │
│  │  • Health Assistant│                    │  • Health Assistant│           │
│  │  • Report Display  │                    │  • WebSocket Debug │           │
│  └─────────┬──────────┘                    └──────────┬─────────┘           │
│            │                                          │                      │
│            │         WebSocket (Audio)                │                      │
│            │         REST API (Medical/Assistant)     │                      │
│            └────────────────┬─────────────────────────┘                      │
│                             │                                                │
│                             ▼                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        Backend Server                                 │   │
│  │           (GitHub Codespaces - External Service)                      │   │
│  │                                                                       │   │
│  │   Endpoints:                                                          │   │
│  │   • WSS /ws/audio    - Audio analysis via WebSocket                   │   │
│  │   • POST /api/predict - Medical risk prediction                       │   │
│  │   • POST /assistant   - AI health assistant with hospital finder      │   │
│  │   • WSS /ws           - General WebSocket connection                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Application Structure

The repository contains two client applications:

```
cihhackthon/
├── android/                    # React Native (Expo) mobile application
│   ├── App.tsx                 # Entry point with navigation stack
│   ├── src/
│   │   ├── screens/            # Application screens
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # API integration services
│   │   └── utils/              # Shared utilities (colors, etc.)
│   └── screens/                # Legacy screen files (JavaScript)
│
├── frontend/                   # Next.js web application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── audio-upload/   # Audio file upload page
│   │   │   ├── cough-prediction/ # Medical risk prediction page
│   │   │   ├── health-assistant/ # AI assistant page
│   │   │   └── api/            # API route handlers (proxy)
│   │   ├── components/         # React components
│   │   │   └── ui/             # UI component library
│   │   └── lib/                # Utility functions
│   └── public/                 # Static assets
│
└── documentation.md            # This file
```

### Shared Logic (Conceptual)

> **Note**: The current implementation does not have a dedicated "Global" shared core. Instead, API integration logic is independently implemented in both applications. The following table shows the conceptual mapping of shared concerns:

| Concern | Android Location | Frontend Location |
|---------|------------------|-------------------|
| Audio Analysis API | `src/services/audioService.ts` | `app/audio-upload/page.tsx` |
| Medical Prediction API | `src/services/predictionService.ts` | `app/cough-prediction/page.tsx` |
| Health Assistant API | `src/services/assistantService.ts` | `app/health-assistant/page.tsx` |
| Color/Theme | `src/utils/colors.ts` | `globals.css`, TailwindCSS |
| Types/Interfaces | Inline in services | Inline in pages |

---

## Component Responsibilities

### Android Application

The Android app provides a native mobile experience optimized for TB screening workflows.

#### Core Responsibilities

1. **Audio Recording**: Capture cough samples using device microphone (Expo AV)
2. **Audio Analysis**: Send recordings to backend for ML-based TB risk classification
3. **Medical Data Collection**: Gather symptom information via forms
4. **Risk Assessment**: Display comprehensive risk reports
5. **Health Assistance**: AI-powered Q&A with hospital recommendations

#### Screen Flow

```
Dashboard
    ├── [Cough Audio Analysis]
    │       └── AudioAnalysisScreen
    │               └── ReportScreen
    │
    ├── [Medical Risk Prediction]
    │       └── MedicalPredictionScreen
    │               └── ReportScreen
    │
    └── [Health Assistant]
            └── AssistantScreen
```

#### Key Dependencies

- `expo` - Development framework
- `expo-av` - Audio recording
- `expo-location` - Geolocation services
- `@react-navigation/native` - Navigation stack

---

### Web Frontend

The Next.js frontend provides a responsive web interface with similar functionality.

#### Core Responsibilities

1. **Audio Upload**: File-based audio upload with drag-and-drop
2. **Risk Prediction**: Medical form with real-time API integration
3. **Health Assistant**: AI chatbot interface with location services
4. **Backend Diagnostics**: WebSocket connection testing utility

#### Page Structure

| Route | Description |
|-------|-------------|
| `/` | Home page with navigation cards |
| `/audio-upload` | Audio file upload and analysis |
| `/cough-prediction` | Medical questionnaire and prediction |
| `/health-assistant` | AI health assistant chat interface |

#### Key Dependencies

- `next` 16.x - React framework
- `react` 19.x - UI library
- `framer-motion` - Animations
- `tailwindcss` 4.x - Styling
- `class-variance-authority` - Component variants

---

## Data Flow

### 1. Audio Analysis Flow

```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────────┐
│  User Records   │      │  WebSocket       │      │  Backend ML Model  │
│  Cough Audio    │─────▶│  Connection      │─────▶│                    │
│                 │      │                  │      │  - Audio Processing│
└─────────────────┘      │  1. Metadata     │      │  - Spectrogram     │
                         │  2. Binary Data  │      │  - Classification  │
                         │  3. Complete Sig │      │                    │
                         └──────────────────┘      └─────────┬──────────┘
                                                             │
                                                             ▼
┌─────────────────┐                              ┌────────────────────┐
│  Display Result │◀─────────────────────────────│  Response:         │
│  - Risk Label   │                              │  {                 │
│  - Confidence   │                              │    label,          │
│  - Spectrogram  │                              │    confidence,     │
└─────────────────┘                              │    spectrogram_shape│
                                                 │  }                 │
                                                 └────────────────────┘
```

#### WebSocket Protocol (Audio)

1. **Connection**: `wss://[backend]/ws/audio`
2. **Metadata Message**:
   ```json
   {
     "type": "metadata",
     "filename": "cough.wav",
     "size": 123456,
     "mimeType": "audio/wav"
   }
   ```
3. **Binary Chunks**: Raw audio data in 64KB chunks
4. **Complete Signal**: `{ "type": "complete" }`
5. **Response**: Analysis result JSON

---

### 2. Medical Risk Prediction Flow

```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────────┐
│  User Input:    │      │  REST API        │      │  Risk Calculator   │
│  - Age          │─────▶│  POST /api/predict│─────▶│                    │
│  - Cough Days   │      │                  │      │  - Score Computation│
│  - Fever (bool) │      │  JSON Payload    │      │  - Level Assignment│
│  - Smoker (bool)│      └──────────────────┘      └─────────┬──────────┘
└─────────────────┘                                          │
                                                             ▼
┌─────────────────┐                              ┌────────────────────┐
│  Display Result │◀─────────────────────────────│  Response:         │
│  - Risk Level   │                              │  {                 │
│  - Risk Score   │                              │    risk_score,     │
└─────────────────┘                              │    risk_level      │
                                                 │  }                 │
                                                 └────────────────────┘
```

#### Request Format

```json
{
  "age": 35,
  "cough_days": 14,
  "fever": "true",
  "smoker": "false"
}
```

> **Note**: `fever` and `smoker` are sent as string values `"true"/"false"` per backend expectations.

---

### 3. Health Assistant Flow

```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────────┐
│  User Query:    │      │  REST API        │      │  AI Assistant      │
│  - Risk Level   │─────▶│  POST /assistant │─────▶│                    │
│  - Location     │      │                  │      │  - LLM Processing  │
│  - Question     │      │  JSON Payload    │      │  - Hospital Lookup │
└─────────────────┘      └──────────────────┘      └─────────┬──────────┘
                                                             │
                                                             ▼
┌─────────────────┐                              ┌────────────────────┐
│  Display:       │◀─────────────────────────────│  Response:         │
│  - AI Response  │                              │  {                 │
│  - Hospitals[]  │                              │    response,       │
│  - Recommendations│                            │    hospitals[],    │
└─────────────────┘                              │    recommendations[]│
                                                 │  }                 │
                                                 └────────────────────┘
```

---

## API Integration

### Backend Endpoints

All applications communicate with a single backend instance:

**Base URL**: `https://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev`

| Endpoint | Method | Protocol | Description |
|----------|--------|----------|-------------|
| `/ws/audio` | - | WebSocket | Audio file upload and analysis |
| `/api/predict` | POST | REST | Medical risk prediction |
| `/assistant` | POST | REST | AI health assistant |
| `/ws` | - | WebSocket | General connection (status check) |

### Type Definitions

#### Audio Analysis Result
```typescript
interface AudioAnalysisResult {
  confidence: number;        // 0.0 - 1.0
  label: string;             // "High Risk", "Low Risk", etc.
  spectrogram_shape: number[]; // e.g., [128, 131]
}
```

#### Medical Input
```typescript
interface MedicalInput {
  age: number;
  cough_days: number;
  fever: boolean;
  smoker: boolean;
}
```

#### Prediction Result
```typescript
interface PredictionResult {
  risk_score: number;  // 0.0 - 1.0
  risk_level: string;  // "LOW", "MEDIUM", "HIGH"
}
```

#### Assistant Types
```typescript
interface AssistantInput {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  user_location: string;
  user_query: string;
}

interface AssistantResponse {
  response?: string;
  hospitals?: Hospital[];
  recommendations?: string[];
}

interface Hospital {
  name: string;
  address?: string;
  distance?: string;
  phone?: string;
}
```

---

## Configuration & Environment

### Android Configuration

**File**: `android/app.json`
```json
{
  "expo": {
    "name": "coughlock",
    "slug": "coughlock",
    "version": "1.0.0",
    "platforms": ["android", "web"]
  }
}
```

**Backend URL**: Hardcoded in service files (`src/services/*.ts`)

### Frontend Configuration

**Environment File**: `frontend/.env.local`
```env
# (Currently not used - URLs are hardcoded)
```

**Next.js Config**: `frontend/next.config.ts`
```typescript
const nextConfig = {
  // Default configuration
};
```

### Changing Backend URLs

Currently, backend endpoints are hardcoded in multiple files. To change:

| Application | Files to Update |
|-------------|-----------------|
| Android | `src/services/audioService.ts`, `src/services/predictionService.ts`, `src/services/assistantService.ts` |
| Frontend | `src/app/audio-upload/page.tsx`, `src/app/cough-prediction/page.tsx`, `src/app/health-assistant/page.tsx`, `src/components/WebSocketClient.tsx`, `src/app/api/predict/route.ts` |

**Recommendation**: Centralize configuration using environment variables.

---

## Security Considerations

### Current Implementation

| Concern | Status | Notes |
|---------|--------|-------|
| **HTTPS/WSS** | ✅ Implemented | All backend communication uses secure protocols |
| **Authentication** | ❌ Not Implemented | No user authentication system |
| **Data Encryption** | ⚠️ Transport Only | Data encrypted in transit, not at rest on client |
| **Input Validation** | ⚠️ Basic | Frontend validation present, backend validation unknown |
| **CORS** | ⚠️ Configured | Backend allows cross-origin requests |

### Recommendations

1. **Add Authentication**: Implement user accounts for medical data protection
2. **Environment Variables**: Move sensitive URLs and keys to environment configuration
3. **Data Privacy**: Consider HIPAA/GDPR compliance for health data
4. **Rate Limiting**: Implement on API endpoints to prevent abuse
5. **Audit Logging**: Track access to health-related endpoints

---

## Extension & Maintenance Guide

### Adding New Features

#### 1. New Screen (Android)

```bash
# 1. Create screen file
touch android/src/screens/NewScreen.tsx

# 2. Add to navigation in App.tsx
# 3. Add navigation card in DashboardScreen.tsx
```

#### 2. New Page (Frontend)

```bash
# 1. Create page directory
mkdir frontend/src/app/new-feature

# 2. Create page file
touch frontend/src/app/new-feature/page.tsx

# 3. Add link in main page
```

#### 3. New API Endpoint Integration

```bash
# Android: Create service in android/src/services/
# Frontend: Create inline in page or add to lib/
```

### Creating a Shared Core (Recommended)

To reduce duplication and improve maintainability:

```bash
# 1. Create shared package
mkdir global
cd global
npm init -y

# 2. Add TypeScript
npm install typescript @types/node --save-dev

# 3. Structure
global/
├── src/
│   ├── types/          # Shared TypeScript interfaces
│   ├── api/            # API client functions
│   ├── constants/      # URLs, configuration
│   └── utils/          # Common utilities
├── package.json
└── tsconfig.json
```

### Running the Applications

#### Android
```bash
cd android
npm install
npx expo start          # Expo Go or web
npx expo start --android # Android emulator
```

#### Frontend
```bash
cd frontend
npm install
npm run dev             # Development server
npm run build           # Production build
npm start               # Production server
```

### Common Maintenance Tasks

| Task | Android | Frontend |
|------|---------|----------|
| Update dependencies | `npm update` | `npm update` |
| Type checking | `npx tsc --noEmit` | `npm run build` (includes type check) |
| Lint | (Not configured) | `npm run lint` |
| Build | `npx expo export` | `npm run build` |

### Troubleshooting

| Issue | Solution |
|-------|----------|
| WebSocket connection fails | Check if backend Codespace is running and port is PUBLIC |
| Audio recording fails (Android) | Ensure microphone permissions are granted |
| 429 Rate Limit errors | Wait and retry, or contact backend admin |
| CORS errors | Ensure backend allows your origin |

---

## Appendix

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01 | Initial implementation with audio analysis, risk prediction, and health assistant |

### Contributors

- Development Team: CIH Hackathon 2026

### License

(Include license information as applicable)

---

*This documentation was generated based on codebase analysis. For the most current information, always refer to the source code.*
