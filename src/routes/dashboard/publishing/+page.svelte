<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Plus } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import KanbanColumn from '$lib/components/dashboard/kanban-column.svelte';
	import PostCard from '$lib/components/dashboard/post-card.svelte';
	import PostReviewDialog from '$lib/components/dashboard/post-review-dialog.svelte';

	let { data } = $props();

	let selectedPost = $state<(typeof data.allPosts)[number] | null>(null);
	let dialogOpen = $state(false);

	const columnLabels: Record<string, () => string> = {
		draft: () => m.pub_col_draft(),
		pending_review: () => m.pub_col_pending(),
		scheduled: () => m.pub_col_scheduled(),
		published: () => m.pub_col_published()
	};

	function openReview(post: (typeof data.allPosts)[number]) {
		selectedPost = post;
		dialogOpen = true;
	}

	// Compute stats from real data
	let totalPosts = $derived(data.allPosts.length);
	let pendingCount = $derived(data.columns.find((c: { id: string }) => c.id === 'pending_review')?.count ?? 0);
	let scheduledCount = $derived(data.columns.find((c: { id: string }) => c.id === 'scheduled')?.count ?? 0);
	let publishedCount = $derived(data.columns.find((c: { id: string }) => c.id === 'published')?.count ?? 0);

	let sidebarStats = $derived([
		{ label: 'Total', value: totalPosts, color: 'var(--text-main)' },
		{ label: 'Pending', value: pendingCount, color: 'var(--c-secondary)' },
		{ label: 'Scheduled', value: scheduledCount, color: 'var(--c-electric)' },
		{ label: 'Published', value: publishedCount, color: 'var(--positive)' }
	]);
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
				{#each data.columns as col}
					<KanbanColumn label={columnLabels[col.id]?.()} count={col.count} status={col.id}>
						{#each col.posts as post}
							<PostCard {post} onclick={() => openReview(post)} />
						{/each}
					</KanbanColumn>
				{/each}
			</div>
		</div>
	</div>

	<!-- Stats sidebar -->
	<aside
		class="w-[280px] shrink-0 flex flex-col"
		style="background: var(--bg-surface); border-left: 1px solid var(--border-subtle);"
	>
		<div class="px-5 py-4 shrink-0" style="border-bottom: 1px solid var(--border-subtle);">
			<h3 class="text-sm font-bold" style="color: var(--text-main);">Stats</h3>
		</div>
		<div>
			{#each sidebarStats as stat, i}
				<div
					class="px-5 py-3"
					style={i < sidebarStats.length - 1 ? 'border-bottom: 1px solid var(--border-subtle);' : ''}
				>
					<div class="text-xs" style="color: var(--text-dim);">{stat.label}</div>
					<div class="text-lg font-extrabold" style="color: {stat.color};">{stat.value}</div>
				</div>
			{/each}
		</div>
	</aside>
</div>

{#if selectedPost}
	<PostReviewDialog post={selectedPost} bind:open={dialogOpen} onupdate={() => invalidateAll()} />
{/if}
