export interface BriefField {
	id: string;
	label: string;
	type: 'text' | 'textarea' | 'select' | 'tags';
	value: string;
	placeholder?: string;
	options?: string[];
}

export interface ContentPreview {
	id: string;
	platform: string;
	content: string;
	hashtags: string[];
	characterCount: number;
	characterLimit: number;
	imageUrl?: string;
	aiScore: number;
	hookScore: number;
	ctaScore: number;
	readabilityScore: number;
}

export interface ContentVariant {
	id: string;
	label: string;
	preview: string;
	score: number;
	isSelected: boolean;
}

export interface EditHistoryItem {
	id: string;
	action: string;
	timestamp: string;
	user: string;
}

export const briefData: BriefField[] = [
	{
		id: 'campaign',
		label: 'Campaign',
		type: 'select',
		value: 'Product Launch 2024',
		options: ['Product Launch 2024', 'Thought Leadership', 'Customer Stories']
	},
	{
		id: 'topic',
		label: 'Topic',
		type: 'text',
		value: '5 AI Tools Every Startup Needs in 2024'
	},
	{
		id: 'key-message',
		label: 'Key Message',
		type: 'textarea',
		value:
			'AI tools are no longer optional for startups. The right stack can replace an entire marketing team and deliver better results in half the time.'
	},
	{
		id: 'target-audience',
		label: 'Target Audience',
		type: 'text',
		value: 'Startup founders, CTOs, indie hackers'
	},
	{
		id: 'content-type',
		label: 'Content Type',
		type: 'select',
		value: 'Carousel Post',
		options: ['Single Image', 'Carousel Post', 'Text Only', 'Video']
	},
	{
		id: 'tags',
		label: 'Tags',
		type: 'tags',
		value: 'ai, startups, tools, productivity'
	}
];

export const contentPreview: ContentPreview = {
	id: 'preview-1',
	platform: 'LinkedIn',
	content: `Stop wasting 10 hours a week on marketing.

I tested 47 AI tools over 6 months. Here are the 5 that actually moved the needle for our startup:

1. Content Strategy \u2014 BriefAgent generates your entire 2-week plan from a single brief
2. Visual Design \u2014 Midjourney creates brand-consistent visuals in seconds
3. Copy Refinement \u2014 Claude polishes your copy while keeping your voice
4. Scheduling \u2014 Buffer handles multi-platform posting on autopilot
5. Analytics \u2014 Metricool shows what\u2019s actually working

The result? 3x more content. 40% higher engagement. Zero extra hires.

Which AI tool has been your biggest game-changer? Drop it below.`,
	hashtags: [
		'#AITools',
		'#StartupGrowth',
		'#ContentMarketing',
		'#MarketingAutomation',
		'#AI'
	],
	characterCount: 612,
	characterLimit: 3000,
	aiScore: 92,
	hookScore: 95,
	ctaScore: 88,
	readabilityScore: 91
};

export const contentVariants: ContentVariant[] = [
	{
		id: 'v1',
		label: 'Professional Tone',
		preview:
			'Stop wasting 10 hours a week on marketing. I tested 47 AI tools over 6 months...',
		score: 92,
		isSelected: true
	},
	{
		id: 'v2',
		label: 'Casual / Conversational',
		preview:
			"Okay real talk \u2014 I was mass-testing AI tools like a mad scientist. 47 tools, 6 months...",
		score: 87,
		isSelected: false
	},
	{
		id: 'v3',
		label: 'Data-Heavy',
		preview:
			'We tracked 47 AI marketing tools across 12 KPIs over 180 days. The data tells a clear...',
		score: 84,
		isSelected: false
	}
];

export const editHistory: EditHistoryItem[] = [
	{ id: 'h1', action: 'Generated initial content', timestamp: '2 min ago', user: 'AI' },
	{ id: 'h2', action: 'Adjusted hook line', timestamp: '5 min ago', user: 'You' },
	{ id: 'h3', action: 'Regenerated with casual tone', timestamp: '8 min ago', user: 'AI' },
	{ id: 'h4', action: 'Added hashtag suggestions', timestamp: '10 min ago', user: 'AI' },
	{ id: 'h5', action: 'Created from brief', timestamp: '15 min ago', user: 'AI' }
];
