<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';
	import { Globe, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Two-step flow: type selection first, then details
	let selectedType = $state(data.product?.productType ?? '');
	let step = $state<'type' | 'details'>(data.product?.productType ? 'details' : 'type');

	// Form fields with pre-fill from existing product
	let name = $state(data.product?.name ?? form?.name ?? '');
	let websiteUrl = $state(data.product?.websiteUrl ?? form?.websiteUrl ?? '');
	let description = $state(data.product?.description ?? form?.description ?? '');

	// Logo upload state
	let logoUrl = $state(data.product?.logoUrl ?? '');
	let logoUploading = $state(false);

	// Scraping state
	let scrapingStatus = $state<'idle' | 'loading' | 'success' | 'failed'>('idle');

	let submitting = $state(false);

	// Type-specific labels for step 2
	const labels = $derived.by(() => {
		if (selectedType === 'personal_brand') {
			return {
				title: () => m.onb_quick_brand_title(),
				subtitle: () => m.onb_quick_brand_subtitle(),
				name: () => m.onb_quick_brand_name(),
				namePlaceholder: () => m.onb_quick_brand_name_placeholder(),
				url: () => m.onb_quick_brand_url(),
				urlPlaceholder: () => m.onb_quick_brand_url_placeholder(),
				urlHint: () => m.onb_quick_brand_url_hint(),
				description: () => m.onb_quick_brand_description(),
				descriptionPlaceholder: () => m.onb_quick_brand_description_placeholder(),
				logo: () => m.onb_quick_brand_logo(),
				logoHint: () => m.onb_quick_brand_logo_hint()
			};
		}
		if (selectedType === 'service') {
			return {
				title: () => m.onb_quick_service_title(),
				subtitle: () => m.onb_quick_service_subtitle(),
				name: () => m.onb_quick_service_name(),
				namePlaceholder: () => m.onb_quick_service_name_placeholder(),
				url: () => m.onb_quick_service_url(),
				urlPlaceholder: () => m.onb_quick_service_url_placeholder(),
				urlHint: () => m.onb_quick_service_url_hint(),
				description: () => m.onb_quick_service_description(),
				descriptionPlaceholder: () => m.onb_quick_service_description_placeholder(),
				logo: () => m.onb_quick_service_logo(),
				logoHint: () => m.onb_quick_service_logo_hint()
			};
		}
		// Default: product
		return {
			title: () => m.onb_quick_title(),
			subtitle: () => m.onb_quick_subtitle(),
			name: () => m.onb_quick_name(),
			namePlaceholder: () => m.onb_quick_name_placeholder(),
			url: () => m.onb_quick_url(),
			urlPlaceholder: () => m.onb_quick_url_placeholder(),
			urlHint: () => m.onb_quick_url_hint(),
			description: () => m.onb_quick_description(),
			descriptionPlaceholder: () => m.onb_quick_description_placeholder(),
			logo: () => m.onb_quick_logo(),
			logoHint: () => m.onb_quick_logo_hint()
		};
	});

	const typeOptions = [
		{
			value: 'personal_brand',
			icon: '\u{1F464}',
			title: () => m.onb_quick_type_personal_brand(),
			desc: () => m.onb_quick_type_personal_brand_desc()
		},
		{
			value: 'product',
			icon: '\u{1F4E6}',
			title: () => m.onb_quick_type_product(),
			desc: () => m.onb_quick_type_product_desc()
		},
		{
			value: 'service',
			icon: '\u{1F6E0}',
			title: () => m.onb_quick_type_service(),
			desc: () => m.onb_quick_type_service_desc()
		}
	];

	async function handleUrlBlur() {
		if (!websiteUrl || scrapingStatus === 'loading') return;

		// Validate URL format
		try {
			new URL(websiteUrl);
		} catch {
			return;
		}

		scrapingStatus = 'loading';

		try {
			const res = await fetch('/api/scrape', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: websiteUrl })
			});

			const scraped = await res.json();

			if (scraped.success) {
				scrapingStatus = 'success';
				// Auto-fill description if empty
				if (!description && scraped.description) {
					description = scraped.description;
				}
			} else {
				scrapingStatus = 'failed';
			}
		} catch {
			scrapingStatus = 'failed';
		}
	}

	async function handleLogoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !data.product?.id) return;

		logoUploading = true;
		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('product_id', data.product.id);
			formData.append('tag', 'logo');

			const res = await fetch('/api/assets/upload', { method: 'POST', body: formData });
			if (res.ok) {
				const asset = await res.json();
				logoUrl = asset.fileUrl;
			}
		} catch {
			// Logo upload failed silently -- not blocking
		} finally {
			logoUploading = false;
		}
	}
</script>

<div>
	<!-- Step 1: Product Type Selection -->
	{#if step === 'type'}
		<div style="animation: dash-fade-up 0.35s ease-out;">
			<!-- Header -->
			<div class="text-center mb-10">
				<h1
					class="text-[1.75rem] font-extrabold tracking-tight mb-2"
					style="color: var(--text-main);"
				>
					{m.onb_quick_type_title()}
				</h1>
				<p class="text-[0.9rem]" style="color: var(--text-dim);">
					{m.onb_quick_type_subtitle()}
				</p>
			</div>

			<!-- Type cards -->
			<div class="flex flex-col gap-3 mb-8">
				{#each typeOptions as opt}
					<button
						type="button"
						class="w-full flex items-center gap-4 px-5 py-4 rounded-[14px] border text-left transition-all duration-200 cursor-pointer"
						style="
							background: var(--bg-surface);
							border-color: {selectedType === opt.value ? 'var(--c-electric)' : 'var(--border-subtle)'};
							{selectedType === opt.value ? 'background: var(--c-electric-glow); border-width: 1.5px;' : ''}
							box-shadow: var(--card-shadow);
						"
						onclick={() => (selectedType = opt.value)}
					>
						<span class="text-2xl shrink-0">{opt.icon}</span>
						<div class="flex-1 min-w-0">
							<div
								class="text-[0.95rem] font-bold tracking-tight"
								style="color: {selectedType === opt.value ? 'var(--c-electric)' : 'var(--text-main)'};"
							>
								{opt.title()}
							</div>
							<div class="text-[0.8rem] mt-0.5" style="color: var(--text-dim);">
								{opt.desc()}
							</div>
						</div>
						{#if selectedType === opt.value}
							<div
								class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
								style="background: var(--c-electric);"
							>
								<CheckCircle class="w-3.5 h-3.5 text-white" />
							</div>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-between pt-4">
				<a
					href="/dashboard"
					class="text-[0.85rem] font-medium transition-colors duration-150"
					style="color: var(--text-muted);"
					onmouseenter={(e) => (e.currentTarget.style.color = 'var(--c-electric)')}
					onmouseleave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
				>
					{m.onb_quick_skip()}
				</a>
				<button
					type="button"
					disabled={!selectedType}
					class="px-6 py-2.5 rounded-xl text-[0.85rem] font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					style="background: var(--c-electric);"
					onmouseenter={(e) => {
						if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9';
					}}
					onmouseleave={(e) => {
						e.currentTarget.style.opacity = '1';
					}}
					onclick={() => (step = 'details')}
				>
					{m.onb_quick_type_continue()}
				</button>
			</div>
		</div>
	{/if}

	<!-- Step 2: Product Details (existing form) -->
	{#if step === 'details'}
		<div style="animation: dash-fade-up 0.35s ease-out;">
			<!-- Header -->
			<div class="text-center mb-10">
				<h1
					class="text-[1.75rem] font-extrabold tracking-tight mb-2"
					style="color: var(--text-main);"
				>
					{labels.title()}
				</h1>
				<p class="text-[0.9rem]" style="color: var(--text-dim);">
					{labels.subtitle()}
				</p>
			</div>

			<!-- Form -->
			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						submitting = false;
						await update();
					};
				}}
				class="space-y-6"
			>
				<!-- Hidden product type -->
				<input type="hidden" name="productType" value={selectedType} />

				{#if form?.error}
					<div
						class="flex items-center gap-2 px-4 py-3 rounded-xl text-[0.85rem]"
						style="background: rgba(248, 113, 113, 0.1); color: var(--negative); border: 1px solid rgba(248, 113, 113, 0.2);"
					>
						<AlertCircle class="w-4 h-4 shrink-0" />
						{form.error}
					</div>
				{/if}

				<!-- Name -->
				<div class="space-y-1.5">
					<label for="name" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{labels.name()}
					</label>
					<input
						id="name"
						name="name"
						type="text"
						bind:value={name}
						placeholder={labels.namePlaceholder()}
						required
						class="w-full px-4 py-3 rounded-xl text-[0.9rem] outline-none transition-all duration-200"
						style="
							background: var(--input-bg);
							border: 1px solid var(--border-subtle);
							color: var(--text-main);
						"
						onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
						onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
					/>
				</div>

				<!-- Website URL -->
				<div class="space-y-1.5">
					<label for="websiteUrl" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{labels.url()}
					</label>
					<div class="relative">
						<div class="absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--text-muted);">
							<Globe class="w-4 h-4" />
						</div>
						<input
							id="websiteUrl"
							name="websiteUrl"
							type="url"
							bind:value={websiteUrl}
							placeholder={labels.urlPlaceholder()}
							class="w-full pl-10 pr-4 py-3 rounded-xl text-[0.9rem] outline-none transition-all duration-200"
							style="
								background: var(--input-bg);
								border: 1px solid var(--border-subtle);
								color: var(--text-main);
							"
							onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
							onblur={(e) => {
								e.currentTarget.style.borderColor = 'var(--border-subtle)';
								handleUrlBlur();
							}}
						/>
					</div>
					<p class="text-[0.75rem]" style="color: var(--text-muted);">
						{labels.urlHint()}
					</p>

					<!-- Scraping status indicators -->
					{#if scrapingStatus === 'loading'}
						<div
							class="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-[0.8rem]"
							style="background: var(--c-electric-glow); color: var(--c-electric);"
						>
							<Loader2 class="w-3.5 h-3.5 animate-spin" />
							{m.onb_quick_scraping()}
						</div>
					{:else if scrapingStatus === 'success'}
						<div
							class="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-[0.8rem]"
							style="background: rgba(52, 211, 153, 0.1); color: var(--positive);"
						>
							<CheckCircle class="w-3.5 h-3.5" />
							{m.onb_quick_scraped()}
						</div>
					{:else if scrapingStatus === 'failed'}
						<div
							class="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-[0.8rem]"
							style="background: rgba(248, 113, 113, 0.08); color: var(--text-dim);"
						>
							<AlertCircle class="w-3.5 h-3.5" />
							{m.onb_quick_scrape_failed()}
						</div>
					{/if}
				</div>

				<!-- Description -->
				<div class="space-y-1.5">
					<label for="description" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{labels.description()}
					</label>
					<textarea
						id="description"
						name="description"
						bind:value={description}
						placeholder={labels.descriptionPlaceholder()}
						rows="3"
						class="w-full px-4 py-3 rounded-xl text-[0.9rem] outline-none transition-all duration-200 resize-none"
						style="
							background: var(--input-bg);
							border: 1px solid var(--border-subtle);
							color: var(--text-main);
						"
						onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
						onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
					></textarea>
				</div>

				<!-- Logo / Photo upload -->
				<div class="space-y-1.5">
					<label class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{labels.logo()}
					</label>
					{#if data.product?.id}
						<div
							class="relative flex items-center gap-4 px-4 py-4 rounded-xl border-2 border-dashed transition-colors duration-200"
							style="border-color: var(--border-subtle); background: var(--input-bg);"
						>
							{#if logoUrl}
								<img src={logoUrl} alt="Logo" class="rounded-lg object-contain" style="width: 48px; height: 48px; border: 1px solid var(--border-subtle); padding: 3px;" />
							{:else}
								<div
									class="flex items-center justify-center w-12 h-12 rounded-lg"
									style="background: var(--bg-surface-alt);"
								>
									{#if logoUploading}
										<Loader2 class="w-5 h-5 animate-spin" style="color: var(--c-electric);" />
									{:else}
										<Upload class="w-5 h-5" style="color: var(--text-muted);" />
									{/if}
								</div>
							{/if}
							<div class="flex-1 min-w-0">
								<p class="text-[0.8rem] font-medium" style="color: var(--text-main);">
									{labels.logo()}
								</p>
								<p class="text-[0.7rem]" style="color: var(--text-muted);">
									{labels.logoHint()}
								</p>
							</div>
							<input
								type="file"
								accept="image/png,image/jpeg,image/svg+xml,image/webp"
								class="absolute inset-0 opacity-0 cursor-pointer"
								onchange={handleLogoUpload}
							/>
						</div>
					{:else}
						<p class="text-[0.7rem] italic" style="color: var(--text-muted);">
							Save your product details first, then upload a logo.
						</p>
					{/if}
				</div>

				<!-- Actions -->
				<div class="flex items-center justify-between pt-4">
					<button
						type="button"
						class="text-[0.85rem] font-medium transition-colors duration-150 cursor-pointer"
						style="color: var(--text-muted); background: none; border: none;"
						onmouseenter={(e) => (e.currentTarget.style.color = 'var(--c-electric)')}
						onmouseleave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
						onclick={() => (step = 'type')}
					>
						&larr; Back
					</button>
					<button
						type="submit"
						disabled={submitting || !name.trim()}
						class="px-6 py-2.5 rounded-xl text-[0.85rem] font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						style="background: var(--c-electric);"
						onmouseenter={(e) => {
							if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9';
						}}
						onmouseleave={(e) => {
							e.currentTarget.style.opacity = '1';
						}}
					>
						{#if submitting}
							<Loader2 class="w-4 h-4 animate-spin inline mr-2" />
						{/if}
						{m.onb_quick_next()}
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
