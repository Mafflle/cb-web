<script lang="ts">
	import RestaurantCard from '$lib/components/RestaurantCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageProps } from './$types';
	import { showToast } from '$lib/utils/toaster.svelte';
	import restaurantRepository from '$lib/repositories/restaurant.repository';

	const { data }: PageProps = $props();

	let {restaurant: restaurantData, supabase} = $derived(data);

	// Debounce function for search input
	function debounce(func: (...args: any[]) => void, delay: number) {
		let timeout: NodeJS.Timeout;
		return (...args: any[]) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), delay);
		};
	}

	const handleSearch = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		const searchTerm = input.value.toLowerCase();

		try {
			restaurantData = await restaurantRepository.search(supabase, searchTerm);
		} catch (e) {
			restaurantData = [];
			showToast({
				message: 'Error searching restaurants, please try again.',
				type: 'error'
			})
			console.error('Error searching restaurants:', e);
		}
	}

	// Debounced search function
	const debouncedSearch = debounce(handleSearch, 400);
</script>

<Seo />

<main class="space-y-8">
	<!-- <div class="items-center justify-between space-y-3 md:flex md:space-y-0">
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
	</div> -->

	{#if restaurantData?.length === 0}
		<div class="flex h-[200px] items-center justify-center">
			<p class="text-lg font-bold text-[#3333338C]">No restaurants found</p>
		</div>
	{:else if (restaurantData && restaurantData?.length > 0)}
		<div
			class="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-x-[10px] lg:grid-cols-4 lg:gap-x-[16px]"
		>
			{#each restaurantData as restaurant (restaurant.id)}
				<RestaurantCard details={restaurant} />
			{/each}
		</div>
	{/if}
</main>
