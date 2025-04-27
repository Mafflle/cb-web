<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import cart from '$lib/stores/cart.svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	$effect(() => {
		if (browser && !cart.loaded) {
			cart.load();
		}
	});
</script>

<Navbar />
<div class="container mx-auto flex-1 px-5 py-5 lg:px-10">
	{@render children()}
</div>
<Footer />
