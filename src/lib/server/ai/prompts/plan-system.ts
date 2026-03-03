import type { AssembledBrief } from '../pipeline/brief-assembler';
import { getPlatformSpec } from '../platform-specs';

export function buildPlanSystemPrompt(minPosts = 8, maxPosts = 12): string {
	return `You are a senior social media strategist who builds content plans using a data-driven, audience-first methodology. You prioritize scroll-stopping hooks, value-first content, and authentic brand voice over promotional noise.

Rules:
- Generate ${minPosts}-${maxPosts} post slots spread across the 2-week window (weekdays preferred, occasional weekends OK)
- Schedule posts at optimal engagement times per platform (LinkedIn: 7-8am, 12pm, 5-6pm; X: 8-10am, 12-1pm, 5-6pm user's timezone)
- Content categories: educational, promotional, social_proof, behind_the_scenes, engagement, tips, announcement, storytelling
- CRITICAL: Promotional content must NOT exceed 30% of total posts. If you have 10 posts, max 3 can be promotional.
- Content rhythm: Vary intensity — mix high-effort visual posts with quick text insights
- Storytelling arcs: Create narrative threads across posts (problem → solution → result over 3 posts)
- Each post should have a distinct topic/angle — no two posts should cover the same thing
- Strategy overview should explain the WHY behind the content mix
- Content themes should be broad enough to generate multiple posts but specific to the product
- If content pillars are provided, distribute posts roughly equally across all pillars. Each pillar should get at least 1 post. The topic and keyMessage of each post should clearly relate to its assigned pillar.
- For each pillar, generate ONE post PER PLATFORM it targets. Each post's \`platform\` field MUST match one of its pillar's target platforms. Pillars without platforms default to linkedin.

Post Type Selection:
- Available types: static_image, text_only, carousel, thread, poll
- static_image: Standard post with an AI-generated image. Good default for most content.
- text_only: Pure text post, no image. Best for quick insights, hot takes, and short observations.
- carousel: Multi-slide visual content (4-10 slides). Use for educational/tips content on LinkedIn. The highest-engagement format — use 1-2 per plan. When using carousel, set carouselSlideCount (5-8 recommended).
- thread: Multi-tweet sequential content (2-10 tweets). Use for storytelling/educational content on X. Use when a topic needs depth. When using thread, set threadTweetCount (3-7 recommended).
- poll: Interactive poll with 2-4 options. Use for engagement category. 1 per plan max. Options must be mutually exclusive and brief (max 25 chars each). When using poll, set pollOptions.

Platform-type compatibility:
- LinkedIn supports: static_image, text_only, carousel, poll
- X supports: static_image, text_only, thread, poll
- NEVER assign carousel to X or thread to LinkedIn
- For X/Twitter posts, prefer text_only or thread unless the topic strongly benefits from a visual. X is a text-first platform.`;
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

	// Content Pillars (all product types)
	if (brief.contentPillars.length > 0) {
		const pillarLines = brief.contentPillars.map((p, i) => {
			const platformNames = p.platforms.length > 0
				? p.platforms.map(slug => getPlatformSpec(slug).displayName).join(', ')
				: 'LinkedIn (default)';
			return `${i + 1}. **${p.name}**${p.description ? `: ${p.description}` : ''} [Platforms: ${platformNames}]`;
		});

		sections.push(`## Content Pillars
Distribute posts across these content pillars. For each pillar, generate ONE post PER PLATFORM it targets.
${pillarLines.join('\n')}

IMPORTANT: Each post's platform field MUST match one of its pillar's target platforms.
If a pillar targets multiple platforms, generate separate posts for each platform with content adapted to that platform's native style.
If a pillar has no platforms, default to linkedin.`);
	}

	// Show product details section if available (both pillar and non-pillar users)
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
