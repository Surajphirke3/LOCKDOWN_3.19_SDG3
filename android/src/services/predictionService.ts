/**
 * Prediction Service - REST API for medical risk prediction
 * Matches frontend: frontend/src/app/cough-prediction/page.tsx (line 34)
 */

// Exact URL from frontend cough-prediction page
const MEDICAL_PREDICT_URL = 'https://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/api/predict';

export interface MedicalInput {
  age: number;
  cough_days: number;
  fever: boolean;
  smoker: boolean;
}

export interface PredictionResult {
  risk_score: number;
  risk_level: string;
}

export const predictRisk = async (input: MedicalInput): Promise<PredictionResult> => {
  console.log('[PredictionService] Submitting medical data:', input);
  
  // Match frontend format EXACTLY (line 37 of cough-prediction/page.tsx)
  // fever and smoker are sent as strings 'true'/'false'
  const body = {
    age: input.age,
    cough_days: input.cough_days,
    fever: input.fever ? 'true' : 'false',
    smoker: input.smoker ? 'true' : 'false',
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