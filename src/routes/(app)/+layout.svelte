<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Onboarding from '$lib/components/Onboarding.svelte';
	import cart from '$lib/stores/cart.svelte';
	import { browser } from '$app/environment';
	import { navigating, page } from '$app/state';
	import NavigationLoader from '$lib/components/NavigationLoader.svelte';

	let { children } = $props();

	$effect(() => {
		if (browser && !cart.loaded) {
			cart.load();
		}
	});

	let showLoader = $derived(!!navigating.to)
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
