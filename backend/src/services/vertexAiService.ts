// ============================================================
// Vertex AI Service — Gemini Integration for Election Guide
// ============================================================

import { VertexAI } from '@google-cloud/vertexai';
import { getConfig } from '../config/environment';
import { ElectionGuideResponse, ElectionQueryInput } from '../types';
import logger from '../utils/logger';

let vertexAI: VertexAI | null = null;

function getVertexAI(): VertexAI {
  if (!vertexAI) {
    const config = getConfig();
    vertexAI = new VertexAI({
      project: config.GOOGLE_CLOUD_PROJECT,
      location: 'us-central1',
    });
  }
  return vertexAI;
}

/** System prompt that defines the AI's role and required output format */
const SYSTEM_PROMPT = `You are an expert AI Election Guide for India. Your role is to help Indian citizens understand the election process, voter registration, and their democratic rights.

IMPORTANT RULES:
1. Only answer questions related to Indian elections, voting, and democratic processes.
2. If the question is unrelated to elections, politely redirect the user.
3. Provide accurate, up-to-date information based on the Election Commission of India guidelines.
4. Be sensitive to the user's age, state, and voter registration status.
5. Always encourage democratic participation.

You MUST respond ONLY with a valid JSON object in this exact format:
{
  "personalizedAdvice": "A personalized 2-3 sentence overview based on the user's profile",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Detailed description",
      "requirements": ["requirement1", "requirement2"],
      "tips": ["tip1", "tip2"]
    }
  ],
  "importantDates": ["Date 1: Description", "Date 2: Description"],
  "helplineNumbers": ["1950 - Voter Helpline", "other numbers"],
  "additionalResources": ["https://eci.gov.in", "other links"]
}

Do NOT include any text outside the JSON. Do NOT use markdown code fences.`;

/**
 * Build a user prompt from their profile and question.
 */
function buildUserPrompt(input: ElectionQueryInput): string {
  return `User Profile:
- Age: ${input.age}
- State: ${input.state}
- Voter ID Status: ${input.voterIdStatus || 'unsure'}
- Preferred Language: ${input.language === 'hi' ? 'Hindi' : 'English'}

User's Question: ${input.question}

Please provide a personalized election guide response.`;
}

/**
 * Call Vertex AI (Gemini) to generate a personalized election guide.
 */
export async function generateElectionGuide(
  input: ElectionQueryInput
): Promise<ElectionGuideResponse> {
  const ai = getVertexAI();

  const model = ai.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const userPrompt = buildUserPrompt(input);

  logger.info('Sending request to Vertex AI', {
    state: input.state,
    age: input.age,
    questionLength: input.question.length,
  });

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty response from Vertex AI');
    }

    // Parse JSON response
    const parsed = JSON.parse(text) as ElectionGuideResponse;

    // Basic shape validation
    if (!parsed.personalizedAdvice || !Array.isArray(parsed.steps)) {
      throw new Error('Invalid response shape from Vertex AI');
    }

    logger.info('Vertex AI response received', {
      stepsCount: parsed.steps.length,
    });

    return parsed;
  } catch (error) {
    logger.error('Vertex AI generation failed', { error });
    throw new Error('Failed to generate election guide. Please try again.');
  }
}
