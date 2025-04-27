<script>
	import Footer from '$lib/components/Footer.svelte';

	import Navbar from '$lib/components/Navbar.svelte';
	import NotFoundIllustration from '$lib/components/NotFoundIllustration.svelte';
</script>

<Navbar />
<div
	class="container mx-auto flex h-full flex-1 flex-col items-center justify-center px-5 py-5 text-center lg:px-10"
>
	<!-- Display restaurant not found message here and button to browse all restaurants -->
	<!-- <div class=""> -->
	<NotFoundIllustration />
	<p class="mt-4 text-lg">Sorry, we couldn't find the page you're looking for.</p>
	<a href="/" class="mt-6 rounded bg-[#FF5722] px-4 py-2 text-center text-white">
		Browse All Restaurants
	</a>
	<!-- </div> -->
</div>
<Footer />
