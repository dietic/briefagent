export type PostStatus = 'draft' | 'review' | 'scheduled' | 'published';

export interface PostCard {
	id: string;
	title: string;
	preview: string;
	platform: string;
	type: 'image' | 'carousel' | 'text' | 'video';
	status: PostStatus;
	scheduledTime?: string;
	publishedTime?: string;
	engagement?: { likes: number; comments: number; shares: number };
	authorAvatar: string;
}

export interface KanbanColumn {
	id: PostStatus;
	label: string;
	count: number;
	posts: PostCard[];
}

export interface AiSuggestion {
	id: string;
	type: 'optimization' | 'timing' | 'content' | 'warning';
	title: string;
	description: string;
	action?: string;
}

export interface PublishingStat {
	label: string;
	value: string;
	change?: string;
}

export const kanbanColumns: KanbanColumn[] = [
	{
		id: 'draft',
		label: 'Drafts',
		count: 3,
		posts: [
			{
				id: 'd1',
				title: 'AI Tools Roundup',
				preview: 'Stop wasting 10 hours a week on marketing. I tested 47 AI tools...',
				platform: 'LinkedIn',
				type: 'image',
				status: 'draft',
				authorAvatar: 'DM'
			},
			{
				id: 'd2',
				title: 'Design Trends 2024',
				preview: '8 visual design trends that are dominating social media right now...',
				platform: 'Instagram',
				type: 'carousel',
				status: 'draft',
				authorAvatar: 'DM'
			},
			{
				id: 'd3',
				title: 'Quick Poll: Favorite Tool',
				preview: 'What is your favorite AI marketing tool? Reply with your top pick...',
				platform: 'Twitter/X',
				type: 'text',
				status: 'draft',
				authorAvatar: 'DM'
			}
		]
	},
	{
		id: 'review',
		label: 'In Review',
		count: 2,
		posts: [
			{
				id: 'r1',
				title: 'Customer Story: Acme Corp',
				preview: 'How Acme Corp scaled their content output by 10x using BriefAgent...',
				platform: 'LinkedIn',
				type: 'image',
				status: 'review',
				authorAvatar: 'AC'
			},
			{
				id: 'r2',
				title: 'Product Update v2.1',
				preview: 'Exciting new features landing this week: AI-powered scheduling...',
				platform: 'LinkedIn',
				type: 'carousel',
				status: 'review',
				authorAvatar: 'DM'
			}
		]
	},
	{
		id: 'scheduled',
		label: 'Scheduled',
		count: 3,
		posts: [
			{
				id: 's1',
				title: '5 Growth Hacks',
				preview: 'Growth hacking is not dead. Here are 5 tactics that still work...',
				platform: 'LinkedIn',
				type: 'carousel',
				status: 'scheduled',
				scheduledTime: 'Tomorrow 2:00 PM',
				authorAvatar: 'DM'
			},
			{
				id: 's2',
				title: 'Behind the Scenes',
				preview: 'A sneak peek at how we create content at BriefAgent HQ...',
				platform: 'Instagram',
				type: 'image',
				status: 'scheduled',
				scheduledTime: 'Tomorrow 4:30 PM',
				authorAvatar: 'DM'
			},
			{
				id: 's3',
				title: 'Weekly Tips Thread',
				preview: 'Thread: 7 copywriting frameworks that actually convert in 2024...',
				platform: 'Twitter/X',
				type: 'text',
				status: 'scheduled',
				scheduledTime: 'Wed 9:00 AM',
				authorAvatar: 'DM'
			}
		]
	},
	{
		id: 'published',
		label: 'Published',
		count: 4,
		posts: [
			{
				id: 'p1',
				title: 'Startup Toolkit Guide',
				preview: 'The ultimate startup marketing toolkit for 2024. Everything you...',
				platform: 'LinkedIn',
				type: 'carousel',
				status: 'published',
				publishedTime: 'Feb 14',
				engagement: { likes: 142, comments: 23, shares: 18 },
				authorAvatar: 'DM'
			},
			{
				id: 'p2',
				title: 'Team Culture Post',
				preview: 'Building a remote-first culture that actually works. Our journey...',
				platform: 'Instagram',
				type: 'image',
				status: 'published',
				publishedTime: 'Feb 13',
				engagement: { likes: 89, comments: 12, shares: 0 },
				authorAvatar: 'DM'
			},
			{
				id: 'p3',
				title: 'Product Demo',
				preview: 'See BriefAgent in action: from brief to published post in under...',
				platform: 'LinkedIn',
				type: 'video',
				status: 'published',
				publishedTime: 'Feb 12',
				engagement: { likes: 234, comments: 45, shares: 31 },
				authorAvatar: 'DM'
			},
			{
				id: 'p4',
				title: 'Industry News Take',
				preview: 'Hot take: AI will not replace marketers, but marketers who use AI...',
				platform: 'Twitter/X',
				type: 'text',
				status: 'published',
				publishedTime: 'Feb 11',
				engagement: { likes: 67, comments: 8, shares: 0 },
				authorAvatar: 'DM'
			}
		]
	}
];

export const aiSuggestions: AiSuggestion[] = [
	{
		id: 'ai1',
		type: 'optimization',
		title: 'Optimize posting time',
		description:
			'Your LinkedIn posts perform 40% better when published between 8\u201310 AM. Consider rescheduling.',
		action: 'Reschedule'
	},
	{
		id: 'ai2',
		type: 'timing',
		title: 'Content gap detected',
		description:
			"You haven\u2019t posted on Instagram in 5 days. Engagement drops after 3-day gaps.",
		action: 'Create Post'
	},
	{
		id: 'ai3',
		type: 'content',
		title: 'Trending topic alert',
		description:
			'\u201cAI in Marketing\u201d is trending in your niche. Consider creating a thought piece.',
		action: 'Generate Brief'
	},
	{
		id: 'ai4',
		type: 'warning',
		title: 'Review overdue',
		description: '2 posts have been in review for over 48 hours.',
		action: 'Review Now'
	}
];

export const publishingStats: PublishingStat[] = [
	{ label: 'Published This Week', value: '8', change: '+3 vs last week' },
	{ label: 'Avg. Engagement', value: '4.2%', change: '+0.8%' },
	{ label: 'Queue Health', value: 'Good', change: '12 posts scheduled' }
];
