# CoughLock - Global Shared Core

> **Note**: This folder is a proposed structure for shared code that is currently duplicated across the Android and Frontend applications.

## Table of Contents

- [Overview](#overview)
- [Current State](#current-state)
- [Proposed Structure](#proposed-structure)
- [What Should Be Shared](#what-should-be-shared)
- [Implementation Guide](#implementation-guide)
- [Guidelines for Adding Shared Features](#guidelines-for-adding-shared-features)

---

## Overview

### Purpose

The Global shared core is intended to centralize common code that is used by both the Android (React Native) and Frontend (Next.js) applications. This reduces duplication, ensures consistency, and simplifies maintenance.

### Current State

**⚠️ As of the current codebase, there is no centralized shared core.** 

The following logic is **duplicated** across both applications:

| Concern | Android Location | Frontend Location |
|---------|------------------|-------------------|
| API Endpoints | `src/services/*.ts` | Page files (`*.tsx`) |
| Type Definitions | Inline in services | Inline in pages |
| Backend URLs | Hardcoded in services | Hardcoded in pages |
| Data Transformation | Per-service | Per-page |

This duplication leads to:
- **Maintenance burden**: Changes must be made in multiple places
- **Inconsistency risk**: Divergent implementations
- **Onboarding complexity**: Developers must learn two codebases

---

## Proposed Structure

```
global/
├── README.md                    # This file
├── package.json                 # NPM package configuration
├── tsconfig.json                # TypeScript configuration
│
├── src/
│   ├── index.ts                 # Main export file
│   │
│   ├── types/                   # Shared TypeScript interfaces
│   │   ├── index.ts             # Type exports
│   │   ├── audio.ts             # Audio analysis types
│   │   ├── prediction.ts        # Risk prediction types
│   │   └── assistant.ts         # Health assistant types
│   │
│   ├── api/                     # API client functions
│   │   ├── index.ts             # API exports
│   │   ├── audioClient.ts       # Audio analysis API
│   │   ├── predictionClient.ts  # Prediction API
│   │   └── assistantClient.ts   # Assistant API
│   │
│   ├── constants/               # Shared constants
│   │   ├── index.ts             # Constants exports
│   │   ├── endpoints.ts         # Backend URLs
│   │   └── config.ts            # Application configuration
│   │
│   └── utils/                   # Utility functions
│       ├── index.ts             # Utility exports
│       ├── formatters.ts        # Data formatting
│       └── validators.ts        # Input validation
│
└── dist/                        # Compiled output (generated)
```

---

## What Should Be Shared

### 1. Type Definitions

All interfaces for API requests and responses should be defined once:

```typescript
// types/audio.ts
export interface AudioAnalysisResult {
  confidence: number;
  label: string;
  spectrogram_shape: number[];
}

export interface AudioMetadata {
  type: 'metadata';
  filename: string;
  size: number;
  mimeType: string;
}
```

```typescript
// types/prediction.ts
export interface MedicalInput {
  age: number;
  cough_days: number;
  fever: boolean;
  smoker: boolean;
}

export interface PredictionResult {
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

```typescript
// types/assistant.ts
export interface AssistantInput {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  user_location: string;
  user_query: string;
}

export interface Hospital {
  name: string;
  address?: string;
  distance?: string;
  phone?: string;
}

export interface AssistantResponse {
  response?: string;
  hospitals?: Hospital[];
  recommendations?: string[];
}
```

### 2. API Endpoints

Centralized endpoint configuration:

```typescript
// constants/endpoints.ts
export const BACKEND_BASE_URL = 'https://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev';

export const ENDPOINTS = {
  AUDIO_WS: `wss://${new URL(BACKEND_BASE_URL).host}/ws/audio`,
  PREDICTION: `${BACKEND_BASE_URL}/api/predict`,
  ASSISTANT: `${BACKEND_BASE_URL}/assistant`,
  WEBSOCKET: `wss://${new URL(BACKEND_BASE_URL).host}/ws`,
} as const;
```

### 3. API Client Functions

Platform-agnostic API interaction layer:

```typescript
// api/predictionClient.ts
import { ENDPOINTS } from '../constants/endpoints';
import { MedicalInput, PredictionResult } from '../types/prediction';

export async function predictRisk(input: MedicalInput): Promise<PredictionResult> {
  const response = await fetch(ENDPOINTS.PREDICTION, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      age: input.age,
      cough_days: input.cough_days,
      fever: input.fever ? 'true' : 'false',
      smoker: input.smoker ? 'true' : 'false',
    }),
  });

  if (!response.ok) {
    throw new Error(`Prediction failed: ${response.status}`);
  }

  return response.json();
}
```

### 4. Validation Functions

Shared input validation:

```typescript
// utils/validators.ts
export function validateAge(age: number): boolean {
  return Number.isInteger(age) && age >= 0 && age <= 120;
}

export function validateCoughDays(days: number): boolean {
  return Number.isInteger(days) && days >= 0;
}

export function validateMedicalInput(input: MedicalInput): string[] {
  const errors: string[] = [];
  
  if (!validateAge(input.age)) {
    errors.push('Age must be between 0 and 120');
  }
  
  if (!validateCoughDays(input.cough_days)) {
    errors.push('Cough days must be 0 or more');
  }
  
  return errors;
}
```

### 5. Formatting Utilities

Consistent data formatting:

```typescript
// utils/formatters.ts
export function formatRiskPercentage(score: number): string {
  return `${(score * 100).toFixed(0)}%`;
}

export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

export function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    LOW: '#059669',    // Green
    MEDIUM: '#d97706', // Orange
    HIGH: '#b91c1c',   // Red
  };
  return colors[level.toUpperCase()] || '#64748b';
}
```

---

## Implementation Guide

### Step 1: Initialize the Package

```bash
# Create the directory
mkdir global
cd global

# Initialize npm package
npm init -y

# Add TypeScript
npm install typescript --save-dev

# Initialize TypeScript
npx tsc --init
```

### Step 2: Configure TypeScript

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Configure Package

**package.json**:
```json
{
  "name": "@coughlock/global",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### Step 4: Create Exports

**src/index.ts**:
```typescript
// Types
export * from './types';

// API Clients
export * from './api';

// Constants
export * from './constants';

// Utilities
export * from './utils';
```

### Step 5: Link to Applications

#### For Android (React Native)

```bash
# From android directory
npm link ../global
# Or add to package.json:
# "dependencies": {
#   "@coughlock/global": "file:../global"
# }
```

#### For Frontend (Next.js)

```bash
# From frontend directory
npm link ../global
# Or add to package.json:
# "dependencies": {
#   "@coughlock/global": "file:../global"
# }
```

### Step 6: Update Applications

**Before** (duplicated):
```typescript
// android/src/services/predictionService.ts
const MEDICAL_PREDICT_URL = 'https://sturdy-yodel...';

export interface MedicalInput {
  age: number;
  // ...
}
```

**After** (shared):
```typescript
// android/src/services/predictionService.ts
import { ENDPOINTS, MedicalInput, predictRisk } from '@coughlock/global';

// Use shared function directly
export { predictRisk };
```

---

## Guidelines for Adding Shared Features

### When to Add to Global

✅ **Add to Global when**:
- Logic is identical between Android and Frontend
- Types/interfaces are used by both applications
- Constants are shared (URLs, limits, messages)
- Utility functions have no platform dependencies

❌ **Keep platform-specific when**:
- Logic uses native modules (e.g., Expo AV)
- UI components (React Native vs React)
- Platform-specific styling
- Navigation logic

### Process for Adding Shared Code

1. **Identify Duplication**
   - Review Android and Frontend implementations
   - Confirm logic is truly identical

2. **Create in Global**
   ```bash
   # Add new file
   touch global/src/[category]/newFeature.ts
   
   # Export from index
   echo "export * from './newFeature';" >> global/src/[category]/index.ts
   ```

3. **Rebuild**
   ```bash
   cd global
   npm run build
   ```

4. **Update Applications**
   ```bash
   # Reinstall in each app
   cd ../android && npm install
   cd ../frontend && npm install
   ```

5. **Replace Duplicated Code**
   - Import from `@coughlock/global`
   - Remove local implementation
   - Test thoroughly

### Versioning Strategy

- Use semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Breaking API changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

### Testing Shared Code

```bash
# Add test framework
npm install jest @types/jest ts-jest --save-dev

# Create test files
touch global/src/__tests__/validators.test.ts
```

Example test:
```typescript
// src/__tests__/validators.test.ts
import { validateAge, validateCoughDays } from '../utils/validators';

describe('validateAge', () => {
  it('should accept valid ages', () => {
    expect(validateAge(35)).toBe(true);
    expect(validateAge(0)).toBe(true);
    expect(validateAge(120)).toBe(true);
  });

  it('should reject invalid ages', () => {
    expect(validateAge(-1)).toBe(false);
    expect(validateAge(121)).toBe(false);
  });
});
```

---

## Migration Checklist

When migrating from duplicated code to shared core:

- [ ] Create `global/` directory structure
- [ ] Move type definitions to `global/src/types/`
- [ ] Move constants to `global/src/constants/`
- [ ] Create shared API clients in `global/src/api/`
- [ ] Add utility functions to `global/src/utils/`
- [ ] Configure TypeScript and build
- [ ] Link to Android application
- [ ] Link to Frontend application
- [ ] Update Android imports
- [ ] Update Frontend imports
- [ ] Remove duplicated code
- [ ] Test both applications
- [ ] Update documentation

---

## Benefits of Shared Core

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | Types and logic defined once |
| **Consistency** | Guaranteed identical behavior |
| **Easier Maintenance** | Fix bugs in one place |
| **Better Testing** | Test shared logic independently |
| **Faster Development** | Reuse existing code |
| **Type Safety** | Shared types catch mismatches |

---

*For overall system documentation, see [/documentation.md](../documentation.md)*
