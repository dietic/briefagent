<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { inview } from 'svelte-inview';
	import { scrollRevealConfig, staggerDelay, revealClasses } from '$lib/utils/animations';

	let isVisible = $state(false);

	const features = [
		{
			emoji: '💡',
			title: () => m.landing_features_ai_strategy_title(),
			description: () => m.landing_features_ai_strategy_description(),
			accent: 'from-primary-500/20 to-primary-600/5',
			iconBg: 'background: color-mix(in srgb, var(--c-electric) 12%, transparent)',
			span: 'md:col-span-2'
		},
		{
			emoji: '🎨',
			title: () => m.landing_features_ai_visuals_title(),
			description: () => m.landing_features_ai_visuals_description(),
			accent: 'from-accent-500/15 to-accent-600/5',
			iconBg: 'background: color-mix(in srgb, var(--c-secondary) 12%, transparent)',
			span: ''
		},
		{
			emoji: '✍️',
			title: () => m.landing_features_optimized_copy_title(),
			description: () => m.landing_features_optimized_copy_description(),
			accent: 'from-tertiary-500/15 to-tertiary-600/5',
			iconBg: 'background: color-mix(in srgb, var(--c-tertiary) 12%, transparent)',
			span: ''
		},
		{
			emoji: '🚀',
			title: () => m.landing_features_publishing_title(),
			description: () => m.landing_features_publishing_description(),
			accent: 'from-success/15 to-success/5',
			iconBg: 'background: color-mix(in srgb, #34d399 12%, transparent)',
			span: 'md:col-span-2'
		},
		{
			emoji: '🧠',
			title: () => m.landing_features_brand_understanding_title(),
			description: () => m.landing_features_brand_understanding_description(),
			accent: 'from-accent-400/15 to-accent-500/5',
			iconBg: 'background: color-mix(in srgb, var(--c-secondary) 12%, transparent)',
			span: ''
		},
		{
			emoji: '🛡️',
			title: () => m.landing_features_review_title(),
			description: () => m.landing_features_review_description(),
			accent: 'from-primary-500/15 to-primary-600/5',
			iconBg: 'background: color-mix(in srgb, var(--c-electric) 12%, transparent)',
			span: 'md:col-span-2'
		}
	];
</script>

<section id="features" class="relative py-24 md:py-36 overflow-hidden" style="background: var(--bg-page); transition: background 0.4s;">
	<!-- Subtle ambient glow -->
	<div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none" style="background: var(--c-electric-glow);"></div>

	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<!-- Section header -->
		<div class="text-center max-w-3xl mx-auto mb-16 md:mb-20">
			<p class="font-mono text-[0.7rem] font-medium tracking-[0.15em] uppercase mb-3" style="color: var(--c-electric);">Features</p>
			<h2 class="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-[-0.03em]" style="line-height: 1.05; color: var(--headline-color);">
				{m.landing_features_title()}
			</h2>
			<p class="mt-5 text-base leading-relaxed" style="color: var(--text-dim);">
				{m.landing_features_subtitle()}
			</p>
		</div>

		<!-- Bento grid -->
		<div
			class="grid grid-cols-1 md:grid-cols-3 gap-4"
			use:inview={scrollRevealConfig}
			oninview_enter={() => (isVisible = true)}
		>
			{#each features as feature, i}
				<div
					class="relative transition-all duration-700 ease-out {revealClasses(isVisible)} {feature.span}"
					style="transition-delay: {staggerDelay(i, 100)}ms"
				>
					<div class="group relative h-full rounded-2xl border border-[var(--border-subtle)] p-6 md:p-7 transition-all duration-300 hover:border-[var(--border-hover)] hover:-translate-y-0.5 overflow-hidden" style="background: var(--bg-surface);">
						<!-- Gradient overlay on hover -->
						<div class="absolute inset-0 bg-gradient-to-br {feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

						<div class="relative z-10">
							<div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-[1.2rem]" style={feature.iconBg}>
								{feature.emoji}
							</div>
							<h3 class="font-display font-bold text-base mb-2" style="color: var(--text-main);">
								{feature.title()}
							</h3>
							<p class="text-[0.85rem] leading-relaxed" style="color: var(--text-dim);">
								{feature.description()}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
