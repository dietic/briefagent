<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		size?: 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		size = 'lg',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const sizes: Record<string, string> = {
		sm: 'max-w-3xl',
		md: 'max-w-5xl',
		lg: 'max-w-6xl',
		xl: 'max-w-7xl'
	};
</script>

<div class="mx-auto px-4 sm:px-6 lg:px-8 {sizes[size]} {className}" {...rest}>
	{@render children()}
</div>
