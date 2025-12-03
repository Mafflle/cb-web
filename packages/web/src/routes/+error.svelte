<script>
	import { page } from '$app/state';
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import NotFoundIllustration from '$lib/components/NotFoundIllustration.svelte';
</script>

<Navbar />
<div
	class="container mx-auto flex h-full flex-1 flex-col items-center justify-center px-5 py-5 text-center lg:px-10"
>
	{#if page.status === 404}
		<NotFoundIllustration />
		<p class="mt-4 text-lg">Sorry, we couldn't find the page you're looking for.</p>
		<a href="/" class="mt-6 rounded bg-[#FF5722] px-4 py-2 text-center text-white">
			Browse All Restaurants
		</a>
	{:else}
		<p class="mt-4 text-lg">An unexpected error occurred.</p>
		<a href="/" class="mt-6 rounded bg-[#FF5722] px-4 py-2 text-center text-white">
			Browse All Restaurants
		</a>
	{/if}
	
</div>
<Footer />
