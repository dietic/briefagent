<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Mail } from 'lucide-svelte';
</script>

<div class="auth-page">
	<div class="auth-icon-wrapper">
		<Mail class="auth-icon" />
	</div>

	<h1 class="auth-title">{m.auth_verify_title()}</h1>
	<p class="auth-subtitle">{m.auth_verify_subtitle()}</p>

	<a href="/login" class="auth-back-link">{m.auth_verify_back()}</a>
</div>

<style>
	.auth-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.5rem;
		padding: 1rem 0;
	}

	.auth-icon-wrapper {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background: var(--c-electric-glow);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.5rem;
		color: var(--c-electric);
	}

	:global(.auth-icon) {
		width: 1.5rem;
		height: 1.5rem;
	}

	.auth-title {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.5rem;
		color: var(--text-main);
		letter-spacing: -0.02em;
		margin: 0;
	}

	.auth-subtitle {
		font-size: 0.875rem;
		color: var(--text-dim);
		margin: 0;
		line-height: 1.5;
		max-width: 320px;
	}

	.auth-back-link {
		color: var(--c-electric);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.85rem;
		margin-top: 1rem;
	}

	.auth-back-link:hover {
		text-decoration: underline;
	}
</style>
