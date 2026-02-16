<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Plus } from 'lucide-svelte';
	import { kanbanColumns, aiSuggestions, publishingStats } from '$lib/data/mock-publishing.js';
	import KanbanColumn from '$lib/components/dashboard/kanban-column.svelte';
	import PostCard from '$lib/components/dashboard/post-card.svelte';
	import AiPanel from '$lib/components/dashboard/ai-panel.svelte';

	const filters = [
		{ label: () => m.dash_publishing_filter_all(), active: true },
		{ label: () => 'LinkedIn', active: false },
		{ label: () => 'Instagram', active: false },
		{ label: () => 'Twitter/X', active: false }
	];

	const columnLabels: Record<string, () => string> = {
		draft: () => m.dash_publishing_col_drafts(),
		review: () => m.dash_publishing_col_review(),
		scheduled: () => m.dash_publishing_col_scheduled(),
		published: () => m.dash_publishing_col_published()
	};
</script>

<svelte:head>
	<title>{m.dash_meta_title_publishing()}</title>
</svelte:head>

<div class="flex h-[calc(100%+4rem)] -m-8">
	<!-- Main area -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- Header row -->
		<div
			class="flex items-center justify-between px-6 py-4 shrink-0"
			style="border-bottom: 1px solid var(--border-subtle);"
		>
			<div class="flex items-center gap-4">
				<h1 class="text-lg font-extrabold tracking-tight" style="color: var(--text-main);">
					{m.dash_publishing_title()}
				</h1>
				<div class="flex items-center gap-1">
					{#each filters as f}
						<button
							class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
							style="
								background: {f.active ? 'var(--c-electric)' : 'transparent'};
								color: {f.active ? 'white' : 'var(--text-dim)'};
							"
						>{f.label()}</button>
					{/each}
				</div>
			</div>
			<button
				class="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-bold transition-transform hover:-translate-y-px"
				style="background: var(--c-electric);"
			>
				<Plus class="w-4 h-4" />
				{m.dash_publishing_new_post()}
			</button>
		</div>

		<!-- Kanban board -->
		<div class="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-4 pt-4">
			<div class="flex gap-4 h-full min-w-max">
				{#each kanbanColumns as col}
					<KanbanColumn label={columnLabels[col.id]?.()} count={col.count} status={col.id}>
						{#each col.posts as post}
							<PostCard {post} />
						{/each}
					</KanbanColumn>
				{/each}
			</div>
		</div>
	</div>

	<!-- AI Panel -->
	<AiPanel suggestions={aiSuggestions} stats={publishingStats} />
</div>
