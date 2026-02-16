<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Hero from '$lib/components/landing/hero.svelte';
	import Features from '$lib/components/landing/features.svelte';
	import HowItWorks from '$lib/components/landing/how-it-works.svelte';
	import Pricing from '$lib/components/landing/pricing.svelte';
	import Cta from '$lib/components/landing/cta.svelte';
</script>

<svelte:head>
	<title>{m.landing_meta_title()}</title>
	<meta name="description" content={m.landing_meta_description()} />
</svelte:head>

<Hero />
<Features />
<HowItWorks />
<Pricing />
<Cta />
