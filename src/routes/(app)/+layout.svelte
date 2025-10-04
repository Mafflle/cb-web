<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import cart from '$lib/stores/cart.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	let { children } = $props();

	$effect(() => {
		if (browser && !cart.loaded) {
			cart.load();
		}
	});
</script>

<Navbar showSearchButton={page.url.pathname === '/'} />
<div class="container mx-auto flex-1 px-[16px] pt-[32px] mb-[100px] lg:px-10">
	{@render children()}
</div>
<Footer />
