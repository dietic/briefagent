import type { BrandAnalysis } from '../schemas/brand-analysis';

export function buildImagePrompt(
	topic: string,
	keyMessage: string,
	brand: BrandAnalysis
): string {
	return `Create a professional social media image for LinkedIn.

Topic: ${topic}
Key Message: ${keyMessage}

Brand Style Guidelines:
- Primary colors: ${brand.primaryColors.join(', ')}
- Secondary colors: ${brand.secondaryColors.join(', ')}
- Visual style: ${brand.visualStyle}
- Mood: ${brand.mood}
- Design elements: ${brand.patterns}
- ${brand.imageStyleGuide}

Requirements:
- Professional, clean composition suitable for LinkedIn
- No text overlays (copy is separate)
- Brand-coherent color palette and visual style
- Eye-catching for social media feed scrolling
- Abstract or conceptual -- avoid stock photo aesthetics`;
}
