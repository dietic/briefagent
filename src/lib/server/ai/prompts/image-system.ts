import type { BrandAnalysis } from '../schemas/brand-analysis';
import { getPlatformSpec } from '../platform-specs';

/** Approximate a hex color to a human-readable name so Imagen doesn't render hex codes. */
function hexToColorName(hex: string): string {
	const h = hex.replace('#', '');
	if (h.length !== 6) return '';
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2 / 255;
	const s = max === min ? 0 : (max - min) / (l > 0.5 ? 510 - max - min : max + min);

	if (l < 0.12) return 'black';
	if (l > 0.9) return 'white';
	if (s < 0.1) return l > 0.5 ? 'light gray' : 'dark gray';

	// Determine hue
	let hue: number;
	if (max === r) hue = ((g - b) / (max - min)) * 60;
	else if (max === g) hue = (2 + (b - r) / (max - min)) * 60;
	else hue = (4 + (r - g) / (max - min)) * 60;
	if (hue < 0) hue += 360;

	const dark = l < 0.35;
	const light = l > 0.65;

	if (hue < 15) return dark ? 'dark red' : light ? 'salmon' : 'red';
	if (hue < 40) return dark ? 'brown' : light ? 'peach' : 'orange';
	if (hue < 65) return dark ? 'olive' : light ? 'light yellow' : 'yellow';
	if (hue < 150) return dark ? 'dark green' : light ? 'light green' : 'green';
	if (hue < 195) return dark ? 'dark teal' : light ? 'light cyan' : 'teal';
	if (hue < 250) return dark ? 'dark blue' : light ? 'light blue' : 'blue';
	if (hue < 290) return dark ? 'dark purple' : light ? 'lavender' : 'purple';
	if (hue < 330) return dark ? 'dark magenta' : light ? 'pink' : 'magenta';
	return dark ? 'dark red' : light ? 'salmon' : 'red';
}

export function buildImagePrompt(
	topic: string,
	keyMessage: string,
	brand: BrandAnalysis,
	platform: string | null = null
): string {
	const spec = getPlatformSpec(platform);
	const colors = [...brand.primaryColors, ...brand.secondaryColors]
		.map(hexToColorName)
		.filter(Boolean)
		.join(', ');

	return `A ${brand.visualStyle} illustration about "${topic}". The mood is ${brand.mood}. ${brand.imageStyleGuide} Use a color palette of ${colors}. ${brand.patterns}. Designed for ${spec.displayName}, ${spec.imageAspectRatio} aspect ratio. No text, no letters, no words, no watermarks.`;
}

export function buildCarouselSlideImagePrompt(
	slideNumber: number,
	totalSlides: number,
	headline: string,
	body: string,
	brand: BrandAnalysis
): string {
	const isCover = slideNumber === 1;
	const isCta = slideNumber === totalSlides;
	const colors = [...brand.primaryColors, ...brand.secondaryColors]
		.map(hexToColorName)
		.filter(Boolean)
		.join(', ');

	let mood = brand.mood;
	if (isCover) mood += ', bold and eye-catching';
	if (isCta) mood += ', conclusive and inspiring';

	return `Abstract dark background with subtle geometric shapes and gradients. ${brand.visualStyle} style, ${mood} mood. Color palette of ${colors}. ${brand.patterns}. Fills the entire canvas edge-to-edge. No text, no letters, no words, no borders, no frames, no margins, no white space around edges.`;
}

// ── SVG text overlay for carousel slides (composited by sharp) ──────

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function wrapText(text: string, maxChars: number): string[] {
	const words = text.split(/\s+/);
	const lines: string[] = [];
	let current = '';
	for (const word of words) {
		if (current && (current + ' ' + word).length > maxChars) {
			lines.push(current);
			current = word;
		} else {
			current = current ? current + ' ' + word : word;
		}
	}
	if (current) lines.push(current);
	return lines;
}

export function buildSlideTextSvg(headline: string, body: string, w: number, h: number): Buffer {
	const headlineSize = 58;
	const bodySize = 28;
	const headlineLineH = headlineSize * 1.25;
	const bodyLineH = bodySize * 1.5;
	const pad = Math.round(w * 0.1);
	const contentW = w - pad * 2;

	const headlineLines = wrapText(headline, Math.floor(contentW / (headlineSize * 0.52)));
	const bodyLines = wrapText(body, Math.floor(contentW / (bodySize * 0.48)));

	const totalHeadline = headlineLines.length * headlineLineH;
	const separatorGap = 50;
	const totalBody = bodyLines.length * bodyLineH;
	const totalH = totalHeadline + separatorGap + totalBody;

	const startY = (h - totalH) / 2 + headlineSize;
	const sepY = startY + totalHeadline + separatorGap / 2 - 5;
	const bodyStartY = startY + totalHeadline + separatorGap;
	const cx = w / 2;

	const headlineTspans = headlineLines
		.map((line, i) => `<tspan x="${cx}" y="${startY + i * headlineLineH}">${escapeXml(line)}</tspan>`)
		.join('');
	const bodyTspans = bodyLines
		.map((line, i) => `<tspan x="${cx}" y="${bodyStartY + i * bodyLineH}">${escapeXml(line)}</tspan>`)
		.join('');

	return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="${w}" height="${h}" fill="black" fill-opacity="0.35"/>
<text text-anchor="middle" fill="white" font-size="${headlineSize}" font-weight="700" font-family="Arial,Helvetica,sans-serif">${headlineTspans}</text>
<line x1="${cx - 30}" y1="${sepY}" x2="${cx + 30}" y2="${sepY}" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
<text text-anchor="middle" fill="rgba(255,255,255,0.88)" font-size="${bodySize}" font-family="Arial,Helvetica,sans-serif">${bodyTspans}</text>
</svg>`);
}
