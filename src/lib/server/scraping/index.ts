import * as cheerio from 'cheerio';
import { extractKeyPhrases, extractColors } from './extractors';

export interface ScrapedData {
	title?: string;
	description?: string;
	ogImage?: string;
	themeColor?: string;
	favicon?: string;
	keyPhrases: string[];
	colors: string[];
	success: boolean;
	error?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10_000);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; BriefAgentBot/1.0)',
				Accept: 'text/html'
			}
		});

		if (!response.ok) {
			return { keyPhrases: [], colors: [], success: false, error: `HTTP ${response.status}` };
		}

		const html = await response.text();
		const $ = cheerio.load(html);

		return {
			title:
				$('meta[property="og:title"]').attr('content') || $('title').text() || undefined,
			description:
				$('meta[property="og:description"]').attr('content') ||
				$('meta[name="description"]').attr('content') ||
				undefined,
			ogImage: $('meta[property="og:image"]').attr('content') || undefined,
			themeColor: $('meta[name="theme-color"]').attr('content') || undefined,
			favicon:
				$('link[rel="icon"]').attr('href') ||
				$('link[rel="shortcut icon"]').attr('href') ||
				undefined,
			keyPhrases: extractKeyPhrases($),
			colors: extractColors($),
			success: true
		};
	} catch (err) {
		return {
			keyPhrases: [],
			colors: [],
			success: false,
			error: err instanceof Error ? err.message : 'Unknown error'
		};
	} finally {
		clearTimeout(timeout);
	}
}
