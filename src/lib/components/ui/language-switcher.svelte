<script lang="ts">
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js';
	import { Globe } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	function handleLocaleChange(locale: string) {
		setLocale(locale as any);
	}
</script>

<div class="flex items-center gap-1" aria-label={m.ui_language_label()}>
	<Globe class="w-4 h-4 text-neutral-500" />
	{#each locales as locale}
		<button
			onclick={() => handleLocaleChange(locale)}
			class="text-xs font-medium px-2 py-1 rounded-md transition-colors cursor-pointer
				{getLocale() === locale
				? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
				: 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}"
		>
			{locale.toUpperCase()}
		</button>
	{/each}
</div>
