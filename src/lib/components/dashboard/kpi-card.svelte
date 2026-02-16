<script lang="ts">
	interface Props {
		label: string;
		value: string;
		unit?: string;
		trend: { direction: 'up' | 'down'; value: string };
		sparkline: number[];
		accentColor: string;
		delay?: number;
	}

	let { label, value, unit, trend, sparkline, accentColor, delay = 0 }: Props = $props();

	const sparklinePoints = $derived(() => {
		const width = 72;
		const height = 28;
		const padding = 2;
		const min = Math.min(...sparkline);
		const max = Math.max(...sparkline);
		const range = max - min || 1;
		const step = width / (sparkline.length - 1);

		return sparkline
			.map((val, i) => {
				const x = i * step;
				const y = height - padding - ((val - min) / range) * (height - padding * 2);
				return `${x},${y}`;
			})
			.join(' ');
	});

	const areaPoints = $derived(() => {
		const base = sparklinePoints();
		return `0,28 ${base} 72,28`;
	});
</script>

<div
	class="group relative overflow-hidden rounded-[14px] border p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-default"
	style="
		border-color: var(--border-subtle);
		background: var(--bg-surface);
		box-shadow: var(--card-shadow);
		animation: dash-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
		animation-delay: {delay}s;
	"
>
	<!-- Top accent line on hover -->
	<div
		class="absolute top-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		style="background: {accentColor};"
	></div>

	<!-- Label -->
	<div class="mb-3 text-xs font-normal" style="color: var(--text-dim);">
		{label}
	</div>

	<!-- Value -->
	<div class="mb-2 text-[1.85rem] font-extrabold leading-none tracking-tight" style="color: var(--text-main);">
		{value}{#if unit}<span class="ml-0.5 text-sm font-normal" style="color: var(--text-dim);">{unit}</span>{/if}
	</div>

	<!-- Footer: trend + sparkline -->
	<div class="flex items-center justify-between">
		<!-- Trend badge -->
		<span
			class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.7rem] font-bold"
			style="
				color: {trend.direction === 'up' ? 'var(--positive)' : 'var(--negative)'};
				background: {trend.direction === 'up'
					? 'rgba(52,211,153,0.1)'
					: 'rgba(248,113,113,0.1)'};
			"
		>
			{trend.direction === 'up' ? '\u25B2' : '\u25BC'}
			{trend.value}
		</span>

		<!-- SVG Sparkline -->
		<svg class="h-[28px] w-[72px]" viewBox="0 0 72 28">
			<polyline
				points={areaPoints()}
				fill={accentColor}
				stroke="none"
				opacity="0.08"
			/>
			<polyline
				points={sparklinePoints()}
				fill="none"
				stroke={accentColor}
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>
</div>
