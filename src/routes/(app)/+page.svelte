<script lang="ts">
	import RestaurantCard from '$lib/components/RestaurantCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageProps } from './$types';
	import { showToast } from '$lib/utils/toaster.svelte';
	import restaurantRepository from '$lib/repositories/restaurant.repository';

	const { data }: PageProps = $props();

	let { restaurants, supabase, featuredRestaurants } = $derived(data);
	

	const handleSearch = async (searchTerm: string) => {
		searchTerm = searchTerm.toLowerCase().trim();

		if (searchTerm.length === 0) {
			restaurants = data.restaurants;
			return;
		}

		try {
			const searchResults = await restaurantRepository.search(supabase, searchTerm);
			console.log('Search results:', searchResults);
			restaurants = searchResults;
		} catch (e) {
			console.error('Error searching restaurants:', e);
			restaurants = [];
			showToast({
				message: 'Error searching restaurants, please try again.',
				type: 'error'
			})
			console.error('Error searching restaurants:', e);
		}
	}
</script>

<Seo />



<main class="space-y-8">
	{#if restaurants?.length === 0}
		<div class="flex h-[200px] items-center justify-center">
			<p class="text-lg font-bold text-[#3333338C]">No restaurants found</p>
		</div>
	{:else if (restaurants && restaurants?.length > 0)}
		{#if featuredRestaurants && featuredRestaurants.length > 0}
			<!-- Side carousel for featured restaurants -->
			<div class="mb-8">
				<h2 class="mb-[16px] text-[20px] font-[700]">Featured today</h2>
				<div class="relative">
					<div class="flex overflow-x-auto space-x-4 scrollbar-hide">
						{#each featuredRestaurants as restaurant (restaurant.id)}
							<div class="min-w-[250px] flex-shrink-0">
								<RestaurantCard {restaurant} />
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<div
			class="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-x-[10px] lg:grid-cols-4 lg:gap-x-[16px]"
		>
			{#each restaurants as restaurant (restaurant.id)}
				<RestaurantCard {restaurant} fullWidth />
			{/each}
		</div>
	{/if}
</main>
