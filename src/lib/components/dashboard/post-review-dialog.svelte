<script lang="ts">
	import { Dialog } from 'bits-ui';
	import {
		X,
		Check,
		Ban,
		RefreshCw,
		Copy,
		Download,
		Image,
		Clock,
		Loader2,
		Send
	} from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { postStatusColors, type PostStatus } from '$lib/utils/post-status';

	interface ReviewPost {
		id: string;
		topic: string;
		copyText: string | null;
		hashtags: string[] | null;
		imageUrl: string | null;
		scheduledAt: string | null;
		status: string;
		platform: string;
		keyMessage: string;
		contentCategory: string;
	}

	let {
		post,
		open = $bindable(false),
		onupdate
	}: {
		post: ReviewPost;
		open: boolean;
		onupdate?: () => void;
	} = $props();

	// -- Editing state --
	let editedCopy = $state(post.copyText ?? '');
	let editedHashtags = $state<string[]>(post.hashtags ? [...post.hashtags] : []);
	let editedScheduledAt = $state(formatForDatetimeLocal(post.scheduledAt));
	let hashtagInput = $state('');
	let rejectionReason = $state('');
	let showRejectForm = $state(false);

	// -- Loading state --
	let loadingApprove = $state(false);
	let loadingReject = $state(false);
	let loadingRegenCopy = $state(false);
	let loadingRegenImage = $state(false);
	let loadingRegenBoth = $state(false);
	let loadingPublish = $state(false);

	// -- Feedback state --
	let copied = $state(false);
	let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

	let charCount = $derived(editedCopy.length);
	let isAnyLoading = $derived(
		loadingApprove ||
			loadingReject ||
			loadingRegenCopy ||
			loadingRegenImage ||
			loadingRegenBoth ||
			loadingPublish
	);

	let statusInfo = $derived(postStatusColors[post.status as PostStatus] ?? postStatusColors.draft);

	// Reset form state when post changes
	$effect(() => {
		editedCopy = post.copyText ?? '';
		editedHashtags = post.hashtags ? [...post.hashtags] : [];
		editedScheduledAt = formatForDatetimeLocal(post.scheduledAt);
		rejectionReason = '';
		showRejectForm = false;
	});

	function formatForDatetimeLocal(iso: string | null): string {
		if (!iso) return '';
		const d = new Date(iso);
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	async function updatePost(body: Record<string, unknown>) {
		const res = await fetch(`/api/posts/${post.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!res.ok) throw new Error('Failed to update post');
		onupdate?.();
		open = false;
	}

	async function regeneratePost(type: 'copy' | 'image' | 'both') {
		if (type === 'copy') loadingRegenCopy = true;
		else if (type === 'image') loadingRegenImage = true;
		else loadingRegenBoth = true;

		try {
			const res = await fetch(`/api/posts/${post.id}/regenerate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type })
			});
			if (!res.ok) throw new Error('Failed to regenerate');
			onupdate?.();
			open = false;
		} finally {
			loadingRegenCopy = false;
			loadingRegenImage = false;
			loadingRegenBoth = false;
		}
	}

	async function handleApprove() {
		loadingApprove = true;
		try {
			await updatePost({
				status: 'scheduled',
				copyText: editedCopy,
				hashtags: editedHashtags,
				scheduledAt: editedScheduledAt || undefined
			});
		} finally {
			loadingApprove = false;
		}
	}

	async function handleReject() {
		loadingReject = true;
		try {
			await updatePost({
				status: 'rejected',
				rejectionReason
			});
		} finally {
			loadingReject = false;
		}
	}

	async function handleMarkPublished() {
		loadingPublish = true;
		try {
			await updatePost({ status: 'published' });
		} finally {
			loadingPublish = false;
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(editedCopy);
		} catch {
			// Fallback
			const ta = document.createElement('textarea');
			ta.value = editedCopy;
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
		if (!post.imageUrl) return;
		try {
			const res = await fetch(post.imageUrl);
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `briefagent-${post.id.slice(0, 8)}.jpg`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch {
			// silently fail
		}
	}

	function addHashtag(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		const val = hashtagInput.trim();
		if (!val) return;
		const tag = val.startsWith('#') ? val : `#${val}`;
		if (!editedHashtags.includes(tag)) {
			editedHashtags = [...editedHashtags, tag];
		}
		hashtagInput = '';
	}

	function removeHashtag(index: number) {
		editedHashtags = editedHashtags.filter((_, i) => i !== index);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
			style="animation: fadeIn 150ms ease-out;"
		/>
		<Dialog.Content
			class="fixed inset-0 z-50 m-auto max-w-4xl max-h-[90vh] w-[calc(100%-2rem)] h-fit rounded-2xl overflow-y-auto"
			style="
				background: var(--bg-surface);
				border: 1px solid var(--border-subtle);
				box-shadow: 0 25px 60px rgba(0,0,0,0.5);
				animation: dialogIn 200ms ease-out;
			"
		>
			<!-- Header -->
			<div
				class="sticky top-0 z-10 flex items-center justify-between p-5 pb-4"
				style="background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle);"
			>
				<div class="flex items-center gap-3 min-w-0">
					<Dialog.Title class="text-lg font-extrabold truncate" style="color: var(--text-main);">
						{post.topic}
					</Dialog.Title>
					<span
						class="text-[0.65rem] font-bold px-2.5 py-1 rounded-lg shrink-0"
						style="color: {statusInfo.color}; background: {statusInfo.bg};"
					>
						{statusInfo.label}
					</span>
				</div>
				<Dialog.Close
					class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0"
					style="color: var(--text-muted); border: 1px solid var(--border-subtle);"
				>
					<X class="w-4 h-4" />
				</Dialog.Close>
			</div>

			<div class="p-5 flex flex-col gap-6">
				<!-- Meta bar -->
				<div class="flex items-center gap-3 flex-wrap">
					<span
						class="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
						style="background: rgba(6,182,212,0.1); color: var(--c-electric);"
					>
						{post.platform}
					</span>
					<span class="text-[0.7rem]" style="color: var(--text-dim);">
						{post.contentCategory.replace('_', ' ')}
					</span>
					<span class="text-[0.65rem] italic" style="color: var(--text-muted);">
						{post.keyMessage.length > 80 ? post.keyMessage.slice(0, 80) + '...' : post.keyMessage}
					</span>
				</div>

				<!-- 1. Image preview -->
				<section>
					{#if post.imageUrl}
						<div class="rounded-xl overflow-hidden border" style="border-color: var(--border-subtle);">
							<img
								src={post.imageUrl}
								alt={post.topic}
								class="w-full max-h-64 object-cover"
							/>
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
					<div class="flex gap-2 mt-3">
						<button
							class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:-translate-y-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
							style="border: 1px solid var(--border-subtle); color: var(--text-dim); background: var(--bg-surface-alt, var(--bg-surface));"
							onclick={downloadImage}
							disabled={!post.imageUrl || isAnyLoading}
						>
							<Download class="w-3.5 h-3.5" />
							{m.review_download_image()}
						</button>
						<button
							class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:-translate-y-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
							style="border: 1px solid var(--border-subtle); color: var(--c-secondary); background: rgba(249,115,22,0.05);"
							onclick={() => regeneratePost('image')}
							disabled={isAnyLoading}
						>
							{#if loadingRegenImage}
								<Loader2 class="w-3.5 h-3.5 animate-spin" />
							{:else}
								<RefreshCw class="w-3.5 h-3.5" />
							{/if}
							{loadingRegenImage ? m.review_loading() : m.review_regenerate_image()}
						</button>
					</div>
				</section>

				<!-- 2. Copy editing -->
				<section>
					<label class="text-xs font-bold uppercase tracking-wider mb-2 block" style="color: var(--text-muted);">
						{m.review_edit_copy()}
					</label>
					<textarea
						bind:value={editedCopy}
						class="w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-y min-h-[120px] outline-none transition-colors"
						style="
							background: var(--input-bg, var(--bg-surface-alt));
							border: 1px solid var(--border-subtle);
							color: var(--text-main);
						"
						onfocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-electric)'; }}
						onblur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
					></textarea>
					<div class="flex items-center justify-between mt-1.5">
						<span
							class="text-[0.7rem] font-mono"
							style="color: {charCount > 3000 ? 'var(--negative)' : 'var(--text-muted)'};"
						>
							{charCount} {m.review_characters()}
						</span>
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
					</div>
				</section>

				<!-- 3. Hashtag editing -->
				<section>
					<label class="text-xs font-bold uppercase tracking-wider mb-2 block" style="color: var(--text-muted);">
						{m.review_hashtags()}
					</label>
					<div class="flex flex-wrap gap-2 mb-2">
						{#each editedHashtags as tag, i}
							<span
								class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
								style="background: rgba(6,182,212,0.1); color: var(--c-electric); border: 1px solid rgba(6,182,212,0.2);"
							>
								{tag}
								<button
									class="w-4 h-4 flex items-center justify-center rounded-full transition-colors cursor-pointer hover:bg-white/10"
									onclick={() => removeHashtag(i)}
								>
									<X class="w-3 h-3" />
								</button>
							</span>
						{/each}
					</div>
					<input
						type="text"
						bind:value={hashtagInput}
						onkeydown={addHashtag}
						placeholder={m.review_add_hashtag()}
						class="w-full rounded-lg px-3 py-2 text-sm outline-none"
						style="
							background: var(--input-bg, var(--bg-surface-alt));
							border: 1px solid var(--border-subtle);
							color: var(--text-main);
						"
					/>
				</section>

				<!-- 4. Scheduled date -->
				<section>
					<label class="text-xs font-bold uppercase tracking-wider mb-2 block" style="color: var(--text-muted);">
						<Clock class="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
						{m.review_scheduled_at()}
					</label>
					<input
						type="datetime-local"
						bind:value={editedScheduledAt}
						class="w-full rounded-lg px-3 py-2 text-sm outline-none"
						style="
							background: var(--input-bg, var(--bg-surface-alt));
							border: 1px solid var(--border-subtle);
							color: var(--text-main);
							color-scheme: dark;
						"
					/>
				</section>

				<!-- Reject form (conditionally shown) -->
				{#if showRejectForm}
					<section
						class="rounded-xl p-4"
						style="background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2);"
					>
						<label class="text-xs font-bold mb-2 block" style="color: var(--negative);">
							{m.review_reject_reason()}
						</label>
						<textarea
							bind:value={rejectionReason}
							class="w-full rounded-lg px-3 py-2 text-sm min-h-[60px] resize-y outline-none"
							style="
								background: var(--input-bg, var(--bg-surface-alt));
								border: 1px solid var(--border-subtle);
								color: var(--text-main);
							"
							placeholder={m.review_reject_reason()}
						></textarea>
						<div class="flex gap-2 mt-3">
							<button
								class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:-translate-y-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
								style="background: var(--negative);"
								onclick={handleReject}
								disabled={!rejectionReason.trim() || isAnyLoading}
							>
								{#if loadingReject}
									<Loader2 class="w-3.5 h-3.5 animate-spin" />
								{:else}
									<Ban class="w-3.5 h-3.5" />
								{/if}
								{loadingReject ? m.review_loading() : m.review_reject()}
							</button>
							<button
								class="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
								style="color: var(--text-dim); border: 1px solid var(--border-subtle);"
								onclick={() => { showRejectForm = false; rejectionReason = ''; }}
							>
								Cancel
							</button>
						</div>
					</section>
				{/if}

				<!-- 5. Action buttons -->
				<section class="flex flex-wrap gap-2 pt-2" style="border-top: 1px solid var(--border-subtle);">
					<!-- Approve -->
					<button
						class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
						style="background: #16a34a;"
						onclick={handleApprove}
						disabled={isAnyLoading}
					>
						{#if loadingApprove}
							<Loader2 class="w-4 h-4 animate-spin" />
						{:else}
							<Check class="w-4 h-4" />
						{/if}
						{loadingApprove ? m.review_loading() : m.review_approve()}
					</button>

					<!-- Reject -->
					{#if !showRejectForm}
						<button
							class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
							style="color: var(--negative); border: 1px solid var(--negative); background: rgba(239,68,68,0.05);"
							onclick={() => { showRejectForm = true; }}
							disabled={isAnyLoading}
						>
							<Ban class="w-4 h-4" />
							{m.review_reject()}
						</button>
					{/if}

					<!-- Mark Published (only when scheduled) -->
					{#if post.status === 'scheduled'}
						<button
							class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
							style="background: var(--c-electric);"
							onclick={handleMarkPublished}
							disabled={isAnyLoading}
						>
							{#if loadingPublish}
								<Loader2 class="w-4 h-4 animate-spin" />
							{:else}
								<Send class="w-4 h-4" />
							{/if}
							{loadingPublish ? m.review_loading() : m.review_mark_published()}
						</button>
					{/if}

					<div class="flex-1"></div>

					<!-- Regenerate copy -->
					<button
						class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:-translate-y-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
						style="border: 1px solid var(--border-subtle); color: var(--c-secondary); background: rgba(249,115,22,0.05);"
						onclick={() => regeneratePost('copy')}
						disabled={isAnyLoading}
					>
						{#if loadingRegenCopy}
							<Loader2 class="w-3.5 h-3.5 animate-spin" />
						{:else}
							<RefreshCw class="w-3.5 h-3.5" />
						{/if}
						{loadingRegenCopy ? m.review_loading() : m.review_regenerate_copy()}
					</button>

					<!-- Regenerate both -->
					<button
						class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:-translate-y-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
						style="border: 1px solid var(--border-subtle); color: var(--c-tertiary); background: rgba(236,72,153,0.05);"
						onclick={() => regeneratePost('both')}
						disabled={isAnyLoading}
					>
						{#if loadingRegenBoth}
							<Loader2 class="w-3.5 h-3.5 animate-spin" />
						{:else}
							<RefreshCw class="w-3.5 h-3.5" />
						{/if}
						{loadingRegenBoth ? m.review_loading() : m.review_regenerate_both()}
					</button>
				</section>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes dialogIn {
		from { opacity: 0; transform: scale(0.96) translateY(8px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}
</style>
