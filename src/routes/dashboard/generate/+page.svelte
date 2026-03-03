<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import { AlertDialog, Popover } from 'bits-ui';
	import {
		Sparkles,
		Loader2,
		CheckCircle2,
		AlertCircle,
		RotateCcw,
		Calendar,
		Tag,
		FileText,
		ImageIcon,
		Trash2,
		Check
	} from 'lucide-svelte';

	let { data } = $props();

	// Generation state machine
	let status = $state<'idle' | 'starting' | 'running' | 'completed' | 'failed'>('idle');
	let progress = $state('');
	let currentStep = $state(0);
	let totalSteps = $state(0);
	let jobId = $state<string | null>(null);
	let errorMsg = $state<string | null>(null);
	let resultId = $state<string | null>(null);

	// Track which job type is active
	let activeJobType = $state<'plan' | 'posts' | null>(null);

	// Pillar selection
	let selectedPillarIds = $state(new Set(data.pillars.map((p: { id: string }) => p.id)));
	let showPillarPicker = $state(false);
	let hasPillars = $derived(data.pillars.length > 0);

	let postCountMin = $derived(() => {
		const totalPlatformPosts = [...selectedPillarIds].reduce((sum, id) => {
			const pillar = data.pillars.find((p: { id: string }) => p.id === id);
			return sum + Math.max(1, pillar?.platforms?.length ?? 1);
		}, 0);
		return Math.max(4, totalPlatformPosts);
	});
	let postCountMax = $derived(() => {
		return Math.min(20, Math.max(postCountMin(), Math.ceil(postCountMin() * 1.5)));
	});

	function togglePillar(id: string) {
		const next = new Set(selectedPillarIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedPillarIds = next;
	}

	function toggleAllPillars() {
		if (selectedPillarIds.size === data.pillars.length) {
			selectedPillarIds = new Set();
		} else {
			selectedPillarIds = new Set(data.pillars.map((p: { id: string }) => p.id));
		}
	}

	let isGenerating = $derived(status === 'starting' || status === 'running');
	let progressPercent = $derived(totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0);

	let noProduct = $derived(!data.product || data.product.onboardingStep !== 'complete');

	async function startGeneration() {
		if (!data.product) return;

		showPillarPicker = false;
		status = 'starting';
		activeJobType = 'plan';
		errorMsg = null;
		resultId = null;

		const body: Record<string, unknown> = { productId: data.product.id };
		if (hasPillars && selectedPillarIds.size > 0) {
			body.pillarIds = [...selectedPillarIds];
		}

		try {
			const res = await fetch('/api/generate/plan', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Request failed' }));
				throw new Error(err.message ?? 'Request failed');
			}

			const { jobId: newJobId } = await res.json();
			jobId = newJobId;
			status = 'running';
			connectSSE(newJobId);
		} catch (err) {
			status = 'failed';
			errorMsg = err instanceof Error ? err.message : 'Unknown error';
		}
	}

	async function startPostGeneration(contentPlanId: string) {
		status = 'starting';
		activeJobType = 'posts';
		errorMsg = null;
		resultId = null;

		try {
			const res = await fetch('/api/generate/posts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ contentPlanId })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Request failed' }));
				throw new Error(err.message ?? 'Request failed');
			}

			const { jobId: newJobId } = await res.json();
			jobId = newJobId;
			status = 'running';
			connectSSE(newJobId);
		} catch (err) {
			status = 'failed';
			errorMsg = err instanceof Error ? err.message : 'Unknown error';
		}
	}

	function connectSSE(id: string) {
		const source = new EventSource(`/api/jobs/${id}/stream`);

		source.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				progress = data.progress ?? '';
				currentStep = data.currentStep ?? 0;
				totalSteps = data.totalSteps ?? 0;

				if (data.status === 'completed') {
					status = 'completed';
					resultId = data.resultId;
					source.close();
				} else if (data.status === 'failed') {
					status = 'failed';
					errorMsg = data.error ?? 'Generation failed';
					source.close();
				} else if (data.status === 'running') {
					status = 'running';
				}
			} catch {
				// Ignore parse errors
			}
		};

		source.onerror = () => {
			source.close();
			// Fall back to polling
			if (status === 'running' || status === 'starting') {
				pollJobStatus(id);
			}
		};
	}

	function pollJobStatus(id: string) {
		const interval = setInterval(async () => {
			try {
				const res = await fetch(`/api/jobs/${id}`);
				if (!res.ok) {
					clearInterval(interval);
					status = 'failed';
					errorMsg = 'Failed to check job status';
					return;
				}

				const data = await res.json();
				progress = data.progress ?? '';
				currentStep = data.currentStep ?? 0;
				totalSteps = data.totalSteps ?? 0;

				if (data.status === 'completed') {
					status = 'completed';
					resultId = data.resultId;
					clearInterval(interval);
				} else if (data.status === 'failed') {
					status = 'failed';
					errorMsg = data.error ?? 'Generation failed';
					clearInterval(interval);
				}
			} catch {
				clearInterval(interval);
				status = 'failed';
				errorMsg = 'Connection lost';
			}
		}, 3000);
	}

	function retry() {
		status = 'idle';
		activeJobType = null;
		errorMsg = null;
		jobId = null;
		resultId = null;
		startGeneration();
	}

	function resetStatus() {
		status = 'idle';
		activeJobType = null;
		errorMsg = null;
		jobId = null;
		resultId = null;
	}

	function formatDate(iso: string | null): string {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function truncate(text: string, max: number): string {
		if (text.length <= max) return text;
		return text.slice(0, max).trimEnd() + '...';
	}

	// Plan deletion
	let deletePlanTarget = $state<{ id: string; postCount: number } | null>(null);
	let deleteConfirmOpen = $state(false);
	let deletingPlanId = $state<string | null>(null);

	function openDeletePlan(id: string, postCount: number) {
		deletePlanTarget = { id, postCount };
		deleteConfirmOpen = true;
	}

	async function confirmDeletePlan() {
		if (!deletePlanTarget) return;
		deletingPlanId = deletePlanTarget.id;
		try {
			const res = await fetch(`/api/content-plans/${deletePlanTarget.id}`, { method: 'DELETE' });
			if (res.ok) {
				deleteConfirmOpen = false;
				deletePlanTarget = null;
				await invalidateAll();
			}
		} finally {
			deletingPlanId = null;
		}
	}
</script>

<svelte:head>
	<title>{m.gen_title()} - BriefAgent</title>
</svelte:head>

<div style="animation: dash-fade-up 0.4s ease-out both;">
	<!-- Page header -->
	<div class="flex items-start justify-between gap-4 mb-8">
		<div>
			<h1 class="text-[1.75rem] font-extrabold tracking-tight" style="color: var(--text-main);">
				<Sparkles class="inline-block w-7 h-7 -mt-1 mr-1.5" style="color: var(--c-electric);" />
				{m.gen_title()}
			</h1>
			<p class="mt-1 text-sm" style="color: var(--text-dim);">
				{m.gen_subtitle()}
			</p>
		</div>

		{#if !noProduct}
			{#if hasPillars}
				<Popover.Root bind:open={showPillarPicker}>
					<Popover.Trigger
						disabled={isGenerating}
						class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.85rem] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
						style="
							background: var(--c-electric);
							color: var(--bg-page);
						"
						onmouseenter={(e) => {
							if (!isGenerating) (e.currentTarget as HTMLElement).style.opacity = '0.85';
						}}
						onmouseleave={(e) => {
							(e.currentTarget as HTMLElement).style.opacity = '1';
						}}
					>
						{#if isGenerating && activeJobType === 'plan'}
							<Loader2 class="w-4 h-4 animate-spin" />
							{m.gen_button_generating()}
						{:else}
							<Sparkles class="w-4 h-4" />
							{m.gen_button()}
						{/if}
					</Popover.Trigger>

					<Popover.Portal>
						<Popover.Content
							class="z-50 w-[300px] rounded-[14px] shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
							style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
							sideOffset={6}
							align="end"
						>
							<!-- Header -->
							<div class="flex items-center justify-between px-4 pt-3.5 pb-2">
								<span
									class="text-[0.7rem] font-bold uppercase tracking-[0.1em]"
									style="color: var(--text-muted);"
								>
									{m.gen_select_pillars()}
								</span>
								<button
									class="text-[0.7rem] font-semibold cursor-pointer transition-opacity"
									style="color: var(--c-electric);"
									onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
									onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
									onclick={toggleAllPillars}
								>
									{selectedPillarIds.size === data.pillars.length ? m.gen_select_none() : m.gen_select_all()}
								</button>
							</div>

							<!-- Pillar list -->
							<div class="px-2 py-1 max-h-[240px] overflow-y-auto">
								{#each data.pillars as pillar}
									{@const selected = selectedPillarIds.has(pillar.id)}
									<button
										class="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-left transition-colors duration-100 cursor-pointer"
										style="background: {selected ? 'var(--c-electric-glow)' : 'transparent'};"
										onmouseenter={(e) => {
											(e.currentTarget as HTMLElement).style.background = selected ? 'var(--c-electric-glow)' : 'var(--bg-sidebar-hover)';
										}}
										onmouseleave={(e) => {
											(e.currentTarget as HTMLElement).style.background = selected ? 'var(--c-electric-glow)' : 'transparent';
										}}
										onclick={() => togglePillar(pillar.id)}
									>
										<!-- Checkbox -->
										<div
											class="flex items-center justify-center w-4.5 h-4.5 rounded-md shrink-0 transition-colors duration-100"
											style="
												width: 18px; height: 18px;
												background: {selected ? 'var(--c-electric)' : 'transparent'};
												border: {selected ? 'none' : '1.5px solid var(--border-subtle)'};
											"
										>
											{#if selected}
												<Check class="w-3 h-3" style="color: var(--bg-page);" />
											{/if}
										</div>

										<!-- Name -->
										<span
											class="text-[0.82rem] font-medium truncate flex-1"
											style="color: var(--text-main);"
										>
											{pillar.name}
										</span>

										<!-- Platform badges -->
										{#if pillar.platforms?.length > 0}
											<div class="flex gap-1 shrink-0">
												{#each pillar.platforms as platform}
													<span
														class="mono text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
														style="background: var(--bg-sidebar-hover); color: var(--text-muted);"
													>
														{platform === 'x' ? 'X' : 'LI'}
													</span>
												{/each}
											</div>
										{/if}
									</button>
								{/each}
							</div>

							<!-- Footer -->
							<div
								class="px-4 py-3 flex items-center justify-between"
								style="border-top: 1px solid var(--border-subtle);"
							>
								<span class="text-[0.75rem] font-medium" style="color: var(--text-muted);">
									{#if selectedPillarIds.size === 0}
										{m.gen_no_pillars_selected()}
									{:else}
										{m.gen_posts_estimate({ min: String(postCountMin()), max: String(postCountMax()) })}
									{/if}
								</span>
								<button
									onclick={startGeneration}
									disabled={selectedPillarIds.size === 0}
									class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[0.8rem] font-semibold transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
									style="background: var(--c-electric); color: var(--bg-page);"
									onmouseenter={(e) => {
										if (selectedPillarIds.size > 0) (e.currentTarget as HTMLElement).style.opacity = '0.85';
									}}
									onmouseleave={(e) => {
										(e.currentTarget as HTMLElement).style.opacity = '1';
									}}
								>
									<Sparkles class="w-3.5 h-3.5" />
									{m.gen_generate()}
								</button>
							</div>
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
			{:else}
				<button
					onclick={startGeneration}
					disabled={isGenerating}
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.85rem] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
					style="
						background: var(--c-electric);
						color: var(--bg-page);
					"
					onmouseenter={(e) => {
						if (!isGenerating) (e.currentTarget as HTMLElement).style.opacity = '0.85';
					}}
					onmouseleave={(e) => {
						e.currentTarget.style.opacity = '1';
					}}
				>
					{#if isGenerating && activeJobType === 'plan'}
						<Loader2 class="w-4 h-4 animate-spin" />
						{m.gen_button_generating()}
					{:else}
						<Sparkles class="w-4 h-4" />
						{m.gen_button()}
					{/if}
				</button>
			{/if}
		{/if}
	</div>

	<!-- No product warning -->
	{#if noProduct}
		<div
			class="flex flex-col items-center justify-center py-16 rounded-2xl"
			style="background: var(--bg-surface); border: 1px dashed var(--border-subtle);"
		>
			<div
				class="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
				style="background: var(--c-electric-glow);"
			>
				<Sparkles class="w-7 h-7" style="color: var(--c-electric);" />
			</div>
			<p class="text-[0.95rem] font-semibold mb-1" style="color: var(--text-main);">
				{m.gen_no_product()}
			</p>
			<a
				href="/dashboard/onboarding/quick-start"
				class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.8rem] font-semibold transition-opacity"
				style="background: var(--c-electric); color: var(--bg-page);"
				onmouseenter={(e) => (e.currentTarget.style.opacity = '0.85')}
				onmouseleave={(e) => (e.currentTarget.style.opacity = '1')}
			>
				{m.gen_no_product_cta()}
			</a>
		</div>
	{/if}

	<!-- Progress card -->
	{#if status !== 'idle' && !noProduct}
		<div
			class="rounded-2xl p-6 mb-8"
			style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
		>
			{#if status === 'starting' || status === 'running'}
				<div class="flex items-center gap-4 mb-4">
					<div
						class="flex items-center justify-center w-10 h-10 rounded-xl"
						style="background: var(--c-electric-glow);"
					>
						<Loader2 class="w-5 h-5 animate-spin" style="color: var(--c-electric);" />
					</div>
					<div>
						<p class="text-[0.9rem] font-semibold" style="color: var(--text-main);">
							{#if activeJobType === 'posts'}
								{progress || m.gen_posts_generating()}
							{:else}
								{progress || m.gen_progress_assembling()}
							{/if}
						</p>
						{#if totalSteps > 0}
							<p class="text-[0.75rem] mt-0.5" style="color: var(--text-muted);">
								{m.gen_progress_step({ current: String(currentStep), total: String(totalSteps) })}
							</p>
						{/if}
					</div>
				</div>
				<!-- Progress bar -->
				<div
					class="h-1.5 rounded-full overflow-hidden"
					style="background: var(--border-subtle);"
				>
					<div
						class="h-full rounded-full transition-all duration-500 ease-out"
						style="width: {progressPercent}%; background: var(--c-electric);"
					></div>
				</div>
			{:else if status === 'completed'}
				<div class="flex items-center gap-4">
					<div
						class="flex items-center justify-center w-10 h-10 rounded-xl"
						style="background: rgba(34, 197, 94, 0.1);"
					>
						<CheckCircle2 class="w-5 h-5" style="color: var(--positive, #22c55e);" />
					</div>
					<div class="flex-1">
						<p class="text-[0.9rem] font-semibold" style="color: var(--positive, #22c55e);">
							{#if activeJobType === 'posts'}
								{m.gen_posts_completed()}
							{:else}
								{m.gen_completed()}
							{/if}
						</p>
					</div>
					<button
						onclick={resetStatus}
						class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.8rem] font-semibold transition-opacity cursor-pointer"
						style="background: var(--c-electric); color: var(--bg-page);"
						onmouseenter={(e) => (e.currentTarget.style.opacity = '0.85')}
						onmouseleave={(e) => (e.currentTarget.style.opacity = '1')}
					>
						{m.gen_view_plan()}
					</button>
				</div>
			{:else if status === 'failed'}
				<div class="flex items-center gap-4">
					<div
						class="flex items-center justify-center w-10 h-10 rounded-xl"
						style="background: rgba(239, 68, 68, 0.1);"
					>
						<AlertCircle class="w-5 h-5" style="color: var(--negative, #ef4444);" />
					</div>
					<div class="flex-1">
						<p class="text-[0.9rem] font-semibold" style="color: var(--negative, #ef4444);">
							{m.gen_failed()}
						</p>
						{#if errorMsg}
							<p class="text-[0.75rem] mt-0.5" style="color: var(--text-muted);">
								{errorMsg}
							</p>
						{/if}
					</div>
					<button
						onclick={retry}
						class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.8rem] font-semibold transition-opacity cursor-pointer"
						style="background: var(--bg-sidebar-hover); color: var(--text-main);"
						onmouseenter={(e) => (e.currentTarget.style.opacity = '0.85')}
						onmouseleave={(e) => (e.currentTarget.style.opacity = '1')}
					>
						<RotateCcw class="w-3.5 h-3.5" />
						{m.gen_retry()}
					</button>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Existing plans -->
	{#if !noProduct}
		<div>
			<h2 class="text-[0.95rem] font-bold mb-4" style="color: var(--text-main);">
				{m.gen_existing_plans()}
			</h2>

			{#if data.existingPlans.length === 0}
				<div
					class="flex flex-col items-center justify-center py-12 rounded-2xl"
					style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
				>
					<Calendar class="w-8 h-8 mb-3" style="color: var(--text-muted);" />
					<p class="text-[0.85rem]" style="color: var(--text-dim);">
						{m.gen_no_plans()}
					</p>
				</div>
			{:else}
				<div class="grid gap-4">
					{#each data.existingPlans as plan, i}
						<div
							class="rounded-2xl p-5 transition-all duration-200"
							style="
								background: var(--bg-surface);
								border: 1px solid var(--border-subtle);
								animation: dash-fade-up 0.3s ease-out {0.05 * i}s both;
							"
						>
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1 min-w-0">
									<p class="text-[0.85rem] leading-relaxed" style="color: var(--text-dim);">
										{truncate(plan.strategyOverview, 150)}
									</p>

									<!-- Themes -->
									{#if plan.contentThemes?.length}
										<div class="flex flex-wrap gap-1.5 mt-3">
											{#each plan.contentThemes as theme}
												<span
													class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.7rem] font-medium"
													style="background: var(--c-electric-glow); color: var(--c-electric);"
												>
													<Tag class="w-2.5 h-2.5" />
													{theme}
												</span>
											{/each}
										</div>
									{/if}
								</div>

								<!-- Meta + Generate Posts -->
								<div class="text-right shrink-0 flex flex-col items-end gap-2">
									<span class="block text-[0.75rem] font-medium" style="color: var(--text-muted);">
										{m.gen_plan_created({ date: formatDate(plan.createdAt) })}
									</span>
									<span
										class="block text-[0.75rem] font-semibold"
										style="color: var(--c-electric);"
									>
										{m.gen_plan_posts({ count: String(plan.postCount) })}
									</span>

									{#if plan.postsGenerated}
										<span
											class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[0.7rem] font-semibold"
											style="background: rgba(34, 197, 94, 0.1); color: var(--positive, #22c55e);"
										>
											<CheckCircle2 class="w-3 h-3" />
											{m.gen_posts_generated_badge()}
											<span style="color: var(--text-muted);">
												({m.gen_posts_count({ count: String(plan.generatedPostCount) })})
											</span>
										</span>
									{:else}
										<button
											onclick={() => startPostGeneration(plan.id)}
											disabled={isGenerating}
											class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
											style="background: var(--c-flame); color: white;"
											onmouseenter={(e) => {
												if (!isGenerating) e.currentTarget.style.opacity = '0.85';
											}}
											onmouseleave={(e) => {
												e.currentTarget.style.opacity = '1';
											}}
										>
											{#if isGenerating && activeJobType === 'posts'}
												<Loader2 class="w-3 h-3 animate-spin" />
												{m.gen_posts_generating()}
											{:else}
												<ImageIcon class="w-3 h-3" />
												{m.gen_posts_button()}
											{/if}
										</button>
									{/if}
									<button
										onclick={() => openDeletePlan(plan.id, plan.postCount)}
										disabled={deletingPlanId === plan.id}
										class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[0.7rem] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
										style="color: var(--negative); background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15);"
										onmouseenter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
										onmouseleave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
										title={m.gen_delete_plan()}
									>
										<Trash2 class="w-3 h-3" />
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Delete plan confirmation dialog -->
<AlertDialog.Root bind:open={deleteConfirmOpen}>
	<AlertDialog.Portal>
		<AlertDialog.Overlay
			class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
			style="animation: fadeIn 150ms ease-out;"
		/>
		<AlertDialog.Content
			class="fixed inset-0 z-50 m-auto max-w-md w-[calc(100%-2rem)] h-fit rounded-2xl p-6"
			style="
				background: var(--bg-surface);
				border: 1px solid var(--border-subtle);
				box-shadow: 0 25px 60px rgba(0,0,0,0.5);
				animation: dialogIn 200ms ease-out;
			"
		>
			<div class="flex items-center gap-3 mb-4">
				<div
					class="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
					style="background: rgba(239,68,68,0.1);"
				>
					<Trash2 class="w-5 h-5" style="color: var(--negative);" />
				</div>
				<AlertDialog.Title class="text-lg font-extrabold tracking-tight" style="color: var(--text-main);">
					{m.gen_delete_confirm_title()}
				</AlertDialog.Title>
			</div>

			<AlertDialog.Description class="text-[0.85rem] leading-relaxed mb-6" style="color: var(--text-dim);">
				{m.gen_delete_confirm_desc({ count: String(deletePlanTarget?.postCount ?? 0) })}
			</AlertDialog.Description>

			<div class="flex items-center justify-end gap-3">
				<AlertDialog.Cancel
					class="px-4 py-2 rounded-[10px] text-[0.85rem] font-semibold transition-colors duration-150 cursor-pointer"
					style="color: var(--text-dim); background: var(--border-subtle);"
				>
					{m.gen_delete_cancel()}
				</AlertDialog.Cancel>
				<AlertDialog.Action
					class="px-4 py-2 rounded-[10px] text-[0.85rem] font-bold text-white transition-all duration-150 cursor-pointer disabled:opacity-50"
					style="background: var(--negative);"
					onclick={confirmDeletePlan}
					disabled={deletingPlanId !== null}
				>
					{deletingPlanId ? '...' : m.gen_delete_confirm_btn()}
				</AlertDialog.Action>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
