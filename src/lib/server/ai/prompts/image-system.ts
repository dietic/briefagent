import type { BrandAnalysis } from '../schemas/brand-analysis';
import { getPlatformSpec } from '../platform-specs';

export function buildImagePrompt(
	topic: string,
	keyMessage: string,
	brand: BrandAnalysis,
	platform: string | null = null
): string {
	const spec = getPlatformSpec(platform);

	return `Create a professional social media image for ${spec.displayName}.

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
- Professional, clean composition suitable for ${spec.displayName} (${spec.imageAspectRatio} aspect ratio)
- No text overlays (copy is separate)
- Brand-coherent color palette and visual style
- Eye-catching for social media feed scrolling
- Abstract or conceptual -- avoid stock photo aesthetics`;
}
