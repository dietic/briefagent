// Platform specifications — single source of truth for all platform-specific behaviour.
// Used by prompt assembly, content generation, UI, and validation layers.

export interface PlatformSpec {
	slug: string;
	displayName: string;
	charLimit: number;
	charRecommended: { min: number; max: number };
	imageSize: { width: number; height: number };
	imageAspectRatio: string;
	hashtagRules: string;
	toneGuidelines: string;
	active: boolean;
}

export const PLATFORM_SPECS: Record<string, PlatformSpec> = {
	linkedin: {
		slug: 'linkedin',
		displayName: 'LinkedIn',
		charLimit: 3000,
		charRecommended: { min: 1200, max: 1800 },
		imageSize: { width: 1200, height: 1200 },
		imageAspectRatio: '1:1',
		hashtagRules: '3-5 hashtags: mix of 2 popular/broad + 2-3 niche/specific',
		toneGuidelines: 'Professional but human tone',
		active: true
	},
	x: {
		slug: 'x',
		displayName: 'X (Twitter)',
		charLimit: 280,
		charRecommended: { min: 200, max: 280 },
		imageSize: { width: 1200, height: 675 },
		imageAspectRatio: '16:9',
		hashtagRules: '1-2 hashtags maximum, integrated naturally into text',
		toneGuidelines: 'Concise, punchy, opinionated tone',
		active: true
	},
	instagram: {
		slug: 'instagram',
		displayName: 'Instagram',
		charLimit: 2200,
		charRecommended: { min: 150, max: 500 },
		imageSize: { width: 1080, height: 1350 },
		imageAspectRatio: '4:5',
		hashtagRules: '',
		toneGuidelines: '',
		active: false
	},
	youtube: {
		slug: 'youtube',
		displayName: 'YouTube',
		charLimit: 5000,
		charRecommended: { min: 200, max: 500 },
		imageSize: { width: 1280, height: 720 },
		imageAspectRatio: '16:9',
		hashtagRules: '',
		toneGuidelines: '',
		active: false
	},
	tiktok: {
		slug: 'tiktok',
		displayName: 'TikTok',
		charLimit: 2200,
		charRecommended: { min: 50, max: 150 },
		imageSize: { width: 1080, height: 1920 },
		imageAspectRatio: '9:16',
		hashtagRules: '',
		toneGuidelines: '',
		active: false
	}
};

/** Active platforms available for user selection */
export const ACTIVE_PLATFORMS = Object.values(PLATFORM_SPECS).filter((p) => p.active);

/** Platforms displayed as "Coming Soon" (disabled in UI) */
export const COMING_SOON_PLATFORMS = Object.values(PLATFORM_SPECS).filter((p) => !p.active);

/** Get platform spec by slug, falling back to LinkedIn as the default */
export function getPlatformSpec(slug: string | null): PlatformSpec {
	if (slug && slug in PLATFORM_SPECS) {
		return PLATFORM_SPECS[slug];
	}
	return PLATFORM_SPECS.linkedin;
}
