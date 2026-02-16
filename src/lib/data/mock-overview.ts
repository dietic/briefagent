// Mock data for the Dashboard Overview page
// All data is static and can be replaced with real API calls later

export interface KpiCard {
	id: string;
	labelKey: string;
	value: string;
	unit?: string;
	trend: { direction: 'up' | 'down'; value: string };
	sparkline: number[];
	color: 'electric' | 'secondary' | 'tertiary' | 'positive';
}

export interface ChartDataPoint {
	label: string;
	impressions: number;
	engagement: number;
}

export interface ActivityItem {
	id: string;
	type: 'published' | 'scheduled' | 'generated' | 'approved' | 'edited';
	title: string;
	time: string;
	platform?: string;
}

export interface ScheduleItem {
	id: string;
	title: string;
	platform: string;
	time: string;
	type: 'carousel' | 'image' | 'text' | 'video';
	status: 'scheduled' | 'review';
}

export interface QuickStat {
	labelKey: string;
	value: string;
	sublabel: string;
}

export const kpiCards: KpiCard[] = [
	{
		id: 'total-posts',
		labelKey: 'dash_kpi_total_posts',
		value: '248',
		trend: { direction: 'up', value: '12%' },
		sparkline: [20, 25, 18, 30, 28, 35, 32, 40],
		color: 'electric'
	},
	{
		id: 'engagement-rate',
		labelKey: 'dash_kpi_engagement_rate',
		value: '4.8',
		unit: '%',
		trend: { direction: 'up', value: '0.6%' },
		sparkline: [3.2, 3.8, 4.1, 3.9, 4.3, 4.6, 4.2, 4.8],
		color: 'secondary'
	},
	{
		id: 'impressions',
		labelKey: 'dash_kpi_impressions',
		value: '12.4',
		unit: 'K',
		trend: { direction: 'down', value: '3%' },
		sparkline: [15, 14, 13, 12, 13, 11, 12, 12.4],
		color: 'tertiary'
	},
	{
		id: 'click-through',
		labelKey: 'dash_kpi_click_through',
		value: '2.1',
		unit: '%',
		trend: { direction: 'up', value: '0.3%' },
		sparkline: [1.4, 1.6, 1.8, 1.7, 1.9, 2.0, 1.8, 2.1],
		color: 'positive'
	}
];

export const chartData: ChartDataPoint[] = [
	{ label: 'Mon', impressions: 2400, engagement: 180 },
	{ label: 'Tue', impressions: 3200, engagement: 240 },
	{ label: 'Wed', impressions: 2800, engagement: 210 },
	{ label: 'Thu', impressions: 4100, engagement: 310 },
	{ label: 'Fri', impressions: 3600, engagement: 280 },
	{ label: 'Sat', impressions: 2100, engagement: 160 },
	{ label: 'Sun', impressions: 2900, engagement: 220 }
];

export const activityItems: ActivityItem[] = [
	{
		id: 'a1',
		type: 'published',
		title: 'LinkedIn carousel published',
		time: '2h ago',
		platform: 'LinkedIn'
	},
	{
		id: 'a2',
		type: 'scheduled',
		title: 'Instagram reel scheduled',
		time: '4h ago',
		platform: 'Instagram'
	},
	{
		id: 'a3',
		type: 'generated',
		title: '3 new post variants generated',
		time: '6h ago'
	},
	{
		id: 'a4',
		type: 'approved',
		title: 'Product launch campaign approved',
		time: '8h ago'
	},
	{
		id: 'a5',
		type: 'edited',
		title: 'Blog post copy edited',
		time: '12h ago'
	},
	{
		id: 'a6',
		type: 'generated',
		title: 'Weekly content plan generated',
		time: '1d ago'
	}
];

export const scheduleItems: ScheduleItem[] = [
	{
		id: 's1',
		title: '5 AI Tools Every Startup Needs',
		platform: 'LinkedIn',
		time: '2:00 PM',
		type: 'carousel',
		status: 'scheduled'
	},
	{
		id: 's2',
		title: 'Behind the Scenes: Our Design Process',
		platform: 'Instagram',
		time: '4:30 PM',
		type: 'image',
		status: 'scheduled'
	},
	{
		id: 's3',
		title: 'Weekly Growth Tips Thread',
		platform: 'Twitter/X',
		time: 'Tomorrow 9:00 AM',
		type: 'text',
		status: 'review'
	},
	{
		id: 's4',
		title: 'Product Demo Walkthrough',
		platform: 'LinkedIn',
		time: 'Tomorrow 11:00 AM',
		type: 'video',
		status: 'scheduled'
	}
];

export const quickStats: QuickStat[] = [
	{
		labelKey: 'dash_overview_stat_posts_week',
		value: '12',
		sublabel: '3 remaining'
	},
	{
		labelKey: 'dash_overview_stat_best_day',
		value: 'Thursday',
		sublabel: '4.2K impressions'
	},
	{
		labelKey: 'dash_overview_stat_top_platform',
		value: 'LinkedIn',
		sublabel: '68% of traffic'
	}
];
