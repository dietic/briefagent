<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';
	import {
		ArrowLeft,
		Globe,
		Save,
		Loader2,
		Check,
		Lock,
		AlertTriangle
	} from 'lucide-svelte';

	let { data, form } = $props();

	let saving = $state(false);
	let saved = $state(false);
	let savingPlatforms = $state(false);

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

	// Build mutable platform state from server data
	let pillarPlatformState = $state<Record<string, string[]>>(
		Object.fromEntries(
			data.pillars.map((p: { id: string; pillarPlatforms?: { platform: string }[] }) => [
				p.id,
				p.pillarPlatforms?.map((pp) => pp.platform) ?? []
			])
		)
	);

	function toggleSettingsPlatform(pillarId: string, slug: string) {
		const current = pillarPlatformState[pillarId] ?? [];
		if (current.includes(slug)) {
			pillarPlatformState[pillarId] = current.filter((p) => p !== slug);
		} else {
			pillarPlatformState[pillarId] = [...current, slug];
		}
		pillarPlatformState = { ...pillarPlatformState };
	}

	let platformDataJson = $derived(
		JSON.stringify(
			data.pillars.map((p: { id: string }) => ({
				pillarId: p.id,
				platforms: pillarPlatformState[p.id] ?? []
			}))
		)
	);

	function resetSaved() {
		if (saved) {
			setTimeout(() => { saved = false; }, 2000);
		}
	}

</script>

<svelte:head>
	<title>{data.settingsProduct.name} - {m.dash_nav_settings()}</title>
</svelte:head>

<div style="animation: dash-fade-up 0.4s ease-out;">
	<!-- Back link -->
	<a
		href="/dashboard/settings"
		class="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold mb-6 transition-colors"
		style="color: var(--c-electric);"
	>
		<ArrowLeft class="w-4 h-4" />
		{m.settings_back()}
	</a>

	<h1 class="text-2xl font-extrabold tracking-tight mb-8" style="color: var(--text-main);">
		{data.settingsProduct.name}
	</h1>

	<!-- Section 1: Product Details -->
	<section
		class="rounded-[14px] border p-6 mb-6"
		style="background: var(--bg-surface); border-color: var(--border-subtle); box-shadow: var(--card-shadow);"
	>
		<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4" style="color: var(--text-muted);">
			{m.settings_product_details()}
		</h2>

		<form
			method="POST"
			action="?/updateProduct"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
					saved = true;
					resetSaved();
				};
			}}
		>
			<div class="flex flex-col gap-4">
				<div>
					<label class="text-xs font-bold mb-1 block" style="color: var(--text-dim);">
						{m.settings_product_name()}
					</label>
					<input
						type="text"
						name="name"
						value={data.settingsProduct.name}
						required
						class="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
						style="background: var(--input-bg, var(--bg-surface-alt)); border: 1px solid var(--border-subtle); color: var(--text-main);"
					/>
				</div>
				<div>
					<label class="text-xs font-bold mb-1 block" style="color: var(--text-dim);">
						{m.settings_product_description()}
					</label>
					<textarea
						name="description"
						class="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-y min-h-[80px]"
						style="background: var(--input-bg, var(--bg-surface-alt)); border: 1px solid var(--border-subtle); color: var(--text-main);"
					>{data.settingsProduct.description ?? ''}</textarea>
				</div>
				<div>
					<label class="text-xs font-bold mb-1 block" style="color: var(--text-dim);">
						<Globe class="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
						{m.settings_product_url()}
					</label>
					<input
						type="url"
						name="websiteUrl"
						value={data.settingsProduct.websiteUrl ?? ''}
						class="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
						style="background: var(--input-bg, var(--bg-surface-alt)); border: 1px solid var(--border-subtle); color: var(--text-main);"
						placeholder="https://..."
					/>
				</div>

				<div class="flex items-center gap-3 pt-2">
					<button
						type="submit"
						class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50"
						style="background: var(--c-electric);"
						disabled={saving}
					>
						{#if saving}
							<Loader2 class="w-4 h-4 animate-spin" />
							{m.settings_saving()}
						{:else if saved}
							<Check class="w-4 h-4" />
							{m.settings_saved()}
						{:else}
							<Save class="w-4 h-4" />
							{m.settings_save()}
						{/if}
					</button>
				</div>
			</div>
		</form>
	</section>

	<!-- Section 2: Target Platforms -->
	<section
		class="rounded-[14px] border p-6 mb-6"
		style="background: var(--bg-surface); border-color: var(--border-subtle); box-shadow: var(--card-shadow);"
	>
		<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4" style="color: var(--text-muted);">
			{m.settings_platforms_title()}
		</h2>

		{#if data.planCount > 0}
			<!-- Locked state -->
			<div
				class="rounded-xl p-4 flex items-start gap-3 mb-4"
				style="background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.2);"
			>
				<Lock class="w-4 h-4 shrink-0 mt-0.5" style="color: var(--c-secondary);" />
				<p class="text-[0.8rem]" style="color: var(--c-secondary);">
					{m.settings_platforms_locked()}
				</p>
			</div>
		{/if}

		{#if data.pillars.length > 0}
			<form
				method="POST"
				action="?/updatePlatforms"
				use:enhance={() => {
					savingPlatforms = true;
					return async ({ update }) => {
						await update();
						savingPlatforms = false;
					};
				}}
			>
				<input type="hidden" name="pillarPlatforms" value={platformDataJson} />

				<div class="flex flex-col gap-3">
					{#each data.pillars as pillar}
						<div
							class="rounded-xl p-4"
							style="border: 1px solid var(--border-subtle); background: var(--bg-surface-alt, var(--bg-surface));"
						>
							<div class="mb-2">
								<span class="text-sm font-bold" style="color: var(--text-main);">
									{pillar.name}
								</span>
								{#if pillar.description}
									<p class="text-[0.75rem] truncate" style="color: var(--text-dim);">
										{pillar.description}
									</p>
								{/if}
							</div>
							<div class="flex flex-wrap gap-2">
								{#each platformOptions.active as p}
									{@const selected = (pillarPlatformState[pillar.id] ?? []).includes(p.slug)}
									<button
										type="button"
										onclick={() => toggleSettingsPlatform(pillar.id, p.slug)}
										disabled={data.planCount > 0}
										class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
										style="
											background: {selected ? 'var(--c-electric-glow)' : 'var(--bg-surface)'};
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
										style="background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border-subtle);"
									>
										<span class="w-2 h-2 rounded-full shrink-0 opacity-50" style="background: {p.color};"></span>
										{p.name}
										<span class="text-[0.55rem] font-bold uppercase tracking-wider">Soon</span>
									</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				{#if data.planCount === 0}
					<button
						type="submit"
						class="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50"
						style="background: var(--c-electric);"
						disabled={savingPlatforms}
					>
						{#if savingPlatforms}
							<Loader2 class="w-4 h-4 animate-spin" />
						{:else}
							<Save class="w-4 h-4" />
						{/if}
						{m.settings_save()}
					</button>
				{/if}
			</form>
		{:else}
			<p class="text-sm" style="color: var(--text-dim);">
				{m.settings_no_pillars()}
			</p>
		{/if}
	</section>

</div>
