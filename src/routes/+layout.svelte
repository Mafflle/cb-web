<script lang="ts">
	import '../app.css';
	import 'iconify-icon';
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import auth from '$lib/stores/auth.svelte';
	import cart from '$lib/stores/cart.svelte';
	import orders from '$lib/stores/orders.svelte';

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
</script>

<Toaster richColors position="bottom-right" />

{@render children()}
