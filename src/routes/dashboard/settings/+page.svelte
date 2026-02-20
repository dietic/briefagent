<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import { AlertDialog } from 'bits-ui';
	import { Trash2, Plus, Globe, CheckCircle2, AlertTriangle } from 'lucide-svelte';

	let { data } = $props();

	let deleteTarget = $state<{ id: string; name: string } | null>(null);
	let deleteOpen = $state(false);
	let deleting = $state(false);

	function getInitials(name: string): string {
		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((w) => w[0])
			.join('')
			.toUpperCase();
	}

	function formatDate(dateStr: string | Date | null): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function openDeleteDialog(id: string, name: string) {
		deleteTarget = { id, name };
		deleteOpen = true;
	}

	async function confirmDelete() {
		if (!deleteTarget) return;
		deleting = true;
		try {
			const res = await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' });
			if (res.ok) {
				deleteOpen = false;
				deleteTarget = null;
				await invalidateAll();
			}
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>{m.dash_meta_title_settings()}</title>
</svelte:head>

<div style="animation: dash-fade-up 0.4s ease-out;">
	<!-- Page header -->
	<div class="mb-8">
		<h1 class="text-2xl font-extrabold tracking-tight" style="color: var(--text-main);">
			{m.settings_title()}
		</h1>
		<p class="text-sm mt-1" style="color: var(--text-dim);">
			{m.settings_subtitle()}
		</p>
	</div>

	<!-- Products section -->
	<div class="mb-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-extrabold tracking-tight" style="color: var(--text-main);">
				{m.settings_products_title()}
			</h2>
			<a
				href="/dashboard/onboarding/quick-start?new=1"
				class="inline-flex items-center gap-2 text-[0.8rem] font-semibold px-4 py-2 rounded-[10px] border transition-all duration-200"
				style="color: var(--text-main); border-color: var(--border-subtle); background: transparent;"
				onmouseenter={(e) => {
					e.currentTarget.style.background = 'var(--bg-sidebar-hover)';
				}}
				onmouseleave={(e) => {
					e.currentTarget.style.background = 'transparent';
				}}
			>
				<Plus class="w-4 h-4" />
				{m.settings_new_product()}
			</a>
		</div>

		<div class="flex flex-col gap-3">
			{#each data.settingsProducts as product (product.id)}
				{@const isActive = product.id === data.product?.id}
				{@const isComplete = product.onboardingStep === 'complete'}
				<div
					class="rounded-[14px] border p-5 transition-all duration-200 hover:shadow-lg"
					style="
						background: var(--bg-surface);
						border-color: {isActive ? 'var(--c-electric)' : 'var(--border-subtle)'};
						box-shadow: var(--card-shadow);
						{isActive ? 'border-width: 1.5px;' : ''}
					"
				>
					<div class="flex items-center gap-4">
						<!-- Logo / Initials -->
						{#if product.logoUrl}
							<img
								src={product.logoUrl}
								alt={product.name}
								class="rounded-xl object-contain shrink-0"
								style="width: 48px; height: 48px; border: 1px solid var(--border-subtle); padding: 4px;"
							/>
						{:else}
							<div
								class="flex items-center justify-center w-11 h-11 rounded-xl text-white text-lg font-extrabold shrink-0"
								style="background: linear-gradient(135deg, var(--c-electric), var(--c-tertiary));"
							>
								{getInitials(product.name)}
							</div>
						{/if}

						<!-- Info -->
						<div class="flex flex-col min-w-0 flex-1">
							<div class="flex items-center gap-2.5">
								<span class="text-[0.95rem] font-bold tracking-tight truncate" style="color: var(--text-main);">
									{product.name}
								</span>
								{#if isActive}
									<span
										class="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0"
										style="color: var(--c-electric); background: rgba(6,182,212,0.1);"
									>
										<CheckCircle2 class="w-3 h-3" />
										{m.settings_product_active()}
									</span>
								{/if}
								{#if !isComplete}
									<span
										class="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0"
										style="color: var(--c-secondary); background: rgba(249,115,22,0.1);"
									>
										<AlertTriangle class="w-3 h-3" />
										{m.settings_product_setup_incomplete()}
									</span>
								{/if}
								{#if product.productType}
									<span
										class="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full shrink-0"
										style="color: var(--text-dim); background: var(--border-subtle);"
									>
										{product.productType === 'personal_brand' ? m.settings_product_type_personal_brand() : product.productType === 'product' ? m.settings_product_type_product() : m.settings_product_type_service()}
									</span>
								{/if}
							</div>
							<div class="flex items-center gap-3 mt-0.5">
								{#if product.websiteUrl}
									<span class="text-[0.75rem] flex items-center gap-1 truncate" style="color: var(--text-dim);">
										<Globe class="w-3 h-3 shrink-0" />
										{product.websiteUrl.replace(/^https?:\/\//, '')}
									</span>
								{/if}
								{#if product.createdAt}
									<span
										class="text-[0.7rem]"
										style="font-family: var(--font-mono); color: var(--text-muted);"
									>
										{m.settings_product_created({ date: formatDate(product.createdAt) })}
									</span>
								{/if}
							</div>
						</div>

						<!-- Delete button -->
						<button
							class="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[0.78rem] font-semibold transition-all duration-150 cursor-pointer shrink-0"
							style="
								color: var(--negative);
								background: rgba(239,68,68,0.05);
								border: 1px solid rgba(239,68,68,0.15);
							"
							onmouseenter={(e) => {
								e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
								e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
							}}
							onmouseleave={(e) => {
								e.currentTarget.style.background = 'rgba(239,68,68,0.05)';
								e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)';
							}}
							onclick={() => openDeleteDialog(product.id, product.name)}
						>
							<Trash2 class="w-3.5 h-3.5" />
							{m.settings_product_delete()}
						</button>
					</div>

					{#if product.description}
						<p class="text-[0.8rem] mt-2.5 ml-15 line-clamp-1" style="color: var(--text-dim); margin-left: 3.75rem;">
							{product.description}
						</p>
					{/if}
				</div>
			{:else}
				<!-- Empty state -->
				<div
					class="rounded-[14px] border p-8 text-center"
					style="border-color: var(--border-subtle); background: var(--bg-surface);"
				>
					<div class="text-3xl mb-3 opacity-40">&#128230;</div>
					<p class="text-sm mb-4" style="color: var(--text-dim);">
						No products yet
					</p>
					<a
						href="/dashboard/onboarding/quick-start?new=1"
						class="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
						style="background: var(--c-electric);"
					>
						<Plus class="w-4 h-4" />
						{m.settings_new_product()}
					</a>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Delete confirmation dialog -->
<AlertDialog.Root bind:open={deleteOpen}>
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
					{m.settings_delete_confirm_title()}
				</AlertDialog.Title>
			</div>

			<AlertDialog.Description class="text-[0.85rem] leading-relaxed mb-6" style="color: var(--text-dim);">
				{m.settings_delete_confirm_desc({ name: deleteTarget?.name ?? '' })}
			</AlertDialog.Description>

			<div class="flex items-center justify-end gap-3">
				<AlertDialog.Cancel
					class="px-4 py-2 rounded-[10px] text-[0.85rem] font-semibold transition-colors duration-150 cursor-pointer"
					style="color: var(--text-dim); background: var(--border-subtle);"
					onmouseenter={(e) => {
						e.currentTarget.style.background = 'var(--bg-sidebar-hover)';
					}}
					onmouseleave={(e) => {
						e.currentTarget.style.background = 'var(--border-subtle)';
					}}
				>
					{m.settings_delete_cancel()}
				</AlertDialog.Cancel>
				<AlertDialog.Action
					class="px-4 py-2 rounded-[10px] text-[0.85rem] font-bold text-white transition-all duration-150 cursor-pointer disabled:opacity-50"
					style="background: var(--negative);"
					onclick={confirmDelete}
					disabled={deleting}
					onmouseenter={(e) => {
						if (!deleting) e.currentTarget.style.filter = 'brightness(1.15)';
					}}
					onmouseleave={(e) => {
						e.currentTarget.style.filter = 'none';
					}}
				>
					{deleting ? '...' : m.settings_delete_confirm_btn()}
				</AlertDialog.Action>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
