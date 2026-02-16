<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { ClipboardEdit, Sparkles, Rocket } from 'lucide-svelte';
	import { inview } from 'svelte-inview';
	import { scrollRevealConfig, staggerDelay, revealClasses } from '$lib/utils/animations';

	let isVisible = $state(false);

	const steps = [
		{
			number: '01',
			icon: ClipboardEdit,
			title: () => m.landing_how_step1_title(),
			description: () => m.landing_how_step1_description(),
			accent: 'primary'
		},
		{
			number: '02',
			icon: Sparkles,
			title: () => m.landing_how_step2_title(),
			description: () => m.landing_how_step2_description(),
			accent: 'accent'
		},
		{
			number: '03',
			icon: Rocket,
			title: () => m.landing_how_step3_title(),
			description: () => m.landing_how_step3_description(),
			accent: 'primary'
		}
	];
</script>

<section id="how-it-works" class="relative bg-neutral-900/40 py-24 md:py-36 overflow-hidden">
	<!-- Ambient glow -->
	<div class="absolute bottom-0 right-0 w-[500px] h-[400px] bg-accent-500/[0.03] rounded-full blur-[140px] pointer-events-none"></div>
	<div class="absolute top-0 left-0 w-[400px] h-[300px] bg-primary-500/[0.04] rounded-full blur-[120px] pointer-events-none"></div>

	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<!-- Section header -->
		<div class="text-center max-w-3xl mx-auto mb-16 md:mb-20">
			<p class="text-sm font-medium text-primary-400 tracking-wider uppercase mb-4">Process</p>
			<h2 class="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
				{m.landing_how_title()}
			</h2>
			<p class="mt-5 text-lg text-neutral-400 leading-relaxed">
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
			<div class="hidden md:block absolute top-[3.25rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px">
				<div class="w-full h-full bg-gradient-to-r from-primary-500/30 via-accent-500/20 to-primary-500/30"></div>
			</div>

			{#each steps as step, i}
				<div
					class="relative transition-all duration-700 ease-out {revealClasses(isVisible)}"
					style="transition-delay: {staggerDelay(i, 200)}ms"
				>
					<div class="relative rounded-2xl bg-neutral-900/40 border border-white/[0.06] p-7 md:p-8 text-center hover:border-white/[0.10] transition-all duration-300">
						<!-- Step number -->
						<div class="relative z-10 mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br {step.accent === 'primary' ? 'from-primary-500 to-primary-600' : 'from-accent-400 to-accent-500'} flex items-center justify-center shadow-lg {step.accent === 'primary' ? 'shadow-primary-500/20' : 'shadow-accent-500/20'}">
							<span class="text-white font-display font-bold text-sm">{step.number}</span>
						</div>

						<!-- Icon -->
						<div class="mt-5 flex justify-center">
							<step.icon class="w-5 h-5 {step.accent === 'primary' ? 'text-primary-400' : 'text-accent-400'}" />
						</div>

						<!-- Title -->
						<h3 class="font-display font-semibold text-xl text-white mt-3">
							{step.title()}
						</h3>

						<!-- Description -->
						<p class="text-neutral-400 text-sm mt-3 leading-relaxed max-w-xs mx-auto">
							{step.description()}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
