<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/ui/button.svelte';
	import { ArrowRight, Play } from 'lucide-svelte';
</script>

<section class="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-16" style="background: var(--bg-page); transition: background 0.4s;">
	<!-- Background: radial glow behind headline -->
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px]" style="background: radial-gradient(ellipse at center, var(--c-electric-glow), transparent 70%);"></div>
	</div>

	<!-- Floating geometric shapes -->
	<div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
		<div
			class="absolute top-[12%] left-[8%] w-[120px] h-[120px] rounded-3xl rotate-[15deg] opacity-[0.08]"
			style="background: var(--c-electric); animation: floatIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0;"
		></div>
		<div
			class="absolute top-[20%] right-[12%] w-[80px] h-[80px] rounded-full opacity-[0.12]"
			style="border: 2px solid var(--c-secondary); animation: floatIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards; opacity: 0;"
		></div>
		<div
			class="absolute bottom-[25%] left-[15%] w-[60px] h-[60px] rounded-[14px] -rotate-[20deg] opacity-[0.06]"
			style="background: var(--c-tertiary); animation: floatIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; opacity: 0;"
		></div>
		<div
			class="absolute bottom-[15%] right-[10%] w-[160px] h-[160px] rounded-[40px] rotate-[30deg] opacity-[0.04]"
			style="background: var(--c-secondary); animation: floatIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s forwards; opacity: 0;"
		></div>
		<div
			class="absolute top-[40%] left-[3%] w-[20px] h-[20px] rounded-md opacity-30 animate-bobble"
			style="background: var(--c-electric); animation-delay: -2s;"
		></div>
		<div
			class="absolute top-[30%] right-[5%] w-[14px] h-[14px] rounded-full opacity-40 animate-bobble"
			style="background: var(--c-tertiary); animation-delay: -4s;"
		></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<!-- Pill badge -->
		<div class="animate-fade-in-up" style="animation-fill-mode: both;">
			<span class="inline-flex items-center rounded-full font-medium border border-[var(--border-subtle)] text-[var(--text-dim)] px-3.5 py-1 text-sm" style="background: var(--bg-surface);">
				<span class="inline-block w-1.5 h-1.5 rounded-full mr-2 animate-pulse-glow" style="background: var(--c-secondary);"></span>
				{m.landing_hero_badge()}
			</span>
		</div>

		<!-- Headline -->
		<h1
			class="mt-8 font-display font-extrabold leading-none tracking-tighter animate-fade-in-up"
			style="font-size: clamp(3rem, 7vw, 5.5rem); line-height: 0.95; animation-delay: 150ms; animation-fill-mode: both; color: var(--headline-color);"
		>
			<span>{@html m.landing_hero_tagline().split(' ').slice(0, -1).join(' ')}</span>
			<span class="bg-clip-text text-transparent" style="background-image: linear-gradient(135deg, var(--c-electric), var(--c-tertiary), var(--c-tertiary));"> {@html m.landing_hero_tagline().split(' ').slice(-1).join(' ')}</span>
		</h1>

		<!-- Description -->
		<p
			class="mt-6 text-[1.15rem] leading-relaxed max-w-[560px] mx-auto animate-fade-in-up"
			style="animation-delay: 300ms; animation-fill-mode: both; color: var(--text-dim);"
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
		<div class="mt-16 md:mt-20 flex flex-wrap justify-center gap-6 max-w-[700px] mx-auto" style="perspective: 1000px;">
			<div
				class="opacity-0 animate-pop-in relative group rounded-2xl border border-[var(--border-subtle)] px-6 py-5 hover:-translate-y-1 transition-[transform,border-color] duration-500 flex items-center gap-3"
				style="animation-delay: 0.8s; animation-fill-mode: both; background: var(--bg-surface);"
			>
				<div class="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 text-[1.1rem]" style="background: color-mix(in srgb, var(--c-electric) 12%, transparent);">⚡</div>
				<div>
					<h3 class="font-display font-bold text-[0.8rem] leading-tight" style="color: var(--text-main);">Content Strategy</h3>
					<p class="font-mono text-[0.65rem] font-light mt-0.5" style="color: var(--text-dim);">2-week plans in seconds</p>
				</div>
			</div>

			<div
				class="opacity-0 animate-pop-in relative group rounded-2xl border border-[var(--border-subtle)] px-6 py-5 hover:-translate-y-1 transition-[transform,border-color] duration-500 flex items-center gap-3"
				style="animation-delay: 0.95s; animation-fill-mode: both; background: var(--bg-surface);"
			>
				<div class="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 text-[1.1rem]" style="background: color-mix(in srgb, var(--c-secondary) 12%, transparent);">🎨</div>
				<div>
					<h3 class="font-display font-bold text-[0.8rem] leading-tight" style="color: var(--text-main);">AI Visuals</h3>
					<p class="font-mono text-[0.65rem] font-light mt-0.5" style="color: var(--text-dim);">Brand-matched graphics</p>
				</div>
			</div>

			<div
				class="opacity-0 animate-pop-in relative group rounded-2xl border border-[var(--border-subtle)] px-6 py-5 hover:-translate-y-1 transition-[transform,border-color] duration-500 flex items-center gap-3"
				style="animation-delay: 1.1s; animation-fill-mode: both; background: var(--bg-surface);"
			>
				<div class="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 text-[1.1rem]" style="background: color-mix(in srgb, var(--c-tertiary) 12%, transparent);">📤</div>
				<div>
					<h3 class="font-display font-bold text-[0.8rem] leading-tight" style="color: var(--text-main);">Auto Publish</h3>
					<p class="font-mono text-[0.65rem] font-light mt-0.5" style="color: var(--text-dim);">One-click scheduling</p>
				</div>
			</div>
		</div>
	</div>
</section>
