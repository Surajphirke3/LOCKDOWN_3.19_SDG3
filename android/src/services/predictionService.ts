/**
 * Prediction Service - REST API for medical risk prediction
 * Matches frontend: frontend/src/app/cough-prediction/page.tsx (line 34)
 */

// Exact URL from frontend cough-prediction page
const MEDICAL_PREDICT_URL = 'https://reimagined-space-sniffle-pjvp5g7rpqjjhr9ww-8000.app.github.dev/api/predict';

export interface MedicalInput {
  Age: number;           // Age in years (e.g., 45)
  Gender: string;        // "Male" or "Female"
  Cough: number;         // Number of days with cough
  Fever: string;         // "Yes" or "No"
  WeightLoss: number;    // Weight loss in kg
  NightSweats: string;   // "Yes" or "No"
  ChestPain: string;     // "Yes" or "No"
  Hemoptysis: string;    // "Yes" or "No" (coughing blood)
  Breathlessness: string; // "Mild", "Moderate", or "Severe"
  ContactHistory: string; // "Yes" or "No" (contact with TB patient)
  TravelHistory: string;  // "Yes" or "No"
  HIVStatus: string;     // "Positive" or "Negative"
  PreviousTB: string;    // "Yes" or "No"
  ChestXRay: string;     // "Normal" or "Abnormal"
  SputumTest: string;    // "Positive" or "Negative"
}

export interface PredictionResult {
  risk_score: number;
  risk_level: string;
}

export const predictRisk = async (input: MedicalInput): Promise<PredictionResult> => {
  console.log('[PredictionService] Submitting medical data:', input);
  
  // Since interface is now PascalCase, pass input directly
  const body = {
    Age: input.Age,
    Gender: input.Gender,
    Cough: input.Cough,
    Fever: input.Fever,
    WeightLoss: Math.round(input.WeightLoss),
    NightSweats: input.NightSweats,
    ChestPain: input.ChestPain,
    Hemoptysis: input.Hemoptysis,
    Breathlessness: input.Breathlessness,
    ContactHistory: input.ContactHistory,
    TravelHistory: input.TravelHistory,
    HIVStatus: input.HIVStatus,
    PreviousTB: input.PreviousTB,
    ChestXRay: input.ChestXRay,
    SputumTest: input.SputumTest,
  };

  console.log('[PredictionService] Request body:', JSON.stringify(body));
  console.log('[PredictionService] Sending to:', MEDICAL_PREDICT_URL);

  try {
    const res = await fetch(MEDICAL_PREDICT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('[PredictionService] Response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.log('[PredictionService] Error response:', errorText);
      throw new Error(`Submit failed: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log('[PredictionService] Response data:', data);
    
    return {
      risk_score: data.risk_score ?? 0,
      risk_level: data.risk_level ?? 'UNKNOWN',
    };
  } catch (error) {
    console.error('[PredictionService] Request failed:', error);
    throw error;
  }
};