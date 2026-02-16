<script lang="ts">
	type ScoreProps = {
		mode: 'score';
		value: number;
		max?: number;
		color: string;
		size?: number;
	};
	type DonutSegment = {
		percentage: number;
		color: string;
		label: string;
	};
	type DonutProps = {
		mode: 'donut';
		segments: DonutSegment[];
		size?: number;
	};

	let props: ScoreProps | DonutProps = $props();

	const radius = 55;
	const circumference = 2 * Math.PI * radius;

	// Score mode reactive
	let animatedOffset = $state(circumference);

	$effect(() => {
		if (props.mode === 'score') {
			const max = props.max ?? 100;
			const pct = Math.min(props.value / max, 1);
			// Animate after mount
			requestAnimationFrame(() => {
				animatedOffset = circumference - circumference * pct;
			});
		}
	});

	// Donut mode: compute segment dash arrays
	let donutSegments = $derived.by(() => {
		if (props.mode !== 'donut') return [];
		const gap = 3;
		let offset = 0;
		return props.segments.map((seg) => {
			const arcLen = (seg.percentage / 100) * circumference;
			const result = {
				color: seg.color,
				label: seg.label,
				percentage: seg.percentage,
				dasharray: `${Math.max(arcLen - gap, 0)} ${circumference - arcLen + gap}`,
				dashoffset: -offset
			};
			offset += arcLen;
			return result;
		});
	});
</script>

{#if props.mode === 'score'}
	{@const size = props.size ?? 120}
	<div class="flex flex-col items-center">
		<div class="relative" style="width: {size}px; height: {size}px;">
			<svg viewBox="0 0 140 140" class="w-full h-full">
				<!-- Background circle -->
				<circle
					cx="70"
					cy="70"
					r={radius}
					fill="none"
					stroke="var(--border-subtle)"
					stroke-width="6"
				/>
				<!-- Foreground arc -->
				<circle
					cx="70"
					cy="70"
					r={radius}
					fill="none"
					stroke={props.color}
					stroke-width="7"
					stroke-linecap="round"
					stroke-dasharray={circumference}
					stroke-dashoffset={animatedOffset}
					style="
						transform: rotate(-90deg);
						transform-origin: center;
						transition: stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1);
						filter: drop-shadow(0 0 6px {props.color});
					"
				/>
			</svg>
			<!-- Center text -->
			<div class="absolute inset-0 flex flex-col items-center justify-center">
				<span class="text-[2rem] font-extrabold tracking-tighter leading-none" style="color: var(--text-main);">
					{props.value}
				</span>
				<span class="text-xs" style="font-family: var(--font-mono); color: var(--text-muted);">
					/{props.max ?? 100}
				</span>
			</div>
		</div>
	</div>
{:else}
	{@const size = props.size ?? 160}
	<div class="flex items-center gap-8 justify-center">
		<div class="relative shrink-0" style="width: {size}px; height: {size}px;">
			<svg viewBox="0 0 140 140" class="w-full h-full" style="transform: rotate(-90deg);">
				{#each donutSegments as seg}
					<circle
						cx="70"
						cy="70"
						r={radius}
						fill="none"
						stroke={seg.color}
						stroke-width="24"
						stroke-linecap="butt"
						stroke-dasharray={seg.dasharray}
						stroke-dashoffset={seg.dashoffset}
						style="transition: stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);"
					/>
				{/each}
			</svg>
			<div class="absolute inset-0 flex items-center justify-center text-[0.85rem] font-bold" style="color: var(--text-main);">
				100%
			</div>
		</div>
		<!-- Legend -->
		<div class="flex flex-col gap-2.5">
			{#each donutSegments as seg}
				<div class="flex items-center gap-2.5">
					<div class="w-2.5 h-2.5 rounded-sm shrink-0" style="background: {seg.color};"></div>
					<span class="text-[0.8rem] font-semibold" style="color: var(--text-main);">{seg.label}</span>
					<span class="ml-auto text-[0.7rem]" style="font-family: var(--font-mono); color: var(--text-dim);">
						{seg.percentage}%
					</span>
				</div>
			{/each}
		</div>
	</div>
{/if}
