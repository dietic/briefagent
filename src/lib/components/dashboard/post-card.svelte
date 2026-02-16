<script lang="ts">
	import { Clock, Heart, MessageCircle, Share2 } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { PostCard } from '$lib/data/mock-publishing.js';

	let { post }: { post: PostCard } = $props();

	const platformColors: Record<string, { bg: string; text: string }> = {
		LinkedIn: { bg: 'rgba(6,182,212,0.1)', text: 'var(--c-electric)' },
		Instagram: { bg: 'rgba(236,72,153,0.1)', text: 'var(--c-tertiary)' },
		'Twitter/X': { bg: 'rgba(249,115,22,0.1)', text: 'var(--c-secondary)' }
	};

	let pc = $derived(platformColors[post.platform] ?? platformColors.LinkedIn);
</script>

<div
	class="rounded-xl p-3.5 cursor-pointer transition-all hover:-translate-y-0.5"
	style="background: var(--bg-surface); border: 1px solid var(--border-subtle); box-shadow: var(--card-shadow);"
>
	<!-- Platform + Type -->
	<div class="flex items-center gap-2">
		<span
			class="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
			style="background: {pc.bg}; color: {pc.text};"
		>{post.platform}</span>
		<span class="text-[0.65rem] capitalize" style="color: var(--text-muted);">{post.type}</span>
	</div>

	<!-- Title -->
	<div class="text-sm font-semibold mt-2 line-clamp-1" style="color: var(--text-main);">{post.title}</div>

	<!-- Preview -->
	<p class="text-xs mt-1 line-clamp-2" style="color: var(--text-dim);">{post.preview}</p>

	<!-- Bottom row: status-specific -->
	{#if post.status === 'draft'}
		<div class="flex items-center gap-2 mt-3">
			<button
				class="text-[0.7rem] font-semibold px-3 py-1 rounded-lg transition-colors"
				style="border: 1px solid var(--border-subtle); color: var(--text-dim);"
			>{m.dash_publishing_edit()}</button>
			<button
				class="text-[0.7rem] font-semibold px-3 py-1 rounded-lg transition-colors"
				style="border: 1px solid var(--c-electric); color: var(--c-electric); background: rgba(6,182,212,0.05);"
			>{m.dash_publishing_submit()}</button>
		</div>
	{:else if post.status === 'review'}
		<div class="flex items-center gap-2 mt-3">
			<button
				class="text-[0.7rem] font-semibold px-3 py-1 rounded-lg transition-colors"
				style="color: var(--positive); border: 1px solid var(--positive); background: rgba(52,211,153,0.05);"
			>{m.dash_publishing_approve()}</button>
			<button
				class="text-[0.7rem] font-semibold px-3 py-1 rounded-lg transition-colors"
				style="color: var(--negative); border: 1px solid var(--negative); background: rgba(248,113,113,0.05);"
			>{m.dash_publishing_reject()}</button>
		</div>
	{:else if post.status === 'scheduled'}
		<div class="flex items-center gap-2 mt-3 mono text-xs" style="color: var(--c-electric);">
			<Clock class="w-3.5 h-3.5" />
			<span>{post.scheduledTime}</span>
		</div>
	{:else if post.status === 'published' && post.engagement}
		<div class="flex items-center gap-3 mt-3 pt-2" style="border-top: 1px solid var(--border-subtle);">
			<span class="flex items-center gap-1 text-xs" style="color: var(--text-dim);">
				<Heart class="w-3.5 h-3.5" />
				{post.engagement.likes}
			</span>
			<span class="flex items-center gap-1 text-xs" style="color: var(--text-dim);">
				<MessageCircle class="w-3.5 h-3.5" />
				{post.engagement.comments}
			</span>
			{#if post.engagement.shares > 0}
				<span class="flex items-center gap-1 text-xs" style="color: var(--text-dim);">
					<Share2 class="w-3.5 h-3.5" />
					{post.engagement.shares}
				</span>
			{/if}
		</div>
	{/if}
</div>
