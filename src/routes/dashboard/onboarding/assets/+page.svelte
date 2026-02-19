<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		Upload,
		Loader2,
		Trash2,
		Star,
		ChevronDown,
		ImagePlus
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let dragging = $state(false);
	let uploading = $state(false);
	let finishing = $state(false);

	const tagOptions = [
		{ value: 'screenshot', label: () => m.onb_assets_tag_screenshot() },
		{ value: 'photo', label: () => m.onb_assets_tag_photo() },
		{ value: 'logo', label: () => m.onb_assets_tag_logo() },
		{ value: 'lifestyle', label: () => m.onb_assets_tag_lifestyle() },
		{ value: 'testimonial', label: () => m.onb_assets_tag_testimonial() },
		{ value: 'graphic', label: () => m.onb_assets_tag_graphic() }
	];

	function getTagLabel(value: string | null): string {
		if (!value) return '';
		return tagOptions.find((t) => t.value === value)?.label() ?? value;
	}

	async function uploadFiles(files: FileList | File[]) {
		if (!data.product) return;
		uploading = true;
		try {
			for (const file of files) {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('product_id', data.product.id);
				await fetch('/api/assets/upload', { method: 'POST', body: formData });
			}
			await invalidateAll();
		} catch {
			// Upload failed silently
		} finally {
			uploading = false;
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		if (e.dataTransfer?.files) {
			uploadFiles(e.dataTransfer.files);
		}
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			uploadFiles(input.files);
		}
	}

	async function updateAsset(id: string, updates: Record<string, unknown>) {
		await fetch(`/api/assets/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updates)
		});
		await invalidateAll();
	}

	async function deleteAsset(id: string) {
		await fetch(`/api/assets/${id}`, { method: 'DELETE' });
		await invalidateAll();
	}

	// finishSetup is handled by form action ?/finish
</script>

<div>
	<!-- Header -->
	<div class="text-center mb-10">
		<h1
			class="text-[1.75rem] font-extrabold tracking-tight mb-2"
			style="color: var(--text-main);"
		>
			{m.onb_assets_title()}
		</h1>
		<p class="text-[0.9rem]" style="color: var(--text-dim);">
			{m.onb_assets_subtitle()}
		</p>
	</div>

	<!-- Drop zone -->
	<div
		class="relative flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed transition-all duration-200 mb-8 cursor-pointer"
		style="
			border-color: {dragging ? 'var(--c-electric)' : 'var(--border-subtle)'};
			background: {dragging ? 'var(--c-electric-glow)' : 'var(--input-bg)'};
		"
		role="button"
		tabindex="0"
		ondragover={(e) => {
			e.preventDefault();
			dragging = true;
		}}
		ondragleave={() => (dragging = false)}
		ondrop={handleDrop}
	>
		{#if uploading}
			<Loader2 class="w-8 h-8 animate-spin" style="color: var(--c-electric);" />
			<p class="text-[0.85rem] font-medium" style="color: var(--c-electric);">
				{m.onb_assets_upload()}...
			</p>
		{:else}
			<ImagePlus class="w-8 h-8" style="color: var(--text-muted);" />
			<p class="text-[0.85rem] font-medium" style="color: var(--text-dim);">
				{m.onb_assets_drag()}
			</p>
			<p class="text-[0.75rem]" style="color: var(--text-muted);">
				{m.onb_assets_upload_hint()}
			</p>
		{/if}
		<input
			type="file"
			accept="image/jpeg,image/png,image/gif,image/webp"
			multiple
			class="absolute inset-0 opacity-0 cursor-pointer"
			onchange={handleFileInput}
		/>
	</div>

	<!-- Asset grid -->
	{#if data.assets.length === 0}
		<div class="text-center py-12">
			<Upload class="w-10 h-10 mx-auto mb-3" style="color: var(--text-muted);" />
			<p class="text-[0.9rem]" style="color: var(--text-muted);">
				{m.onb_assets_empty()}
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
			{#each data.assets as asset (asset.id)}
				<div
					class="rounded-xl overflow-hidden"
					style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
				>
					<!-- Thumbnail -->
					<div class="aspect-video relative overflow-hidden" style="background: var(--bg-surface-alt);">
						<img
							src={asset.fileUrl}
							alt={asset.fileName}
							class="w-full h-full object-cover"
						/>
					</div>

					<!-- Controls -->
					<div class="p-3 space-y-2.5">
						<!-- Tag dropdown -->
						<div class="relative">
							<select
								value={asset.tag ?? ''}
								onchange={(e) =>
									updateAsset(asset.id, { tag: (e.target as HTMLSelectElement).value || null })}
								class="w-full px-3 py-2 rounded-lg text-[0.8rem] appearance-none outline-none cursor-pointer"
								style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
							>
								<option value="">{m.onb_assets_tag()}</option>
								{#each tagOptions as opt}
									<option value={opt.value}>{opt.label()}</option>
								{/each}
							</select>
							<ChevronDown
								class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
								style="color: var(--text-muted);"
							/>
						</div>

						<!-- Description -->
						<input
							type="text"
							value={asset.description ?? ''}
							placeholder={m.onb_assets_description_placeholder()}
							class="w-full px-3 py-2 rounded-lg text-[0.8rem] outline-none"
							style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
							onblur={(e) =>
								updateAsset(asset.id, { description: (e.target as HTMLInputElement).value || null })}
						/>

						<!-- Bottom row: primary toggle + delete -->
						<div class="flex items-center justify-between">
							<button
								type="button"
								onclick={() => updateAsset(asset.id, { isPrimary: !asset.isPrimary })}
								class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-150 cursor-pointer"
								style="
									background: {asset.isPrimary ? 'rgba(var(--chip-secondary-rgb) / 0.12)' : 'transparent'};
									color: {asset.isPrimary ? 'var(--c-secondary)' : 'var(--text-muted)'};
								"
							>
								<Star class="w-3.5 h-3.5" style={asset.isPrimary ? 'fill: currentColor;' : ''} />
								{m.onb_assets_primary()}
							</button>
							<button
								type="button"
								onclick={() => deleteAsset(asset.id)}
								class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors duration-150 cursor-pointer"
								style="color: var(--text-muted);"
								onmouseenter={(e) => (e.currentTarget.style.color = 'var(--negative)')}
								onmouseleave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
							>
								<Trash2 class="w-3.5 h-3.5" />
								{m.onb_assets_delete()}
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex items-center justify-between pt-4 pb-8">
		<div class="flex items-center gap-4">
			<a
				href="/dashboard/onboarding/deep-brief"
				class="text-[0.85rem] font-medium transition-colors duration-150"
				style="color: var(--text-muted);"
				onmouseenter={(e) => (e.currentTarget.style.color = 'var(--c-electric)')}
				onmouseleave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
			>
				{m.onb_assets_back()}
			</a>
			<span style="color: var(--border-subtle);">|</span>
			<a
				href="/dashboard"
				class="text-[0.85rem] font-medium transition-colors duration-150"
				style="color: var(--text-muted);"
				onmouseenter={(e) => (e.currentTarget.style.color = 'var(--c-electric)')}
				onmouseleave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
			>
				{m.onb_assets_skip()}
			</a>
		</div>
		<form method="POST" action="?/finish" use:enhance={() => {
			finishing = true;
			return async ({ update }) => {
				finishing = false;
				await update();
			};
		}}>
			<button
				type="submit"
				disabled={finishing}
				class="px-6 py-2.5 rounded-xl text-[0.85rem] font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
				style="background: var(--c-electric);"
				onmouseenter={(e) => {
					if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9';
				}}
				onmouseleave={(e) => {
					e.currentTarget.style.opacity = '1';
				}}
			>
				{#if finishing}
					<Loader2 class="w-4 h-4 animate-spin inline mr-2" />
				{/if}
				{m.onb_assets_finish()}
			</button>
		</form>
	</div>
</div>
