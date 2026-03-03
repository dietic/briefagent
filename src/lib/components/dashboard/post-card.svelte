<script lang="ts">
	import { postStatusColors, type PostStatus } from '$lib/utils/post-status';
	import { Image, AlignLeft, Layers, MessageSquare, BarChart2 } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface RealPost {
		id: string;
		topic: string;
		status: string;
		scheduledAt: string | null;
		platform: string;
		postType: string;
		imageUrl: string | null;
		contentCategory: string;
		copyText: string | null;
		hashtags: string[] | null;
		keyMessage: string;
		contentData?: unknown;
		rejectionReason?: string | null;
	}

	let {
		post,
		onclick
	}: {
		post: RealPost;
		onclick?: () => void;
	} = $props();

	const platformColors: Record<string, { bg: string; text: string }> = {
		linkedin: { bg: 'rgba(6,182,212,0.1)', text: 'var(--c-electric)' },
		instagram: { bg: 'rgba(236,72,153,0.1)', text: 'var(--c-tertiary)' },
		twitter: { bg: 'rgba(249,115,22,0.1)', text: 'var(--c-secondary)' }
	};

	const postTypeConfig: Record<string, { icon: typeof Image; label: () => string; color: string }> = {
		static_image: { icon: Image, label: () => m.post_type_image(), color: 'var(--c-electric)' },
		text_only: { icon: AlignLeft, label: () => m.post_type_text(), color: 'var(--text-dim)' },
		carousel: { icon: Layers, label: () => m.post_type_carousel(), color: 'var(--c-secondary)' },
		thread: { icon: MessageSquare, label: () => m.post_type_thread(), color: 'var(--c-tertiary)' },
		poll: { icon: BarChart2, label: () => m.post_type_poll(), color: '#a78bfa' }
	};

	let pc = $derived(
		platformColors[post.platform.toLowerCase()] ?? platformColors.linkedin
	);
	let statusInfo = $derived(
		postStatusColors[post.status as PostStatus] ?? postStatusColors.draft
	);
	let typeInfo = $derived(
		postTypeConfig[post.postType] ?? postTypeConfig.static_image
	);

	let formattedDate = $derived(() => {
		if (!post.scheduledAt) return '';
		const d = new Date(post.scheduledAt);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	});
</script>

<button
	class="rounded-xl p-3.5 cursor-pointer transition-all hover:-translate-y-0.5 text-left w-full"
	style="background: var(--bg-surface); border: 1px solid var(--border-subtle); box-shadow: var(--card-shadow);"
	{onclick}
>
	<!-- Platform + Type + Status -->
	<div class="flex items-center gap-2">
		<span
			class="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
			style="background: {pc.bg}; color: {pc.text};"
		>{post.platform}</span>
		<span
			class="inline-flex items-center gap-1 text-[0.62rem] font-bold px-1.5 py-0.5 rounded"
			style="color: {typeInfo.color}; background: color-mix(in srgb, {typeInfo.color} 10%, transparent);"
		>
			<typeInfo.icon class="w-3 h-3" />
			{typeInfo.label()}
		</span>
		<span class="text-[0.65rem] capitalize" style="color: var(--text-muted);">
			{post.contentCategory.replace('_', ' ')}
		</span>
		<div class="flex-1"></div>
		<div
			class="w-2 h-2 rounded-full shrink-0"
			style="background: {statusInfo.color};"
			title={statusInfo.label}
		></div>
	</div>

	<!-- Topic -->
	<div class="text-sm font-semibold mt-2 line-clamp-1" style="color: var(--text-main);">
		{post.topic}
	</div>

	<!-- Preview text -->
	{#if post.copyText}
		<p class="text-xs mt-1 line-clamp-2" style="color: var(--text-dim);">
			{post.copyText}
		</p>
	{:else}
		<p class="text-xs mt-1 italic" style="color: var(--text-muted);">No copy yet</p>
	{/if}

	<!-- Bottom row -->
	<div class="flex items-center gap-2 mt-3">
		<span
			class="text-[0.62rem] font-bold px-2 py-0.5 rounded-md"
			style="color: {statusInfo.color}; background: {statusInfo.bg};"
		>
			{statusInfo.label}
		</span>
		{#if post.scheduledAt}
			<span class="text-[0.62rem]" style="color: var(--text-muted); font-family: var(--font-mono);">
				{formattedDate()}
			</span>
		{/if}
	</div>
</button>
