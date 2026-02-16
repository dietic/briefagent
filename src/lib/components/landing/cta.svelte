<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/ui/button.svelte';
	import { ArrowRight } from 'lucide-svelte';
	import { inview } from 'svelte-inview';
	import { scrollRevealConfig, revealClasses } from '$lib/utils/animations';

	let isVisible = $state(false);
</script>

<section class="relative overflow-hidden py-24 md:py-36" style="background: var(--bg-page); transition: background 0.4s;">
	<!-- Background: gradient wash -->
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[100px]" style="background: radial-gradient(ellipse at center, var(--c-electric-glow), color-mix(in srgb, var(--c-secondary) 3%, transparent) 50%, transparent 70%);"></div>
	</div>

	<div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div
			class="text-center transition-all duration-700 ease-out {revealClasses(isVisible)}"
			use:inview={scrollRevealConfig}
			oninview_enter={() => (isVisible = true)}
		>
			<div class="relative rounded-3xl border border-[var(--border-subtle)] p-10 md:px-12 md:py-14" style="background: var(--bg-surface);">
				<!-- Inner glow -->
				<div class="absolute inset-0 bg-gradient-to-b from-primary-500/[0.04] to-transparent rounded-3xl pointer-events-none"></div>

				<div class="relative z-10">
					<h2 class="font-display font-extrabold tracking-[-0.03em] leading-tight" style="font-size: clamp(1.6rem, 3.5vw, 2.4rem); color: var(--headline-color);">
						{m.landing_cta_title()}
					</h2>
					<p class="text-lg mt-5 max-w-[500px] mx-auto leading-relaxed" style="color: var(--text-dim);">
						{m.landing_cta_description()}
					</p>
					<div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button variant="primary" size="lg" href="/signup">
							{m.landing_cta_button()}
							<ArrowRight class="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
