<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Sparkles, Image, Copy, Check, Download, RefreshCw, Loader2 } from 'lucide-svelte';
	import { postStatusColors, type PostStatus } from '$lib/utils/post-status';
	import { invalidateAll } from '$app/navigation';
	import PostReviewDialog from '$lib/components/dashboard/post-review-dialog.svelte';

	let { data } = $props();

	let dialogOpen = $state(false);
	let copied = $state(false);
	let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

	let charCount = $derived(data.post?.copyText?.length ?? 0);
	let statusInfo = $derived(
		data.post ? postStatusColors[data.post.status as PostStatus] ?? postStatusColors.draft : null
	);

	async function copyToClipboard() {
		if (!data.post?.copyText) return;
		try {
			await navigator.clipboard.writeText(data.post.copyText);
		} catch {
			const ta = document.createElement('textarea');
			ta.value = data.post.copyText;
			ta.style.position = 'fixed';
			ta.style.left = '-9999px';
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
		}
		copied = true;
		if (copiedTimeout) clearTimeout(copiedTimeout);
		copiedTimeout = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	async function downloadImage() {
		if (!data.post?.imageUrl) return;
		try {
			const res = await fetch(data.post.imageUrl);
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `briefagent-${data.post.id.slice(0, 8)}.jpg`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch {
			// silently fail
		}
	}
</script>

<svelte:head>
	<title>{m.dash_meta_title_editor()}</title>
</svelte:head>

{#if !data.post}
	<!-- Empty state: no post to edit -->
	<div class="flex items-center justify-center min-h-[60vh]">
		<div
			class="rounded-[14px] border p-10 text-center max-w-md"
			style="border-color: var(--border-subtle); background: var(--bg-surface); box-shadow: var(--card-shadow);"
		>
			<div class="text-4xl mb-4 opacity-40">&#9997;&#65039;</div>
			<h2 class="text-lg font-extrabold mb-2" style="color: var(--text-main);">
				{m.dash_editor_title()}
			</h2>
			<p class="text-sm mb-6" style="color: var(--text-dim);">
				{m.dash_editor_no_post()}
			</p>
			<a
				href="/dashboard/generate"
				class="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
				style="background: linear-gradient(135deg, var(--c-electric), color-mix(in srgb, var(--c-electric) 80%, var(--c-secondary)));"
			>
				<Sparkles class="w-4 h-4" />
				{m.dash_editor_no_post_cta()}
			</a>
		</div>
	</div>
{:else}
	{@const post = data.post}
	<div class="flex h-[calc(100%+4rem)] -m-8">
		<!-- LEFT PANEL: Post Details -->
		<aside
			class="w-80 shrink-0 flex flex-col overflow-y-auto"
			style="background: var(--bg-surface); border-right: 1px solid var(--border-subtle);"
		>
			<div
				class="flex items-center justify-between px-5 py-4 shrink-0"
				style="border-bottom: 1px solid var(--border-subtle);"
			>
				<h2 class="text-sm font-bold" style="color: var(--text-main);">{m.dash_editor_brief()}</h2>
				<button
					class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-white text-xs font-bold transition-transform hover:-translate-y-px"
					style="background: var(--c-electric);"
					onclick={() => { dialogOpen = true; }}
				>
					<Sparkles class="w-3.5 h-3.5" />
					Edit & Review
				</button>
			</div>

			<div class="flex flex-col gap-4 px-5 py-4 flex-1">
				<!-- Status -->
				{#if statusInfo}
					<div class="flex flex-col gap-1.5">
						<span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
							Status
						</span>
						<span
							class="inline-flex w-fit items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg"
							style="color: {statusInfo.color}; background: {statusInfo.bg};"
						>
							{statusInfo.label}
						</span>
					</div>
				{/if}

				<!-- Topic -->
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
						{m.dash_editor_topic()}
					</span>
					<div class="text-sm font-medium" style="color: var(--text-main);">
						{post.topic}
					</div>
				</div>

				<!-- Key Message -->
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
						{m.dash_editor_key_message()}
					</span>
					<div class="text-sm" style="color: var(--text-dim);">
						{post.keyMessage}
					</div>
				</div>

				<!-- Platform -->
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
						Platform
					</span>
					<span
						class="inline-flex w-fit text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
						style="background: rgba(6,182,212,0.1); color: var(--c-electric);"
					>
						{post.platform}
					</span>
				</div>

				<!-- Content Category -->
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
						{m.dash_editor_content_type()}
					</span>
					<div class="text-sm capitalize" style="color: var(--text-dim);">
						{post.contentCategory.replace('_', ' ')} &middot; {post.postType}
					</div>
				</div>

				<!-- Content Plan context -->
				{#if data.contentPlan}
					<div class="flex flex-col gap-1.5 pt-2" style="border-top: 1px solid var(--border-subtle);">
						<span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
							Content Plan
						</span>
						<div class="text-sm" style="color: var(--text-dim);">
							{data.contentPlan.summary ?? data.contentPlan.strategyOverview.slice(0, 120) + '...'}
						</div>
						{#if data.contentPlan.contentThemes.length > 0}
							<div class="flex flex-wrap gap-1.5 mt-1">
								{#each data.contentPlan.contentThemes.slice(0, 4) as theme}
									<span
										class="px-2 py-0.5 rounded-full text-[0.65rem] font-medium"
										style="background: var(--bg-sidebar-active); color: var(--c-electric);"
									>{theme}</span>
								{/each}
							</div>
						{/if}
					</div>
				{/if}

				<!-- Hashtags -->
				{#if post.hashtags && post.hashtags.length > 0}
					<div class="flex flex-col gap-1.5">
						<span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
							{m.dash_editor_tags()}
						</span>
						<div class="flex flex-wrap gap-1.5">
							{#each post.hashtags as tag}
								<span
									class="px-2.5 py-1 rounded-full text-xs font-medium"
									style="background: var(--bg-sidebar-active); color: var(--c-electric);"
								>{tag}</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</aside>

		<!-- CENTER PANEL: Content Preview -->
		<div class="flex-1 flex flex-col overflow-y-auto" style="background: var(--bg-page);">
			<!-- Platform pill + char count -->
			<div
				class="flex items-center justify-between px-6 py-3 shrink-0"
				style="border-bottom: 1px solid var(--border-subtle);"
			>
				<div class="flex items-center gap-2">
					<span
						class="px-3 py-1.5 rounded-full text-xs font-bold capitalize"
						style="background: var(--c-electric); color: white;"
					>{post.platform}</span>
					<span
						class="px-3 py-1.5 rounded-full text-xs font-bold capitalize"
						style="background: var(--border-subtle); color: var(--text-dim);"
					>{post.postType}</span>
				</div>
				<span class="mono text-xs" style="color: var(--text-dim);">
					{charCount.toLocaleString()} characters
				</span>
			</div>

			<div class="flex-1 p-6 flex flex-col gap-5">
				<!-- Image preview -->
				{#if post.imageUrl}
					<div class="rounded-xl overflow-hidden border" style="border-color: var(--border-subtle);">
						<img
							src={post.imageUrl}
							alt={post.topic}
							class="w-full max-h-72 object-cover"
						/>
					</div>
					<div class="flex gap-2">
						<button
							class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:-translate-y-px cursor-pointer"
							style="border: 1px solid var(--border-subtle); color: var(--text-dim); background: var(--bg-surface-alt, var(--bg-surface));"
							onclick={downloadImage}
						>
							<Download class="w-3.5 h-3.5" />
							{m.review_download_image()}
						</button>
					</div>
				{:else}
					<div
						class="rounded-xl flex flex-col items-center justify-center py-10 border"
						style="border-color: var(--border-subtle); background: var(--bg-surface-alt, var(--bg-surface));"
					>
						<Image class="w-10 h-10 mb-2" style="color: var(--text-muted); opacity: 0.4;" />
						<span class="text-xs" style="color: var(--text-muted);">No image generated</span>
					</div>
				{/if}

				<!-- Social post preview card -->
				<div
					class="rounded-xl p-6"
					style="background: var(--bg-surface); border: 1px solid var(--border-subtle); box-shadow: var(--card-shadow);"
				>
					<!-- Author row -->
					<div class="flex items-center gap-3 mb-4">
						<div
							class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0"
							style="background: linear-gradient(135deg, var(--c-electric), var(--c-tertiary));"
						>B</div>
						<div>
							<div class="text-sm font-bold" style="color: var(--text-main);">
								{data.product?.name ?? 'BriefAgent'}
							</div>
							<div class="mono text-xs capitalize" style="color: var(--text-dim);">{post.platform}</div>
						</div>
					</div>
					<!-- Content -->
					{#if post.copyText}
						<div class="text-sm leading-relaxed whitespace-pre-line" style="color: var(--text-main);">
							{post.copyText}
						</div>
					{:else}
						<div class="text-sm italic" style="color: var(--text-muted);">
							No copy text generated yet.
						</div>
					{/if}
					<!-- Hashtags -->
					{#if post.hashtags && post.hashtags.length > 0}
						<div class="flex flex-wrap gap-1.5 mt-4">
							{#each post.hashtags as ht}
								<span class="text-sm font-semibold" style="color: var(--c-electric);">{ht}</span>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Action bar -->
				<div class="flex items-center gap-3">
					<button
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-px cursor-pointer"
						style="border: 1px solid var(--border-subtle); color: {copied ? 'var(--positive)' : 'var(--text-dim)'}; background: {copied ? 'rgba(34,197,94,0.08)' : 'transparent'};"
						onclick={copyToClipboard}
					>
						{#if copied}
							<Check class="w-3.5 h-3.5" />
							{m.review_copied()}
						{:else}
							<Copy class="w-3.5 h-3.5" />
							{m.review_copy_clipboard()}
						{/if}
					</button>
					<button
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-px cursor-pointer"
						style="border: 1px solid var(--border-subtle); color: var(--c-electric);"
						onclick={() => { dialogOpen = true; }}
					>
						{m.review_approve()} / {m.review_reject()}
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Review Dialog -->
	<PostReviewDialog {post} bind:open={dialogOpen} onupdate={() => invalidateAll()} />
{/if}
