<script lang="ts">
	import { toggleMode, mode } from 'mode-watcher';
	import { Sun, Moon } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<button
	onclick={toggleMode}
	class="p-2 rounded-lg transition-all duration-200 text-[var(--text-dim)] hover:text-[var(--text-main)]"
	aria-label={m.ui_theme_toggle()}
>
	{#if $mode === 'dark'}
		<Sun class="w-5 h-5" />
	{:else}
		<Moon class="w-5 h-5" />
	{/if}
</button>
