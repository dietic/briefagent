<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Lightbulb, Palette, PenTool, Send, Brain, ShieldCheck } from 'lucide-svelte';
	import { inview } from 'svelte-inview';
	import { scrollRevealConfig, staggerDelay, revealClasses } from '$lib/utils/animations';

	let isVisible = $state(false);

	const features = [
		{
			icon: Lightbulb,
			title: () => m.landing_features_ai_strategy_title(),
			description: () => m.landing_features_ai_strategy_description(),
			accent: 'from-primary-500/20 to-primary-600/5',
			iconBg: 'bg-primary-500/12 text-primary-400',
			span: 'md:col-span-2'
		},
		{
			icon: Palette,
			title: () => m.landing_features_ai_visuals_title(),
			description: () => m.landing_features_ai_visuals_description(),
			accent: 'from-accent-500/15 to-accent-600/5',
			iconBg: 'bg-accent-500/12 text-accent-400',
			span: ''
		},
		{
			icon: PenTool,
			title: () => m.landing_features_optimized_copy_title(),
			description: () => m.landing_features_optimized_copy_description(),
			accent: 'from-tertiary-500/15 to-tertiary-600/5',
			iconBg: 'bg-tertiary-500/12 text-tertiary-400',
			span: ''
		},
		{
			icon: Send,
			title: () => m.landing_features_publishing_title(),
			description: () => m.landing_features_publishing_description(),
			accent: 'from-success/15 to-success/5',
			iconBg: 'bg-success/12 text-success',
			span: 'md:col-span-2'
		},
		{
			icon: Brain,
			title: () => m.landing_features_brand_understanding_title(),
			description: () => m.landing_features_brand_understanding_description(),
			accent: 'from-accent-400/15 to-accent-500/5',
			iconBg: 'bg-accent-400/12 text-accent-300',
			span: ''
		},
		{
			icon: ShieldCheck,
			title: () => m.landing_features_review_title(),
			description: () => m.landing_features_review_description(),
			accent: 'from-primary-500/15 to-primary-600/5',
			iconBg: 'bg-primary-500/12 text-primary-400',
			span: 'md:col-span-2'
		}
	];
</script>

<section id="features" class="relative bg-neutral-950 py-24 md:py-36 overflow-hidden">
	<!-- Subtle ambient glow -->
	<div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/[0.04] rounded-full blur-[120px] pointer-events-none"></div>

	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<!-- Section header -->
		<div class="text-center max-w-3xl mx-auto mb-16 md:mb-20">
			<p class="text-sm font-medium text-primary-400 tracking-wider uppercase mb-4">Features</p>
			<h2 class="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
				{m.landing_features_title()}
			</h2>
			<p class="mt-5 text-lg text-neutral-400 leading-relaxed">
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
					<div class="group relative h-full rounded-2xl bg-neutral-900/40 border border-white/[0.06] p-6 md:p-7 transition-all duration-300 hover:border-white/[0.12] hover:bg-neutral-900/60 overflow-hidden">
						<!-- Gradient overlay on hover -->
						<div class="absolute inset-0 bg-gradient-to-br {feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

						<div class="relative z-10">
							<!-- Icon -->
							<div class="w-10 h-10 rounded-xl {feature.iconBg} flex items-center justify-center mb-4">
								<feature.icon class="w-5 h-5" />
							</div>

							<!-- Title -->
							<h3 class="font-display font-semibold text-lg text-white mb-2">
								{feature.title()}
							</h3>

							<!-- Description -->
							<p class="text-neutral-400 text-sm leading-relaxed">
								{feature.description()}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
