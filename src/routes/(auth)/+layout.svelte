<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	let { children } = $props();
</script>

<div class="auth-layout">
	<!-- Decorative background elements -->
	<div class="auth-bg-accent auth-bg-accent--1"></div>
	<div class="auth-bg-accent auth-bg-accent--2"></div>

	<div class="auth-container">
		<!-- Logo -->
		<a href="/" class="auth-logo">
			<div class="auth-logo-icon">B</div>
			<span class="auth-logo-text">
				<span class="auth-logo-brief">{m.auth_logo_brief()}</span><span class="auth-logo-agent">{m.auth_logo_agent()}</span>
			</span>
		</a>

		<!-- Content card -->
		<div class="auth-card">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.auth-layout {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-page);
		position: relative;
		overflow: hidden;
		padding: 2rem 1rem;
	}

	.auth-bg-accent {
		position: absolute;
		border-radius: 50%;
		filter: blur(120px);
		opacity: 0.12;
		pointer-events: none;
	}

	.auth-bg-accent--1 {
		width: 600px;
		height: 600px;
		background: var(--c-electric);
		top: -200px;
		right: -100px;
	}

	.auth-bg-accent--2 {
		width: 400px;
		height: 400px;
		background: var(--c-tertiary);
		bottom: -150px;
		left: -100px;
	}

	.auth-container {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		width: 100%;
		max-width: 420px;
	}

	.auth-logo {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
	}

	.auth-logo-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: var(--c-electric);
		color: white;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.875rem;
	}

	.auth-logo-text {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.25rem;
		letter-spacing: -0.03em;
	}

	.auth-logo-brief {
		color: var(--text-main);
	}

	.auth-logo-agent {
		color: var(--c-electric);
	}

	.auth-card {
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--border-subtle);
		border-radius: 1rem;
		padding: 2rem;
	}

	/* Geometric accent in background */
	.auth-layout::before {
		content: '';
		position: absolute;
		width: 200px;
		height: 200px;
		border: 1px solid var(--border-subtle);
		transform: rotate(45deg);
		top: 15%;
		left: 8%;
		opacity: 0.3;
		pointer-events: none;
	}
</style>
