<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Sparkles, Loader2, CheckCircle2, AlertCircle, RotateCcw, Calendar, Tag } from 'lucide-svelte';

	let { data } = $props();

	// Generation state machine
	let status = $state<'idle' | 'starting' | 'running' | 'completed' | 'failed'>('idle');
	let progress = $state('');
	let currentStep = $state(0);
	let totalSteps = $state(0);
	let jobId = $state<string | null>(null);
	let errorMsg = $state<string | null>(null);
	let resultId = $state<string | null>(null);

	let isGenerating = $derived(status === 'starting' || status === 'running');
	let progressPercent = $derived(totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0);

	let noProduct = $derived(!data.product || data.product.onboardingStep !== 'complete');

	async function startGeneration() {
		if (!data.product) return;

		status = 'starting';
		errorMsg = null;
		resultId = null;

		try {
			const res = await fetch('/api/generate/plan', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ productId: data.product.id })
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
		errorMsg = null;
		jobId = null;
		resultId = null;
		startGeneration();
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
			<button
				onclick={startGeneration}
				disabled={isGenerating}
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.85rem] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
				style="
					background: var(--c-electric);
					color: var(--bg-page);
				"
				onmouseenter={(e) => {
					if (!isGenerating) e.currentTarget.style.opacity = '0.85';
				}}
				onmouseleave={(e) => {
					e.currentTarget.style.opacity = '1';
				}}
			>
				{#if isGenerating}
					<Loader2 class="w-4 h-4 animate-spin" />
					{m.gen_button_generating()}
				{:else}
					<Sparkles class="w-4 h-4" />
					{m.gen_button()}
				{/if}
			</button>
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
							{progress || m.gen_progress_assembling()}
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
							{m.gen_completed()}
						</p>
					</div>
					<a
						href="/dashboard/publishing"
						class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.8rem] font-semibold transition-opacity"
						style="background: var(--c-electric); color: var(--bg-page);"
						onmouseenter={(e) => (e.currentTarget.style.opacity = '0.85')}
						onmouseleave={(e) => (e.currentTarget.style.opacity = '1')}
					>
						{m.gen_view_plan()}
					</a>
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

								<!-- Meta -->
								<div class="text-right shrink-0">
									<span class="block text-[0.75rem] font-medium" style="color: var(--text-muted);">
										{m.gen_plan_created({ date: formatDate(plan.createdAt) })}
									</span>
									<span
										class="block text-[0.75rem] font-semibold mt-0.5"
										style="color: var(--c-electric);"
									>
										{m.gen_plan_posts({ count: String(plan.postCount) })}
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
