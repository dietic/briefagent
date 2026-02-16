<script lang="ts">
	import Navbar from '$lib/components/landing/navbar.svelte';
	import Footer from '$lib/components/landing/footer.svelte';

	let { children } = $props();
</script>

<Navbar />
{@render children()}
<Footer />
