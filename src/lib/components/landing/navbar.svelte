<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/ui/button.svelte';
	import ThemeToggle from '$lib/components/ui/theme-toggle.svelte';
	import LanguageSwitcher from '$lib/components/ui/language-switcher.svelte';
	import { Menu, X } from 'lucide-svelte';

	let scrollY = $state(0);
	let mobileOpen = $state(false);
	let isScrolled = $derived(scrollY > 20);

	$effect(() => {
		function handleScroll() {
			scrollY = window.scrollY;
		}
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});

	const navLinks = [
		{ href: '#features', label: () => m.nav_features() },
		{ href: '#how-it-works', label: () => m.nav_how_it_works() },
		{ href: '#pricing', label: () => m.nav_pricing() }
	];

	function closeMobile() {
		mobileOpen = false;
	}

	function handleNavClick(e: MouseEvent, href: string) {
		e.preventDefault();
		closeMobile();
		const el = document.querySelector(href);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<header
	class="fixed top-0 left-0 right-0 z-50 transition-all duration-500
		{isScrolled
		? 'bg-neutral-950/80 backdrop-blur-2xl border-b border-white/[0.06]'
		: 'bg-transparent'}"
>
	<nav class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16 md:h-[4.5rem]">
			<!-- Logo: "Brief" white + "Agent" cyan -->
			<a href="/" class="font-display font-bold text-lg tracking-tight transition-colors hover:opacity-80">
				<span class="text-white">Brief</span><span class="text-primary-400">Agent</span>
			</a>

			<!-- Center nav links (desktop) -->
			<div class="hidden md:flex items-center gap-8">
				{#each navLinks as link}
					<a
						href={link.href}
						onclick={(e) => handleNavClick(e, link.href)}
						class="text-sm font-medium text-neutral-500 hover:text-white transition-colors duration-200"
					>
						{link.label()}
					</a>
				{/each}
			</div>

			<!-- Right side (desktop) -->
			<div class="hidden md:flex items-center gap-3">
				<div class="[&_button]:text-neutral-500 [&_button:hover]:text-white [&_a]:text-neutral-500 [&_a:hover]:text-white">
					<LanguageSwitcher />
				</div>
				<div class="w-px h-4 bg-white/10"></div>
				<div class="[&_button]:text-neutral-500 [&_button:hover]:text-white">
					<ThemeToggle />
				</div>
				<Button variant="primary" size="sm" href="/signup">{m.nav_get_started()}</Button>
			</div>

			<!-- Mobile hamburger -->
			<button
				class="md:hidden p-2 rounded-lg transition-colors text-neutral-400 hover:text-white hover:bg-white/5"
				onclick={() => (mobileOpen = !mobileOpen)}
				aria-label={mobileOpen ? m.nav_close_menu() : m.nav_menu()}
			>
				{#if mobileOpen}
					<X class="w-5 h-5" />
				{:else}
					<Menu class="w-5 h-5" />
				{/if}
			</button>
		</div>
	</nav>

	<!-- Mobile menu -->
	{#if mobileOpen}
		<div class="md:hidden bg-neutral-950/95 backdrop-blur-2xl border-t border-white/[0.06] animate-fade-in-down">
			<div class="px-4 py-6 space-y-1">
				{#each navLinks as link}
					<a
						href={link.href}
						onclick={(e) => handleNavClick(e, link.href)}
						class="block text-base font-medium text-neutral-300 hover:text-white transition-colors py-3 px-3 rounded-lg hover:bg-white/5"
					>
						{link.label()}
					</a>
				{/each}
				<div class="pt-4 border-t border-white/[0.06] flex items-center gap-4 px-3">
					<LanguageSwitcher />
					<ThemeToggle />
				</div>
				<div class="pt-3 px-3">
					<Button variant="primary" size="md" href="/signup" class="w-full">{m.nav_get_started()}</Button>
				</div>
			</div>
		</div>
	{/if}
</header>
