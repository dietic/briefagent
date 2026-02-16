<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages.js';
	import '$lib/styles/dashboard.css';
	import Sidebar from '$lib/components/dashboard/sidebar.svelte';
	import DashboardHeader from '$lib/components/dashboard/header.svelte';

	let { children } = $props();

	const titleMap: Record<string, () => string> = {
		'/dashboard': () => m.dash_breadcrumb_overview(),
		'/dashboard/calendar': () => m.dash_breadcrumb_calendar(),
		'/dashboard/editor': () => m.dash_breadcrumb_editor(),
		'/dashboard/brand': () => m.dash_breadcrumb_brand(),
		'/dashboard/publishing': () => m.dash_breadcrumb_publishing()
	};

	let pageTitle = $derived(titleMap[$page.url.pathname]?.() ?? m.dash_breadcrumb_overview());
</script>

<div
	class="grid h-screen overflow-hidden"
	style="grid-template-columns: 240px 1fr; grid-template-rows: auto 1fr; background: var(--bg-page);"
>
	<!-- Sidebar spans full height -->
	<div class="row-span-full">
		<Sidebar />
	</div>

	<!-- Header -->
	<DashboardHeader title={pageTitle} />

	<!-- Main content area -->
	<main class="overflow-y-auto p-8">
		{@render children()}
	</main>
</div>
