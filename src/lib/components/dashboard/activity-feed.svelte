<script lang="ts">
	import type { ActivityItem } from '$lib/data/mock-overview.js';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		items: ActivityItem[];
	}

	let { items }: Props = $props();

	const dotColors: Record<ActivityItem['type'], string> = {
		published: 'var(--positive)',
		scheduled: 'var(--c-electric)',
		generated: 'var(--c-secondary)',
		approved: 'var(--positive)',
		edited: 'var(--text-dim)'
	};

	const badgeColors: Record<ActivityItem['type'], { text: string; bg: string }> = {
		published: { text: 'var(--positive)', bg: 'rgba(52,211,153,0.1)' },
		scheduled: { text: 'var(--c-electric)', bg: 'rgba(6,182,212,0.1)' },
		generated: { text: 'var(--c-secondary)', bg: 'rgba(249,115,22,0.1)' },
		approved: { text: 'var(--positive)', bg: 'rgba(52,211,153,0.1)' },
		edited: { text: 'var(--text-dim)', bg: 'rgba(107,138,153,0.1)' }
	};

	const typeLabels: Record<ActivityItem['type'], () => string> = {
		published: () => m.dash_activity_published(),
		scheduled: () => m.dash_activity_scheduled(),
		generated: () => m.dash_activity_generated(),
		approved: () => m.dash_activity_approved(),
		edited: () => m.dash_activity_edited()
	};
</script>

<div
	class="overflow-hidden rounded-[14px] border transition-all duration-300"
	style="border-color: var(--border-subtle); background: var(--bg-surface); box-shadow: var(--card-shadow);"
>
	<!-- Header -->
	<div class="flex items-center justify-between px-4 pt-4 pb-2">
		<span class="text-[0.95rem] font-bold" style="color: var(--text-main);">
			{m.dash_overview_activity()}
		</span>
		<button
			class="cursor-pointer border-none bg-transparent text-xs font-bold transition-opacity duration-200 hover:opacity-70"
			style="color: var(--c-electric);"
		>
			{m.dash_overview_view_all()}
		</button>
	</div>

	<!-- Activity items -->
	<div>
		{#each items as item, i}
			<div
				class="flex items-start gap-3 px-4 py-3"
				class:border-b={i < items.length - 1}
				style={i < items.length - 1 ? 'border-color: var(--border-subtle);' : ''}
			>
				<!-- Colored dot -->
				<div
					class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
					style="background: {dotColors[item.type]};"
				></div>

				<!-- Content -->
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<span class="truncate text-sm" style="color: var(--text-main);">
							{item.title}
						</span>
						<span
							class="shrink-0 rounded-md px-2 py-0.5 text-[0.65rem] font-bold"
							style="
								color: {badgeColors[item.type].text};
								background: {badgeColors[item.type].bg};
							"
						>
							{typeLabels[item.type]()}
						</span>
					</div>
				</div>

				<!-- Time -->
				<span
					class="shrink-0 font-mono text-xs"
					style="color: var(--text-muted);"
				>
					{item.time}
				</span>
			</div>
		{/each}
	</div>
</div>
