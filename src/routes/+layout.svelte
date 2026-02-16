<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import Navbar from '$lib/components/landing/navbar.svelte';
	import Footer from '$lib/components/landing/footer.svelte';

	let { children } = $props();
</script>

<ModeWatcher />
<Navbar />
{@render children()}
<Footer />
