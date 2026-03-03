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
		Send,
		Layers,
		MessageSquare,
		BarChart2,
		Plus,
		Trash2,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { postStatusColors, type PostStatus } from '$lib/utils/post-status';

	interface CarouselSlide {
		headline: string;
		body: string;
		imageUrl?: string;
		imagePrompt?: string;
	}

	interface ReviewPost {
		id: string;
		topic: string;
		copyText: string | null;
		hashtags: string[] | null;
		imageUrl: string | null;
		scheduledAt: string | null;
		status: string;
		platform: string;
		postType: string;
		keyMessage: string;
		contentCategory: string;
		contentData?: unknown;
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

	// -- Type-specific editing state --
	let cd = post.contentData as Record<string, unknown> | null | undefined;
	let editedSlides = $state<CarouselSlide[]>(cd?.slides ? [...(cd.slides as CarouselSlide[])] : []);
	let activeSlideIndex = $state(0);
	let editedTweets = $state<Array<{ text: string }>>(cd?.tweets ? [...(cd.tweets as Array<{ text: string }>)] : []);
	let editedPollQuestion = $state((cd?.question as string) ?? '');
	let editedPollOptions = $state<string[]>(cd?.options ? [...(cd.options as string[])] : []);

	// -- Loading state --
	let loadingApprove = $state(false);
	let loadingReject = $state(false);
	let loadingRegenCopy = $state(false);
	let loadingRegenImage = $state(false);
	let loadingRegenBoth = $state(false);
	let loadingPublish = $state(false);
	let loadingSlideRegen = $state<number | null>(null);

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
			loadingPublish ||
			loadingSlideRegen !== null
	);

	let statusInfo = $derived(postStatusColors[post.status as PostStatus] ?? postStatusColors.draft);

	// Map platform to CSS aspect-ratio for image containers
	const platformAspectRatio: Record<string, string> = {
		linkedin: '1 / 1',
		x: '16 / 9',
		instagram: '4 / 5',
		youtube: '16 / 9',
		tiktok: '9 / 16'
	};
	let imageAspect = $derived(platformAspectRatio[post.platform] ?? '1 / 1');

	// Reset form state when post changes
	$effect(() => {
		editedCopy = post.copyText ?? '';
		editedHashtags = post.hashtags ? [...post.hashtags] : [];
		editedScheduledAt = formatForDatetimeLocal(post.scheduledAt);
		rejectionReason = '';
		showRejectForm = false;
		cd = post.contentData as Record<string, unknown> | null | undefined;
		editedSlides = cd?.slides ? [...(cd.slides as CarouselSlide[])] : [];
		activeSlideIndex = 0;
		editedTweets = cd?.tweets ? [...(cd.tweets as Array<{ text: string }>)] : [];
		editedPollQuestion = (cd?.question as string) ?? '';
		editedPollOptions = cd?.options ? [...(cd.options as string[])] : [];
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

	async function regenerateSlide(index: number) {
		loadingSlideRegen = index;
		try {
			const res = await fetch(`/api/posts/${post.id}/regenerate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'slide', slideIndex: index })
			});
			if (!res.ok) throw new Error('Failed to regenerate slide');
			onupdate?.();
			open = false;
		} finally {
			loadingSlideRegen = null;
		}
	}

	function buildContentData(): Record<string, unknown> | undefined {
		if (post.postType === 'carousel') {
			return {
				...(post.contentData ?? {}),
				slides: editedSlides
			};
		}
		if (post.postType === 'thread') {
			return {
				...(post.contentData ?? {}),
				tweets: editedTweets
			};
		}
		if (post.postType === 'poll') {
			return {
				...(post.contentData ?? {}),
				question: editedPollQuestion,
				options: editedPollOptions
			};
		}
		return undefined;
	}

	async function handleApprove() {
		loadingApprove = true;
		try {
			const body: Record<string, unknown> = {
				status: 'scheduled',
				copyText: editedCopy,
				hashtags: editedHashtags,
				scheduledAt: editedScheduledAt || undefined
			};
			const cd = buildContentData();
			if (cd) body.contentData = cd;
			await updatePost(body);
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

				<!-- ═══ CAROUSEL EDITOR ═══ -->
				{#if post.postType === 'carousel'}
					<section>
						{#if editedSlides.length > 0}
						<label class="text-xs font-bold uppercase tracking-wider mb-2 block" style="color: var(--text-muted);">
							<Layers class="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
							{m.carousel_slide_of({ n: activeSlideIndex + 1, total: editedSlides.length })}
						</label>
						<!-- Slide strip thumbnails + generate all button -->
						<div class="flex items-center gap-3 mb-3">
							<div class="flex gap-2 overflow-x-auto pb-1 flex-1">
								{#each editedSlides as slide, i}
									<button
										class="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all"
										style="border-color: {i === activeSlideIndex ? 'var(--c-electric)' : 'var(--border-subtle)'};"
										onclick={() => { activeSlideIndex = i; }}
									>
										{#if slide.imageUrl}
											<img src={slide.imageUrl} alt="Slide {i + 1}" class="w-full h-full object-cover" />
										{:else}
											<div class="w-full h-full flex items-center justify-center text-[0.6rem] font-bold" style="background: var(--bg-surface-alt, var(--bg-surface)); color: var(--text-muted);">
												{i + 1}
											</div>
										{/if}
									</button>
								{/each}
							</div>
							<button
								class="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.7rem] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-px"
								style="border: 1px solid var(--border-subtle); color: var(--c-secondary); background: rgba(249,115,22,0.05);"
								onclick={() => regeneratePost('image')}
								disabled={isAnyLoading}
							>
								{#if loadingRegenImage}
									<Loader2 class="w-3.5 h-3.5 animate-spin" />
								{:else}
									<RefreshCw class="w-3.5 h-3.5" />
								{/if}
								{m.carousel_generate_all_images()}
							</button>
						</div>
						<!-- Active slide editor -->
						{#if editedSlides[activeSlideIndex]}
							<div class="rounded-xl p-4" style="border: 1px solid var(--border-subtle); background: var(--bg-surface-alt, var(--bg-surface));">
								{#if editedSlides[activeSlideIndex].imageUrl}
									<div
										class="rounded-lg overflow-hidden mb-3 mx-auto"
										style="aspect-ratio: 1 / 1; background: var(--bg-surface-alt, #0a0f14); max-height: 320px;"
									>
										<img src={editedSlides[activeSlideIndex].imageUrl} alt="Slide {activeSlideIndex + 1}" class="w-full h-full object-contain" />
									</div>
								{/if}
								<input
									type="text"
									bind:value={editedSlides[activeSlideIndex].headline}
									class="w-full rounded-lg px-3 py-2 text-sm font-bold outline-none mb-2"
									style="background: var(--input-bg, var(--bg-surface)); border: 1px solid var(--border-subtle); color: var(--text-main);"
									placeholder="Slide headline"
								/>
								<textarea
									bind:value={editedSlides[activeSlideIndex].body}
									class="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y min-h-[60px]"
									style="background: var(--input-bg, var(--bg-surface)); border: 1px solid var(--border-subtle); color: var(--text-main);"
									placeholder="Slide body text"
								></textarea>
								<div class="flex gap-2 mt-2">
									{#if activeSlideIndex > 0}
										<button
											class="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[0.7rem] cursor-pointer"
											style="color: var(--text-dim); border: 1px solid var(--border-subtle);"
											onclick={() => { activeSlideIndex--; }}
										>
											<ChevronLeft class="w-3 h-3" /> Prev
										</button>
									{/if}
									{#if activeSlideIndex < editedSlides.length - 1}
										<button
											class="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[0.7rem] cursor-pointer"
											style="color: var(--text-dim); border: 1px solid var(--border-subtle);"
											onclick={() => { activeSlideIndex++; }}
										>
											Next <ChevronRight class="w-3 h-3" />
										</button>
									{/if}
								</div>
							</div>
						{/if}
						{:else}
						<!-- Empty state: carousel not yet generated -->
						<div
							class="rounded-xl flex flex-col items-center justify-center py-10 border"
							style="border-color: var(--border-subtle); background: var(--bg-surface-alt, var(--bg-surface));"
						>
							<Layers class="w-10 h-10 mb-2" style="color: var(--text-muted); opacity: 0.4;" />
							<span class="text-sm font-bold mb-1" style="color: var(--text-muted);">Carousel not generated yet</span>
							<span class="text-xs" style="color: var(--text-dim);">Use "Regenerate Both" below to generate slides and images</span>
						</div>
						{/if}
					</section>

					<!-- Intro text (shown above carousel on LinkedIn) -->
					<section>
						<label class="text-xs font-bold uppercase tracking-wider mb-2 block" style="color: var(--text-muted);">
							{m.carousel_intro_text()}
						</label>
						<textarea
							bind:value={editedCopy}
							class="w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-y min-h-[80px] outline-none transition-colors"
							style="background: var(--input-bg, var(--bg-surface-alt)); border: 1px solid var(--border-subtle); color: var(--text-main);"
							onfocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-electric)'; }}
							onblur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
						></textarea>
					</section>

				<!-- ═══ THREAD EDITOR ═══ -->
				{:else if post.postType === 'thread'}
					<section>
						{#if editedTweets.length > 0}
						<label class="text-xs font-bold uppercase tracking-wider mb-2 block" style="color: var(--text-muted);">
							<MessageSquare class="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
							Thread ({editedTweets.length} tweets)
						</label>
						<div class="flex flex-col gap-3">
							{#each editedTweets as tweet, i}
								<div class="relative rounded-xl p-3" style="border: 1px solid var(--border-subtle); background: var(--bg-surface-alt, var(--bg-surface));">
									<div class="flex items-center justify-between mb-1.5">
										<span class="text-[0.65rem] font-bold" style="color: var(--text-muted);">
											{m.thread_tweet_n({ n: i + 1 })}
										</span>
										<span
											class="text-[0.6rem] font-mono"
											style="color: {tweet.text.length > 280 ? 'var(--negative)' : 'var(--text-muted)'};"
										>
											{tweet.text.length}/280
										</span>
									</div>
									<textarea
										bind:value={editedTweets[i].text}
										class="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y min-h-[60px]"
										style="background: var(--input-bg, var(--bg-surface)); border: 1px solid var(--border-subtle); color: var(--text-main);"
									></textarea>
									{#if editedTweets.length > 2}
										<button
											class="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full cursor-pointer"
											style="background: var(--negative); color: white;"
											onclick={() => { editedTweets = editedTweets.filter((_, idx) => idx !== i); }}
										>
											<Trash2 class="w-3 h-3" />
										</button>
									{/if}
								</div>
							{/each}
						</div>
						{#if editedTweets.length < 10}
							<button
								class="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
								style="border: 1px dashed var(--border-subtle); color: var(--text-dim);"
								onclick={() => { editedTweets = [...editedTweets, { text: '' }]; }}
							>
								<Plus class="w-3 h-3" />
								{m.thread_add_tweet()}
							</button>
						{/if}
						{:else}
						<!-- Empty state: thread not yet generated -->
						<div
							class="rounded-xl flex flex-col items-center justify-center py-10 border"
							style="border-color: var(--border-subtle); background: var(--bg-surface-alt, var(--bg-surface));"
						>
							<MessageSquare class="w-10 h-10 mb-2" style="color: var(--text-muted); opacity: 0.4;" />
							<span class="text-sm font-bold mb-1" style="color: var(--text-muted);">Thread not generated yet</span>
							<span class="text-xs" style="color: var(--text-dim);">Use "Regenerate Copy" below to generate tweets</span>
						</div>
						{/if}
					</section>

				<!-- ═══ POLL EDITOR ═══ -->
				{:else if post.postType === 'poll'}
					<section>
						<label class="text-xs font-bold uppercase tracking-wider mb-2 block" style="color: var(--text-muted);">
							<BarChart2 class="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
							{m.poll_question_label()}
						</label>
						<textarea
							bind:value={editedPollQuestion}
							class="w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-y min-h-[60px] outline-none"
							style="background: var(--input-bg, var(--bg-surface-alt)); border: 1px solid var(--border-subtle); color: var(--text-main);"
							placeholder={m.poll_question_label()}
						></textarea>

						<div class="flex flex-col gap-2 mt-3">
							{#each editedPollOptions as option, i}
								<div class="flex items-center gap-2">
									<span class="text-[0.65rem] font-bold shrink-0 w-4" style="color: var(--text-muted);">{i + 1}</span>
									<input
										type="text"
										bind:value={editedPollOptions[i]}
										class="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
										style="background: var(--input-bg, var(--bg-surface-alt)); border: 1px solid var(--border-subtle); color: var(--text-main);"
										maxlength={25}
										placeholder={m.poll_option_n({ n: i + 1 })}
									/>
									{#if editedPollOptions.length > 2}
										<button
											class="w-6 h-6 flex items-center justify-center rounded cursor-pointer"
											style="color: var(--negative);"
											onclick={() => { editedPollOptions = editedPollOptions.filter((_, idx) => idx !== i); }}
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									{/if}
								</div>
							{/each}
						</div>
						{#if editedPollOptions.length < 4}
							<button
								class="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
								style="border: 1px dashed var(--border-subtle); color: var(--text-dim);"
								onclick={() => { editedPollOptions = [...editedPollOptions, '']; }}
							>
								<Plus class="w-3 h-3" />
								{m.poll_add_option()}
							</button>
						{/if}

						<!-- Context post text -->
						<label class="text-xs font-bold uppercase tracking-wider mt-4 mb-2 block" style="color: var(--text-muted);">
							{m.review_edit_copy()}
						</label>
						<textarea
							bind:value={editedCopy}
							class="w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-y min-h-[80px] outline-none"
							style="background: var(--input-bg, var(--bg-surface-alt)); border: 1px solid var(--border-subtle); color: var(--text-main);"
						></textarea>
					</section>

				<!-- ═══ STANDARD (static_image / text_only) ═══ -->
				{:else}
					<!-- 1. Image preview -->
					<section>
						{#if post.imageUrl}
							<div
								class="rounded-xl overflow-hidden border mx-auto"
								style="border-color: var(--border-subtle); aspect-ratio: {imageAspect}; background: var(--bg-surface-alt, #0a0f14); max-height: 480px;"
							>
								<img
									src={post.imageUrl}
									alt={post.topic}
									class="w-full h-full object-contain"
								/>
							</div>
						{:else if post.postType === 'static_image'}
							<div
								class="rounded-xl flex flex-col items-center justify-center py-10 border"
								style="border-color: var(--border-subtle); background: var(--bg-surface-alt, var(--bg-surface));"
							>
								<Image class="w-10 h-10 mb-2" style="color: var(--text-muted); opacity: 0.4;" />
								<span class="text-xs" style="color: var(--text-muted);">No image generated</span>
							</div>
						{/if}
						{#if post.postType === 'static_image'}
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
						{/if}
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
				{/if}

				<!-- 3. Hashtag editing (shared across all types) -->
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
