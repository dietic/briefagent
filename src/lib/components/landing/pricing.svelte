<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Badge from '$lib/components/ui/badge.svelte';
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

<section id="pricing" class="relative py-24 md:py-36 overflow-hidden" style="background: var(--bg-page); transition: background 0.4s;">
	<!-- Ambient glow -->
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[150px] pointer-events-none" style="background: var(--c-electric-glow);"></div>

	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<!-- Section header -->
		<div class="text-center max-w-3xl mx-auto mb-16 md:mb-20">
			<p class="font-mono text-[0.7rem] font-medium tracking-[0.15em] uppercase mb-3" style="color: var(--c-electric);">Pricing</p>
			<h2 class="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-[-0.03em]" style="line-height: 1.05; color: var(--headline-color);">
				{m.landing_pricing_title()}
			</h2>
			<p class="mt-5 text-base leading-relaxed" style="color: var(--text-dim);">
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
					{#if tier.highlighted}
						<div class="absolute -inset-px bg-gradient-to-b from-primary-500/30 via-primary-500/10 to-transparent rounded-2xl blur-sm"></div>
					{/if}

					<div class="relative h-full rounded-2xl p-6 md:p-7 flex flex-col transition-all duration-300 border"
						style="background: var(--bg-surface); border-color: {tier.highlighted ? 'rgb(6 182 212 / 0.2)' : 'var(--border-subtle)'};"
					>
						<div class="mb-5">
							<Badge variant={tier.highlighted ? 'accent' : 'default'} size="sm" class="font-mono text-[0.6rem] px-2 py-0.5">
								{m.landing_pricing_beta_badge()}
							</Badge>
						</div>

						<h3 class="font-display font-extrabold text-[1.15rem]" style="color: var(--text-main);">
							{tier.name()}
						</h3>

						<div class="mt-4 flex items-baseline gap-2">
							<span class="font-extrabold text-[2.5rem] tracking-[-0.03em] font-display" style="color: var(--text-main);">$0</span>
							{#if tier.futurePrice}
								<span class="text-sm line-through opacity-60" style="color: var(--text-dim);">
									{tier.futurePrice}
								</span>
							{/if}
						</div>

						<p class="mt-2 text-sm" style="color: var(--text-dim);">
							{tier.description()}
						</p>

						<div class="my-6 h-px" style="background: {tier.highlighted ? 'rgb(6 182 212 / 0.15)' : 'var(--border-subtle)'};"></div>

						<ul class="space-y-3 flex-1">
							{#each tier.features as feature}
								<li class="flex items-start gap-3 text-sm" style="color: var(--text-main);">
									<Check class="w-4 h-4 mt-0.5 flex-shrink-0 {tier.highlighted ? 'text-primary-500' : 'text-neutral-500'}" />
									<span>{feature()}</span>
								</li>
							{/each}
						</ul>

						<div class="mt-8">
							{#if tier.highlighted}
								<a
									href="/signup"
									class="flex items-center justify-center gap-2 w-full font-bold text-sm bg-primary-500 text-white rounded-[12px] py-3 px-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(6_182_212/0.25),0_0_0_1px_rgb(6_182_212)] cursor-pointer"
								>
									{m.landing_pricing_cta()}
									<ArrowRight class="w-3.5 h-3.5" />
								</a>
							{:else}
								<a
									href="/signup"
									class="flex items-center justify-center gap-2 w-full font-bold text-sm border rounded-[12px] py-3 px-6 transition-all duration-300 cursor-pointer"
									style="border-color: var(--btn-outline-border); color: var(--text-dim);"
									onmouseenter={(e) => { e.currentTarget.style.borderColor = 'var(--btn-outline-hover-border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
									onmouseleave={(e) => { e.currentTarget.style.borderColor = 'var(--btn-outline-border)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
								>
									{m.landing_pricing_cta()}
									<ArrowRight class="w-3.5 h-3.5" />
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
