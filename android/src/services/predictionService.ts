/**
 * Prediction Service - REST API for medical risk prediction
 */

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
  const body = {
    age: input.age,
    cough_days: input.cough_days,
    fever: input.fever ? 'true' : 'false',
    smoker: input.smoker ? 'true' : 'false',
  };

  const res = await fetch(MEDICAL_PREDICT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('Submit failed: ' + res.status);
  }

  const data = await res.json();
  return {
    risk_score: data.risk_score ?? 0,
    risk_level: data.risk_level ?? 'UNKNOWN',
  };
};
