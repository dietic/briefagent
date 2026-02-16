<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { ArrowRight, Play, Lightbulb, Image, Send } from 'lucide-svelte';
</script>

<section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950 pt-20 pb-24 md:pb-32">
	<!-- Background: radial glow behind headline -->
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgb(6_182_212/0.12),transparent_70%)]"></div>
		<!-- Grid pattern overlay -->
		<div class="absolute inset-0 opacity-[0.025]" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 60px 60px;"></div>
		<!-- Radial fade at bottom -->
		<div class="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-neutral-950 to-transparent"></div>
	</div>

	<!-- Floating geometric shapes -->
	<div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
		<!-- geo-1: cyan ring, top-left -->
		<div class="absolute top-[12%] left-[8%] w-16 h-16 rounded-full border-2 border-primary-400/20 animate-bobble" style="animation-delay: 0s;"></div>
		<!-- geo-2: orange filled square, top-right -->
		<div class="absolute top-[18%] right-[12%] w-10 h-10 rounded-lg bg-accent-500/15 rotate-12 animate-bobble" style="animation-delay: -2s;"></div>
		<!-- geo-3: pink triangle, mid-left -->
		<div class="absolute top-[45%] left-[5%] w-0 h-0 animate-bobble" style="animation-delay: -4s; border-left: 12px solid transparent; border-right: 12px solid transparent; border-bottom: 20px solid rgb(236 72 153 / 0.18);"></div>
		<!-- geo-4: cyan filled dot, mid-right -->
		<div class="absolute top-[40%] right-[7%] w-5 h-5 rounded-full bg-primary-500/20 animate-bobble" style="animation-delay: -1s;"></div>
		<!-- geo-5: orange ring, bottom-left -->
		<div class="absolute bottom-[20%] left-[15%] w-12 h-12 rounded-full border-2 border-accent-400/15 animate-bobble" style="animation-delay: -3s;"></div>
		<!-- geo-6: pink small square, bottom-right -->
		<div class="absolute bottom-[25%] right-[10%] w-8 h-8 rounded-md bg-tertiary-500/12 -rotate-6 animate-bobble" style="animation-delay: -5s;"></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<!-- Pill badge with pulsing orange dot -->
		<div class="animate-fade-in-up" style="animation-fill-mode: both;">
			<Badge variant="accent" size="md">
				<span class="inline-block w-1.5 h-1.5 rounded-full bg-accent-500 mr-2 animate-pulse-glow"></span>
				{m.landing_hero_badge()}
			</Badge>
		</div>

		<!-- Headline: "Your AI marketing team is ready." with gradient on "ready." -->
		<h1
			class="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-none tracking-tighter animate-fade-in-up"
			style="animation-delay: 150ms; animation-fill-mode: both;"
		>
			<span class="text-white">{@html m.landing_hero_tagline().split(' ').slice(0, -1).join(' ')}</span>
			<span class="bg-gradient-to-r from-primary-400 via-tertiary-400 to-tertiary-500 bg-clip-text text-transparent"> {@html m.landing_hero_tagline().split(' ').slice(-1).join(' ')}</span>
		</h1>

		<!-- Description -->
		<p
			class="mt-6 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto animate-fade-in-up"
			style="animation-delay: 300ms; animation-fill-mode: both;"
		>
			{m.landing_hero_description()}
		</p>

		<!-- CTAs -->
		<div
			class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
			style="animation-delay: 450ms; animation-fill-mode: both;"
		>
			<Button variant="primary" size="lg" href="/signup">
				{m.landing_hero_cta()}
				<ArrowRight class="w-4 h-4" />
			</Button>
			<Button variant="outline" size="lg" href="#how-it-works">
				<Play class="w-4 h-4" />
				{m.landing_hero_cta_secondary()}
			</Button>
		</div>

		<!-- Three floating feature cards -->
		<div class="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
			<!-- Card 1: Content Strategy -->
			<div
				class="relative group rounded-2xl bg-neutral-900/50 border border-white/[0.06] p-5 text-left backdrop-blur-sm hover:border-primary-500/20 transition-all duration-500 animate-card-float"
				style="animation-delay: 0s; opacity: 0; animation: popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.6s forwards, cardFloat 8s ease-in-out 1.2s infinite;"
			>
				<div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style="background: color-mix(in srgb, #06b6d4 12%, transparent);">
					<Lightbulb class="w-4.5 h-4.5 text-primary-400" />
				</div>
				<h3 class="font-display font-semibold text-sm text-white">Content Strategy</h3>
				<p class="text-xs text-neutral-500 mt-1">AI-driven plans</p>
			</div>

			<!-- Card 2: AI Visuals -->
			<div
				class="relative group rounded-2xl bg-neutral-900/50 border border-white/[0.06] p-5 text-left backdrop-blur-sm hover:border-accent-500/20 transition-all duration-500"
				style="opacity: 0; animation: popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.75s forwards, cardFloat 8s ease-in-out 1.5s infinite;"
			>
				<div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style="background: color-mix(in srgb, #f97316 12%, transparent);">
					<Image class="w-4.5 h-4.5 text-accent-400" />
				</div>
				<h3 class="font-display font-semibold text-sm text-white">AI Visuals</h3>
				<p class="text-xs text-neutral-500 mt-1">Generated imagery</p>
			</div>

			<!-- Card 3: Auto Publish -->
			<div
				class="relative group rounded-2xl bg-neutral-900/50 border border-white/[0.06] p-5 text-left backdrop-blur-sm hover:border-tertiary-500/20 transition-all duration-500"
				style="opacity: 0; animation: popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.9s forwards, cardFloat 8s ease-in-out 1.8s infinite;"
			>
				<div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style="background: color-mix(in srgb, #ec4899 12%, transparent);">
					<Send class="w-4.5 h-4.5 text-tertiary-400" />
				</div>
				<h3 class="font-display font-semibold text-sm text-white">Auto Publish</h3>
				<p class="text-xs text-neutral-500 mt-1">Scheduled posting</p>
			</div>
		</div>
	</div>
</section>
