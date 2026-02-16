<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import BrandCard from '$lib/components/dashboard/brand-card.svelte';
	import RadialChart from '$lib/components/dashboard/radial-chart.svelte';
	import ProgressBar from '$lib/components/dashboard/progress-bar.svelte';
	import { brandProfile, campaigns, brandVoice, contentMix } from '$lib/data/mock-brand';

	const statusStyles: Record<string, { color: string; bg: string; label: () => string; border: string }> = {
		active: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: () => m.dash_brand_status_active(), border: 'var(--positive)' },
		paused: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', label: () => m.dash_brand_status_paused(), border: 'var(--c-secondary)' },
		completed: { color: 'var(--c-electric)', bg: 'rgba(6,182,212,0.1)', label: () => m.dash_brand_status_completed(), border: 'var(--c-electric)' },
		draft: { color: 'var(--text-dim)', bg: 'rgba(107,138,153,0.1)', label: () => m.dash_brand_status_draft(), border: 'var(--text-muted)' }
	};

	const voiceColors = [
		'linear-gradient(90deg, var(--c-electric), #22c55e)',
		'linear-gradient(90deg, var(--c-secondary), #eab308)',
		'linear-gradient(90deg, var(--c-tertiary), #a855f7)',
		'linear-gradient(90deg, #a855f7, var(--c-electric))'
	];

	const donutSegments = contentMix.map((item) => ({
		percentage: item.percentage,
		color: item.color,
		label: item.label
	}));
</script>

<svelte:head>
	<title>{m.dash_meta_title_brand()}</title>
</svelte:head>

<div class="grid grid-cols-1 xl:grid-cols-3 gap-6" style="animation: dash-fade-up 0.4s ease-out;">
	<!-- Left column -->
	<div class="col-span-1 flex flex-col gap-6">
		<BrandCard profile={brandProfile} />

		<!-- Brand Voice -->
		<div
			class="rounded-[14px] border p-6"
			style="background: var(--bg-surface); border-color: var(--border-subtle); box-shadow: var(--card-shadow);"
		>
			<h3 class="text-[0.9rem] font-bold tracking-tight mb-4 flex items-center gap-2" style="color: var(--text-main);">
				<span class="text-[0.85rem]">&#x1F3A4;</span>
				{m.dash_brand_voice_title()}
			</h3>
			<div class="flex flex-col gap-4">
				{#each brandVoice as trait, i}
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<span class="text-[0.8rem] font-semibold" style="color: var(--text-main);">{trait.trait}</span>
							<span class="text-[0.65rem]" style="font-family: var(--font-mono); color: var(--text-dim);">
								{trait.score}%
							</span>
						</div>
						<div class="text-[0.68rem] mb-2" style="color: var(--text-dim);">{trait.description}</div>
						<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--border-subtle);">
							<div class="voice-bar h-full rounded-full" style="width: {trait.score}%; background: {voiceColors[i]};" data-width={trait.score}></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Right column -->
	<div class="xl:col-span-2 flex flex-col gap-6">
		<!-- Campaigns header -->
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-extrabold tracking-tight" style="color: var(--text-main);">
				{m.dash_brand_campaigns_title()}
			</h2>
			<button
				class="text-[0.8rem] font-semibold px-4 py-2 rounded-[10px] border flex items-center gap-2 transition-all duration-200 cursor-pointer"
				style="color: var(--text-main); border-color: var(--border-subtle); background: transparent;"
				onmouseenter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-sidebar-hover)'; }}
				onmouseleave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'transparent'; }}
			>
				+ {m.dash_brand_new_campaign()}
			</button>
		</div>

		<!-- Campaign cards grid -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			{#each campaigns as camp}
				{@const ss = statusStyles[camp.status]}
				<div
					class="rounded-[14px] border p-5 relative overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
					style="
						background: var(--bg-surface);
						border-color: var(--border-subtle);
						box-shadow: var(--card-shadow);
						border-left: 3px solid {ss.border};
					"
				>
					<!-- Status badge -->
					<div class="flex items-start justify-between mb-3">
						<div>
							<div class="text-[0.95rem] font-bold tracking-tight" style="color: var(--text-main);">{camp.name}</div>
							<div class="text-[0.65rem] mt-0.5" style="font-family: var(--font-mono); color: var(--text-dim);">
								{camp.startDate} - {camp.endDate}
							</div>
						</div>
						<span
							class="text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0"
							style="color: {ss.color}; background: {ss.bg};"
						>
							<span class="w-1.5 h-1.5 rounded-full" style="background: {ss.color};"></span>
							{ss.label()}
						</span>
					</div>

					<!-- Platform badge -->
					<div class="mb-3">
						<span
							class="text-[0.65rem] font-medium px-2 py-0.5 rounded-md"
							style="font-family: var(--font-mono); background: var(--border-subtle); color: var(--text-dim);"
						>
							{camp.platform}
						</span>
					</div>

					<!-- Progress -->
					<div class="mb-1 flex items-center justify-between">
						<span class="text-[0.65rem]" style="color: var(--text-dim);">Progress</span>
						<span class="text-[0.65rem]" style="font-family: var(--font-mono); color: var(--text-dim);">
							{camp.postsPublished}/{camp.postsTotal} posts
						</span>
					</div>
					<ProgressBar value={camp.progress} color={ss.border} />
				</div>
			{/each}
		</div>

		<!-- Content Mix -->
		<div
			class="rounded-[14px] border p-6"
			style="background: var(--bg-surface); border-color: var(--border-subtle); box-shadow: var(--card-shadow);"
		>
			<h3 class="text-[0.9rem] font-bold tracking-tight mb-4 flex items-center gap-2" style="color: var(--text-main);">
				<span class="text-[0.85rem]">&#x1F4CA;</span>
				{m.dash_brand_content_mix()}
			</h3>
			<RadialChart mode="donut" segments={donutSegments} size={150} />
		</div>
	</div>
</div>
