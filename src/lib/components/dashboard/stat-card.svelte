<script lang="ts">
	interface Props {
		label: string;
		value: string;
		sublabel: string;
	}

	let { label, value, sublabel }: Props = $props();
</script>

<div
	class="rounded-xl border p-4 transition-all duration-200"
	style="
		border-color: var(--border-subtle);
		background: var(--bg-surface);
		box-shadow: var(--card-shadow);
	"
>
	<div class="mb-1 text-xs" style="color: var(--text-dim);">
		{label}
	</div>
	<div class="text-lg font-extrabold" style="color: var(--text-main);">
		{value}
	</div>
	<div class="mt-0.5 text-xs" style="color: var(--text-dim);">
		{sublabel}
	</div>
</div>
