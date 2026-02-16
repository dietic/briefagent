<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/ui/button.svelte';
	import { ArrowRight } from 'lucide-svelte';
	import { inview } from 'svelte-inview';
	import { scrollRevealConfig, revealClasses } from '$lib/utils/animations';

	let isVisible = $state(false);
</script>

<section class="relative overflow-hidden py-24 md:py-36 bg-neutral-950">
	<!-- Background: gradient wash -->
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgb(6_182_212/0.08),rgb(249_115_22/0.03)_50%,transparent_70%)] rounded-full blur-[100px]"></div>
	</div>

	<div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div
			class="text-center transition-all duration-700 ease-out {revealClasses(isVisible)}"
			use:inview={scrollRevealConfig}
			oninview_enter={() => (isVisible = true)}
		>
			<!-- CTA card -->
			<div class="relative rounded-3xl bg-neutral-900/50 border border-white/[0.06] backdrop-blur-sm p-10 md:p-16">
				<!-- Inner glow -->
				<div class="absolute inset-0 bg-gradient-to-b from-primary-500/[0.04] to-transparent rounded-3xl pointer-events-none"></div>

				<div class="relative z-10">
					<h2 class="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight tracking-tight">
						{m.landing_cta_title()}
					</h2>
					<p class="text-lg text-neutral-400 mt-5 max-w-2xl mx-auto leading-relaxed">
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
