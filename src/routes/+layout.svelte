<script lang="ts">
	import '../app.css';
	import 'iconify-icon';
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import auth from '$lib/stores/auth.svelte';
	import cart from '$lib/stores/cart.svelte';
	import orders from '$lib/stores/orders.svelte';
	import appSettings from '$lib/stores/appSettings.svelte';

	let { children } = $props();

	onMount(async () => {
		if (browser && !auth.loaded) {
			await auth.load();
			await cart.load();
		}

		if (auth.currentUser) {
			await orders.load();
		}
	});

	$effect(() => {
		if (browser && !appSettings.loaded) {
			appSettings.load();
		}
	});
</script>

<Toaster richColors position="bottom-right" />

{#if appSettings.loading}
	<div class="flex h-screen items-center justify-center">
		<iconify-icon icon="eos-icons:loading" class=" text-primary" width="32" height="32"
		></iconify-icon>
	</div>
{:else}
	{@render children()}
{/if}
