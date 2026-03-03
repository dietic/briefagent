import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { OPENAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';

const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
const google = createGoogleGenerativeAI({ apiKey: GOOGLE_GENERATIVE_AI_API_KEY });

// Text models
export const planModel = openai('gpt-4.1'); // Strategic planning (higher quality)
export const copyModel = openai('gpt-4.1-mini'); // Per-post copy (cost-effective)
export const analysisModel = openai('gpt-4.1-mini'); // Brand analysis (vision-capable)

// Image model
export const imageModel = google.image('imagen-4.0-generate-001');
