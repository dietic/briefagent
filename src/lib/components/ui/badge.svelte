<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'accent' | 'outline' | 'success';
		size?: 'sm' | 'md';
		children: Snippet;
		class?: string;
		[key: string]: unknown;
	}

	let {
		variant = 'default',
		size = 'md',
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const baseClasses = 'inline-flex items-center rounded-full font-medium';

	const variants: Record<string, string> = {
		default: 'bg-[var(--toggle-bg)] border border-[var(--border-subtle)] text-[var(--text-dim)]',
		accent: 'bg-primary-500/10 border border-primary-500/20 text-primary-500',
		outline:
			'border border-[var(--btn-outline-border)] text-[var(--text-dim)]',
		success: 'bg-success/10 border border-success/20 text-success'
	};

	const sizes: Record<string, string> = {
		sm: 'px-2.5 py-0.5 text-xs',
		md: 'px-3.5 py-1 text-sm'
	};
</script>

<span class="{baseClasses} {variants[variant]} {sizes[size]} {className}" {...rest}>
	{@render children()}
</span>
