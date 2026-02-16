<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		variant?: 'dark' | 'darker' | 'gradient';
		padding?: 'sm' | 'md' | 'lg';
		class?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		id,
		variant = 'dark',
		padding = 'lg',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const variants: Record<string, string> = {
		dark: 'bg-neutral-950 text-neutral-50',
		darker: 'bg-[oklch(0.08_0.015_270)] text-neutral-50',
		gradient:
			'bg-gradient-to-b from-neutral-950 via-[oklch(0.12_0.03_358)] to-neutral-950 text-white'
	};

	const paddings: Record<string, string> = {
		sm: 'py-16 md:py-20',
		md: 'py-20 md:py-28',
		lg: 'py-24 md:py-36'
	};
</script>

<section {id} class="{variants[variant]} {paddings[padding]} {className}" {...rest}>
	{@render children()}
</section>
