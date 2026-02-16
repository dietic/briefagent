<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { inview } from 'svelte-inview';
	import { scrollRevealConfig, staggerDelay, revealClasses } from '$lib/utils/animations';

	let isVisible = $state(false);

	const steps = [
		{
			number: '01',
			emoji: '📋',
			title: () => m.landing_how_step1_title(),
			description: () => m.landing_how_step1_description(),
			gradient: 'from-primary-500 to-[color-mix(in_srgb,#06b6d4_60%,#ec4899)]',
			shadow: 'shadow-primary-500/20'
		},
		{
			number: '02',
			emoji: '✨',
			title: () => m.landing_how_step2_title(),
			description: () => m.landing_how_step2_description(),
			gradient: 'from-accent-500 to-[color-mix(in_srgb,#f97316_60%,#ec4899)]',
			shadow: 'shadow-accent-500/20'
		},
		{
			number: '03',
			emoji: '🚀',
			title: () => m.landing_how_step3_title(),
			description: () => m.landing_how_step3_description(),
			gradient: 'from-primary-500 to-[color-mix(in_srgb,#06b6d4_60%,#f97316)]',
			shadow: 'shadow-primary-500/20'
		}
	];
</script>

<section id="how-it-works" class="relative py-24 md:py-36 overflow-hidden" style="background: var(--bg-surface-alt); transition: background 0.4s;">
	<!-- Ambient glow -->
	<div class="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none" style="background: color-mix(in srgb, var(--c-secondary) 3%, transparent);"></div>
	<div class="absolute top-0 left-0 w-[400px] h-[300px] rounded-full blur-[120px] pointer-events-none" style="background: var(--c-electric-glow);"></div>

	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<!-- Section header -->
		<div class="text-center max-w-3xl mx-auto mb-16 md:mb-20">
			<p class="font-mono text-[0.7rem] font-medium tracking-[0.15em] uppercase mb-3" style="color: var(--c-electric);">Process</p>
			<h2 class="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-[-0.03em]" style="line-height: 1.05; color: var(--headline-color);">
				{m.landing_how_title()}
			</h2>
			<p class="mt-5 text-base leading-relaxed" style="color: var(--text-dim);">
				{m.landing_how_subtitle()}
			</p>
		</div>

		<!-- Steps -->
		<div
			class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative"
			use:inview={scrollRevealConfig}
			oninview_enter={() => (isVisible = true)}
		>
			<!-- Connecting line (desktop only) -->
			<div class="hidden md:block absolute top-[2.5rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px">
				<div class="w-full h-full bg-gradient-to-r from-primary-500/30 via-accent-500/20 to-primary-500/30"></div>
			</div>

			{#each steps as step, i}
				<div
					class="relative transition-all duration-700 ease-out {revealClasses(isVisible)}"
					style="transition-delay: {staggerDelay(i, 200)}ms"
				>
					<div class="relative rounded-2xl border border-[var(--border-subtle)] p-7 md:p-8 text-center hover:border-[var(--border-hover)] transition-all duration-300" style="background: var(--bg-surface);">
						<!-- Step number -->
						<div class="relative z-10 mx-auto w-[3.25rem] h-[3.25rem] rounded-[14px] bg-gradient-to-br {step.gradient} flex items-center justify-center shadow-lg {step.shadow}">
							<span class="text-white font-display font-bold text-sm">{step.number}</span>
						</div>

						<div class="mt-5 flex justify-center text-[1.2rem]">
							{step.emoji}
						</div>

						<h3 class="font-display font-bold text-[1.1rem] mt-3" style="color: var(--text-main);">
							{step.title()}
						</h3>

						<p class="text-[0.85rem] mt-3 leading-relaxed max-w-[280px] mx-auto" style="color: var(--text-dim);">
							{step.description()}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
