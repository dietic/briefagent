<script lang="ts">
	import { Sparkles, Zap, Clock, FileText, AlertTriangle, Send } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { AiSuggestion, PublishingStat } from '$lib/data/mock-publishing.js';

	let { suggestions, stats }: { suggestions: AiSuggestion[]; stats: PublishingStat[] } = $props();

	const typeIcons: Record<string, typeof Zap> = {
		optimization: Zap,
		timing: Clock,
		content: FileText,
		warning: AlertTriangle
	};

	const typeColors: Record<string, string> = {
		optimization: 'var(--c-electric)',
		timing: 'var(--c-secondary)',
		content: 'var(--positive)',
		warning: 'var(--negative)'
	};
</script>

<aside
	class="w-[300px] shrink-0 flex flex-col"
	style="background: var(--bg-surface); border-left: 1px solid var(--border-subtle);"
>
	<!-- Header -->
	<div
		class="flex items-center gap-2.5 px-5 py-4 shrink-0"
		style="border-bottom: 1px solid var(--border-subtle);"
	>
		<div
			class="w-7 h-7 rounded-lg flex items-center justify-center"
			style="background: linear-gradient(135deg, var(--c-electric), var(--c-tertiary));"
		>
			<Sparkles class="w-3.5 h-3.5 text-white" />
		</div>
		<div>
			<h3 class="text-sm font-bold" style="color: var(--text-main);">{m.dash_publishing_ai_assistant()}</h3>
		</div>
	</div>

	<!-- Stats -->
	<div style="border-bottom: 1px solid var(--border-subtle);">
		{#each stats as stat, i}
			<div
				class="px-5 py-3"
				style={i < stats.length - 1 ? 'border-bottom: 1px solid var(--border-subtle);' : ''}
			>
				<div class="text-xs" style="color: var(--text-dim);">{stat.label}</div>
				<div class="text-lg font-extrabold" style="color: var(--text-main);">{stat.value}</div>
				{#if stat.change}
					<div class="text-xs" style="color: var(--positive);">{stat.change}</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Suggestions -->
	<div class="flex-1 overflow-y-auto flex flex-col">
		<div class="px-5 pt-4 pb-2">
			<h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
				{m.dash_publishing_ai_suggestions()}
			</h4>
		</div>
		<div class="flex flex-col gap-2.5 px-4 pb-4">
			{#each suggestions as suggestion}
				{@const Icon = typeIcons[suggestion.type] ?? Zap}
				{@const color = typeColors[suggestion.type] ?? 'var(--c-electric)'}
				<div
					class="rounded-lg p-3"
					style="border: 1px solid var(--border-subtle); background: var(--bg-surface-alt);"
				>
					<div class="flex items-center gap-2 mb-1.5">
						<Icon class="w-3.5 h-3.5" style="color: {color};" />
						<span class="text-sm font-semibold" style="color: var(--text-main);">{suggestion.title}</span>
					</div>
					<p class="text-xs mt-1" style="color: var(--text-dim);">{suggestion.description}</p>
					{#if suggestion.action}
						<button
							class="text-xs font-bold mt-2 hover:underline"
							style="color: var(--c-electric);"
						>{suggestion.action}</button>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Input -->
	<div class="px-4 py-3 shrink-0" style="border-top: 1px solid var(--border-subtle);">
		<div
			class="flex items-center gap-2 rounded-lg px-3 py-2.5"
			style="background: var(--input-bg); border: 1px solid var(--border-subtle);"
		>
			<input
				type="text"
				placeholder={m.dash_publishing_ai_ask()}
				class="flex-1 text-sm outline-none bg-transparent"
				style="color: var(--text-main);"
			/>
			<button
				class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
				style="background: var(--c-electric);"
			>
				<Send class="w-3.5 h-3.5" />
			</button>
		</div>
	</div>
</aside>
