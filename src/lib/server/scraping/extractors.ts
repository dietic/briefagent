import type { CheerioAPI } from 'cheerio';

/**
 * Extract key phrases from meta keywords or h1/h2 headings (max 10).
 */
export function extractKeyPhrases($: CheerioAPI): string[] {
	const keywords = $('meta[name="keywords"]').attr('content');
	if (keywords) {
		return keywords
			.split(',')
			.map((k) => k.trim())
			.filter(Boolean)
			.slice(0, 10);
	}
	// Fallback: extract from h1, h2 headings
	const headings: string[] = [];
	$('h1, h2').each((_, el) => {
		const text = $(el).text().trim();
		if (text && text.length < 100) headings.push(text);
	});
	return headings.slice(0, 10);
}

/**
 * Extract brand colors from theme-color meta or inline CSS custom properties (best effort, max 5).
 */
export function extractColors($: CheerioAPI): string[] {
	const colors: string[] = [];

	// Check theme-color meta tag
	const themeColor = $('meta[name="theme-color"]').attr('content');
	if (themeColor) colors.push(themeColor);

	// Check inline styles for CSS custom properties that look like colors
	$('[style]').each((_, el) => {
		const style = $(el).attr('style') || '';
		const hexMatches = style.match(/#[0-9a-fA-F]{3,8}/g);
		if (hexMatches) {
			for (const hex of hexMatches) {
				if (!colors.includes(hex) && colors.length < 5) {
					colors.push(hex);
				}
			}
		}
	});

	return colors.slice(0, 5);
}
