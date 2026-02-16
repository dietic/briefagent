<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/ui/button.svelte';
	import ThemeToggle from '$lib/components/ui/theme-toggle.svelte';
	import LanguageSwitcher from '$lib/components/ui/language-switcher.svelte';
	import { Menu, X } from 'lucide-svelte';

	let mobileOpen = $state(false);

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
	class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-[var(--border-subtle)] transition-[background,border-color] duration-400"
	style="background: var(--bg-nav);"
>
	<nav class="mx-auto px-6 sm:px-8 lg:px-12">
		<div class="flex items-center justify-between h-16 md:h-[4.5rem]">
			<!-- Logo -->
			<a href="/" class="font-display font-extrabold text-[1.2rem] tracking-[-0.03em] transition-colors hover:opacity-80">
				<span class="text-[var(--text-white-or-dark)]">Brief</span><span class="text-[var(--c-electric)]">Agent</span>
			</a>

			<!-- Center nav links (desktop) -->
			<div class="hidden md:flex items-center gap-8">
				{#each navLinks as link}
					<a
						href={link.href}
						onclick={(e) => handleNavClick(e, link.href)}
						class="text-sm font-normal text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors duration-200"
					>
						{link.label()}
					</a>
				{/each}
			</div>

			<!-- Right side (desktop) -->
			<div class="hidden md:flex items-center gap-3">
				<div class="w-9 h-9 flex items-center justify-center rounded-[10px] border border-[var(--border-subtle)] transition-colors" style="background: var(--toggle-bg);">
					<ThemeToggle />
				</div>
				<a
					href="/login"
					class="text-sm font-normal text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors duration-200 px-3 py-1.5"
				>
					{m.nav_log_in()}
				</a>
				<a
					href="/signup"
					class="inline-flex items-center justify-center font-bold text-sm bg-primary-500 text-white rounded-[10px] px-5 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(6_182_212/0.25),0_0_0_1px_rgb(6_182_212)] cursor-pointer"
				>
					{m.nav_start_free()}
				</a>
			</div>

			<!-- Mobile hamburger -->
			<button
				class="md:hidden p-2 rounded-lg transition-colors text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
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
		<div class="md:hidden backdrop-blur-2xl border-t border-[var(--border-subtle)] animate-fade-in-down" style="background: var(--bg-nav);">
			<div class="px-4 py-6 space-y-1">
				{#each navLinks as link}
					<a
						href={link.href}
						onclick={(e) => handleNavClick(e, link.href)}
						class="block text-base font-medium text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors py-3 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
					>
						{link.label()}
					</a>
				{/each}
				<div class="pt-4 border-t border-[var(--border-subtle)] flex items-center gap-4 px-3">
					<LanguageSwitcher />
					<ThemeToggle />
				</div>
				<div class="pt-3 px-3 space-y-2">
					<a href="/login" class="block text-center text-sm text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors py-2">{m.nav_log_in()}</a>
					<Button variant="primary" size="md" href="/signup" class="w-full">{m.nav_start_free()}</Button>
				</div>
			</div>
		</div>
	{/if}
</header>
