<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Sparkles, ChevronDown, Image } from 'lucide-svelte';
	import {
		briefData,
		contentPreview,
		contentVariants,
		editHistory,
		type ContentVariant
	} from '$lib/data/mock-editor.js';

	let selectedVariant = $state<string>(contentVariants.find((v) => v.isSelected)?.id ?? 'v1');

	function selectVariant(v: ContentVariant) {
		selectedVariant = v.id;
	}

	const tags = contentPreview.content ? contentPreview.hashtags : [];
	const scores = [
		{ label: () => m.dash_editor_score_ai(), value: contentPreview.aiScore, color: 'var(--c-electric)' },
		{ label: () => m.dash_editor_score_hook(), value: contentPreview.hookScore, color: 'var(--positive)' },
		{ label: () => m.dash_editor_score_cta(), value: contentPreview.ctaScore, color: 'var(--c-secondary)' },
		{ label: () => m.dash_editor_score_readability(), value: contentPreview.readabilityScore, color: 'var(--positive)' }
	];
</script>

<svelte:head>
	<title>{m.dash_meta_title_editor()}</title>
</svelte:head>

<div class="flex h-[calc(100%+4rem)] -m-8">
	<!-- LEFT PANEL: Brief Form -->
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
			>
				<Sparkles class="w-3.5 h-3.5" />
				{m.dash_editor_generate()}
			</button>
		</div>

		<div class="flex flex-col gap-4 px-5 py-4 flex-1">
			{#each briefData as field}
				<div class="flex flex-col gap-1.5">
					<label
						class="text-xs font-bold uppercase tracking-wider"
						style="color: var(--text-muted);"
						for={field.id}
					>
						{field.label}
					</label>

					{#if field.type === 'text'}
						<input
							id={field.id}
							type="text"
							value={field.value}
							class="px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
							style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
						/>
					{:else if field.type === 'textarea'}
						<textarea
							id={field.id}
							class="px-3 py-2.5 rounded-lg text-sm min-h-[80px] outline-none resize-none transition-colors"
							style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
						>{field.value}</textarea>
					{:else if field.type === 'select'}
						<div class="relative">
							<select
								id={field.id}
								class="w-full px-3 py-2.5 rounded-lg text-sm appearance-none outline-none transition-colors pr-8"
								style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
							>
								{#each field.options ?? [] as opt}
									<option selected={opt === field.value}>{opt}</option>
								{/each}
							</select>
							<ChevronDown
								class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
								style="color: var(--text-dim);"
							/>
						</div>
					{:else if field.type === 'tags'}
						<div class="flex flex-wrap gap-1.5">
							{#each field.value.split(', ') as tag}
								<span
									class="px-2.5 py-1 rounded-full text-xs font-medium"
									style="background: var(--bg-sidebar-active); color: var(--c-electric);"
								>{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
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
					class="px-3 py-1.5 rounded-full text-xs font-bold"
					style="background: var(--c-electric); color: white;"
				>{contentPreview.platform}</span>
				<span class="px-3 py-1.5 rounded-full text-xs" style="color: var(--text-muted);">Instagram</span>
				<span class="px-3 py-1.5 rounded-full text-xs" style="color: var(--text-muted);">X</span>
			</div>
			<span class="mono text-xs" style="color: var(--text-dim);">
				{contentPreview.characterCount.toLocaleString()} / {contentPreview.characterLimit.toLocaleString()}
			</span>
		</div>

		<div class="flex-1 p-6 flex flex-col gap-5">
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
						<div class="text-sm font-bold" style="color: var(--text-main);">BriefAgent</div>
						<div class="mono text-xs" style="color: var(--text-dim);">{m.dash_editor_just_now()}</div>
					</div>
				</div>
				<!-- Content -->
				<div class="text-sm leading-relaxed whitespace-pre-line" style="color: var(--text-main);">
					{contentPreview.content}
				</div>
				<!-- Hashtags -->
				<div class="flex flex-wrap gap-1.5 mt-4">
					{#each contentPreview.hashtags as ht}
						<span class="text-sm font-semibold" style="color: var(--c-electric);">{ht}</span>
					{/each}
				</div>
			</div>

			<!-- Score badges -->
			<div class="flex items-center gap-3">
				{#each scores as s}
					<span
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg mono text-xs font-medium"
						style="background: color-mix(in srgb, {s.color} 10%, transparent); color: {s.color};"
					>
						{s.label()}: {s.value}
					</span>
				{/each}
			</div>
		</div>
	</div>

	<!-- RIGHT PANEL: Variants + History -->
	<aside
		class="w-72 shrink-0 flex flex-col overflow-y-auto"
		style="background: var(--bg-surface); border-left: 1px solid var(--border-subtle);"
	>
		<!-- Variants -->
		<div
			class="flex items-center justify-between px-5 py-4 shrink-0"
			style="border-bottom: 1px solid var(--border-subtle);"
		>
			<h3 class="text-sm font-bold" style="color: var(--text-main);">{m.dash_editor_variants()}</h3>
			<button class="text-xs font-bold" style="color: var(--c-electric);">{m.dash_editor_generate_new()}</button>
		</div>
		<div class="flex flex-col gap-2.5 px-4 py-4">
			{#each contentVariants as variant}
				{@const active = selectedVariant === variant.id}
				<button
					class="text-left rounded-xl p-3.5 transition-all cursor-pointer"
					style="
						background: {active ? 'var(--c-electric-glow)' : 'var(--input-bg)'};
						border: 1px solid {active ? 'var(--c-electric)' : 'var(--border-subtle)'};
					"
					onclick={() => selectVariant(variant)}
				>
					<div class="flex items-center justify-between mb-1.5">
						<span class="text-xs font-bold" style="color: var(--text-dim);">{variant.label}</span>
						<span
							class="mono text-xs font-medium px-1.5 py-0.5 rounded"
							style="color: {variant.score >= 90 ? 'var(--positive)' : 'var(--c-secondary)'}; background: color-mix(in srgb, {variant.score >= 90 ? 'var(--positive)' : 'var(--c-secondary)'} 10%, transparent);"
						>{variant.score}</span>
					</div>
					<p class="text-xs line-clamp-2" style="color: var(--text-dim);">{variant.preview}</p>
					{#if active}
						<span class="text-[0.65rem] font-bold mt-1.5 inline-block" style="color: var(--c-electric);">{m.dash_editor_selected()}</span>
					{/if}
				</button>
			{/each}
		</div>

		<!-- History -->
		<div class="px-4" style="border-top: 1px solid var(--border-subtle);">
			<h3 class="text-sm font-bold py-4" style="color: var(--text-main);">{m.dash_editor_history()}</h3>
			<div class="flex flex-col gap-0 pb-4">
				{#each editHistory as entry, i}
					<div class="flex items-start gap-3 relative {i < editHistory.length - 1 ? 'pb-4' : ''}">
						{#if i < editHistory.length - 1}
							<div
								class="absolute left-[7px] top-5 bottom-0 w-px"
								style="background: var(--border-subtle);"
							></div>
						{/if}
						<div
							class="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5"
							style="background: {entry.user === 'AI' ? 'var(--c-electric)' : 'var(--c-secondary)'};"
						></div>
						<div class="flex-1 min-w-0">
							<div class="text-xs font-medium" style="color: var(--text-main);">{entry.action}</div>
							<div class="mono text-xs mt-0.5" style="color: var(--text-muted);">
								{entry.user} &middot; {entry.timestamp}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</aside>
</div>
