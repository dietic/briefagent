<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages.js';
	import { Check } from 'lucide-svelte';

	let { children, data } = $props();

	const steps = [
		{ path: '/dashboard/onboarding/quick-start', label: () => m.onb_stepper_quick_start(), number: 1 },
		{ path: '/dashboard/onboarding/deep-brief', label: () => m.onb_stepper_deep_brief(), number: 2 },
		{ path: '/dashboard/onboarding/assets', label: () => m.onb_stepper_assets(), number: 3 }
	];

	const stepMap: Record<string, number> = {
		quick_start: 1,
		deep_brief: 2,
		assets: 3,
		complete: 4
	};

	let currentPathStep = $derived(
		steps.findIndex((s) => $page.url.pathname.startsWith(s.path)) + 1 || 1
	);

	let completedUpTo = $derived(
		data.product?.onboardingStep ? (stepMap[data.product.onboardingStep] ?? 1) : 1
	);
</script>

<div class="mx-auto max-w-3xl px-6 py-10">
	<!-- Top bar: skip link -->
	<div class="flex justify-end mb-6">
		<a
			href="/dashboard"
			class="text-[0.8rem] font-medium transition-colors duration-150"
			style="color: var(--text-muted);"
			onmouseenter={(e) => (e.currentTarget.style.color = 'var(--c-electric)')}
			onmouseleave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
		>
			{m.onb_quick_skip()}
		</a>
	</div>

	<!-- Stepper indicator -->
	<div class="mb-10 flex items-center justify-center gap-3">
		{#each steps as step}
			{@const isCompleted = completedUpTo > step.number}
			{@const isCurrent = currentPathStep === step.number}
			<a
				href={step.path}
				class="flex items-center gap-2.5 group"
			>
				<div
					class="flex items-center justify-center w-9 h-9 rounded-full text-[0.8rem] font-bold transition-all duration-200"
					style="
						background: {isCompleted || isCurrent ? 'var(--c-electric)' : 'var(--bg-surface-alt)'};
						color: {isCompleted || isCurrent ? 'white' : 'var(--text-muted)'};
						box-shadow: {isCurrent ? '0 0 0 3px var(--c-electric-glow)' : 'none'};
					"
				>
					{#if isCompleted}
						<Check class="w-4 h-4" />
					{:else}
						{step.number}
					{/if}
				</div>
				<span
					class="hidden sm:block text-[0.8rem] font-medium transition-colors duration-150"
					style="color: {isCompleted || isCurrent ? 'var(--text-main)' : 'var(--text-muted)'};"
				>
					{step.label()}
				</span>
			</a>
			{#if step.number < steps.length}
				<div
					class="w-10 h-[2px] rounded-full transition-colors duration-200"
					style="background: {completedUpTo > step.number ? 'var(--c-electric)' : 'var(--border-subtle)'};"
				></div>
			{/if}
		{/each}
	</div>

	{@render children()}
</div>
