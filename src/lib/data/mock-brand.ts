export interface BrandProfile {
	name: string;
	tagline: string;
	healthScore: number;
	logoInitials: string;
	industry: string;
	audience: string;
	tone: string[];
}

export interface Campaign {
	id: string;
	name: string;
	status: 'active' | 'paused' | 'completed' | 'draft';
	progress: number;
	postsTotal: number;
	postsPublished: number;
	startDate: string;
	endDate: string;
	platform: string;
}

export interface BrandVoiceTrait {
	trait: string;
	score: number;
	description: string;
}

export interface ContentMixItem {
	label: string;
	percentage: number;
	color: string;
}

export const brandProfile: BrandProfile = {
	name: 'BriefAgent',
	tagline: 'AI-powered marketing agency',
	healthScore: 87,
	logoInitials: 'BA',
	industry: 'SaaS / Marketing Tech',
	audience: 'Startup founders & solopreneurs',
	tone: ['Professional', 'Approachable', 'Data-driven']
};

export const campaigns: Campaign[] = [
	{
		id: 'camp-01',
		name: 'Product Launch 2024',
		status: 'active',
		progress: 75,
		postsTotal: 16,
		postsPublished: 12,
		startDate: 'Jan 15',
		endDate: 'Mar 30',
		platform: 'LinkedIn'
	},
	{
		id: 'camp-02',
		name: 'Thought Leadership Series',
		status: 'active',
		progress: 40,
		postsTotal: 15,
		postsPublished: 6,
		startDate: 'Feb 01',
		endDate: 'Apr 15',
		platform: 'LinkedIn'
	},
	{
		id: 'camp-03',
		name: 'Customer Stories',
		status: 'paused',
		progress: 60,
		postsTotal: 15,
		postsPublished: 9,
		startDate: 'Dec 01',
		endDate: 'Mar 01',
		platform: 'Instagram'
	},
	{
		id: 'camp-04',
		name: 'Q1 Growth Push',
		status: 'completed',
		progress: 100,
		postsTotal: 20,
		postsPublished: 20,
		startDate: 'Jan 01',
		endDate: 'Mar 31',
		platform: 'Multi-platform'
	}
];

export const brandVoice: BrandVoiceTrait[] = [
	{ trait: 'Professional', score: 85, description: 'Confident expertise without jargon' },
	{ trait: 'Approachable', score: 78, description: 'Warm and conversational tone' },
	{ trait: 'Data-driven', score: 92, description: 'Backed by metrics and results' },
	{ trait: 'Innovative', score: 71, description: 'Forward-thinking and creative' }
];

export const contentMix: ContentMixItem[] = [
	{ label: 'Educational', percentage: 35, color: 'var(--c-electric)' },
	{ label: 'Promotional', percentage: 20, color: 'var(--c-secondary)' },
	{ label: 'Engagement', percentage: 25, color: 'var(--c-tertiary)' },
	{ label: 'Thought Leadership', percentage: 15, color: 'var(--positive)' },
	{ label: 'Behind the Scenes', percentage: 5, color: 'var(--text-dim)' }
];
