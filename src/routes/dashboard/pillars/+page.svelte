<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';
	import { Layers, Plus, Trash2, Save, Loader2, Check } from 'lucide-svelte';

	let { data, form } = $props();

	const platformOptions = {
		active: [
			{ slug: 'linkedin', name: 'LinkedIn', color: '#0a66c2' },
			{ slug: 'x', name: 'X (Twitter)', color: '#eff3f4' }
		],
		comingSoon: [
			{ slug: 'instagram', name: 'Instagram', color: '#e1306c' },
			{ slug: 'youtube', name: 'YouTube', color: '#ff0000' },
			{ slug: 'tiktok', name: 'TikTok', color: '#00f2ea' }
		]
	};

	let pillars = $state<Array<{ name: string; description: string; platforms: string[] }>>(
		data.pillars && data.pillars.length > 0
			? data.pillars.map(
					(p: { name: string; description: string | null; pillarPlatforms: { platform: string }[] }) => ({
						name: p.name,
						description: p.description ?? '',
						platforms: p.pillarPlatforms?.map((pp) => pp.platform) ?? []
					})
				)
			: []
	);

	let saving = $state(false);
	let saved = $state(false);

	const pillarSuggestions = [
		{ name: () => m.onb_brief_pillar_suggest_journey(), desc: '' },
		{ name: () => m.onb_brief_pillar_suggest_insights(), desc: '' },
		{ name: () => m.onb_brief_pillar_suggest_promo(), desc: '' },
		{ name: () => m.onb_brief_pillar_suggest_tips(), desc: '' },
		{ name: () => m.onb_brief_pillar_suggest_stories(), desc: '' }
	];

	function addPillar() {
		if (pillars.length < 5) {
			pillars = [...pillars, { name: '', description: '', platforms: [] }];
		}
	}

	function removePillar(index: number) {
		pillars = pillars.filter((_, i) => i !== index);
	}

	function togglePlatform(pillarIndex: number, slug: string) {
		const current = pillars[pillarIndex].platforms;
		if (current.includes(slug)) {
			pillars[pillarIndex].platforms = current.filter((p: string) => p !== slug);
		} else {
			pillars[pillarIndex].platforms = [...current, slug];
		}
		pillars = [...pillars];
	}

	function addSuggestion(suggestion: { name: () => string; desc: string }) {
		const name = suggestion.name();
		if (pillars.length < 5 && !pillars.some((p) => p.name === name)) {
			pillars = [...pillars, { name, description: suggestion.desc, platforms: [] }];
		}
	}
</script>

<svelte:head>
	<title>{m.pillars_title()} - BriefAgent</title>
</svelte:head>

<div style="animation: dash-fade-up 0.4s ease-out both;">
	<!-- Page header -->
	<div class="mb-8">
		<h1 class="text-[1.75rem] font-extrabold tracking-tight" style="color: var(--text-main);">
			<Layers class="inline-block w-7 h-7 -mt-1 mr-1.5" style="color: var(--c-electric);" />
			{m.pillars_title()}
		</h1>
		<p class="mt-1 text-sm" style="color: var(--text-dim);">
			{m.pillars_subtitle()}
		</p>
	</div>

	<!-- No product state -->
	{#if !data.hasProduct}
		<div
			class="flex flex-col items-center justify-center py-16 rounded-2xl"
			style="background: var(--bg-surface); border: 1px dashed var(--border-subtle);"
		>
			<div
				class="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
				style="background: var(--c-electric-glow);"
			>
				<Layers class="w-7 h-7" style="color: var(--c-electric);" />
			</div>
			<p class="text-[0.95rem] font-semibold mb-1" style="color: var(--text-main);">
				{m.pillars_no_product()}
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
	{:else}
		<form
			method="POST"
			action="?/save"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
					saved = true;
					setTimeout(() => {
						saved = false;
					}, 2000);
				};
			}}
		>
			<input type="hidden" name="pillars" value={JSON.stringify(pillars)} />

			<!-- Pillar cards -->
			<div class="space-y-4">
				{#if pillars.length === 0}
					<div
						class="flex flex-col items-center justify-center py-12 rounded-2xl"
						style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
					>
						<Layers class="w-8 h-8 mb-3" style="color: var(--text-muted);" />
						<p class="text-[0.85rem]" style="color: var(--text-dim);">
							{m.pillars_empty()}
						</p>
					</div>
				{/if}

				{#each pillars as pillar, i}
					<div
						class="relative rounded-2xl p-5"
						style="
							background: var(--bg-surface);
							border: 1px solid var(--border-subtle);
							animation: dash-fade-up 0.3s ease-out {0.05 * i}s both;
						"
					>
						<!-- Remove button -->
						<button
							type="button"
							onclick={() => removePillar(i)}
							class="absolute top-4 right-4 p-1.5 rounded-lg cursor-pointer transition-all duration-200"
							style="color: var(--text-muted); background: transparent;"
							onmouseenter={(e) => {
								e.currentTarget.style.color = 'var(--negative)';
								e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
							}}
							onmouseleave={(e) => {
								e.currentTarget.style.color = 'var(--text-muted)';
								e.currentTarget.style.background = 'transparent';
							}}
							title={m.pillars_remove()}
						>
							<Trash2 class="w-3.5 h-3.5" />
						</button>

						<div class="space-y-3 pr-8">
							<!-- Name -->
							<div class="space-y-1">
								<label class="block text-[0.75rem] font-semibold" style="color: var(--text-dim);">
									{m.pillars_name()}
								</label>
								<input
									type="text"
									bind:value={pillar.name}
									placeholder={m.pillars_name_placeholder()}
									class="w-full px-3 py-2.5 rounded-lg text-[0.85rem] outline-none transition-all duration-200"
									style="background: var(--input-bg, var(--bg-surface-alt)); border: 1px solid var(--border-subtle); color: var(--text-main);"
									onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
									onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
								/>
							</div>

							<!-- Description -->
							<div class="space-y-1">
								<label class="block text-[0.75rem] font-semibold" style="color: var(--text-dim);">
									{m.pillars_desc()}
								</label>
								<textarea
									bind:value={pillar.description}
									placeholder={m.pillars_desc_placeholder()}
									rows="2"
									class="w-full px-3 py-2.5 rounded-lg text-[0.85rem] outline-none transition-all duration-200 resize-none"
									style="background: var(--input-bg, var(--bg-surface-alt)); border: 1px solid var(--border-subtle); color: var(--text-main);"
									onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
									onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
								></textarea>
							</div>

							<!-- Platform toggle chips -->
							<div class="space-y-1">
								<label class="block text-[0.75rem] font-semibold" style="color: var(--text-dim);">
									{m.pillars_platforms()}
								</label>
								<div class="flex flex-wrap gap-2">
									{#each platformOptions.active as p}
										{@const selected = pillar.platforms.includes(p.slug)}
										<button
											type="button"
											onclick={() => togglePlatform(i, p.slug)}
											class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-all duration-200 cursor-pointer"
											style="
												background: {selected ? 'var(--c-electric-glow)' : 'var(--bg-surface-alt, var(--bg-surface))'};
												color: {selected ? 'var(--c-electric)' : 'var(--text-dim)'};
												border: 1px solid {selected ? 'var(--c-electric)' : 'var(--border-subtle)'};
											"
										>
											<span
												class="w-2 h-2 rounded-full shrink-0"
												style="background: {p.color};"
											></span>
											{p.name}
										</button>
									{/each}
									{#each platformOptions.comingSoon as p}
										<span
											class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-medium opacity-35 cursor-not-allowed"
											style="background: var(--bg-surface-alt, var(--bg-surface)); color: var(--text-muted); border: 1px solid var(--border-subtle);"
										>
											<span
												class="w-2 h-2 rounded-full shrink-0 opacity-50"
												style="background: {p.color};"
											></span>
											{p.name}
											<span class="text-[0.55rem] font-bold uppercase tracking-wider">Soon</span>
										</span>
									{/each}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Add pillar button -->
			{#if pillars.length < 5}
				<button
					type="button"
					onclick={addPillar}
					class="w-full mt-4 py-4 rounded-2xl text-[0.85rem] font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
					style="
						background: transparent;
						color: var(--text-dim);
						border: 2px dashed var(--border-subtle);
					"
					onmouseenter={(e) => {
						e.currentTarget.style.borderColor = 'var(--c-electric)';
						e.currentTarget.style.color = 'var(--c-electric)';
					}}
					onmouseleave={(e) => {
						e.currentTarget.style.borderColor = 'var(--border-subtle)';
						e.currentTarget.style.color = 'var(--text-dim)';
					}}
				>
					<Plus class="w-4 h-4" />
					{m.pillars_add()}
				</button>
			{:else}
				<p class="text-center text-[0.75rem] mt-4 font-medium" style="color: var(--text-muted);">
					{m.pillars_max()}
				</p>
			{/if}

			<!-- Quick add suggestions -->
			<div class="mt-5 flex flex-wrap items-center gap-2">
				<span class="text-[0.75rem] font-semibold" style="color: var(--text-muted);">
					{m.pillars_suggestions_label()}
				</span>
				{#each pillarSuggestions as suggestion}
					{@const alreadyAdded = pillars.some((p) => p.name === suggestion.name())}
					<button
						type="button"
						onclick={() => addSuggestion(suggestion)}
						disabled={alreadyAdded || pillars.length >= 5}
						class="px-2.5 py-1 rounded-lg text-[0.72rem] font-medium transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
						style="
							background: var(--bg-surface);
							color: var(--text-dim);
							border: 1px solid var(--border-subtle);
						"
						onmouseenter={(e) => {
							if (!alreadyAdded && pillars.length < 5) {
								e.currentTarget.style.borderColor = 'var(--c-electric)';
								e.currentTarget.style.color = 'var(--c-electric)';
							}
						}}
						onmouseleave={(e) => {
							e.currentTarget.style.borderColor = 'var(--border-subtle)';
							e.currentTarget.style.color = 'var(--text-dim)';
						}}
					>
						{suggestion.name()}
					</button>
				{/each}
			</div>

			<!-- Save button -->
			<div class="mt-8 flex items-center gap-3">
				<button
					type="submit"
					disabled={saving}
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.85rem] font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					style="background: var(--c-electric); color: var(--bg-page);"
					onmouseenter={(e) => {
						if (!saving) (e.currentTarget as HTMLElement).style.opacity = '0.85';
					}}
					onmouseleave={(e) => {
						(e.currentTarget as HTMLElement).style.opacity = '1';
					}}
				>
					{#if saving}
						<Loader2 class="w-4 h-4 animate-spin" />
						{m.pillars_save()}
					{:else if saved}
						<Check class="w-4 h-4" />
						{m.pillars_saved()}
					{:else}
						<Save class="w-4 h-4" />
						{m.pillars_save()}
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>
