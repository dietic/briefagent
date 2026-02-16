<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import KpiCard from '$lib/components/dashboard/kpi-card.svelte';
	import StatCard from '$lib/components/dashboard/stat-card.svelte';
	import ChartSection from '$lib/components/dashboard/chart-section.svelte';
	import ActivityFeed from '$lib/components/dashboard/activity-feed.svelte';
	import ScheduleCard from '$lib/components/dashboard/schedule-card.svelte';
	import {
		kpiCards,
		chartData,
		activityItems,
		scheduleItems,
		quickStats
	} from '$lib/data/mock-overview.js';

	const colorMap: Record<string, string> = {
		electric: 'var(--c-electric)',
		secondary: 'var(--c-secondary)',
		tertiary: 'var(--c-tertiary)',
		positive: 'var(--positive)'
	};

	const kpiLabelMap: Record<string, () => string> = {
		dash_kpi_total_posts: () => m.dash_kpi_total_posts(),
		dash_kpi_engagement_rate: () => m.dash_kpi_engagement_rate(),
		dash_kpi_impressions: () => m.dash_kpi_impressions(),
		dash_kpi_click_through: () => m.dash_kpi_click_through()
	};

	const statLabelMap: Record<string, () => string> = {
		dash_overview_stat_posts_week: () => m.dash_overview_stat_posts_week(),
		dash_overview_stat_best_day: () => m.dash_overview_stat_best_day(),
		dash_overview_stat_top_platform: () => m.dash_overview_stat_top_platform()
	};
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

<!-- KPI cards -->
<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
	{#each kpiCards as card, i}
		<KpiCard
			label={kpiLabelMap[card.labelKey]()}
			value={card.value}
			unit={card.unit}
			trend={card.trend}
			sparkline={card.sparkline}
			accentColor={colorMap[card.color]}
			delay={i * 0.05}
		/>
	{/each}
</div>

<!-- Chart + Quick Stats -->
<div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3" style="animation: dash-fade-up 0.5s ease-out 0.15s both;">
	<div class="lg:col-span-2">
		<ChartSection data={chartData} title={m.dash_overview_performance()} />
	</div>
	<div class="flex flex-col gap-3">
		<div class="mb-1 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
			{m.dash_overview_quick_stats()}
		</div>
		{#each quickStats as stat}
			<StatCard
				label={statLabelMap[stat.labelKey]()}
				value={stat.value}
				sublabel={stat.sublabel}
			/>
		{/each}
	</div>
</div>

<!-- Activity Feed + Schedule -->
<div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2" style="animation: dash-fade-up 0.5s ease-out 0.25s both;">
	<ActivityFeed items={activityItems} />
	<ScheduleCard items={scheduleItems} />
</div>
