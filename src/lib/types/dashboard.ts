// Shared dashboard types — extracted from former mock data files

// ── Overview types ──────────────────────────────────────────────────

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

// ── Publishing types ────────────────────────────────────────────────

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

// ── Calendar types ──────────────────────────────────────────────────

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

// ── Brand types ─────────────────────────────────────────────────────

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

// ── Editor types ────────────────────────────────────────────────────

export interface ContentVariant {
	id: string;
	label: string;
	preview: string;
	score: number;
	isSelected: boolean;
}

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

export interface EditHistoryItem {
	id: string;
	action: string;
	timestamp: string;
	user: string;
}
