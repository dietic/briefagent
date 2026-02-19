<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { CheckCircle, ArrowRight } from 'lucide-svelte';
</script>

<div class="flex flex-col items-center justify-center text-center py-16">
	<!-- Checkmark icon -->
	<div
		class="flex items-center justify-center w-20 h-20 rounded-full mb-6"
		style="background: var(--c-electric-glow);"
	>
		<CheckCircle class="w-10 h-10" style="color: var(--c-electric);" />
	</div>

	<!-- Title -->
	<h1
		class="text-[2rem] font-extrabold tracking-tight mb-3"
		style="color: var(--text-main);"
	>
		{m.onb_complete_title()}
	</h1>

	<!-- Subtitle -->
	<p
		class="text-[1rem] max-w-md mb-10"
		style="color: var(--text-dim);"
	>
		{m.onb_complete_subtitle()}
	</p>

	<!-- CTA -->
	<a
		href="/dashboard"
		class="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[0.95rem] font-semibold text-white transition-all duration-200"
		style="background: var(--c-electric);"
		onmouseenter={(e) => (e.currentTarget.style.opacity = '0.9')}
		onmouseleave={(e) => (e.currentTarget.style.opacity = '1')}
	>
		{m.onb_complete_dashboard()}
		<ArrowRight class="w-4 h-4" />
	</a>
</div>
