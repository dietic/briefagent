export type ContentType = 'blog' | 'social' | 'email' | 'video';
export type ContentStatus = 'published' | 'scheduled' | 'draft' | 'review';

export interface CalendarEvent {
	id: string;
	title: string;
	type: ContentType;
	status: ContentStatus;
	date: string;
	time?: string;
	platform?: string;
}

export interface DailyQueueItem {
	id: string;
	title: string;
	type: ContentType;
	time: string;
	platform: string;
	status: ContentStatus;
}

export interface AiSuggestion {
	id: string;
	title: string;
	reason: string;
	type: ContentType;
}

/** Returns an ISO date string YYYY-MM-DD for the current month at a given day offset from today. */
function dateOffset(days: number): string {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}

/** Returns an ISO date string for a specific day in the current month. */
function currentMonthDay(day: number): string {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(Math.min(day, 28)).padStart(2, '0');
	return `${y}-${m}-${dd}`;
}

export const calendarEvents: CalendarEvent[] = [
	// Week 1
	{ id: 'ev-01', title: 'AI Tools Listicle', type: 'blog', status: 'published', date: currentMonthDay(2), time: '09:00', platform: 'WordPress' },
	{ id: 'ev-02', title: 'Product Feature Spotlight', type: 'social', status: 'published', date: currentMonthDay(2), time: '14:00', platform: 'LinkedIn' },
	{ id: 'ev-03', title: 'Customer Success Story', type: 'social', status: 'published', date: currentMonthDay(3), time: '10:30', platform: 'Instagram' },
	{ id: 'ev-04', title: 'Weekly Newsletter #21', type: 'email', status: 'published', date: currentMonthDay(4), time: '08:00', platform: 'Mailchimp' },
	{ id: 'ev-05', title: 'Behind the Scenes Reel', type: 'video', status: 'published', date: currentMonthDay(5), time: '15:00', platform: 'TikTok' },

	// Week 2
	{ id: 'ev-06', title: 'SEO Strategy Deep Dive', type: 'blog', status: 'published', date: currentMonthDay(7), time: '09:00', platform: 'WordPress' },
	{ id: 'ev-07', title: 'Engagement Poll', type: 'social', status: 'published', date: currentMonthDay(8), time: '11:00', platform: 'Twitter' },
	{ id: 'ev-08', title: 'Team Culture Post', type: 'social', status: 'published', date: currentMonthDay(8), time: '16:00', platform: 'LinkedIn' },
	{ id: 'ev-09', title: 'Product Update Email', type: 'email', status: 'published', date: currentMonthDay(9), time: '10:00', platform: 'Mailchimp' },
	{ id: 'ev-10', title: 'Quick Tips Video', type: 'video', status: 'published', date: currentMonthDay(10), time: '14:30', platform: 'YouTube' },
	{ id: 'ev-11', title: 'Industry Insights', type: 'blog', status: 'published', date: currentMonthDay(11), time: '09:00', platform: 'WordPress' },

	// Week 3 - current week area
	{ id: 'ev-12', title: 'Carousel: Growth Tips', type: 'social', status: 'scheduled', date: dateOffset(0), time: '10:00', platform: 'Instagram' },
	{ id: 'ev-13', title: 'Weekly Newsletter #23', type: 'email', status: 'scheduled', date: dateOffset(0), time: '18:00', platform: 'Mailchimp' },
	{ id: 'ev-14', title: 'Case Study: ROI Analysis', type: 'blog', status: 'scheduled', date: dateOffset(1), time: '09:00', platform: 'WordPress' },
	{ id: 'ev-15', title: 'Launch Teaser Post', type: 'social', status: 'draft', date: dateOffset(2), time: '11:00', platform: 'LinkedIn' },
	{ id: 'ev-16', title: 'Tutorial: Automation', type: 'video', status: 'review', date: dateOffset(3), time: '14:00', platform: 'YouTube' },

	// Week 4
	{ id: 'ev-17', title: 'Thought Leadership Thread', type: 'social', status: 'draft', date: currentMonthDay(21), time: '09:30', platform: 'Twitter' },
	{ id: 'ev-18', title: 'Monthly Recap Post', type: 'blog', status: 'draft', date: currentMonthDay(22), time: '10:00', platform: 'WordPress' },
	{ id: 'ev-19', title: 'Promo: Spring Campaign', type: 'email', status: 'draft', date: currentMonthDay(23), time: '08:00', platform: 'Mailchimp' },
	{ id: 'ev-20', title: 'Product Demo Reel', type: 'video', status: 'draft', date: currentMonthDay(24), time: '16:00', platform: 'Instagram' },
];

export const dailyQueue: DailyQueueItem[] = [
	{ id: 'dq-01', title: '5 AI Trends for 2026', type: 'blog', time: '9:00 AM', platform: 'WordPress', status: 'published' },
	{ id: 'dq-02', title: 'Product Launch Teaser', type: 'social', time: '11:00 AM', platform: 'LinkedIn', status: 'published' },
	{ id: 'dq-03', title: 'Customer Spotlight Reel', type: 'video', time: '1:00 PM', platform: 'Instagram', status: 'scheduled' },
	{ id: 'dq-04', title: 'Engagement Thread', type: 'social', time: '3:00 PM', platform: 'Twitter', status: 'scheduled' },
	{ id: 'dq-05', title: 'Weekly Digest #24', type: 'email', time: '5:00 PM', platform: 'Mailchimp', status: 'draft' },
];

export const aiSuggestions: AiSuggestion[] = [
	{ id: 'ai-01', title: 'Industry Trend Analysis', reason: 'Trending topic in your niche', type: 'blog' },
	{ id: 'ai-02', title: 'User Testimonial Carousel', reason: 'High engagement potential', type: 'social' },
	{ id: 'ai-03', title: 'Product Update Announcement', reason: 'Pending feature release', type: 'email' },
];
