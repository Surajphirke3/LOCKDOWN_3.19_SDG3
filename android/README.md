# CoughLock - Android Application

> **Lock TB early. Act faster.**

A React Native (Expo) mobile application for TB screening through cough audio analysis and medical risk prediction.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [App Flow](#app-flow)
- [Screens](#screens)
- [Services & API Integration](#services--api-integration)
- [Components](#components)
- [Configuration](#configuration)
- [Build & Run](#build--run)
- [Dependencies](#dependencies)
- [Troubleshooting](#troubleshooting)

---

## Overview

The CoughLock Android app is the mobile-first client for the TB screening platform. It enables users to:

1. **Record cough audio** directly from their device
2. **Upload for AI analysis** to detect TB risk patterns
3. **Complete medical questionnaires** for symptom-based risk assessment
4. **Get AI-powered health guidance** with nearby hospital recommendations

The app is built with **React Native** using **Expo** for cross-platform compatibility, with an Android-first development approach.

### Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React Native with Expo SDK 51 |
| Language | TypeScript |
| Navigation | React Navigation (Native Stack) |
| Audio | Expo AV |
| Location | Expo Location |
| State | React Hooks (local state) |

---

## Features

- 📱 **Native cough recording** - 3-second audio samples with visual feedback
- 🎯 **ML-powered analysis** - Real-time cough classification via WebSocket
- 📊 **Medical risk prediction** - Symptom-based TB risk scoring
- 🏥 **Health Assistant** - AI chatbot with hospital recommendations
- 📍 **Location services** - Automatic location detection for nearby hospitals
- 📋 **Comprehensive reports** - Consolidated screening results

---

## Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      App.tsx (Entry Point)                       │
│                  NavigationContainer + Stack.Navigator            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐│
│  │  DashboardScreen │◀─▶│ AudioAnalysis   │◀─▶│  ReportScreen   ││
│  │                 │   │     Screen      │   │                 ││
│  │  - Navigation   │   │  - Recording    │   │  - Results      ││
│  │    Hub          │   │  - WebSocket    │   │  - Summary      ││
│  └─────────────────┘   └─────────────────┘   └─────────────────┘│
│          │                                            ▲          │
│          │             ┌─────────────────┐            │          │
│          └────────────▶│ MedicalPrediction│───────────┘          │
│                        │     Screen      │                       │
│                        │  - Form Input   │                       │
│                        │  - REST API     │                       │
│                        └─────────────────┘                       │
│          │                                                       │
│          └────────────▶┌─────────────────┐                       │
│                        │ AssistantScreen │                       │
│                        │  - AI Chat      │                       │
│                        │  - Hospitals    │                       │
│                        └─────────────────┘                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                        Services Layer                            │
│  ┌───────────────┐ ┌────────────────┐ ┌──────────────────┐      │
│  │ audioService  │ │predictionService│ │assistantService  │      │
│  │  (WebSocket)  │ │   (REST API)   │ │   (REST API)     │      │
│  └───────────────┘ └────────────────┘ └──────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Navigation Flow

```
Dashboard ─┬─▶ AudioAnalysis ──▶ Report
           │
           ├─▶ MedicalPrediction ──▶ Report
           │
           └─▶ Assistant
```

---

## Folder Structure

```
android/
├── App.tsx                          # Application entry point & navigation
├── api.js                           # Legacy API configuration
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript configuration
│
├── src/                             # Main source (TypeScript)
│   ├── screens/                     # Application screens
│   │   ├── DashboardScreen.tsx      # Home/navigation hub
│   │   ├── AudioAnalysisScreen.tsx  # Cough recording & upload
│   │   ├── MedicalPredictionScreen.tsx # Medical form & prediction
│   │   ├── ReportScreen.tsx         # Results display
│   │   └── AssistantScreen.tsx      # AI health assistant
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── CardOption.tsx           # Dashboard navigation cards
│   │   └── PrimaryButton.tsx        # Styled action button
│   │
│   ├── services/                    # API integration layer
│   │   ├── audioService.ts          # WebSocket audio upload
│   │   ├── predictionService.ts     # Medical prediction API
│   │   └── assistantService.ts      # Health assistant API
│   │
│   └── utils/                       # Shared utilities
│       └── colors.ts                # Application color palette
│
├── screens/                         # Legacy screens (JavaScript)
│   ├── HomeScreen.js
│   ├── AudioRecordScreen.js
│   ├── SpectrogramScreen.js
│   ├── MedicalFormScreen.js
│   ├── ResultScreen.js
│   └── ReportScreen.js
│
├── components/                      # Legacy components
│   └── SpectrogramPlaceholder.js
│
└── assets/                          # Static assets
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/screens/` | TypeScript screens (current implementation) |
| `src/services/` | Backend API integration |
| `src/components/` | Reusable UI components |
| `src/utils/` | Shared utilities and constants |
| `screens/` | Legacy JavaScript screens (deprecated) |

---

## App Flow

### Main User Journeys

#### Journey 1: Cough Audio Analysis

```
1. Dashboard
   └── Tap "Cough Audio Analysis"

2. AudioAnalysisScreen
   ├── Grant microphone permission
   ├── Tap "Record" (up to 3 times)
   ├── Each recording: 3 seconds
   ├── Tap "Submit & Analyze"
   ├── View: Risk Label, Confidence, Spectrogram
   └── Tap "Generate Report"

3. ReportScreen
   ├── View comprehensive results
   └── Tap "Back to Dashboard"
```

#### Journey 2: Medical Risk Prediction

```
1. Dashboard
   └── Tap "Medical Risk Prediction"

2. MedicalPredictionScreen
   ├── Enter Age
   ├── Enter Cough Duration (days)
   ├── Toggle Fever (Yes/No)
   ├── Toggle Smoker (Yes/No)
   ├── Tap "Submit"
   ├── View: Risk Level, Risk Score
   └── Tap "Generate Report"

3. ReportScreen
   ├── View medical inputs & risk assessment
   └── Tap "Back to Dashboard"
```

#### Journey 3: Health Assistant

```
1. Dashboard
   └── Tap "Health Assistant"

2. AssistantScreen
   ├── Select Risk Level (LOW/MEDIUM/HIGH)
   ├── Location auto-detected (or enter manually)
   ├── Type question or select suggested query
   ├── Tap "Ask Assistant"
   ├── View: AI Response, Recommendations, Nearby Hospitals
   └── Tap "Back to Dashboard"
```

---

## Screens

### DashboardScreen

**File**: `src/screens/DashboardScreen.tsx`

The main hub providing navigation to all features.

| Element | Description |
|---------|-------------|
| Title | "CoughLock" branding |
| Tagline | "Lock TB early. Act faster." |
| Card 1 | Navigate to Audio Analysis |
| Card 2 | Navigate to Medical Prediction |
| Card 3 | Navigate to Health Assistant |

### AudioAnalysisScreen

**File**: `src/screens/AudioAnalysisScreen.tsx`

Handles cough recording and ML analysis.

| Feature | Implementation |
|---------|----------------|
| Recording | Expo AV with platform-specific settings |
| Duration | 3 seconds per sample |
| Max Attempts | 3 recordings |
| Upload | WebSocket chunked transfer |
| Output | Risk label, confidence, spectrogram shape |

**Platform-Specific Recording**:
- **iOS**: WAV format (Linear PCM, 44.1kHz)
- **Android**: 3GP format (AMR_NB, 8kHz) - converted to WAV wrapper for backend

### MedicalPredictionScreen

**File**: `src/screens/MedicalPredictionScreen.tsx`

Form-based symptom collection for risk prediction.

| Field | Type | Validation |
|-------|------|------------|
| Age | Number | 0-120 |
| Cough Days | Number | ≥ 0 |
| Fever | Boolean | Toggle switch |
| Smoker | Boolean | Toggle switch |

### ReportScreen

**File**: `src/screens/ReportScreen.tsx`

Consolidated view of analysis results.

| Section | Content |
|---------|---------|
| Flow Type | "Cough Audio Analysis" or "Medical Risk Prediction" |
| Audio Results | Risk label, confidence %, spectrogram |
| Medical Inputs | Age, cough days, fever, smoker |
| Final Risk | Risk level (color-coded), risk score |
| Disclaimer | "This is a screening tool, not a medical diagnosis." |

### AssistantScreen

**File**: `src/screens/AssistantScreen.tsx`

AI-powered health guidance with location services.

| Feature | Description |
|---------|-------------|
| Risk Level Selector | LOW / MEDIUM / HIGH buttons |
| Location Input | Auto-detect + manual entry |
| Query Input | Multi-line text field |
| Suggested Queries | Quick-tap question buttons |
| Response Display | AI text, recommendations, hospital cards |

---

## Services & API Integration

### audioService.ts

**Purpose**: Handle cough audio upload and analysis via WebSocket.

**Endpoint**: `wss://[backend]/ws/audio`

```typescript
// Usage
import { analyzeAudio, AudioAnalysisResult } from '../services/audioService';

const result: AudioAnalysisResult = await analyzeAudio(audioUri);
// { confidence: 0.85, label: "High Risk", spectrogram_shape: [128, 131] }
```

**Key Features**:
- Automatic audio format detection
- WAV header injection for non-standard formats
- Chunked upload (64KB chunks)
- Progress logging
- Timeout handling (15s connect, 30s response)

### predictionService.ts

**Purpose**: Submit medical data for risk prediction via REST API.

**Endpoint**: `POST https://[backend]/api/predict`

```typescript
// Usage
import { predictRisk, MedicalInput, PredictionResult } from '../services/predictionService';

const input: MedicalInput = {
  age: 35,
  cough_days: 14,
  fever: true,
  smoker: false
};

const result: PredictionResult = await predictRisk(input);
// { risk_score: 0.72, risk_level: "HIGH" }
```

**Note**: `fever` and `smoker` are converted to string `"true"/"false"` per backend requirements.

### assistantService.ts

**Purpose**: Query AI health assistant for guidance and hospitals.

**Endpoint**: `POST https://[backend]/assistant`

```typescript
// Usage
import { queryAssistant, AssistantInput, AssistantResponse } from '../services/assistantService';

const input: AssistantInput = {
  risk_level: 'HIGH',
  user_location: 'Mumbai, Maharashtra',
  user_query: 'What should I do now?'
};

const response: AssistantResponse = await queryAssistant(input);
// { response: "...", hospitals: [...], recommendations: [...] }
```

---

## Components

### CardOption

**File**: `src/components/CardOption.tsx`

Navigation card for dashboard.

```typescript
interface CardOptionProps {
  title: string;      // Card title
  subtitle: string;   // Description text
  onPress: () => void; // Navigation handler
}
```

### PrimaryButton

**File**: `src/components/PrimaryButton.tsx`

Styled action button with variants.

```typescript
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}
```

### Color System

**File**: `src/utils/colors.ts`

| Color | Value | Usage |
|-------|-------|-------|
| `primary` | `#0f766e` | Headers, buttons, links |
| `secondary` | `#059669` | Secondary actions |
| `background` | `#f0fdfa` | Screen backgrounds |
| `error` | `#b91c1c` | High risk, errors |
| `warning` | `#d97706` | Medium risk |
| `success` | `#059669` | Low risk |

---

## Configuration

### Expo Configuration

**File**: `app.json`

```json
{
  "expo": {
    "name": "coughlock",
    "slug": "coughlock",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["android", "web"]
  }
}
```

### Backend URLs

Backend endpoints are currently hardcoded in service files:

| Service | URL |
|---------|-----|
| Audio WebSocket | `wss://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/ws/audio` |
| Prediction API | `https://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/api/predict` |
| Assistant API | `https://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/assistant` |

**To change**: Update URLs in `src/services/*.ts` files.

---

## Build & Run

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Android Studio (for emulator) or physical Android device
- Expo Go app (for quick testing)

### Development

```bash
# Navigate to android directory
cd android

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Options:
# - Scan QR code with Expo Go app
# - Press 'a' for Android emulator
# - Press 'w' for web browser
```

### Running on Android Device/Emulator

```bash
# With emulator running or device connected
npx expo start --android

# Or run directly
npx expo run:android
```

### Running on Web (Limited)

```bash
npx expo start --web
```

> **Note**: Audio recording may behave differently on web due to browser limitations.

### Production Build

```bash
# Create production build
npx expo export

# For standalone APK (requires EAS)
npx eas-cli build --platform android
```

---

## Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~51.0.0 | Development framework |
| `react` | 18.2.0 | UI library |
| `react-native` | 0.74.5 | Mobile framework |
| `@react-navigation/native` | ^6.1.9 | Navigation |
| `@react-navigation/native-stack` | ^6.9.17 | Stack navigator |

### Feature Dependencies

| Package | Purpose |
|---------|---------|
| `expo-av` | Audio recording |
| `expo-location` | Geolocation services |
| `expo-status-bar` | Status bar styling |
| `react-native-safe-area-context` | Safe area handling |
| `react-native-screens` | Native screen optimization |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | Type checking |
| `@types/react` | React types |
| `@babel/core` | JavaScript compilation |

---

## Troubleshooting

### Common Issues

#### 1. WebSocket Connection Fails

**Symptoms**: "WebSocket connection timeout" or "Connection error"

**Solutions**:
- Verify backend server is running
- Check if Codespaces port is set to PUBLIC
- Ensure device has internet connectivity
- Check for firewall restrictions

#### 2. Audio Recording Fails

**Symptoms**: "Microphone permission is required" or recording doesn't start

**Solutions**:
- Grant microphone permission in device settings
- Restart the app after granting permission
- On Android, ensure no other app is using microphone

#### 3. Location Permission Denied

**Symptoms**: "Location permission is required" in Assistant screen

**Solutions**:
- Grant location permission when prompted
- Enter location manually as fallback

#### 4. Metro Bundler Issues

**Symptoms**: Build errors, "Unable to resolve module"

**Solutions**:
```bash
# Clear cache and restart
npx expo start --clear

# Reset Metro cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules
npm install
```

#### 5. Android 3GP Audio Not Supported

**Symptoms**: Backend rejects audio file

**Explanation**: Android records in 3GP/AMR format, which the backend may not fully support.

**Current Workaround**: The app wraps 3GP data in a WAV header, but true transcoding isn't implemented.

**Long-term Solution**: Configure Expo to record in WAV format directly (requires native build).

---

## Contributing

1. Follow TypeScript best practices
2. Use existing color palette from `utils/colors.ts`
3. Add screens to `src/screens/` directory
4. Add services to `src/services/` directory
5. Update navigation in `App.tsx`
6. Test on both Android device and emulator

---

*For overall system documentation, see [/documentation.md](../documentation.md)*
