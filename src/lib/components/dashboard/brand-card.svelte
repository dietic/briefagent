<script lang="ts">
	import type { BrandProfile } from '$lib/types/dashboard';
	import RadialChart from './radial-chart.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { profile }: { profile: BrandProfile } = $props();
</script>

<div
	class="rounded-[14px] border p-6 transition-shadow duration-200 hover:shadow-lg"
	style="background: var(--bg-surface); border-color: var(--border-subtle); box-shadow: var(--card-shadow);"
>
	<!-- Top: Logo + Name -->
	<div class="flex items-center gap-4 mb-5">
		<div
			class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-extrabold shrink-0"
			style="background: linear-gradient(135deg, var(--c-electric), var(--c-tertiary));"
		>
			{profile.logoInitials}
		</div>
		<div>
			<div class="text-xl font-extrabold tracking-tight" style="color: var(--text-main);">
				{profile.name}
			</div>
			<div class="text-sm" style="color: var(--text-dim);">{profile.tagline}</div>
		</div>
	</div>

	<!-- Radial score -->
	<div class="flex justify-center mb-5">
		<RadialChart mode="score" value={profile.healthScore} color="var(--c-electric)" size={130} />
	</div>
	<div class="text-center text-[0.75rem] font-bold mb-4" style="color: var(--text-main);">
		{m.dash_brand_health_score()}
	</div>

	<!-- Tags -->
	<div class="flex flex-wrap gap-2">
		<span
			class="text-xs px-3 py-1 rounded-full"
			style="background: var(--border-subtle); color: var(--text-dim);"
		>
			{profile.industry}
		</span>
		<span
			class="text-xs px-3 py-1 rounded-full"
			style="background: var(--border-subtle); color: var(--text-dim);"
		>
			{profile.audience}
		</span>
		{#each profile.tone as t}
			<span
				class="text-xs px-3 py-1 rounded-full"
				style="background: var(--border-subtle); color: var(--text-dim);"
			>
				{t}
			</span>
		{/each}
	</div>
</div>
