<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Onboarding from '$lib/components/Onboarding.svelte';
	import cart from '$lib/stores/cart.svelte';
	import { browser } from '$app/environment';
	import { navigating, page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import NavigationLoader from '$lib/components/NavigationLoader.svelte';

	let { children } = $props();

	$effect(() => {
		if (browser && !cart.loaded) {
			cart.load();
		}
	});

	// Track navigation state with timeout protection
	let isNavigating = $state(false);
	let navigationTimeout: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (navigating.to) {
			isNavigating = true;
			// Safety timeout: hide loader after 10 seconds to prevent infinite loading
			if (navigationTimeout) clearTimeout(navigationTimeout);
			navigationTimeout = setTimeout(() => {
				isNavigating = false;
			}, 10000);
		} else {
			isNavigating = false;
			if (navigationTimeout) {
				clearTimeout(navigationTimeout);
				navigationTimeout = null;
			}
		}
	});

	// Ensure loader is hidden after navigation completes (including error scenarios)
	afterNavigate(() => {
		isNavigating = false;
		if (navigationTimeout) {
			clearTimeout(navigationTimeout);
			navigationTimeout = null;
		}
	});

	let showLoader = $derived(isNavigating)
</script>

<Onboarding />

{#if showLoader}
	<NavigationLoader />
{/if}
<Navbar showSearchButton={page.url.pathname === '/'} />
<div class="container mx-auto flex-1 px-[16px] pt-[32px] mb-[100px] lg:px-10">
	{@render children()}
</div>
<Footer />
