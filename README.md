# CoughLock — Cough-Based Tuberculosis Diagnostic System

> **Lock TB early. Act faster.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2051-blue?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Screenshots](#screenshots)
- [API Documentation](#api-documentation)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Folder Structure](#folder-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## About the Project

**CoughLock** is an open-source health-tech application that enables early detection and
risk assessment for Tuberculosis (TB) through AI-powered analysis of cough audio recordings
and a short medical symptom questionnaire.

### The Problem

TB remains one of the world's deadliest infectious diseases, claiming roughly **1.3 million
lives annually**. Early detection is critical for treatment success, yet traditional
diagnostic methods require clinical visits and specialised equipment — placing them out of
reach for millions of people in TB-endemic regions.

### The Solution

CoughLock closes this gap by:

- 🎤 **Analysing cough audio** in real time via WebSocket streaming for TB risk signals
- 📊 **Predicting TB risk** from a short symptom questionnaire (age, fever, cough duration, smoking history)
- 🏥 **Connecting users** with nearby healthcare facilities through an AI-powered health assistant

The system ships as both a **React Native mobile app** (Android) and a **Next.js web
application**, making it accessible on any device.

---

## Features

| Feature | Web | Mobile |
|---------|:---:|:------:|
| 🎤 Cough audio upload & real-time WebSocket analysis | ✅ | ✅ |
| 📈 Spectrogram visualisation of recorded audio | ✅ | ✅ |
| 🩺 Medical symptom form & TB risk questionnaire | ✅ | ✅ |
| 🔢 TB risk score (LOW / MEDIUM / HIGH) | ✅ | ✅ |
| 🤖 AI-powered health assistant | ✅ | ✅ |
| 🏥 Nearby hospital finder | ✅ | ✅ |
| 📄 Shareable diagnostic report | — | ✅ |
| 🌙 Dark mode support | ✅ | — |

---

## Tech Stack

### Web Frontend (`/frontend`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | React framework (App Router) |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [TailwindCSS](https://tailwindcss.com/) | 4 | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | 12 | UI animations |

### Android App (`/android`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| [React Native](https://reactnative.dev/) | 0.74 | Cross-platform mobile UI |
| [Expo](https://expo.dev/) | 51 | Development toolchain & build system |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/) | 14 | Audio recording |
| [React Navigation](https://reactnavigation.org/) | 6 | Screen navigation |
| [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/) | 17 | Device GPS for hospital finder |

### Backend (External)

| Technology | Purpose |
|-----------|---------|
| REST API | Medical risk prediction, health assistant |
| WebSocket (WSS) | Real-time cough audio streaming and analysis |

---

## Prerequisites

Make sure the following are installed on your machine:

- **Node.js** ≥ 18 and **npm** ≥ 9  
  [Download Node.js](https://nodejs.org/)
- **Git**  
  [Download Git](https://git-scm.com/)
- **For the mobile app only:**
  - [Expo CLI](https://docs.expo.dev/get-started/installation/):
    ```bash
    npm install -g expo-cli
    ```
  - The **Expo Go** app on your Android/iOS device, **or** an Android/iOS emulator

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Surajphirke3/cough-based-tuberclosis-diagnostic-system.git
cd cough-based-tuberclosis-diagnostic-system
```

### 2. Set up the Web Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the development server (http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Set up the Android App

```bash
cd android

# Install dependencies
npm install

# Start the Expo development server
npm start
```

Scan the QR code with the **Expo Go** app on your device, or press `a` to launch an
Android emulator.

---

## Usage Guide

### Web Frontend

After starting the dev server, navigate to `http://localhost:3000`. Three modules are
available from the home page:

#### 🎤 Audio Upload (`/audio-upload`)

Upload a `.wav` or `.m4a` cough recording. The app streams it to the backend over
WebSocket and returns:

- Predicted label (TB / Non-TB)
- Confidence score (0–1)
- Spectrogram shape metadata

#### 📊 Risk Prediction (`/cough-prediction`)

Fill in the medical questionnaire:

| Field | Type | Description |
|-------|------|-------------|
| Age | Number | Patient age in years (0–120) |
| Cough duration | Number | Days with persistent cough |
| Fever | Boolean | Presence of fever |
| Smoker | Boolean | Current or past smoking history |

The backend returns a **risk score** and **risk level** (LOW / MEDIUM / HIGH).

#### 🏥 Health Assistant (`/health-assistant`)

Enter your risk level, location, and a free-text query. The assistant responds with:

- Personalised health recommendations
- A list of nearby hospitals with contact details

### Android App

Launch the app via Expo Go or an emulator. The navigation flow is:

```
Home Screen
 ├── Record Audio  →  Spectrogram Screen  →  Result Screen
 ├── Medical Form  →  Result Screen
 └── Health Assistant  →  Report Screen
```

---

## Screenshots

> _Screenshots will be added in a future release. Contributors are welcome to submit them._

| Web — Home | Web — Risk Prediction | Mobile — Record Audio |
|-----------|----------------------|----------------------|
| _(placeholder)_ | _(placeholder)_ | _(placeholder)_ |

---

## API Documentation

Both the web and mobile clients communicate with an external backend. Key endpoints:

### WebSocket — Audio Analysis

```
WSS /ws/audio
```

**Flow:**

1. Client sends a JSON metadata message:
   ```json
   {
     "type": "metadata",
     "filename": "cough.wav",
     "size": 204800,
     "mimeType": "audio/wav"
   }
   ```
2. Client streams the audio file as binary `ArrayBuffer` chunks.
3. Server responds with an analysis result:
   ```json
   {
     "confidence": 0.87,
     "label": "TB",
     "spectrogram_shape": [128, 256, 1]
   }
   ```

### POST `/api/predict` — Medical Risk Prediction

**Request body:**
```json
{
  "age": 35,
  "cough_days": 14,
  "fever": "true",
  "smoker": "false"
}
```

**Response:**
```json
{
  "risk_score": 0.72,
  "risk_level": "HIGH"
}
```

### POST `/assistant` — Health Assistant

**Request body:**
```json
{
  "risk_level": "HIGH",
  "user_location": "Mumbai, India",
  "user_query": "What should I do next?"
}
```

**Response:**
```json
{
  "response": "Given your HIGH risk score, please visit a TB clinic immediately.",
  "hospitals": [
    {
      "name": "City TB Centre",
      "address": "123 Main Street, Mumbai",
      "distance": "2.4 km",
      "phone": "+91-22-12345678"
    }
  ],
  "recommendations": [
    "Get a sputum test done within 48 hours.",
    "Avoid close contact with others until tested."
  ]
}
```

---

## Configuration & Environment Variables

The backend base URL is currently hardcoded in the service files. To point the apps at
your own backend, update the following constants:

**Web Frontend** — API routes and page files under `frontend/src/app/`:
```typescript
const BACKEND_BASE_URL = "https://<your-backend-host>";
```

**Android App** — service files under `android/src/services/`:
```typescript
const BACKEND_BASE_URL = "https://<your-backend-host>";
```

> See `documentation.md` for the proposed `global/` shared-core package that will
> centralise these constants in a future release.

---

## Folder Structure

```
cough-based-tuberclosis-diagnostic-system/
│
├── android/                          # React Native (Expo) mobile app
│   ├── App.tsx                       # Entry point & navigation stack
│   ├── app.json                      # Expo configuration
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── screens/                  # TypeScript screens (primary)
│   │   ├── services/                 # API & WebSocket service layer
│   │   │   ├── audioService.ts
│   │   │   ├── predictionService.ts
│   │   │   └── assistantService.ts
│   │   └── utils/                    # Shared utilities (colours, formatters)
│   └── screens/                      # Legacy JavaScript screens
│
├── frontend/                         # Next.js web application
│   ├── src/
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── audio-upload/         # Audio analysis feature
│   │   │   ├── cough-prediction/     # Risk prediction feature
│   │   │   ├── health-assistant/     # AI health assistant feature
│   │   │   └── api/                  # Next.js API routes
│   │   ├── components/               # Reusable React components
│   │   └── lib/                      # Utility functions
│   └── public/                       # Static assets
│
├── documentation.md                  # Detailed technical documentation
├── README.md                         # This file
├── CONTRIBUTING.md                   # Contributor guide
├── CODE_OF_CONDUCT.md                # Code of Conduct
└── LICENSE                           # MIT License
```

---

## Roadmap

- [ ] Centralise shared types and API clients into a `global/` package
- [ ] Environment variable support (`.env` files) for backend URL configuration
- [ ] Expand audio analysis to cover additional respiratory conditions
- [ ] Add offline mode with on-device ML inference
- [ ] iOS app support via Expo
- [ ] Multi-language support (i18n)
- [ ] Admin dashboard for aggregated TB risk analytics
- [ ] CI/CD pipeline with automated tests

---

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before
submitting a pull request.

Quick steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a pull request

Please also review our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## Acknowledgements

- [World Health Organization — Tuberculosis](https://www.who.int/news-room/fact-sheets/detail/tuberculosis) for epidemiological context
- [Expo](https://expo.dev/) for making cross-platform mobile development accessible
- [Next.js](https://nextjs.org/) for the web framework
- [Framer Motion](https://www.framer.com/motion/) for smooth UI animations
- [Contributor Covenant](https://www.contributor-covenant.org/) for the Code of Conduct template
- All contributors and hackathon participants who helped build CoughLock
