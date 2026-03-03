<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import ProgressBar from '$lib/components/dashboard/progress-bar.svelte';
	import { AlertDialog } from 'bits-ui';
	import { Trash2 } from 'lucide-svelte';

	let { data } = $props();

	const voiceColors = [
		'linear-gradient(90deg, var(--c-electric), #22c55e)',
		'linear-gradient(90deg, var(--c-secondary), #eab308)',
		'linear-gradient(90deg, var(--c-tertiary), #a855f7)',
		'linear-gradient(90deg, #a855f7, var(--c-electric))',
		'linear-gradient(90deg, var(--positive), var(--c-electric))',
		'linear-gradient(90deg, var(--c-secondary), var(--c-tertiary))',
		'linear-gradient(90deg, #eab308, var(--positive))',
		'linear-gradient(90deg, var(--c-electric), var(--c-secondary))'
	];

	// Plan deletion
	let deletePlanTarget = $state<{ id: string; postsTotal: number } | null>(null);
	let deletePlanOpen = $state(false);
	let deletingPlanId = $state<string | null>(null);

	function openDeletePlan(id: string, postsTotal: number) {
		deletePlanTarget = { id, postsTotal };
		deletePlanOpen = true;
	}

	async function confirmDeletePlan() {
		if (!deletePlanTarget) return;
		deletingPlanId = deletePlanTarget.id;
		try {
			const res = await fetch(`/api/content-plans/${deletePlanTarget.id}`, { method: 'DELETE' });
			if (res.ok) {
				deletePlanOpen = false;
				deletePlanTarget = null;
				await invalidateAll();
			}
		} finally {
			deletingPlanId = null;
		}
	}
</script>

<svelte:head>
	<title>{m.dash_meta_title_brand()}</title>
</svelte:head>

{#if !data.brand}
	<!-- No product empty state -->
	<div
		class="mt-6 rounded-[14px] border p-8 text-center"
		style="border-color: var(--border-subtle); background: var(--bg-surface);"
	>
		<div class="text-3xl mb-3 opacity-40">&#128203;</div>
		<p class="text-sm" style="color: var(--text-dim);">
			{m.dash_brand_empty()}
		</p>
		<a
			href="/dashboard/onboarding"
			class="mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
			style="background: var(--c-electric);"
		>
			{m.dash_cta_onboarding_btn()}
		</a>
	</div>
{:else}
	<div class="grid grid-cols-1 xl:grid-cols-3 gap-6" style="animation: dash-fade-up 0.4s ease-out;">
		<!-- Left column -->
		<div class="col-span-1 flex flex-col gap-6">
			<!-- Brand Card -->
			<div
				class="rounded-[14px] border p-6 transition-shadow duration-200 hover:shadow-lg"
				style="background: var(--bg-surface); border-color: var(--border-subtle); box-shadow: var(--card-shadow);"
			>
				<div class="flex items-center gap-4 mb-5">
					{#if data.brand.logoUrl}
						<img
							src={data.brand.logoUrl}
							alt={data.brand.name}
							class="rounded-xl object-contain shrink-0"
							style="width: 56px; height: 56px; border: 1px solid var(--border-subtle); padding: 4px;"
						/>
					{:else}
						<div
							class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-extrabold shrink-0"
							style="background: linear-gradient(135deg, var(--c-electric), var(--c-tertiary));"
						>
							{data.brand.logoInitials}
						</div>
					{/if}
					<div>
						<div class="text-xl font-extrabold tracking-tight" style="color: var(--text-main);">
							{data.brand.name}
						</div>
						{#if data.brand.description}
							<div class="text-sm line-clamp-2" style="color: var(--text-dim);">{data.brand.description}</div>
						{/if}
					</div>
				</div>

				<!-- Stats -->
				<div class="text-center mb-4">
					<div class="text-3xl font-extrabold" style="color: var(--c-electric);">
						{data.stats?.totalPosts ?? 0}
					</div>
					<div class="text-xs" style="color: var(--text-dim);">Total Posts</div>
				</div>

				<!-- Tags -->
				<div class="flex flex-wrap gap-2">
					{#if data.brand.productType}
						<span class="text-xs px-3 py-1 rounded-full" style="background: rgba(6,182,212,0.1); color: var(--c-electric);">
							{data.brand.productType === 'personal_brand' ? m.settings_product_type_personal_brand() : data.brand.productType === 'product' ? m.settings_product_type_product() : m.settings_product_type_service()}
						</span>
					{/if}
					{#if data.brand.industry}
						<span
							class="text-xs px-3 py-1 rounded-full"
							style="background: var(--border-subtle); color: var(--text-dim);"
						>
							{data.brand.industry}
						</span>
					{/if}
					{#if data.brand.audience}
						<span
							class="text-xs px-3 py-1 rounded-full"
							style="background: var(--border-subtle); color: var(--text-dim);"
						>
							{data.brand.audience}
						</span>
					{/if}
				</div>
			</div>

			<!-- Brand Voice -->
			<div
				class="rounded-[14px] border p-6"
				style="background: var(--bg-surface); border-color: var(--border-subtle); box-shadow: var(--card-shadow);"
			>
				<h3 class="text-[0.9rem] font-bold tracking-tight mb-4 flex items-center gap-2" style="color: var(--text-main);">
					<span class="text-[0.85rem]">&#x1F3A4;</span>
					{m.dash_brand_voice_title()}
				</h3>

				{#if data.voice && data.voice.personalityTraits.length > 0}
					<div class="flex flex-col gap-4 mb-5">
						{#each data.voice.personalityTraits as trait, i}
							<div>
								<div class="flex items-center justify-between mb-1.5">
									<span class="text-[0.8rem] font-semibold capitalize" style="color: var(--text-main);">{trait}</span>
								</div>
								<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--border-subtle);">
									<div class="h-full rounded-full" style="width: 80%; background: {voiceColors[i % voiceColors.length]};"></div>
								</div>
							</div>
						{/each}
					</div>

					{#if data.voice.wordsToUse.length > 0}
						<div class="mb-3">
							<div class="text-[0.7rem] font-bold uppercase tracking-wider mb-1.5" style="color: var(--text-muted);">Words to use</div>
							<div class="flex flex-wrap gap-1.5">
								{#each data.voice.wordsToUse as word}
									<span class="text-[0.7rem] px-2 py-0.5 rounded-full" style="background: rgba(6,182,212,0.1); color: var(--c-electric);">
										{word}
									</span>
								{/each}
							</div>
						</div>
					{/if}

					{#if data.voice.wordsToAvoid.length > 0}
						<div>
							<div class="text-[0.7rem] font-bold uppercase tracking-wider mb-1.5" style="color: var(--text-muted);">Words to avoid</div>
							<div class="flex flex-wrap gap-1.5">
								{#each data.voice.wordsToAvoid as word}
									<span class="text-[0.7rem] px-2 py-0.5 rounded-full" style="background: rgba(239,68,68,0.1); color: var(--negative);">
										{word}
									</span>
								{/each}
							</div>
						</div>
					{/if}
				{:else}
					<p class="text-sm text-center py-4" style="color: var(--text-dim);">
						{m.dash_brand_no_voice()}
					</p>
				{/if}
			</div>

			</div>

		<!-- Right column -->
		<div class="xl:col-span-2 flex flex-col gap-6">
			<!-- Campaigns header -->
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-extrabold tracking-tight" style="color: var(--text-main);">
					{m.dash_brand_campaigns_title()}
				</h2>
				<a
					href="/dashboard/generate"
					class="text-[0.8rem] font-semibold px-4 py-2 rounded-[10px] border flex items-center gap-2 transition-all duration-200 cursor-pointer"
					style="color: var(--text-main); border-color: var(--border-subtle); background: transparent;"
				>
					+ {m.dash_brand_new_campaign()}
				</a>
			</div>

			{#if data.contentPlans.length > 0}
				<!-- Campaign cards grid -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{#each data.contentPlans as plan}
						{@const isComplete = plan.progress === 100}
						{@const borderColor = isComplete ? 'var(--positive)' : 'var(--c-electric)'}
						<div
							class="rounded-[14px] border p-5 relative overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
							style="
								background: var(--bg-surface);
								border-color: var(--border-subtle);
								box-shadow: var(--card-shadow);
								border-left: 3px solid {borderColor};
							"
						>
							<div class="flex items-start justify-between mb-3">
								<div>
									<div class="text-[0.95rem] font-bold tracking-tight" style="color: var(--text-main);">{plan.name}</div>
									{#if plan.createdAt}
										<div class="text-[0.65rem] mt-0.5" style="font-family: var(--font-mono); color: var(--text-dim);">
											{new Date(plan.createdAt).toLocaleDateString()}
										</div>
									{/if}
								</div>
								<div class="flex items-center gap-2 shrink-0">
									<span
										class="text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
										style="color: {isComplete ? 'var(--positive)' : 'var(--c-electric)'}; background: {isComplete ? 'rgba(52,211,153,0.1)' : 'rgba(6,182,212,0.1)'};"
									>
										<span class="w-1.5 h-1.5 rounded-full" style="background: {isComplete ? 'var(--positive)' : 'var(--c-electric)'};"></span>
										{isComplete ? m.dash_brand_status_completed() : m.dash_brand_status_active()}
									</span>
									<button
										onclick={(e) => { e.stopPropagation(); openDeletePlan(plan.id, plan.postsTotal); }}
										disabled={deletingPlanId === plan.id}
										class="flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150 cursor-pointer disabled:opacity-50"
										style="color: var(--negative); background: rgba(239,68,68,0.05);"
										onmouseenter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
										onmouseleave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
										title={m.gen_delete_plan()}
									>
										<Trash2 class="w-3 h-3" />
									</button>
								</div>
							</div>

							<!-- Themes -->
							{#if plan.themes.length > 0}
								<div class="flex flex-wrap gap-1.5 mb-3">
									{#each plan.themes.slice(0, 3) as theme}
										<span
											class="text-[0.65rem] font-medium px-2 py-0.5 rounded-md"
											style="font-family: var(--font-mono); background: var(--border-subtle); color: var(--text-dim);"
										>
											{theme}
										</span>
									{/each}
								</div>
							{/if}

							<!-- Progress -->
							<div class="mb-1 flex items-center justify-between">
								<span class="text-[0.65rem]" style="color: var(--text-dim);">Progress</span>
								<span class="text-[0.65rem]" style="font-family: var(--font-mono); color: var(--text-dim);">
									{plan.postsPublished}/{plan.postsTotal} posts
								</span>
							</div>
							<ProgressBar value={plan.progress} color={borderColor} />
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="rounded-[14px] border p-8 text-center"
					style="border-color: var(--border-subtle); background: var(--bg-surface);"
				>
					<div class="text-3xl mb-3 opacity-40">&#128640;</div>
					<p class="text-sm" style="color: var(--text-dim);">
						{m.dash_brand_no_campaigns()}
					</p>
					<a
						href="/dashboard/generate"
						class="mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
						style="background: var(--c-electric);"
					>
						{m.dash_cta_button()}
					</a>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Delete plan confirmation dialog -->
<AlertDialog.Root bind:open={deletePlanOpen}>
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
				{m.gen_delete_confirm_desc({ count: String(deletePlanTarget?.postsTotal ?? 0) })}
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
