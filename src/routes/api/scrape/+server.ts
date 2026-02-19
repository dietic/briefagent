import { error, json } from '@sveltejs/kit';
import { scrapeUrl } from '$lib/server/scraping';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = await locals.getUser();
	if (!user) throw error(401, 'Not authenticated');

	const body = await request.json();
	const { url } = body;

	if (!url || typeof url !== 'string') {
		throw error(400, 'Missing url field');
	}

	// Validate URL format
	try {
		new URL(url);
	} catch {
		throw error(400, 'Invalid URL format');
	}

	const result = await scrapeUrl(url);
	return json(result);
};
