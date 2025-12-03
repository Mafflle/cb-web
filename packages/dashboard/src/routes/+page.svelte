<script lang="ts">
	let { data } = $props();
	const { user } = $derived(data);
</script>

<svelte:head>
	<title>Dashboard - ChowBenin</title>
</svelte:head>

<div class="dashboard-container">
	<h1>Welcome to ChowBenin Dashboard</h1>
	{#if user}
		<p>Logged in as: <strong>{user.email}</strong></p>
	{/if}
	<p class="subtitle">Restaurant management dashboard coming soon...</p>
</div>

<style>
	.dashboard-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 24px;
		text-align: center;
	}

	h1 {
		font-size: 28px;
		margin-bottom: 16px;
	}

	p {
		color: var(--color-text-muted);
		margin-bottom: 8px;
	}

	.subtitle {
		font-size: 14px;
	}
</style>
