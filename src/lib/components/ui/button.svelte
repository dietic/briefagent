<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'inverted';
		size?: 'sm' | 'md' | 'lg';
		href?: string;
		children: Snippet;
		class?: string;
		[key: string]: unknown;
	}

	let {
		variant = 'primary',
		size = 'md',
		href,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center font-semibold rounded-[0.875rem] transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 cursor-pointer';

	const variants: Record<string, string> = {
		primary:
			'bg-primary-500 text-white hover:bg-primary-400 shadow-lg shadow-primary-500/20 hover:shadow-primary-400/30 hover:shadow-xl',
		secondary:
			'bg-neutral-800 text-neutral-100 border border-neutral-700/50 hover:bg-neutral-750 hover:border-neutral-600/50',
		ghost:
			'text-neutral-400 hover:text-white hover:bg-white/5',
		outline:
			'border border-neutral-700 text-neutral-300 hover:border-primary-500/50 hover:text-white hover:bg-primary-500/5',
		inverted:
			'bg-white text-neutral-950 hover:bg-neutral-100 shadow-lg'
	};

	const sizes: Record<string, string> = {
		sm: 'px-4 py-2 text-sm gap-2',
		md: 'px-6 py-2.5 text-sm gap-2',
		lg: 'px-8 py-3.5 text-base gap-2.5'
	};
</script>

{#if href}
	<a {href} class="{baseClasses} {variants[variant]} {sizes[size]} {className}" {...rest}>
		{@render children()}
	</a>
{:else}
	<button class="{baseClasses} {variants[variant]} {sizes[size]} {className}" {...rest}>
		{@render children()}
	</button>
{/if}
