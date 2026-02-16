<script lang="ts">
	let {
		value,
		max = 100,
		color = 'var(--c-electric)',
		showLabel = false,
		label = ''
	}: {
		value: number;
		max?: number;
		color?: string;
		showLabel?: boolean;
		label?: string;
	} = $props();

	let pct = $derived(Math.min(Math.round((value / max) * 100), 100));
	let animatedWidth = $state(0);

	$effect(() => {
		requestAnimationFrame(() => {
			animatedWidth = pct;
		});
	});
</script>

<div class="w-full">
	{#if showLabel}
		<div class="flex items-center justify-between mb-1">
			<span class="text-xs" style="color: var(--text-dim);">{label}</span>
			<span class="text-xs font-medium" style="font-family: var(--font-mono); color: var(--text-main);">
				{pct}%
			</span>
		</div>
	{/if}
	<div class="h-2 rounded-full overflow-hidden" style="background: var(--border-subtle);">
		<div
			class="h-full rounded-full"
			style="
				width: {animatedWidth}%;
				background: {color};
				transition: width 0.6s ease-out;
			"
		></div>
	</div>
</div>
