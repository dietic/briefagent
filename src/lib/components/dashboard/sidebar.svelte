<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages.js';
	import {
		LayoutDashboard,
		CalendarDays,
		Layers,
		Megaphone,
		Send,
		BarChart3,
		Settings,
		LogOut,
		Sparkles,
		Wand2
	} from 'lucide-svelte';

	type NavItem = {
		href: string;
		label: () => string;
		icon: typeof LayoutDashboard;
		disabled?: boolean;
	};

	type NavSection = {
		label: () => string;
		items: NavItem[];
	};

	let { user, product }: { user?: { email?: string }; product?: { onboardingStep?: string | null } | null } = $props();

	let userInitials = $derived(() => {
		if (!user?.email) return '??';
		const name = user.email.split('@')[0];
		return name.slice(0, 2).toUpperCase();
	});

	let userName = $derived(() => {
		if (!user?.email) return 'User';
		return user.email.split('@')[0];
	});

	let onboardingIncomplete = $derived(!product || product.onboardingStep !== 'complete');

	const sections: NavSection[] = [
		{
			label: () => m.dash_nav_section_main(),
			items: [
				{ href: '/dashboard', label: () => m.dash_nav_overview(), icon: LayoutDashboard },
				{ href: '/dashboard/calendar', label: () => m.dash_nav_calendar(), icon: CalendarDays },
				{ href: '/dashboard/pillars', label: () => m.dash_nav_pillars(), icon: Layers },
				{ href: '/dashboard/brand', label: () => m.dash_nav_campaigns(), icon: Megaphone },
				{ href: '/dashboard/publishing', label: () => m.dash_nav_publishing(), icon: Send }
			]
		},
		{
			label: () => m.dash_nav_section_tools(),
			items: [
				{ href: '/dashboard/generate', label: () => m.dash_nav_generate(), icon: Wand2 },
				{ href: '#', label: () => 'Analytics', icon: BarChart3, disabled: true }
			]
		},
		{
			label: () => m.dash_nav_section_system(),
			items: [
				{ href: '/dashboard/settings', label: () => m.dash_nav_settings(), icon: Settings }
			]
		}
	];

	function isActive(pathname: string, href: string): boolean {
		if (href === '/dashboard') return pathname === '/dashboard';
		return pathname.startsWith(href);
	}
</script>

<aside
	class="flex flex-col h-full overflow-y-auto"
	style="background: var(--bg-sidebar); border-right: 1px solid var(--border-subtle);"
>
	<!-- Logo -->
	<div class="flex items-center gap-2.5 h-14 px-5 shrink-0" style="border-bottom: 1px solid var(--border-subtle);">
		<a href="/" class="flex items-center gap-2.5 group">
			<div
				class="flex items-center justify-center w-7 h-7 rounded-lg text-white text-[0.75rem] font-extrabold"
				style="background: linear-gradient(135deg, var(--c-electric), var(--c-electric));"
			>
				B
			</div>
			<span class="font-display font-extrabold text-[0.95rem] tracking-[-0.03em]">
				<span style="color: var(--text-main);">Brief</span><span style="color: var(--c-electric);">Agent</span>
			</span>
		</a>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 py-2 px-3 overflow-y-auto">
		<!-- Onboarding item (conditional) -->
		{#if onboardingIncomplete}
			{@const onbActive = isActive($page.url.pathname, '/dashboard/onboarding')}
			<div
				class="text-[0.65rem] font-bold uppercase tracking-[0.1em] px-3 pt-5 pb-2"
				style="color: var(--text-muted);"
			>
				Setup
			</div>
			<a
				href="/dashboard/onboarding/quick-start"
				class="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[0.85rem] transition-all duration-150 relative mb-1"
				style="
					color: {onbActive ? 'var(--c-electric)' : 'var(--c-secondary)'};
					background: {onbActive ? 'var(--bg-sidebar-active)' : 'transparent'};
				"
				onmouseenter={(e) => {
					if (!onbActive) {
						e.currentTarget.style.color = 'var(--text-main)';
						e.currentTarget.style.background = 'var(--bg-sidebar-hover)';
					}
				}}
				onmouseleave={(e) => {
					if (!onbActive) {
						e.currentTarget.style.color = 'var(--c-secondary)';
						e.currentTarget.style.background = 'transparent';
					}
				}}
			>
				{#if onbActive}
					<div
						class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r"
						style="background: var(--c-electric);"
					></div>
				{/if}
				<Sparkles class="w-[18px] h-[18px]" />
				<span class={onbActive ? 'font-semibold' : 'font-medium'}>{m.onb_nav_onboarding()}</span>
			</a>
		{/if}

		{#each sections as section}
			<div
				class="text-[0.65rem] font-bold uppercase tracking-[0.1em] px-3 pt-5 pb-2"
				style="color: var(--text-muted);"
			>
				{section.label()}
			</div>

			{#each section.items as item}
				{@const active = !item.disabled && isActive($page.url.pathname, item.href)}
				{#if item.disabled}
					<div
						class="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[0.85rem] opacity-40 cursor-not-allowed select-none"
						style="color: var(--text-dim);"
					>
						<item.icon class="w-[18px] h-[18px]" />
						<span>{item.label()}</span>
					</div>
				{:else}
					<a
						href={item.href}
						class="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[0.85rem] transition-all duration-150 relative"
						style="
							color: {active ? 'var(--c-electric)' : 'var(--text-dim)'};
							background: {active ? 'var(--bg-sidebar-active)' : 'transparent'};
						"
						onmouseenter={(e) => {
							if (!active) {
								e.currentTarget.style.color = 'var(--text-main)';
								e.currentTarget.style.background = 'var(--bg-sidebar-hover)';
							}
						}}
						onmouseleave={(e) => {
							if (!active) {
								e.currentTarget.style.color = 'var(--text-dim)';
								e.currentTarget.style.background = 'transparent';
							}
						}}
					>
						{#if active}
							<div
								class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r"
								style="background: var(--c-electric);"
							></div>
						{/if}
						<item.icon class="w-[18px] h-[18px]" />
						<span class={active ? 'font-semibold' : 'font-normal'}>{item.label()}</span>
					</a>
				{/if}
			{/each}
		{/each}
	</nav>

	<!-- User pill + Logout -->
	<div
		class="shrink-0 px-3 py-3"
		style="border-top: 1px solid var(--border-subtle);"
	>
		<div
			class="flex items-center gap-3 px-3 py-2.5 rounded-[10px]"
		>
			<div
				class="flex items-center justify-center w-8 h-8 rounded-lg text-white text-[0.7rem] font-bold shrink-0"
				style="background: linear-gradient(135deg, var(--c-tertiary), var(--c-secondary));"
			>
				{userInitials()}
			</div>
			<div class="flex flex-col min-w-0 flex-1">
				<span class="text-[0.8rem] font-semibold truncate" style="color: var(--text-main);">
					{userName()}
				</span>
				<span class="mono text-[0.65rem]" style="color: var(--c-electric);">
					{m.dash_user_plan()}
				</span>
			</div>
			<form method="POST" action="/logout">
				<button
					type="submit"
					class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 cursor-pointer"
					style="color: var(--text-muted);"
					title="Logout"
					onmouseenter={(e) => {
						e.currentTarget.style.color = 'var(--c-electric)';
						e.currentTarget.style.background = 'var(--bg-sidebar-hover)';
					}}
					onmouseleave={(e) => {
						e.currentTarget.style.color = 'var(--text-muted)';
						e.currentTarget.style.background = 'transparent';
					}}
				>
					<LogOut class="w-[16px] h-[16px]" />
				</button>
			</form>
		</div>
	</div>
</aside>
