<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';
	import { Loader2, X, ChevronDown } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Product Details
	let problemSolved = $state(data.brief?.problemSolved ?? '');
	let keyFeatures = $state<string[]>(data.brief?.keyFeatures ?? []);
	let featureInput = $state('');
	let differentiator = $state(data.brief?.differentiator ?? '');
	let pricingInfo = $state(data.brief?.pricingInfo ?? '');
	let productStage = $state(data.brief?.productStage ?? '');

	// Target Audience
	let idealCustomer = $state(data.brief?.idealCustomer ?? '');
	let industry = $state(data.brief?.industry ?? '');
	let ageRange = $state(data.brief?.ageRange ?? '');
	let painPoints = $state<string[]>(data.brief?.painPoints ?? []);
	let painInput = $state('');
	let audienceHangouts = $state<string[]>(data.brief?.audienceHangouts ?? []);
	let hangoutInput = $state('');

	// Brand Voice
	let personalityTraits = $state<string[]>(data.brief?.personalityTraits ?? []);
	let exampleContent = $state(data.brief?.exampleContent ?? '');
	let wordsToUse = $state<string[]>(data.brief?.wordsToUse ?? []);
	let wordsUseInput = $state('');
	let wordsToAvoid = $state<string[]>(data.brief?.wordsToAvoid ?? []);
	let wordsAvoidInput = $state('');

	// Goals
	let mainGoal = $state(data.brief?.mainGoal ?? '');
	let postingFrequency = $state(data.brief?.postingFrequency ?? '');

	let submitting = $state(false);

	const allTraits = [
		{ key: 'professional', label: () => m.onb_brief_trait_professional() },
		{ key: 'casual', label: () => m.onb_brief_trait_casual() },
		{ key: 'witty', label: () => m.onb_brief_trait_witty() },
		{ key: 'bold', label: () => m.onb_brief_trait_bold() },
		{ key: 'friendly', label: () => m.onb_brief_trait_friendly() },
		{ key: 'technical', label: () => m.onb_brief_trait_technical() },
		{ key: 'inspiring', label: () => m.onb_brief_trait_inspiring() },
		{ key: 'playful', label: () => m.onb_brief_trait_playful() }
	];

	const goalOptions = [
		{ value: 'awareness', label: () => m.onb_brief_goal_awareness() },
		{ value: 'leads', label: () => m.onb_brief_goal_leads() },
		{ value: 'sales', label: () => m.onb_brief_goal_sales() },
		{ value: 'community', label: () => m.onb_brief_goal_community() }
	];

	const frequencyOptions = [
		{ value: 'daily', label: () => m.onb_brief_freq_daily() },
		{ value: '3x_week', label: () => m.onb_brief_freq_3x() },
		{ value: '2x_week', label: () => m.onb_brief_freq_2x() },
		{ value: 'weekly', label: () => m.onb_brief_freq_weekly() }
	];

	const stageOptions = $derived(m.onb_brief_stage_options().split(','));

	function toggleTrait(trait: string) {
		if (personalityTraits.includes(trait)) {
			personalityTraits = personalityTraits.filter((t) => t !== trait);
		} else {
			personalityTraits = [...personalityTraits, trait];
		}
	}

	function addTag(
		e: KeyboardEvent,
		input: string,
		tags: string[],
		setInput: (v: string) => void,
		setTags: (v: string[]) => void
	) {
		if (e.key === 'Enter') {
			e.preventDefault();
			const val = input.trim();
			if (val && !tags.includes(val)) {
				setTags([...tags, val]);
			}
			setInput('');
		}
	}

	function removeTag(tags: string[], index: number, setTags: (v: string[]) => void) {
		setTags(tags.filter((_, i) => i !== index));
	}
</script>

<div>
	<!-- Header -->
	<div class="text-center mb-10">
		<h1
			class="text-[1.75rem] font-extrabold tracking-tight mb-2"
			style="color: var(--text-main);"
		>
			{m.onb_brief_title()}
		</h1>
		<p class="text-[0.9rem]" style="color: var(--text-dim);">
			{m.onb_brief_subtitle()}
		</p>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
		class="space-y-8"
	>
		<!-- Hidden inputs for array fields -->
		<input type="hidden" name="keyFeatures" value={JSON.stringify(keyFeatures)} />
		<input type="hidden" name="painPoints" value={JSON.stringify(painPoints)} />
		<input type="hidden" name="audienceHangouts" value={JSON.stringify(audienceHangouts)} />
		<input type="hidden" name="personalityTraits" value={JSON.stringify(personalityTraits)} />
		<input type="hidden" name="wordsToUse" value={JSON.stringify(wordsToUse)} />
		<input type="hidden" name="wordsToAvoid" value={JSON.stringify(wordsToAvoid)} />

		<!-- Section 1: Product Details -->
		<section
			class="rounded-2xl p-6"
			style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
		>
			<h2
				class="text-[1rem] font-bold mb-5 flex items-center gap-2"
				style="color: var(--text-main);"
			>
				<span
					class="flex items-center justify-center w-6 h-6 rounded-md text-[0.7rem] font-extrabold text-white"
					style="background: var(--c-electric);"
				>1</span>
				{m.onb_brief_section_product()}
			</h2>

			<div class="space-y-5">
				<!-- Problem solved -->
				<div class="space-y-1.5">
					<label for="problemSolved" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_problem()}
					</label>
					<textarea
						id="problemSolved"
						name="problemSolved"
						bind:value={problemSolved}
						rows="2"
						class="w-full px-4 py-3 rounded-xl text-[0.9rem] outline-none transition-all duration-200 resize-none"
						style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
						onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
						onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
					></textarea>
				</div>

				<!-- Key features (tag input) -->
				<div class="space-y-1.5">
					<label class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_features()}
					</label>
					<div
						class="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[48px]"
						style="background: var(--input-bg); border: 1px solid var(--border-subtle);"
					>
						{#each keyFeatures as tag, i}
							<span
								class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.75rem] font-medium text-white"
								style="background: var(--c-electric);"
							>
								{tag}
								<button
									type="button"
									onclick={() => removeTag(keyFeatures, i, (v) => (keyFeatures = v))}
									class="cursor-pointer hover:opacity-70"
								>
									<X class="w-3 h-3" />
								</button>
							</span>
						{/each}
						<input
							type="text"
							bind:value={featureInput}
							placeholder={keyFeatures.length === 0 ? m.onb_brief_features_placeholder() : ''}
							class="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[0.85rem] py-1 px-1"
							style="color: var(--text-main);"
							onkeydown={(e) =>
								addTag(
									e,
									featureInput,
									keyFeatures,
									(v) => (featureInput = v),
									(v) => (keyFeatures = v)
								)}
						/>
					</div>
				</div>

				<!-- Differentiator -->
				<div class="space-y-1.5">
					<label for="differentiator" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_differentiator()}
					</label>
					<textarea
						id="differentiator"
						name="differentiator"
						bind:value={differentiator}
						rows="2"
						class="w-full px-4 py-3 rounded-xl text-[0.9rem] outline-none transition-all duration-200 resize-none"
						style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
						onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
						onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
					></textarea>
				</div>

				<!-- Pricing info -->
				<div class="space-y-1.5">
					<label for="pricingInfo" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_pricing()}
					</label>
					<input
						id="pricingInfo"
						name="pricingInfo"
						type="text"
						bind:value={pricingInfo}
						class="w-full px-4 py-3 rounded-xl text-[0.9rem] outline-none transition-all duration-200"
						style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
						onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
						onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
					/>
				</div>

				<!-- Product stage -->
				<div class="space-y-1.5">
					<label for="productStage" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_stage()}
					</label>
					<div class="relative">
						<select
							id="productStage"
							name="productStage"
							bind:value={productStage}
							class="w-full px-4 py-3 rounded-xl text-[0.9rem] outline-none appearance-none transition-all duration-200 cursor-pointer"
							style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
							onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
							onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
						>
							<option value=""></option>
							{#each stageOptions as stage}
								<option value={stage}>{stage}</option>
							{/each}
						</select>
						<ChevronDown
							class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
							style="color: var(--text-muted);"
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Section 2: Target Audience -->
		<section
			class="rounded-2xl p-6"
			style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
		>
			<h2
				class="text-[1rem] font-bold mb-5 flex items-center gap-2"
				style="color: var(--text-main);"
			>
				<span
					class="flex items-center justify-center w-6 h-6 rounded-md text-[0.7rem] font-extrabold text-white"
					style="background: var(--c-secondary);"
				>2</span>
				{m.onb_brief_section_audience()}
			</h2>

			<div class="space-y-5">
				<!-- Ideal customer -->
				<div class="space-y-1.5">
					<label for="idealCustomer" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_customer()}
					</label>
					<textarea
						id="idealCustomer"
						name="idealCustomer"
						bind:value={idealCustomer}
						placeholder={m.onb_brief_customer_placeholder()}
						rows="2"
						class="w-full px-4 py-3 rounded-xl text-[0.9rem] outline-none transition-all duration-200 resize-none"
						style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
						onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
						onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
					></textarea>
				</div>

				<!-- Industry and Age range side by side -->
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="industry" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
							{m.onb_brief_industry()}
						</label>
						<input
							id="industry"
							name="industry"
							type="text"
							bind:value={industry}
							class="w-full px-4 py-3 rounded-xl text-[0.9rem] outline-none transition-all duration-200"
							style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
							onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
							onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
						/>
					</div>
					<div class="space-y-1.5">
						<label for="ageRange" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
							{m.onb_brief_age_range()}
						</label>
						<input
							id="ageRange"
							name="ageRange"
							type="text"
							bind:value={ageRange}
							class="w-full px-4 py-3 rounded-xl text-[0.9rem] outline-none transition-all duration-200"
							style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
							onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
							onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
						/>
					</div>
				</div>

				<!-- Pain points (tag input) -->
				<div class="space-y-1.5">
					<label class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_pain_points()}
					</label>
					<div
						class="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[48px]"
						style="background: var(--input-bg); border: 1px solid var(--border-subtle);"
					>
						{#each painPoints as tag, i}
							<span
								class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.75rem] font-medium text-white"
								style="background: var(--c-electric);"
							>
								{tag}
								<button
									type="button"
									onclick={() => removeTag(painPoints, i, (v) => (painPoints = v))}
									class="cursor-pointer hover:opacity-70"
								>
									<X class="w-3 h-3" />
								</button>
							</span>
						{/each}
						<input
							type="text"
							bind:value={painInput}
							placeholder={painPoints.length === 0 ? m.onb_brief_pain_points_placeholder() : ''}
							class="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[0.85rem] py-1 px-1"
							style="color: var(--text-main);"
							onkeydown={(e) =>
								addTag(
									e,
									painInput,
									painPoints,
									(v) => (painInput = v),
									(v) => (painPoints = v)
								)}
						/>
					</div>
				</div>

				<!-- Audience hangouts (tag input) -->
				<div class="space-y-1.5">
					<label class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_hangouts()}
					</label>
					<div
						class="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[48px]"
						style="background: var(--input-bg); border: 1px solid var(--border-subtle);"
					>
						{#each audienceHangouts as tag, i}
							<span
								class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.75rem] font-medium text-white"
								style="background: var(--c-electric);"
							>
								{tag}
								<button
									type="button"
									onclick={() => removeTag(audienceHangouts, i, (v) => (audienceHangouts = v))}
									class="cursor-pointer hover:opacity-70"
								>
									<X class="w-3 h-3" />
								</button>
							</span>
						{/each}
						<input
							type="text"
							bind:value={hangoutInput}
							placeholder={audienceHangouts.length === 0 ? m.onb_brief_hangouts_placeholder() : ''}
							class="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[0.85rem] py-1 px-1"
							style="color: var(--text-main);"
							onkeydown={(e) =>
								addTag(
									e,
									hangoutInput,
									audienceHangouts,
									(v) => (hangoutInput = v),
									(v) => (audienceHangouts = v)
								)}
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Section 3: Brand Voice -->
		<section
			class="rounded-2xl p-6"
			style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
		>
			<h2
				class="text-[1rem] font-bold mb-5 flex items-center gap-2"
				style="color: var(--text-main);"
			>
				<span
					class="flex items-center justify-center w-6 h-6 rounded-md text-[0.7rem] font-extrabold text-white"
					style="background: var(--c-tertiary);"
				>3</span>
				{m.onb_brief_section_voice()}
			</h2>

			<div class="space-y-5">
				<!-- Personality traits (selectable chips) -->
				<div class="space-y-2">
					<label class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_traits()}
					</label>
					<div class="flex flex-wrap gap-2">
						{#each allTraits as trait}
							{@const selected = personalityTraits.includes(trait.key)}
							<button
								type="button"
								onclick={() => toggleTrait(trait.key)}
								class="px-4 py-2 rounded-xl text-[0.8rem] font-medium transition-all duration-200 cursor-pointer"
								style="
									background: {selected ? 'var(--c-electric)' : 'var(--bg-surface-alt)'};
									color: {selected ? 'white' : 'var(--text-dim)'};
									border: 1px solid {selected ? 'var(--c-electric)' : 'var(--border-subtle)'};
								"
							>
								{trait.label()}
							</button>
						{/each}
					</div>
				</div>

				<!-- Example content -->
				<div class="space-y-1.5">
					<label for="exampleContent" class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_examples()}
					</label>
					<textarea
						id="exampleContent"
						name="exampleContent"
						bind:value={exampleContent}
						placeholder={m.onb_brief_examples_placeholder()}
						rows="3"
						class="w-full px-4 py-3 rounded-xl text-[0.9rem] outline-none transition-all duration-200 resize-none"
						style="background: var(--input-bg); border: 1px solid var(--border-subtle); color: var(--text-main);"
						onfocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-electric)')}
						onblur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
					></textarea>
				</div>

				<!-- Words to use (tag input) -->
				<div class="space-y-1.5">
					<label class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_words_use()}
					</label>
					<div
						class="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[48px]"
						style="background: var(--input-bg); border: 1px solid var(--border-subtle);"
					>
						{#each wordsToUse as tag, i}
							<span
								class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.75rem] font-medium"
								style="background: rgba(var(--chip-positive-rgb) / 0.15); color: var(--positive);"
							>
								{tag}
								<button
									type="button"
									onclick={() => removeTag(wordsToUse, i, (v) => (wordsToUse = v))}
									class="cursor-pointer hover:opacity-70"
								>
									<X class="w-3 h-3" />
								</button>
							</span>
						{/each}
						<input
							type="text"
							bind:value={wordsUseInput}
							class="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[0.85rem] py-1 px-1"
							style="color: var(--text-main);"
							onkeydown={(e) =>
								addTag(
									e,
									wordsUseInput,
									wordsToUse,
									(v) => (wordsUseInput = v),
									(v) => (wordsToUse = v)
								)}
						/>
					</div>
				</div>

				<!-- Words to avoid (tag input) -->
				<div class="space-y-1.5">
					<label class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_words_avoid()}
					</label>
					<div
						class="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[48px]"
						style="background: var(--input-bg); border: 1px solid var(--border-subtle);"
					>
						{#each wordsToAvoid as tag, i}
							<span
								class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.75rem] font-medium"
								style="background: rgba(var(--chip-tertiary-rgb) / 0.15); color: var(--negative);"
							>
								{tag}
								<button
									type="button"
									onclick={() => removeTag(wordsToAvoid, i, (v) => (wordsToAvoid = v))}
									class="cursor-pointer hover:opacity-70"
								>
									<X class="w-3 h-3" />
								</button>
							</span>
						{/each}
						<input
							type="text"
							bind:value={wordsAvoidInput}
							class="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[0.85rem] py-1 px-1"
							style="color: var(--text-main);"
							onkeydown={(e) =>
								addTag(
									e,
									wordsAvoidInput,
									wordsToAvoid,
									(v) => (wordsAvoidInput = v),
									(v) => (wordsToAvoid = v)
								)}
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Section 4: Goals & Preferences -->
		<section
			class="rounded-2xl p-6"
			style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
		>
			<h2
				class="text-[1rem] font-bold mb-5 flex items-center gap-2"
				style="color: var(--text-main);"
			>
				<span
					class="flex items-center justify-center w-6 h-6 rounded-md text-[0.7rem] font-extrabold text-white"
					style="background: linear-gradient(135deg, var(--c-electric), var(--c-secondary));"
				>4</span>
				{m.onb_brief_section_goals()}
			</h2>

			<div class="space-y-6">
				<!-- Main goal (radio group) -->
				<div class="space-y-2">
					<label class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_goal()}
					</label>
					<div class="grid grid-cols-2 gap-2">
						{#each goalOptions as goal}
							{@const selected = mainGoal === goal.value}
							<label
								class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
								style="
									background: {selected ? 'var(--c-electric-glow)' : 'var(--input-bg)'};
									border: 1px solid {selected ? 'var(--c-electric)' : 'var(--border-subtle)'};
								"
							>
								<input
									type="radio"
									name="mainGoal"
									value={goal.value}
									bind:group={mainGoal}
									class="sr-only"
								/>
								<div
									class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
									style="border-color: {selected ? 'var(--c-electric)' : 'var(--border-subtle)'};"
								>
									{#if selected}
										<div
											class="w-2 h-2 rounded-full"
											style="background: var(--c-electric);"
										></div>
									{/if}
								</div>
								<span
									class="text-[0.85rem] font-medium"
									style="color: {selected ? 'var(--c-electric)' : 'var(--text-dim)'};"
								>
									{goal.label()}
								</span>
							</label>
						{/each}
					</div>
				</div>

				<!-- Posting frequency (radio group) -->
				<div class="space-y-2">
					<label class="block text-[0.8rem] font-semibold" style="color: var(--text-main);">
						{m.onb_brief_frequency()}
					</label>
					<div class="grid grid-cols-2 gap-2">
						{#each frequencyOptions as freq}
							{@const selected = postingFrequency === freq.value}
							<label
								class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
								style="
									background: {selected ? 'var(--c-electric-glow)' : 'var(--input-bg)'};
									border: 1px solid {selected ? 'var(--c-electric)' : 'var(--border-subtle)'};
								"
							>
								<input
									type="radio"
									name="postingFrequency"
									value={freq.value}
									bind:group={postingFrequency}
									class="sr-only"
								/>
								<div
									class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
									style="border-color: {selected ? 'var(--c-electric)' : 'var(--border-subtle)'};"
								>
									{#if selected}
										<div
											class="w-2 h-2 rounded-full"
											style="background: var(--c-electric);"
										></div>
									{/if}
								</div>
								<span
									class="text-[0.85rem] font-medium"
									style="color: {selected ? 'var(--c-electric)' : 'var(--text-dim)'};"
								>
									{freq.label()}
								</span>
							</label>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- Actions -->
		<div class="flex items-center justify-between pt-2 pb-8">
			<div class="flex items-center gap-4">
				<a
					href="/dashboard/onboarding/quick-start"
					class="text-[0.85rem] font-medium transition-colors duration-150"
					style="color: var(--text-muted);"
					onmouseenter={(e) => (e.currentTarget.style.color = 'var(--c-electric)')}
					onmouseleave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
				>
					{m.onb_brief_back()}
				</a>
				<span style="color: var(--border-subtle);">|</span>
				<a
					href="/dashboard"
					class="text-[0.85rem] font-medium transition-colors duration-150"
					style="color: var(--text-muted);"
					onmouseenter={(e) => (e.currentTarget.style.color = 'var(--c-electric)')}
					onmouseleave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
				>
					{m.onb_brief_skip()}
				</a>
			</div>
			<button
				type="submit"
				disabled={submitting}
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
				{m.onb_brief_next()}
			</button>
		</div>
	</form>
</div>
