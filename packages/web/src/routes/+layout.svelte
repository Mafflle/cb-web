<script lang="ts">
	import '../app.css';
	import 'iconify-icon';
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import auth from '$lib/stores/auth.svelte';
	import cart from '$lib/stores/cart.svelte';
	import appSettings from '$lib/stores/appSettings.svelte';
	import network from '$lib/stores/network.svelte';
	import OfflinePage from '$lib/components/OfflinePage.svelte';
	import DesktopBlocker from '$lib/components/DesktopBlocker.svelte';
	import NavigationLoader from '$lib/components/NavigationLoader.svelte';

	let { data, children } = $props()
  	let { session, supabase } = $derived(data)	

	onMount(async () => {
		if (browser && !auth.loaded) {
			await auth.load(supabase, session);
			await cart.load();
		}
		if (browser && !appSettings.loaded) {
			appSettings.load(supabase);
		}
		// Initial connectivity check
		if (browser) {
			network.checkConnectivity();
		}
		return (() => {
			auth.cleanup();
			network.cleanup();
		}) as never
	});
</script>

<Toaster richColors position="bottom-right" />

<DesktopBlocker>
	{#if !network.online}
		<OfflinePage />
	{:else if !appSettings.loaded}
		<NavigationLoader />
	{:else}
		{@render children()}
	{/if}
</DesktopBlocker>
