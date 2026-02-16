<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';

	let { form } = $props();
	let loading = $state(false);
</script>

<div class="auth-page">
	<h1 class="auth-title">{m.auth_signup_title()}</h1>
	<p class="auth-subtitle">{m.auth_signup_subtitle()}</p>

	{#if form?.error}
		<div class="auth-error" role="alert">
			<span>{form.error}</span>
		</div>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
		class="auth-form"
	>
		<div class="auth-field">
			<label for="email" class="auth-label">{m.auth_signup_email()}</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				autocomplete="email"
				value={form?.email ?? ''}
				class="auth-input"
				placeholder="you@example.com"
			/>
		</div>

		<div class="auth-field">
			<label for="password" class="auth-label">{m.auth_signup_password()}</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				minlength="8"
				autocomplete="new-password"
				class="auth-input"
			/>
			<span class="auth-hint">{m.auth_signup_password_hint()}</span>
		</div>

		<button type="submit" class="auth-btn" disabled={loading}>
			{#if loading}
				<span class="auth-spinner"></span>
			{/if}
			{m.auth_signup_submit()}
		</button>
	</form>

	<p class="auth-footer-text">
		{m.auth_signup_has_account()}
		<a href="/login" class="auth-link">{m.auth_signup_login_link()}</a>
	</p>
</div>

<style>
	.auth-page {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
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
		margin: 0 0 1.25rem 0;
	}

	.auth-error {
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		margin-bottom: 1rem;
		color: #f87171;
		font-size: 0.85rem;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.125rem;
		margin-top: 0.25rem;
	}

	.auth-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.auth-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-main);
	}

	.auth-input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		background: var(--bg-surface-alt);
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		color: var(--text-main);
		font-size: 0.875rem;
		transition: border-color 0.15s, box-shadow 0.15s;
		outline: none;
		font-family: inherit;
	}

	.auth-input::placeholder {
		color: var(--text-muted);
	}

	.auth-input:focus {
		border-color: var(--c-electric);
		box-shadow: 0 0 0 3px var(--c-electric-glow);
	}

	.auth-hint {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.auth-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.7rem;
		background: var(--c-electric);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: filter 0.15s;
		margin-top: 0.25rem;
	}

	.auth-btn:hover:not(:disabled) {
		filter: brightness(1.1);
	}

	.auth-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.auth-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.auth-link {
		color: var(--c-electric);
		text-decoration: none;
		font-weight: 500;
	}

	.auth-link:hover {
		text-decoration: underline;
	}

	.auth-footer-text {
		text-align: center;
		font-size: 0.85rem;
		color: var(--text-dim);
		margin-top: 1.25rem;
	}
</style>
