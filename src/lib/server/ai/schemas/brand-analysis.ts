import { z } from 'zod';

export const brandAnalysisSchema = z.object({
	primaryColors: z.array(z.string()).describe('Hex color codes of dominant brand colors'),
	secondaryColors: z.array(z.string()).describe('Hex color codes of accent/secondary colors'),
	visualStyle: z
		.string()
		.describe('Overall visual style: minimalist, bold, playful, corporate, etc.'),
	typography: z.string().describe('Typography style: serif, sans-serif, handwritten, etc.'),
	mood: z
		.string()
		.describe('Emotional mood: professional, friendly, energetic, luxurious, etc.'),
	patterns: z
		.string()
		.describe('Recurring visual patterns, textures, or design elements'),
	imageStyleGuide: z
		.string()
		.describe('Concise style guide for generating brand-coherent images')
});

export type BrandAnalysis = z.infer<typeof brandAnalysisSchema>;
