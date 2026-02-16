<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.dash_meta_title_overview()}</title>
</svelte:head>

<div style="animation: dash-fade-up 0.4s ease-out;">
	<h1 class="text-[1.75rem] font-extrabold tracking-tight" style="color: var(--text-main);">
		<span style="display: inline-block; animation: wave-hand 2s infinite; transform-origin: 70% 70%;">&#x1F44B;</span>
		Good morning, Diego
	</h1>
	<p class="mt-2 text-[0.95rem]" style="color: var(--text-dim);">
		Here's what's happening with your content today.
	</p>
</div>
