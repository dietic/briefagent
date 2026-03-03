<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import { Popover } from 'bits-ui';
	import { ChevronDown, Check, Plus } from 'lucide-svelte';

	type SlimProduct = {
		id: string;
		name: string;
		logoUrl: string | null;
		onboardingStep: string | null;
	};

	let {
		product,
		products
	}: {
		product: SlimProduct | null;
		products: SlimProduct[];
	} = $props();

	let open = $state(false);
	let switching = $state(false);

	function getInitials(name: string): string {
		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((w) => w[0])
			.join('')
			.toUpperCase();
	}

	async function switchProduct(id: string) {
		if (id === product?.id) {
			open = false;
			return;
		}
		switching = true;
		try {
			await fetch('/api/products/switch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ productId: id })
			});
			await invalidateAll();
		} finally {
			switching = false;
			open = false;
		}
	}
</script>

{#if product}
	<Popover.Root bind:open>
		<Popover.Trigger
			class="flex items-center gap-2 px-2 py-1.5 rounded-[10px] transition-colors duration-150 cursor-pointer select-none"
			style="background: {open ? 'var(--bg-sidebar-hover)' : 'transparent'};"
			onmouseenter={(e: MouseEvent) => {
				if (!open) (e.currentTarget as HTMLElement).style.background = 'var(--bg-sidebar-hover)';
			}}
			onmouseleave={(e: MouseEvent) => {
				if (!open) (e.currentTarget as HTMLElement).style.background = 'transparent';
			}}
		>
			<!-- Product logo or initials -->
			{#if product.logoUrl}
				<img
					src={product.logoUrl}
					alt={product.name}
					class="rounded-lg object-contain shrink-0"
					style="width: 28px; height: 28px; border: 1px solid var(--border-subtle);"
				/>
			{:else}
				<div
					class="flex items-center justify-center w-6 h-6 rounded-md text-[0.6rem] font-bold text-white shrink-0"
					style="background: linear-gradient(135deg, var(--c-electric), var(--c-tertiary));"
				>
					{getInitials(product.name)}
				</div>
			{/if}

			<!-- Product name -->
			<span class="text-[0.85rem] font-semibold truncate max-w-[140px]" style="color: var(--text-main);">
				{switching ? m.switcher_switching() : product.name}
			</span>

			<!-- FREE badge -->
			<span
				class="mono text-[0.55rem] font-bold px-1.5 py-0.5 rounded-md tracking-wider"
				style="background: var(--c-electric-glow); color: var(--c-electric);"
			>
				{m.switcher_free_badge()}
			</span>

			<!-- Chevron -->
			<ChevronDown
				class="w-3.5 h-3.5 transition-transform duration-150 shrink-0"
				style="color: var(--text-muted); transform: {open ? 'rotate(180deg)' : 'none'};"
			/>
		</Popover.Trigger>

		<Popover.Portal>
			<Popover.Content
				class="z-50 w-[260px] rounded-[14px] py-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
				style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
				sideOffset={6}
				align="start"
			>
				<!-- Header -->
				<div
					class="px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.1em]"
					style="color: var(--text-muted);"
				>
					{m.switcher_your_products()}
				</div>

				<!-- Product list -->
				{#each products as p}
					<button
						class="flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors duration-100 cursor-pointer"
						style="background: transparent;"
						onmouseenter={(e) => {
							(e.currentTarget as HTMLElement).style.background = 'var(--bg-sidebar-hover)';
						}}
						onmouseleave={(e) => {
							(e.currentTarget as HTMLElement).style.background = 'transparent';
						}}
						onclick={() => switchProduct(p.id)}
						disabled={switching}
					>
						<!-- Logo / Initials -->
						{#if p.logoUrl}
							<img
								src={p.logoUrl}
								alt={p.name}
								class="rounded-lg object-contain shrink-0"
								style="width: 30px; height: 30px; border: 1px solid var(--border-subtle);"
							/>
						{:else}
							<div
								class="flex items-center justify-center w-7 h-7 rounded-md text-[0.6rem] font-bold text-white shrink-0"
								style="background: linear-gradient(135deg, var(--c-electric), var(--c-tertiary));"
							>
								{getInitials(p.name)}
							</div>
						{/if}

						<!-- Name + status -->
						<div class="flex flex-col min-w-0 flex-1">
							<span
								class="text-[0.82rem] font-medium truncate"
								style="color: var(--text-main);"
							>
								{p.name}
							</span>
							{#if p.onboardingStep !== 'complete'}
								<span class="text-[0.65rem]" style="color: var(--text-muted);">
									Setup incomplete
								</span>
							{/if}
						</div>

						<!-- Active check -->
						{#if p.id === product?.id}
							<Check class="w-4 h-4 shrink-0" style="color: var(--c-electric);" />
						{/if}
					</button>
				{/each}

				<!-- Separator -->
				<div class="mx-3 my-1" style="border-top: 1px solid var(--border-subtle);"></div>

				<!-- New Product -->
				<a
					href="/dashboard/onboarding/quick-start?new=1"
					class="flex items-center gap-2.5 px-3 py-2 transition-colors duration-100"
					style="background: transparent; color: var(--text-dim);"
					onmouseenter={(e) => {
						(e.currentTarget as HTMLElement).style.background = 'var(--bg-sidebar-hover)';
						(e.currentTarget as HTMLElement).style.color = 'var(--text-main)';
					}}
					onmouseleave={(e) => {
						(e.currentTarget as HTMLElement).style.background = 'transparent';
						(e.currentTarget as HTMLElement).style.color = 'var(--text-dim)';
					}}
					onclick={() => { open = false; }}
				>
					<div
						class="flex items-center justify-center w-7 h-7 rounded-md"
						style="border: 1px dashed var(--border-subtle);"
					>
						<Plus class="w-3.5 h-3.5" style="color: var(--text-muted);" />
					</div>
					<span class="text-[0.82rem] font-medium">
						{m.switcher_new_product()}
					</span>
				</a>
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
{/if}
