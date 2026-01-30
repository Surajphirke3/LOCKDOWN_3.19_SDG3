# CoughLock (Android)

**Lock TB early. Act faster.**

Expo React Native app — Android-first, frontend only. Backend APIs assumed to exist.

## Setup

```bash
cd android
npm install
npx expo start
```

**Without Android device/emulator:**
- Run `npx expo start` and scan the QR code with **Expo Go** on your phone (same Wi‑Fi), or
- Press **`w`** in the terminal to open in the browser (limited; recording may differ).

**With Android:** connect a device (USB debugging) or start an emulator, then run `npx expo start --android`.

## Backend

Set your API base URL in `api.js`:

```js
export const BASE_URL = 'https://your-backend.com/api';
```

- `POST /predict` — multipart audio upload → `{ confidence, label, spectrogram_shape }`
- `POST /medical` — JSON `{ age, cough_days, fever, smoker }` → `{ risk_score, risk_level }`

## Screens

1. **Home** — Name, tagline, "Record Cough"
2. **AudioRecord** — 3 attempts × 3s, then upload
3. **Spectrogram** — Confidence, label, spectrogram placeholder → "Continue to Medical Form"
4. **MedicalForm** — age, cough_days, fever, smoker → Submit
5. **Result** — risk_score, risk_level → "View Full Report"
6. **Report** — Full summary (no back)

## Structure

```
android/
├── App.js                 # Navigation stack
├── api.js                 # Endpoints
├── screens/
│   ├── HomeScreen.js
│   ├── AudioRecordScreen.js
│   ├── SpectrogramScreen.js
│   ├── MedicalFormScreen.js
│   ├── ResultScreen.js
│   └── ReportScreen.js
└── components/
    └── SpectrogramPlaceholder.js
```
