<script lang="ts">
	const { href = '/', text = 'Back to Restaurants' }: { href?: string; text?: string } = $props();
</script>

<a {href} class="link flex items-center gap-1 rounded text-xs">
	<div class="bg-surface border-border mb-4 flex items-center gap-2 rounded border p-2 shadow-xs">
		<iconify-icon icon="material-symbols:arrow-back-rounded" width="16" height="16"></iconify-icon>
		<span> {text} </span>
	</div>
</a>
