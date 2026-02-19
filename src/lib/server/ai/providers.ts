import { openai } from '@ai-sdk/openai';

// Text models
export const planModel = openai('gpt-4.1'); // Strategic planning (higher quality)
export const copyModel = openai('gpt-4.1-mini'); // Per-post copy (cost-effective)
export const analysisModel = openai('gpt-4.1-mini'); // Brand analysis (vision-capable)

// Image model
export const imageModel = openai.image('gpt-image-1');
