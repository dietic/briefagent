<script lang="ts">
	import type { ContentType, ContentStatus } from '$lib/data/mock-calendar';

	let { title, type, status }: { title: string; type: ContentType; status?: ContentStatus } =
		$props();

	const colorMap: Record<ContentType, { bg: string; border: string; text: string }> = {
		blog: {
			bg: 'rgba(var(--chip-electric-rgb, 6 182 212) / 0.12)',
			border: 'rgba(var(--chip-electric-rgb, 6 182 212) / 0.25)',
			text: 'var(--c-electric)'
		},
		social: {
			bg: 'rgba(var(--chip-secondary-rgb, 249 115 22) / 0.12)',
			border: 'rgba(var(--chip-secondary-rgb, 249 115 22) / 0.25)',
			text: 'var(--c-secondary)'
		},
		email: {
			bg: 'rgba(var(--chip-tertiary-rgb, 236 72 153) / 0.12)',
			border: 'rgba(var(--chip-tertiary-rgb, 236 72 153) / 0.25)',
			text: 'var(--c-tertiary)'
		},
		video: {
			bg: 'rgba(var(--chip-positive-rgb, 52 211 153) / 0.12)',
			border: 'rgba(var(--chip-positive-rgb, 52 211 153) / 0.25)',
			text: 'var(--positive)'
		}
	};

	const statusDot: Record<ContentStatus, string> = {
		published: '#34d399',
		scheduled: 'var(--c-electric)',
		draft: 'var(--c-secondary)',
		review: 'var(--c-tertiary)'
	};

	let colors = $derived(colorMap[type]);
	let truncated = $derived(title.length > 20 ? title.slice(0, 18) + '...' : title);
</script>

<div
	class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.7rem] font-medium border max-w-full cursor-pointer transition-transform duration-150 hover:-translate-y-px"
	style="background: {colors.bg}; border-color: {colors.border}; color: {colors.text};"
	title={title}
>
	{#if status}
		<span
			class="w-1.5 h-1.5 rounded-full shrink-0"
			style="background: {statusDot[status]};"
		></span>
	{/if}
	<span class="truncate">{truncated}</span>
</div>
