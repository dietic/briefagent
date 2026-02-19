<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { postStatusColors, type PostStatus } from '$lib/utils/post-status.js';
	import { format } from 'date-fns';

	let { data } = $props();

	const statCards = $derived([
		{
			label: m.dash_stat_generated(),
			value: data.stats?.generated ?? 0,
			color: 'var(--c-electric)',
			bg: 'rgba(6,182,212,0.08)'
		},
		{
			label: m.dash_stat_pending(),
			value: data.stats?.pendingReview ?? 0,
			color: 'var(--c-secondary)',
			bg: 'rgba(249,115,22,0.08)'
		},
		{
			label: m.dash_stat_approved(),
			value: data.stats?.approved ?? 0,
			color: 'var(--c-electric)',
			bg: 'rgba(6,182,212,0.08)'
		},
		{
			label: m.dash_stat_published(),
			value: data.stats?.published ?? 0,
			color: 'var(--positive)',
			bg: 'rgba(52,211,153,0.08)'
		}
	]);

	function formatScheduledDate(isoString: string | null): string {
		if (!isoString) return '';
		return format(new Date(isoString), 'MMM d, h:mm a');
	}
</script>

<svelte:head>
	<title>{m.dash_meta_title_overview()}</title>
</svelte:head>

<!-- Welcome -->
<div style="animation: dash-fade-up 0.4s ease-out both;">
	<h1 class="text-[1.75rem] font-extrabold tracking-tight" style="color: var(--text-main);">
		<span style="display: inline-block; animation: wave-hand 2s infinite; transform-origin: 70% 70%;">&#x1F44B;</span>
		{m.dash_overview_welcome()}
	</h1>
	<p class="mt-1 text-sm" style="color: var(--text-dim);">
		{m.dash_overview_subtitle()}
	</p>
</div>

<!-- Stat Cards -->
{#if data.stats}
	<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each statCards as card, i}
			<div
				class="group relative overflow-hidden rounded-[14px] border p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-default"
				style="
					border-color: var(--border-subtle);
					background: var(--bg-surface);
					box-shadow: var(--card-shadow);
					animation: dash-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
					animation-delay: {i * 0.05}s;
				"
			>
				<!-- Top accent line on hover -->
				<div
					class="absolute top-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					style="background: {card.color};"
				></div>

				<div class="mb-3 text-xs font-normal" style="color: var(--text-dim);">
					{card.label}
				</div>
				<div class="text-[1.85rem] font-extrabold leading-none tracking-tight" style="color: var(--text-main);">
					{card.value}
				</div>
				<!-- Subtle background glow -->
				<div
					class="absolute -bottom-4 -right-4 h-16 w-16 rounded-full opacity-20 blur-2xl"
					style="background: {card.color};"
				></div>
			</div>
		{/each}
	</div>
{:else}
	<!-- No product empty state -->
	<div
		class="mt-6 rounded-[14px] border p-8 text-center"
		style="border-color: var(--border-subtle); background: var(--bg-surface);"
	>
		<p class="text-sm" style="color: var(--text-dim);">
			{m.dash_cta_onboarding()}
		</p>
		<a
			href="/dashboard/onboarding"
			class="mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
			style="background: var(--c-electric);"
		>
			{m.dash_cta_onboarding_btn()}
		</a>
	</div>
{/if}

<!-- Generate Content Plan CTA -->
<div class="mt-6" style="animation: dash-fade-up 0.5s ease-out 0.15s both;">
	{#if data.hasProduct}
		<div
			class="relative overflow-hidden rounded-[14px] border p-6"
			style="
				border-color: color-mix(in srgb, var(--c-electric) 30%, transparent);
				background: var(--bg-surface);
				box-shadow: var(--card-shadow);
			"
		>
			<!-- Gradient accent bar at top -->
			<div
				class="absolute top-0 left-0 right-0 h-[2px]"
				style="background: linear-gradient(90deg, var(--c-electric), var(--c-secondary));"
			></div>

			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 class="text-lg font-bold" style="color: var(--text-main);">
						{m.dash_cta_title()}
					</h2>
					<p class="mt-1 text-sm" style="color: var(--text-dim);">
						{m.dash_cta_description()}
					</p>
				</div>
				<a
					href="/dashboard/generate"
					class="inline-flex shrink-0 items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg"
					style="background: linear-gradient(135deg, var(--c-electric), color-mix(in srgb, var(--c-electric) 80%, var(--c-secondary)));"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
						<path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
					</svg>
					{m.dash_cta_button()}
				</a>
			</div>
		</div>
	{:else}
		<div
			class="rounded-[14px] border p-6 text-center"
			style="border-color: var(--border-subtle); background: var(--bg-surface);"
		>
			<p class="text-sm" style="color: var(--text-dim);">
				{m.dash_cta_onboarding()}
			</p>
			<a
				href="/dashboard/onboarding"
				class="mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
				style="background: var(--c-electric);"
			>
				{m.dash_cta_onboarding_btn()}
			</a>
		</div>
	{/if}
</div>

<!-- Upcoming Posts -->
<div class="mt-6" style="animation: dash-fade-up 0.5s ease-out 0.25s both;">
	<div
		class="overflow-hidden rounded-[14px] border transition-all duration-300"
		style="border-color: var(--border-subtle); background: var(--bg-surface); box-shadow: var(--card-shadow);"
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-4 pt-4 pb-2">
			<span class="text-[0.95rem] font-bold" style="color: var(--text-main);">
				{m.dash_upcoming_title()}
			</span>
			<span class="rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider"
				style="color: var(--c-electric); background: rgba(6,182,212,0.1);">
				{m.dash_upcoming_next_7()}
			</span>
		</div>

		<!-- Upcoming items -->
		<div class="flex flex-col gap-2 px-4 pb-4">
			{#if data.upcoming.length > 0}
				{#each data.upcoming as post}
					{@const statusStyle = postStatusColors[post.status as PostStatus]}
					<a
						href="/dashboard/calendar?month={post.scheduledAt ? post.scheduledAt.substring(0, 7) : ''}"
						class="flex items-center gap-3 overflow-hidden rounded-lg py-3 pr-3 transition-colors duration-150 hover:bg-white/[0.03]"
					>
						<!-- Status color bar -->
						<div
							class="h-full min-h-[48px] w-[3px] shrink-0 self-stretch rounded-full"
							style="background: {statusStyle?.color ?? 'var(--text-dim)'};"
						></div>

						<!-- Content -->
						<div class="min-w-0 flex-1">
							<div class="truncate text-sm font-medium" style="color: var(--text-main);">
								{post.topic}
							</div>
							<div class="mt-0.5 flex items-center gap-2">
								<span class="text-xs capitalize" style="color: var(--text-dim);">
									{post.platform}
								</span>
								<span
									class="rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold capitalize"
									style="color: var(--text-dim); background: var(--toggle-bg);"
								>
									{post.postType}
								</span>
							</div>
						</div>

						<!-- Right: time + status -->
						<div class="flex shrink-0 flex-col items-end gap-1">
							<span class="font-mono text-xs" style="color: var(--text-muted);">
								{formatScheduledDate(post.scheduledAt)}
							</span>
							{#if statusStyle}
								<span
									class="rounded-md px-2 py-0.5 text-[0.6rem] font-bold"
									style="color: {statusStyle.color}; background: {statusStyle.bg};"
								>
									{statusStyle.label}
								</span>
							{/if}
						</div>
					</a>
				{/each}
			{:else}
				<div class="py-8 text-center">
					<p class="text-sm" style="color: var(--text-dim);">
						{m.dash_upcoming_empty()}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
