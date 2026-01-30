/**
 * Assistant Service - AI-powered health assistant with nearby hospital recommendations
 * Endpoint: POST /assistant
 * Payload: { risk_level, user_location, user_query }
 */

const ASSISTANT_URL = 'https://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/assistant';

export interface AssistantInput {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  user_location: string;
  user_query: string;
}

export interface AssistantResponse {
  response?: string;
  hospitals?: Hospital[];
  recommendations?: string[];
  [key: string]: unknown;
}

export interface Hospital {
  name: string;
  address?: string;
  distance?: string;
  phone?: string;
  [key: string]: unknown;
}

export const queryAssistant = async (input: AssistantInput): Promise<AssistantResponse> => {
  console.log('[AssistantService] Sending query:', input);

  try {
    const res = await fetch(ASSISTANT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        risk_level: input.risk_level,
        user_location: input.user_location,
        user_query: input.user_query,
      }),
    });

    console.log('[AssistantService] Response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.log('[AssistantService] Error response:', errorText);
      throw new Error(`Request failed: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log('[AssistantService] Response data:', data);
    
    return data as AssistantResponse;
  } catch (error) {
    console.error('[AssistantService] Request failed:', error);
    throw error;
  }
};
