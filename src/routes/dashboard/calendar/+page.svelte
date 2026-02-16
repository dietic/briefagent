<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import CalendarGrid from '$lib/components/dashboard/calendar-grid.svelte';
	import { calendarEvents, dailyQueue, aiSuggestions } from '$lib/data/mock-calendar';
	import type { ContentType } from '$lib/data/mock-calendar';

	let viewMode = $state<'month' | 'week'>('month');

	const typeEmoji: Record<ContentType, string> = {
		blog: '\u{1F4F0}',
		social: '\u{1F4F7}',
		email: '\u{2709}',
		video: '\u{1F3AC}'
	};

	const statusStyle: Record<string, { color: string; bg: string; label: string }> = {
		published: { color: '#34d399', bg: 'rgba(52,211,153,0.1)', label: 'Published' },
		scheduled: { color: 'var(--c-electric)', bg: 'rgba(6,182,212,0.1)', label: 'Scheduled' },
		draft: { color: 'var(--c-secondary)', bg: 'rgba(249,115,22,0.1)', label: 'Draft' },
		review: { color: 'var(--c-tertiary)', bg: 'rgba(236,72,153,0.1)', label: 'Review' }
	};

	const chipBg: Record<ContentType, string> = {
		blog: 'rgba(6,182,212,0.1)',
		social: 'rgba(249,115,22,0.1)',
		email: 'rgba(236,72,153,0.1)',
		video: 'rgba(52,211,153,0.1)'
	};
</script>

<svelte:head>
	<title>{m.dash_meta_title_calendar()}</title>
</svelte:head>

<div class="flex h-full gap-0 -m-8">
	<!-- Main content -->
	<div class="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
		<!-- Header row -->
		<div class="flex items-center justify-between shrink-0">
			<h1 class="text-xl font-extrabold tracking-tight" style="color: var(--text-main);">
				{m.dash_calendar_title()}
			</h1>
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
				<button
					class="text-[0.8rem] font-bold text-white px-4 py-2 rounded-[10px] flex items-center gap-2 transition-transform duration-200 hover:-translate-y-px cursor-pointer"
					style="background: var(--c-electric);"
				>
					+ {m.dash_calendar_add_content()}
				</button>
			</div>
		</div>

		<!-- Calendar grid -->
		<CalendarGrid events={calendarEvents} {viewMode} />
	</div>

	<!-- Right sidebar -->
	<aside
		class="w-80 shrink-0 flex flex-col gap-5 p-5 overflow-y-auto border-l"
		style="border-color: var(--border-subtle); background: var(--bg-surface-alt, var(--bg-surface));"
	>
		<!-- Today's Queue -->
		<div>
			<h2 class="text-[0.9rem] font-extrabold tracking-tight mb-3" style="color: var(--text-main);">
				{m.dash_calendar_today_queue()}
			</h2>
			<div class="flex flex-col gap-2">
				{#each dailyQueue as item}
					{@const ss = statusStyle[item.status]}
					<div
						class="flex gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-x-0.5"
						style="border-color: var(--border-subtle); background: var(--bg-surface-alt, var(--surface-raised));"
					>
						<div
							class="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg shrink-0"
							style="background: {chipBg[item.type]};"
						>
							{typeEmoji[item.type]}
						</div>
						<div class="flex-1 min-w-0">
							<div class="text-[0.8rem] font-bold truncate" style="color: var(--text-main);">{item.title}</div>
							<div class="text-[0.62rem]" style="color: var(--text-dim);">{item.platform}</div>
							<div class="text-[0.62rem] mono" style="font-family: var(--font-mono); color: var(--text-muted);">
								{item.time}
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

		<!-- AI Suggestions -->
		<div>
			<h2 class="text-[0.9rem] font-extrabold tracking-tight mb-3 flex items-center gap-2" style="color: var(--text-main);">
				<span class="text-base" style="animation: sparkle-pulse 3s ease-in-out infinite;">&#10024;</span>
				{m.dash_calendar_ai_suggestions()}
			</h2>
			<div class="flex flex-col gap-2">
				{#each aiSuggestions as sug}
					<div
						class="p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-y-px"
						style="border-color: var(--border-subtle); background: var(--bg-surface-alt, var(--surface-raised));"
					>
						<div class="flex items-start gap-3">
							<div
								class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
								style="background: {chipBg[sug.type]};"
							>
								{typeEmoji[sug.type]}
							</div>
							<div class="flex-1 min-w-0">
								<div class="text-[0.78rem] font-bold truncate" style="color: var(--text-main);">{sug.title}</div>
								<div class="text-[0.62rem] mt-0.5" style="font-family: var(--font-mono); color: var(--text-dim);">
									{sug.reason}
								</div>
							</div>
						</div>
						<button
							class="mt-2 w-full text-[0.7rem] font-bold py-1.5 rounded-lg border transition-all duration-150 cursor-pointer"
							style="
								color: var(--c-electric);
								background: rgba(var(--chip-electric-rgb, 6 182 212) / 0.08);
								border-color: rgba(var(--chip-electric-rgb, 6 182 212) / 0.2);
							"
						>
							{m.dash_calendar_schedule_btn()}
						</button>
					</div>
				{/each}
			</div>
		</div>
	</aside>
</div>

<style>
	@keyframes sparkle-pulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.08); opacity: 0.8; }
	}
</style>
