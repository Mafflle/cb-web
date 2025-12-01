<script lang="ts">
	import network from '$lib/stores/network.svelte';

	function handleRefresh() {
		network.refresh();
	}
</script>

<div class="flex h-screen flex-col items-center justify-center bg-background px-5 text-center">
	<iconify-icon
		icon="mdi:wifi-off"
		class="mb-6 text-primary"
		width="120"
		height="120"
	></iconify-icon>
	<h1 class="text-h3 mb-4 font-bold text-text-heading">No Internet Connection</h1>
	<p class="text-text-muted mb-8 max-w-md text-base">
		Please check your network connection and try again.
	</p>
	<button
		onclick={handleRefresh}
		class="btn flex items-center gap-2"
		type="button"
	>
		<iconify-icon icon="mdi:refresh" width="20" height="20"></iconify-icon>
		Refresh
	</button>
</div>

