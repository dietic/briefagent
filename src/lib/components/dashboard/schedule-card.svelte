<script lang="ts">
	import type { ScheduleItem } from '$lib/types/dashboard';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		items: ScheduleItem[];
	}

	let { items }: Props = $props();

	const platformColors: Record<string, string> = {
		LinkedIn: 'var(--c-electric)',
		Instagram: 'var(--c-tertiary)',
		'Twitter/X': 'var(--c-secondary)'
	};

	const statusStyles: Record<string, { text: string; bg: string }> = {
		scheduled: { text: 'var(--c-electric)', bg: 'rgba(6,182,212,0.1)' },
		review: { text: 'var(--c-secondary)', bg: 'rgba(249,115,22,0.1)' }
	};
</script>

<div
	class="overflow-hidden rounded-[14px] border transition-all duration-300"
	style="border-color: var(--border-subtle); background: var(--bg-surface); box-shadow: var(--card-shadow);"
>
	<!-- Header -->
	<div class="px-4 pt-4 pb-2">
		<span class="text-[0.95rem] font-bold" style="color: var(--text-main);">
			{m.dash_overview_schedule()}
		</span>
	</div>

	<!-- Schedule items -->
	<div class="flex flex-col gap-2 px-4 pb-4">
		{#each items as item}
			<div
				class="flex items-center gap-3 overflow-hidden rounded-lg py-3 pr-3"
			>
				<!-- Platform color bar -->
				<div
					class="h-full min-h-[48px] w-[3px] shrink-0 self-stretch rounded-full"
					style="background: {platformColors[item.platform] || 'var(--text-dim)'};"
				></div>

				<!-- Content -->
				<div class="min-w-0 flex-1">
					<div class="truncate text-sm font-medium" style="color: var(--text-main);">
						{item.title}
					</div>
					<div class="mt-0.5 flex items-center gap-2">
						<span class="text-xs" style="color: var(--text-dim);">
							{item.platform}
						</span>
						<span
							class="rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold capitalize"
							style="color: var(--text-dim); background: var(--toggle-bg);"
						>
							{item.type}
						</span>
					</div>
				</div>

				<!-- Right: time + status -->
				<div class="flex shrink-0 flex-col items-end gap-1">
					<span class="font-mono text-xs" style="color: var(--text-muted);">
						{item.time}
					</span>
					<span
						class="rounded-md px-2 py-0.5 text-[0.6rem] font-bold capitalize"
						style="
							color: {statusStyles[item.status].text};
							background: {statusStyles[item.status].bg};
						"
					>
						{item.status}
					</span>
				</div>
			</div>
		{/each}
	</div>
</div>
