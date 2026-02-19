<script lang="ts">
	import type { ChartDataPoint } from '$lib/types/dashboard';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		data: ChartDataPoint[];
		title: string;
	}

	let { data, title }: Props = $props();

	let selectedPeriod = $state('7d');

	const periods = [
		{ key: '7d', label: () => m.dash_overview_period_7d() },
		{ key: '30d', label: () => m.dash_overview_period_30d() },
		{ key: '90d', label: () => m.dash_overview_period_90d() }
	];

	// Chart dimensions
	const W = 600;
	const H = 200;
	const PAD_LEFT = 0;
	const PAD_RIGHT = 0;
	const PAD_TOP = 10;
	const PAD_BOTTOM = 30;
	const chartW = W - PAD_LEFT - PAD_RIGHT;
	const chartH = H - PAD_TOP - PAD_BOTTOM;

	const maxImpressions = $derived(Math.max(...data.map((d) => d.impressions)));
	const maxEngagement = $derived(Math.max(...data.map((d) => d.engagement)));

	function scaleY(val: number, max: number): number {
		return PAD_TOP + chartH - (val / max) * chartH;
	}

	function scaleX(i: number): number {
		return PAD_LEFT + (i / (data.length - 1)) * chartW;
	}

	const impressionPoints = $derived(
		data.map((d, i) => `${scaleX(i)},${scaleY(d.impressions, maxImpressions)}`).join(' ')
	);

	const impressionArea = $derived(
		`${scaleX(0)},${PAD_TOP + chartH} ${impressionPoints} ${scaleX(data.length - 1)},${PAD_TOP + chartH}`
	);

	const engagementPoints = $derived(
		data.map((d, i) => `${scaleX(i)},${scaleY(d.engagement, maxEngagement)}`).join(' ')
	);

	const engagementArea = $derived(
		`${scaleX(0)},${PAD_TOP + chartH} ${engagementPoints} ${scaleX(data.length - 1)},${PAD_TOP + chartH}`
	);

	const gridLines = $derived(
		[0.25, 0.5, 0.75].map((frac) => PAD_TOP + chartH * (1 - frac))
	);

	const xLabels = $derived(
		data.map((d, i) => ({
			x: scaleX(i),
			label: d.label
		}))
	);
</script>

<div
	class="overflow-hidden rounded-[14px] border transition-all duration-300"
	style="border-color: var(--border-subtle); background: var(--bg-surface); box-shadow: var(--card-shadow);"
>
	<!-- Header row -->
	<div class="flex items-center justify-between px-5 pt-5 pb-3">
		<span class="text-[0.95rem] font-bold" style="color: var(--text-main);">{title}</span>
		<div class="flex gap-1 rounded-lg p-[3px]" style="background: var(--toggle-bg);">
			{#each periods as period}
				<button
					class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200"
					class:active-tab={selectedPeriod === period.key}
					class:inactive-tab={selectedPeriod !== period.key}
					onclick={() => (selectedPeriod = period.key)}
				>
					{period.label()}
				</button>
			{/each}
		</div>
	</div>

	<!-- Chart area -->
	<div class="px-5 pb-3">
		<svg viewBox="0 0 {W} {H}" class="w-full" style="height: 200px;" preserveAspectRatio="none">
			<!-- Grid lines -->
			{#each gridLines as y}
				<line
					x1={PAD_LEFT}
					y1={y}
					x2={W - PAD_RIGHT}
					y2={y}
					stroke="var(--border-subtle)"
					stroke-width="1"
					stroke-dasharray="4,4"
					opacity="0.5"
				/>
			{/each}

			<!-- Impressions area fill -->
			<polyline
				points={impressionArea}
				fill="var(--c-electric)"
				stroke="none"
				opacity="0.08"
			/>
			<!-- Impressions line -->
			<polyline
				points={impressionPoints}
				fill="none"
				stroke="var(--c-electric)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>

			<!-- Engagement area fill -->
			<polyline
				points={engagementArea}
				fill="var(--c-secondary)"
				stroke="none"
				opacity="0.08"
			/>
			<!-- Engagement line -->
			<polyline
				points={engagementPoints}
				fill="none"
				stroke="var(--c-secondary)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>

			<!-- X-axis labels -->
			{#each xLabels as { x, label }}
				<text
					{x}
					y={H - 4}
					text-anchor="middle"
					class="font-mono"
					style="font-size: 10px; fill: var(--text-muted);"
				>
					{label}
				</text>
			{/each}
		</svg>
	</div>

	<!-- Legend -->
	<div class="flex items-center gap-5 border-t px-5 py-3" style="border-color: var(--border-subtle);">
		<div class="flex items-center gap-2">
			<span class="inline-block h-2 w-2 rounded-full" style="background: var(--c-electric);"></span>
			<span class="text-xs" style="color: var(--text-dim);">{m.dash_overview_impressions_label()}</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="inline-block h-2 w-2 rounded-full" style="background: var(--c-secondary);"></span>
			<span class="text-xs" style="color: var(--text-dim);">{m.dash_overview_engagement_label()}</span>
		</div>
	</div>
</div>

<style>
	.active-tab {
		background: var(--bg-sidebar-active);
		color: var(--c-electric);
	}
	.inactive-tab {
		color: var(--text-dim);
		background: transparent;
	}
	.inactive-tab:hover {
		color: var(--text-main);
	}
</style>
