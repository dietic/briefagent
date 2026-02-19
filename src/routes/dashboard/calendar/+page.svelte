<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import CalendarGrid from '$lib/components/dashboard/calendar-grid.svelte';
	import { postStatusColors, type PostStatus } from '$lib/utils/post-status';
	import { goto } from '$app/navigation';
	import { format } from 'date-fns';

	let { data } = $props();

	let viewMode = $state<'month' | 'week'>('month');
	let selectedDay = $state<string | null>(null);

	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	let displayMonth = $derived(`${monthNames[data.month]} ${data.year}`);

	let postsForDay = $derived(
		selectedDay
			? data.posts.filter((p: { scheduledAt: string | null }) => p.scheduledAt?.slice(0, 10) === selectedDay)
			: []
	);

	function navigateMonth(direction: -1 | 1) {
		let newMonth = data.month + direction;
		let newYear = data.year;
		if (newMonth < 0) {
			newMonth = 11;
			newYear--;
		} else if (newMonth > 11) {
			newMonth = 0;
			newYear++;
		}
		const param = `${newYear}-${String(newMonth + 1).padStart(2, '0')}`;
		goto(`?month=${param}`, { keepFocus: true, noScroll: true });
	}

	function handlePostClick(post: { scheduledAt: string | null }) {
		if (post.scheduledAt) {
			selectedDay = post.scheduledAt.slice(0, 10);
		}
	}

	function formatSelectedDay(dateStr: string): string {
		const d = new Date(dateStr + 'T12:00:00');
		return format(d, 'MMMM d, yyyy');
	}
</script>

<svelte:head>
	<title>{m.dash_meta_title_calendar()}</title>
</svelte:head>

<div class="flex h-full gap-0 -m-8">
	<!-- Main content -->
	<div class="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
		<!-- Header row -->
		<div class="flex items-center justify-between shrink-0">
			<div class="flex items-center gap-4">
				<h1 class="text-xl font-extrabold tracking-tight" style="color: var(--text-main);">
					{m.dash_calendar_title()}
				</h1>
				<!-- Month navigation -->
				<div class="flex items-center gap-2">
					<button
						class="w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer hover:-translate-y-px"
						style="border-color: var(--border-subtle); color: var(--text-dim); background: var(--bg-surface-alt, var(--bg-surface));"
						onclick={() => navigateMonth(-1)}
						title={m.cal_prev_month()}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
					</button>
					<span
						class="text-sm font-bold min-w-[140px] text-center"
						style="color: var(--text-main); font-family: var(--font-mono);"
					>
						{displayMonth}
					</span>
					<button
						class="w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer hover:-translate-y-px"
						style="border-color: var(--border-subtle); color: var(--text-dim); background: var(--bg-surface-alt, var(--bg-surface));"
						onclick={() => navigateMonth(1)}
						title={m.cal_next_month()}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
					</button>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<!-- View toggle -->
				<div class="flex rounded-[10px] border overflow-hidden" style="border-color: var(--border-subtle); background: var(--toggle-bg);">
					<button
						class="text-[0.78rem] font-bold px-4 py-1.5 transition-all duration-200"
						style="
							background: {viewMode === 'month' ? 'rgba(var(--chip-electric-rgb, 6 182 212) / 0.12)' : 'transparent'};
							color: {viewMode === 'month' ? 'var(--c-electric)' : 'var(--text-dim)'};
						"
						onclick={() => (viewMode = 'month')}
					>
						{m.dash_calendar_month()}
					</button>
					<button
						class="text-[0.78rem] font-bold px-4 py-1.5 transition-all duration-200"
						style="
							background: {viewMode === 'week' ? 'rgba(var(--chip-electric-rgb, 6 182 212) / 0.12)' : 'transparent'};
							color: {viewMode === 'week' ? 'var(--c-electric)' : 'var(--text-dim)'};
						"
						onclick={() => (viewMode = 'week')}
					>
						{m.dash_calendar_week()}
					</button>
				</div>
			</div>
		</div>

		<!-- Calendar grid -->
		<CalendarGrid
			posts={data.posts}
			{viewMode}
			year={data.year}
			month={data.month}
			onpostclick={handlePostClick}
		/>
	</div>

	<!-- Right sidebar -->
	<aside
		class="w-80 shrink-0 flex flex-col gap-5 p-5 overflow-y-auto border-l"
		style="border-color: var(--border-subtle); background: var(--bg-surface-alt, var(--bg-surface));"
	>
		{#if selectedDay && postsForDay.length > 0}
			<!-- Posts for selected day -->
			<div>
				<h2 class="text-[0.9rem] font-extrabold tracking-tight mb-3" style="color: var(--text-main);">
					{m.cal_posts_for_day({ date: formatSelectedDay(selectedDay) })}
				</h2>
				<div class="flex flex-col gap-2">
					{#each postsForDay as post}
						{@const ss = postStatusColors[post.status as PostStatus] ?? postStatusColors.draft}
						<div
							class="flex gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-x-0.5"
							style="border-color: var(--border-subtle); background: var(--bg-surface-alt, var(--surface-raised));"
						>
							{#if post.imageUrl}
								<div
									class="w-9 h-9 rounded-[10px] shrink-0 bg-cover bg-center"
									style="background-image: url({post.imageUrl});"
								></div>
							{:else}
								<div
									class="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg shrink-0"
									style="background: {ss.bg};"
								>
									&#128196;
								</div>
							{/if}
							<div class="flex-1 min-w-0">
								<div class="text-[0.8rem] font-bold truncate" style="color: var(--text-main);">{post.topic}</div>
								<div class="text-[0.62rem]" style="color: var(--text-dim);">{post.platform}</div>
								<div class="text-[0.62rem] mono" style="font-family: var(--font-mono); color: var(--text-muted);">
									{post.contentCategory.replace('_', ' ')}
								</div>
							</div>
							<div
								class="self-start text-[0.62rem] font-bold px-2 py-0.5 rounded-md shrink-0"
								style="color: {ss.color}; background: {ss.bg};"
							>
								{ss.label}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if selectedDay}
			<!-- Day selected but no posts -->
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<div class="text-3xl mb-3 opacity-40">&#128197;</div>
				<div class="text-sm font-bold mb-1" style="color: var(--text-dim);">
					{m.cal_no_posts()}
				</div>
				<div class="text-[0.7rem]" style="color: var(--text-muted);">
					{formatSelectedDay(selectedDay)}
				</div>
			</div>
		{:else}
			<!-- No day selected -->
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<div class="text-3xl mb-3 opacity-40">&#128197;</div>
				<div class="text-sm font-bold mb-1" style="color: var(--text-dim);">
					{m.cal_select_day()}
				</div>
			</div>
		{/if}
	</aside>
</div>
