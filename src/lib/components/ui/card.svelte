<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'highlighted' | 'glass';
		hover?: boolean;
		class?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		variant = 'default',
		hover = true,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const baseClasses = 'group rounded-2xl p-6 transition-all duration-300 ease-out';

	const variants: Record<string, string> = {
		default:
			'bg-neutral-900/50 border border-white/[0.06] backdrop-blur-sm',
		highlighted:
			'bg-gradient-to-b from-primary-500/15 to-primary-600/5 border border-primary-500/20 backdrop-blur-sm',
		glass:
			'bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl'
	};

	const hoverClasses: Record<string, string> = {
		default:
			'hover:border-white/[0.12] hover:bg-neutral-900/70 hover:-translate-y-0.5',
		highlighted:
			'hover:border-primary-400/30 hover:shadow-glow hover:-translate-y-0.5',
		glass:
			'hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-0.5'
	};
</script>

<div
	class="{baseClasses} {variants[variant]} {hover ? hoverClasses[variant] : ''} {className}"
	{...rest}
>
	{@render children()}
</div>
