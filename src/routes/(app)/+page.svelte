<script lang="ts">
	import { browser } from '$app/environment';
	import RestaurantCard from '$lib/components/RestaurantCard.svelte';
	import restaurant from '$lib/stores/restaurant.svelte';
	import Seo from '../../lib/components/Seo.svelte';

	$effect(() => {
		if (browser && !restaurant.loaded) {
			restaurant.load();
		}
	});

	// Debounce function for search input
	function debounce(func: (...args: any[]) => void, delay: number) {
		let timeout: NodeJS.Timeout;
		return function (...args: any[]) {
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(this, args), delay);
		};
	}

	// Function to handle search input
	function handleSearch(event: Event) {
		const input = event.target as HTMLInputElement;
		const searchTerm = input.value.toLowerCase();

		restaurant.search(searchTerm);
	}

	// Debounced search function
	const debouncedSearch = debounce(handleSearch, 400);

	// $effect(() => console.log('Keys', restaurant.keys));
</script>

<Seo />

<main class="space-y-8">
	<div class="items-center justify-between space-y-3 md:flex md:space-y-0">
		<div>
			<h3 class="text-2xl font-bold">Restaurants</h3>
		</div>

		<div class="form-input-icon p-1">
			<iconify-icon icon="material-symbols-light:search-rounded" class="icon" width="24" height="24"
			></iconify-icon>
			<input
				type="search"
				class="form-input shadow-sm"
				placeholder="Search jollof, amala, shawarma..."
				oninput={debouncedSearch}
			/>
		</div>
	</div>

	{#if restaurant.loading}
		<div class="flex h-[200px] items-center justify-center">
			<iconify-icon icon="eos-icons:loading" width="40" height="40" class=" text-[#3333338C]"
			></iconify-icon>
		</div>
	{:else if restaurant.loaded && restaurant.keys.length === 0}
		<div class="flex h-[200px] items-center justify-center">
			<p class="text-lg font-bold text-[#3333338C]">No restaurants found</p>
		</div>
	{:else if restaurant.loaded && restaurant.keys.length > 0}
		<div
			class="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-x-[10px] lg:grid-cols-4 lg:gap-x-[16px]"
		>
			{#each restaurant.keys as key (key)}
				<RestaurantCard details={restaurant.restaurants[key]} />
			{/each}
		</div>
	{/if}
</main>
