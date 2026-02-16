<script lang="ts">
	import type { CalendarEvent } from '$lib/data/mock-calendar';
	import ContentChip from './content-chip.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { events, viewMode = 'month' }: { events: CalendarEvent[]; viewMode?: 'month' | 'week' } =
		$props();

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
		events: CalendarEvent[];
	}

	const today = new Date();
	const todayStr = today.toISOString().slice(0, 10);
	const year = today.getFullYear();
	const month = today.getMonth();

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
				events: events.filter((e) => e.date === dateStr)
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
				events: events.filter((e) => e.date === dateStr)
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
				events: events.filter((e) => e.date === dateStr)
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

				<!-- Content chips -->
				{#if cell.events.length > 0}
					<div class="flex flex-col gap-0.5 overflow-hidden flex-1">
						{#each cell.events.slice(0, maxChips) as ev}
							<ContentChip title={ev.title} type={ev.type} status={ev.status} />
						{/each}
						{#if cell.events.length > maxChips}
							<div
								class="text-[0.6rem] text-center py-0.5 cursor-pointer"
								style="font-family: var(--font-mono); color: var(--text-muted);"
							>
								+{cell.events.length - maxChips} more
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
