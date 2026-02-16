<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Check, ArrowRight } from 'lucide-svelte';
	import { inview } from 'svelte-inview';
	import { scrollRevealConfig, staggerDelay, revealClasses } from '$lib/utils/animations';

	let isVisible = $state(false);

	const tiers = [
		{
			name: () => m.landing_pricing_free_name(),
			price: () => m.landing_pricing_free_price(),
			futurePrice: null,
			description: () => m.landing_pricing_free_description(),
			features: [
				() => m.landing_pricing_free_feature_1(),
				() => m.landing_pricing_free_feature_2(),
				() => m.landing_pricing_free_feature_3(),
				() => m.landing_pricing_free_feature_4()
			],
			highlighted: false,
			buttonVariant: 'outline' as const
		},
		{
			name: () => m.landing_pricing_pro_name(),
			price: () => m.landing_pricing_pro_price(),
			futurePrice: '$19/mo',
			description: () => m.landing_pricing_pro_description(),
			features: [
				() => m.landing_pricing_pro_feature_1(),
				() => m.landing_pricing_pro_feature_2(),
				() => m.landing_pricing_pro_feature_3(),
				() => m.landing_pricing_pro_feature_4(),
				() => m.landing_pricing_pro_feature_5()
			],
			highlighted: true,
			buttonVariant: 'primary' as const
		},
		{
			name: () => m.landing_pricing_agency_name(),
			price: () => m.landing_pricing_agency_price(),
			futurePrice: '$49/mo',
			description: () => m.landing_pricing_agency_description(),
			features: [
				() => m.landing_pricing_agency_feature_1(),
				() => m.landing_pricing_agency_feature_2(),
				() => m.landing_pricing_agency_feature_3(),
				() => m.landing_pricing_agency_feature_4(),
				() => m.landing_pricing_agency_feature_5()
			],
			highlighted: false,
			buttonVariant: 'outline' as const
		}
	];
</script>

<section id="pricing" class="relative bg-neutral-950 py-24 md:py-36 overflow-hidden">
	<!-- Ambient glow -->
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary-500/[0.04] rounded-full blur-[150px] pointer-events-none"></div>

	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<!-- Section header -->
		<div class="text-center max-w-3xl mx-auto mb-16 md:mb-20">
			<p class="text-sm font-medium text-primary-400 tracking-wider uppercase mb-4">Pricing</p>
			<h2 class="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
				{m.landing_pricing_title()}
			</h2>
			<p class="mt-5 text-lg text-neutral-400 leading-relaxed">
				{m.landing_pricing_subtitle()}
			</p>
		</div>

		<!-- Pricing tiers -->
		<div
			class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto"
			use:inview={scrollRevealConfig}
			oninview_enter={() => (isVisible = true)}
		>
			{#each tiers as tier, i}
				<div
					class="relative transition-all duration-700 ease-out {revealClasses(isVisible)}"
					style="transition-delay: {staggerDelay(i)}ms"
				>
					<!-- Highlighted glow -->
					{#if tier.highlighted}
						<div class="absolute -inset-px bg-gradient-to-b from-primary-500/30 via-primary-500/10 to-transparent rounded-2xl blur-sm"></div>
					{/if}

					<div class="relative h-full rounded-2xl p-6 md:p-7 flex flex-col transition-all duration-300
						{tier.highlighted
						? 'bg-neutral-900/70 border border-primary-500/20 hover:border-primary-400/30'
						: 'bg-neutral-900/40 border border-white/[0.06] hover:border-white/[0.12]'}"
					>
						<!-- Beta badge -->
						<div class="mb-5">
							<Badge variant={tier.highlighted ? 'accent' : 'default'} size="sm">
								{m.landing_pricing_beta_badge()}
							</Badge>
						</div>

						<!-- Tier name -->
						<h3 class="font-display font-bold text-xl text-white">
							{tier.name()}
						</h3>

						<!-- Price -->
						<div class="mt-4 flex items-baseline gap-2">
							<span class="text-4xl font-bold text-white font-display">$0</span>
							{#if tier.futurePrice}
								<span class="text-sm line-through text-neutral-500">
									{tier.futurePrice}
								</span>
							{/if}
						</div>

						<!-- Description -->
						<p class="mt-2 text-sm text-neutral-400">
							{tier.description()}
						</p>

						<!-- Divider -->
						<div class="my-6 h-px {tier.highlighted ? 'bg-primary-500/15' : 'bg-white/[0.06]'}"></div>

						<!-- Feature list -->
						<ul class="space-y-3 flex-1">
							{#each tier.features as feature}
								<li class="flex items-start gap-3 text-sm text-neutral-300">
									<Check class="w-4 h-4 mt-0.5 flex-shrink-0 {tier.highlighted ? 'text-primary-400' : 'text-neutral-500'}" />
									<span>{feature()}</span>
								</li>
							{/each}
						</ul>

						<!-- CTA -->
						<div class="mt-8">
							<Button
								variant={tier.highlighted ? 'primary' : tier.buttonVariant}
								size="md"
								href="/signup"
								class="w-full"
							>
								{m.landing_pricing_cta()}
								<ArrowRight class="w-3.5 h-3.5" />
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
