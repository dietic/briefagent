import type { AssembledBrief } from '../pipeline/brief-assembler';

export function buildPlanSystemPrompt(): string {
	return `You are an expert LinkedIn content strategist. You create data-driven 2-week content plans.

Rules:
- Generate 8-12 post slots spread across the 2-week window (weekdays preferred, occasional weekends OK)
- Schedule posts at optimal LinkedIn engagement times (7-8am, 12pm, 5-6pm user's timezone)
- Content categories: educational, promotional, social_proof, behind_the_scenes, engagement, tips, announcement, storytelling
- CRITICAL: Promotional content must NOT exceed 30% of total posts. If you have 10 posts, max 3 can be promotional.
- Mix post types: mostly static_image, some text_only
- Each post should have a distinct topic/angle -- no two posts should cover the same thing
- Strategy overview should explain the WHY behind the content mix
- Content themes should be broad enough to generate multiple posts but specific to the product`;
}

export function buildPlanUserPrompt(
	brief: AssembledBrief,
	previousSummaries: string[],
	startDate: string
): string {
	const sections: string[] = [];

	// Product info
	sections.push(`## Product
- Name: ${brief.product.name}
- Description: ${brief.product.description ?? 'Not provided'}
- Website: ${brief.product.websiteUrl ?? 'Not provided'}`);

	// Key features & differentiator
	if (brief.brief.keyFeatures?.length) {
		sections.push(`## Key Features
${brief.brief.keyFeatures.map((f) => `- ${f}`).join('\n')}`);
	}
	if (brief.brief.differentiator) {
		sections.push(`## Differentiator
${brief.brief.differentiator}`);
	}
	if (brief.brief.problemSolved) {
		sections.push(`## Problem Solved
${brief.brief.problemSolved}`);
	}

	// Target audience
	const audienceParts: string[] = [];
	if (brief.brief.idealCustomer) audienceParts.push(`- Ideal customer: ${brief.brief.idealCustomer}`);
	if (brief.brief.industry) audienceParts.push(`- Industry: ${brief.brief.industry}`);
	if (brief.brief.ageRange) audienceParts.push(`- Age range: ${brief.brief.ageRange}`);
	if (brief.brief.painPoints?.length) {
		audienceParts.push(`- Pain points: ${brief.brief.painPoints.join(', ')}`);
	}
	if (audienceParts.length) {
		sections.push(`## Target Audience\n${audienceParts.join('\n')}`);
	}

	// Brand voice
	const voiceParts: string[] = [];
	if (brief.brief.personalityTraits?.length) {
		voiceParts.push(`- Personality: ${brief.brief.personalityTraits.join(', ')}`);
	}
	if (brief.brief.wordsToUse?.length) {
		voiceParts.push(`- Words to use: ${brief.brief.wordsToUse.join(', ')}`);
	}
	if (brief.brief.wordsToAvoid?.length) {
		voiceParts.push(`- Words to avoid: ${brief.brief.wordsToAvoid.join(', ')}`);
	}
	if (voiceParts.length) {
		sections.push(`## Brand Voice\n${voiceParts.join('\n')}`);
	}

	// Goals
	const goalParts: string[] = [];
	if (brief.brief.mainGoal) goalParts.push(`- Main goal: ${brief.brief.mainGoal}`);
	if (brief.brief.postingFrequency) goalParts.push(`- Posting frequency: ${brief.brief.postingFrequency}`);
	if (goalParts.length) {
		sections.push(`## Goals\n${goalParts.join('\n')}`);
	}

	// Available assets
	if (brief.assets.length > 0) {
		const assetLines = brief.assets.map(
			(a) => `- ID: ${a.id} | Tag: ${a.tag ?? 'untagged'} | Description: ${a.description ?? 'none'}`
		);
		sections.push(`## Available Assets (use IDs in assetReferences)\n${assetLines.join('\n')}`);
	}

	// Scraped website data
	if (brief.product.scrapedData) {
		const scraped = brief.product.scrapedData;
		const summary = typeof scraped === 'object' ? JSON.stringify(scraped).slice(0, 500) : String(scraped);
		sections.push(`## Website Data Summary\n${summary}`);
	}

	// Previous plan summaries
	if (previousSummaries.length > 0) {
		sections.push(`## Previous Plans -- AVOID repeating these themes:\n${previousSummaries.map((s, i) => `Plan ${i + 1}: ${s}`).join('\n')}`);
	}

	// Start date
	sections.push(`## Schedule Window
Start date: ${startDate}
End date: 2 weeks from start date
Generate post slots within this window.`);

	return sections.join('\n\n');
}
