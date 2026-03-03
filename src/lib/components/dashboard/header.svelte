<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import ThemeToggle from '$lib/components/ui/theme-toggle.svelte';
	import ProductSwitcher from '$lib/components/dashboard/product-switcher.svelte';
	import { Search, Bell } from 'lucide-svelte';

	type SlimProduct = {
		id: string;
		name: string;
		logoUrl: string | null;
		onboardingStep: string | null;
	};

	let {
		title,
		product,
		products
	}: {
		title: string;
		product: SlimProduct | null;
		products: SlimProduct[];
	} = $props();
</script>

<header
	class="flex items-center justify-between h-14 px-6 sticky top-0 z-30"
	style="background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle);"
>
	<!-- Breadcrumb with product switcher -->
	<div class="flex items-center gap-2 text-[0.85rem]">
		{#if product && products.length > 0}
			<ProductSwitcher {product} {products} />
		{:else}
			<span style="color: var(--text-muted);">{m.dash_breadcrumb_dashboard()}</span>
		{/if}
		<span style="color: var(--text-muted);" class="text-[0.75rem]">/</span>
		<span class="font-semibold" style="color: var(--text-main);">{title}</span>
	</div>

	<!-- Right actions -->
	<div class="flex items-center gap-2">
		<!-- Search button -->
		<button
			class="flex items-center justify-center w-9 h-9 rounded-[10px] transition-colors duration-150"
			style="border: 1px solid var(--border-subtle); background: var(--toggle-bg); color: var(--text-dim);"
			aria-label={m.dash_header_search_placeholder()}
			onmouseenter={(e) => {
				e.currentTarget.style.background = 'var(--toggle-hover)';
				e.currentTarget.style.color = 'var(--text-main)';
			}}
			onmouseleave={(e) => {
				e.currentTarget.style.background = 'var(--toggle-bg)';
				e.currentTarget.style.color = 'var(--text-dim)';
			}}
		>
			<Search class="w-[16px] h-[16px]" />
		</button>

		<!-- Notifications button -->
		<button
			class="relative flex items-center justify-center w-9 h-9 rounded-[10px] transition-colors duration-150"
			style="border: 1px solid var(--border-subtle); background: var(--toggle-bg); color: var(--text-dim);"
			aria-label={m.dash_header_notifications()}
			onmouseenter={(e) => {
				e.currentTarget.style.background = 'var(--toggle-hover)';
				e.currentTarget.style.color = 'var(--text-main)';
			}}
			onmouseleave={(e) => {
				e.currentTarget.style.background = 'var(--toggle-bg)';
				e.currentTarget.style.color = 'var(--text-dim)';
			}}
		>
			<Bell class="w-[16px] h-[16px]" />
			<span
				class="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full"
				style="background: var(--c-secondary);"
			></span>
		</button>

		<!-- Theme toggle -->
		<div
			class="flex items-center justify-center w-9 h-9 rounded-[10px]"
			style="border: 1px solid var(--border-subtle); background: var(--toggle-bg);"
		>
			<ThemeToggle />
		</div>
	</div>
</header>
