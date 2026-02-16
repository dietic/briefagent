<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import type { PostStatus } from '$lib/data/mock-publishing.js';
	import type { Snippet } from 'svelte';

	let { label, count, status, children }: {
		label: string;
		count: number;
		status: PostStatus;
		children: Snippet;
	} = $props();

	const statusColors: Record<PostStatus, string> = {
		draft: 'var(--text-muted)',
		review: 'var(--c-secondary)',
		scheduled: 'var(--c-electric)',
		published: 'var(--positive)'
	};
</script>

<div
	class="flex-1 min-w-[260px] max-w-[320px] flex flex-col rounded-xl overflow-hidden"
	style="background: var(--bg-surface-alt); border: 1px solid var(--border-subtle);"
>
	<!-- Colored top border -->
	<div class="h-[3px] shrink-0" style="background: {statusColors[status]};"></div>

	<!-- Header -->
	<div
		class="flex items-center justify-between px-4 py-3 shrink-0"
		style="border-bottom: 1px solid var(--border-subtle);"
	>
		<div class="flex items-center gap-2">
			<div class="w-2 h-2 rounded-full" style="background: {statusColors[status]};"></div>
			<span class="text-sm font-bold" style="color: var(--text-main);">{label}</span>
			<span
				class="text-xs px-2 py-0.5 rounded-full mono"
				style="background: var(--border-subtle); color: var(--text-dim);"
			>{count}</span>
		</div>
		<button
			class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
			style="border: 1px solid var(--border-subtle); color: var(--text-muted);"
		>
			<Plus class="w-3.5 h-3.5" />
		</button>
	</div>

	<!-- Card body -->
	<div class="flex-1 overflow-y-auto px-3 pb-3 pt-2 flex flex-col gap-2.5">
		{@render children()}
	</div>
</div>
