<script lang="ts">
	import { postStatusColors, type PostStatus } from '$lib/utils/post-status';
	import * as m from '$lib/paraglide/messages.js';

	interface CalendarPost {
		id: string;
		topic: string;
		status: string;
		scheduledAt: string | null;
		platform: string;
		postType: string;
		imageUrl: string | null;
		contentCategory: string;
	}

	let {
		posts,
		viewMode = 'month',
		year,
		month,
		onpostclick
	}: {
		posts: CalendarPost[];
		viewMode?: 'month' | 'week';
		year: number;
		month: number;
		onpostclick?: (post: CalendarPost) => void;
	} = $props();

	const dayLabels = [
		() => m.dash_calendar_mon(),
		() => m.dash_calendar_tue(),
		() => m.dash_calendar_wed(),
		() => m.dash_calendar_thu(),
		() => m.dash_calendar_fri(),
		() => m.dash_calendar_sat(),
		() => m.dash_calendar_sun()
	];

	interface GridCell {
		day: number;
		dateStr: string;
		isCurrentMonth: boolean;
		isToday: boolean;
		posts: CalendarPost[];
	}

	const today = new Date();
	const todayStr = today.toISOString().slice(0, 10);

	let gridCells = $derived.by(() => {
		const cells: GridCell[] = [];
		const firstDay = new Date(year, month, 1);
		// getDay: 0=Sun; convert to Mon=0
		let startOffset = firstDay.getDay() - 1;
		if (startOffset < 0) startOffset = 6;

		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const prevMonthDays = new Date(year, month, 0).getDate();

		// Previous month padding
		for (let i = startOffset - 1; i >= 0; i--) {
			const d = prevMonthDays - i;
			const pm = month === 0 ? 11 : month - 1;
			const py = month === 0 ? year - 1 : year;
			const dateStr = `${py}-${String(pm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			cells.push({
				day: d,
				dateStr,
				isCurrentMonth: false,
				isToday: false,
				posts: posts.filter((p) => p.scheduledAt?.slice(0, 10) === dateStr)
			});
		}

		// Current month
		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			cells.push({
				day: d,
				dateStr,
				isCurrentMonth: true,
				isToday: dateStr === todayStr,
				posts: posts.filter((p) => p.scheduledAt?.slice(0, 10) === dateStr)
			});
		}

		// Next month padding to fill 35 or 42 cells
		const totalTarget = cells.length <= 35 ? 35 : 42;
		const nm = month === 11 ? 0 : month + 1;
		const ny = month === 11 ? year + 1 : year;
		for (let d = 1; cells.length < totalTarget; d++) {
			const dateStr = `${ny}-${String(nm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			cells.push({
				day: d,
				dateStr,
				isCurrentMonth: false,
				isToday: false,
				posts: posts.filter((p) => p.scheduledAt?.slice(0, 10) === dateStr)
			});
		}

		return cells;
	});

	let visibleCells = $derived.by(() => {
		if (viewMode === 'month') return gridCells;
		// Week view: find the row containing today, show only that row
		const todayIndex = gridCells.findIndex((c) => c.isToday);
		if (todayIndex < 0) return gridCells.slice(0, 7);
		const rowStart = Math.floor(todayIndex / 7) * 7;
		return gridCells.slice(rowStart, rowStart + 7);
	});

	const maxChips = $derived(viewMode === 'month' ? 3 : 6);

	function truncate(text: string, max: number): string {
		return text.length > max ? text.slice(0, max - 2) + '..' : text;
	}

	function statusColor(status: string): { color: string; bg: string } {
		const entry = postStatusColors[status as PostStatus];
		return entry ?? { color: 'var(--text-muted)', bg: 'rgba(156,163,175,0.1)' };
	}
</script>

<div class="flex flex-col flex-1 min-h-0">
	<!-- Day headers -->
	<div class="grid grid-cols-7 gap-px mb-px">
		{#each dayLabels as label}
			<div
				class="text-center py-2 text-[0.7rem] uppercase font-bold tracking-wider"
				style="color: var(--text-muted);"
			>
				{label()}
			</div>
		{/each}
	</div>

	<!-- Calendar body -->
	<div
		class="grid grid-cols-7 gap-px flex-1 rounded-[14px] overflow-hidden border"
		style="background: var(--border-subtle); border-color: var(--border-subtle);"
	>
		{#each visibleCells as cell, i}
			<div
				class="flex flex-col gap-1 p-1.5 transition-colors duration-200"
				class:opacity-35={!cell.isCurrentMonth}
				style="
					min-height: {viewMode === 'month' ? '100px' : '140px'};
					background: {cell.isToday
						? 'rgba(var(--chip-electric-rgb, 6 182 212) / 0.06)'
						: 'rgba(var(--bg-surface-rgb, 14 21 25) / 0.6)'};
					{cell.isToday ? 'box-shadow: inset 0 0 0 1.5px var(--c-electric); border-radius: 2px;' : ''}
				"
				onmouseenter={(e) => {
					if (cell.isCurrentMonth) {
						e.currentTarget.style.background = cell.isToday
							? 'rgba(var(--chip-electric-rgb, 6 182 212) / 0.1)'
							: 'rgba(var(--bg-surface-rgb, 14 21 25) / 0.9)';
					}
				}}
				onmouseleave={(e) => {
					e.currentTarget.style.background = cell.isToday
						? 'rgba(var(--chip-electric-rgb, 6 182 212) / 0.06)'
						: 'rgba(var(--bg-surface-rgb, 14 21 25) / 0.6)';
				}}
			>
				<!-- Day number -->
				<div
					class="text-[0.72rem] font-bold leading-none mb-0.5"
					class:flex={cell.isToday}
					class:items-center={cell.isToday}
					class:justify-center={cell.isToday}
					class:w-6={cell.isToday}
					class:h-6={cell.isToday}
					class:rounded-[7px]={cell.isToday}
					class:text-white={cell.isToday}
					class:font-extrabold={cell.isToday}
					style="
						font-family: var(--font-mono);
						{cell.isToday ? 'background: var(--c-electric);' : 'color: var(--text-dim);'}
					"
				>
					{cell.day}
				</div>

				<!-- Post chips -->
				{#if cell.posts.length > 0}
					<div class="flex flex-col gap-0.5 overflow-hidden flex-1">
						{#each cell.posts.slice(0, maxChips) as post}
							{@const sc = statusColor(post.status)}
							<button
								class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.62rem] font-medium border max-w-full cursor-pointer transition-transform duration-150 hover:-translate-y-px text-left"
								style="background: {sc.bg}; border-color: transparent; color: var(--text-main);"
								title={post.topic}
								onclick={() => onpostclick?.(post)}
							>
								<span
									class="w-1.5 h-1.5 rounded-full shrink-0"
									style="background: {sc.color};"
								></span>
								<span class="truncate">{truncate(post.topic, 20)}</span>
							</button>
						{/each}
						{#if cell.posts.length > maxChips}
							<div
								class="text-[0.6rem] text-center py-0.5 cursor-pointer"
								style="font-family: var(--font-mono); color: var(--text-muted);"
							>
								+{cell.posts.length - maxChips} more
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
