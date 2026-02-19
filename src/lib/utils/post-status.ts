export type PostStatus =
	| 'draft'
	| 'pending_review'
	| 'approved'
	| 'rejected'
	| 'scheduled'
	| 'published';

export const postStatusColors: Record<
	PostStatus,
	{ color: string; bg: string; label: string }
> = {
	draft: { color: 'var(--text-muted)', bg: 'rgba(156,163,175,0.1)', label: 'Draft' },
	pending_review: { color: 'var(--c-secondary)', bg: 'rgba(249,115,22,0.1)', label: 'Review' },
	approved: { color: 'var(--c-electric)', bg: 'rgba(6,182,212,0.1)', label: 'Approved' },
	scheduled: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Scheduled' },
	published: { color: '#16a34a', bg: 'rgba(22,163,74,0.1)', label: 'Published' },
	rejected: { color: 'var(--negative)', bg: 'rgba(239,68,68,0.1)', label: 'Rejected' }
};
