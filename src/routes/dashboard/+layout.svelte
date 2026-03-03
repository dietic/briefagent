<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages.js';
	import '$lib/styles/dashboard.css';
	import Sidebar from '$lib/components/dashboard/sidebar.svelte';
	import DashboardHeader from '$lib/components/dashboard/header.svelte';
	import { ArrowRight } from 'lucide-svelte';

	let { children, data } = $props();

	const titleMap: Record<string, () => string> = {
		'/dashboard': () => m.dash_breadcrumb_overview(),
		'/dashboard/calendar': () => m.dash_breadcrumb_calendar(),
		'/dashboard/brand': () => m.dash_breadcrumb_brand(),
		'/dashboard/publishing': () => m.dash_breadcrumb_publishing(),
		'/dashboard/generate': () => m.gen_title(),
		'/dashboard/settings': () => m.dash_breadcrumb_settings()
	};

	let pageTitle = $derived(titleMap[$page.url.pathname]?.() ?? m.dash_breadcrumb_overview());

	let onboardingIncomplete = $derived(
		!data.product || data.product.onboardingStep !== 'complete'
	);

	let isOnboardingPage = $derived(
		$page.url.pathname.startsWith('/dashboard/onboarding')
	);

	let resumeHref = $derived(() => {
		if (!data.product) return '/dashboard/onboarding/quick-start';
		const stepMap: Record<string, string> = {
			quick_start: '/dashboard/onboarding/quick-start',
			deep_brief: '/dashboard/onboarding/deep-brief',
			assets: '/dashboard/onboarding/assets'
		};
		return stepMap[data.product.onboardingStep ?? 'quick_start'] ?? '/dashboard/onboarding/quick-start';
	});
</script>

<div
	class="grid h-screen overflow-hidden"
	style="grid-template-columns: 240px 1fr; grid-template-rows: auto 1fr; background: var(--bg-page);"
>
	<!-- Sidebar spans full height -->
	<div class="row-span-full">
		<Sidebar user={data.user} product={data.product} />
	</div>

	<!-- Header -->
	<DashboardHeader title={pageTitle} product={data.product} products={data.products} />

	<!-- Main content area -->
	<main class="overflow-y-auto p-8">
		<!-- Onboarding banner -->
		{#if onboardingIncomplete && !isOnboardingPage}
			<div
				class="flex items-center justify-between px-5 py-3 rounded-xl mb-6"
				style="background: var(--c-electric-glow); border: 1px solid rgba(6, 182, 212, 0.2);"
			>
				<span class="text-[0.85rem] font-medium" style="color: var(--c-electric);">
					{m.onb_banner_incomplete()}
				</span>
				<a
					href={resumeHref()}
					class="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold transition-opacity duration-150"
					style="color: var(--c-electric);"
					onmouseenter={(e) => (e.currentTarget.style.opacity = '0.8')}
					onmouseleave={(e) => (e.currentTarget.style.opacity = '1')}
				>
					{m.onb_banner_resume()}
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>
		{/if}

		{@render children()}
	</main>
</div>
