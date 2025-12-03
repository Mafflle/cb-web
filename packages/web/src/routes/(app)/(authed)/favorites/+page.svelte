<script lang="ts">
	import RestaurantCard from '$lib/components/RestaurantCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import userStore from '$lib/stores/user.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	let favoriteRestaurants = $derived(
		data.restaurants.filter((restaurant) => userStore.isFavorite(restaurant.id))
	);
</script>

<Seo title="My Favorites - ChowBenin" description="Your favorite restaurants on ChowBenin" />

<div class="flex flex-col gap-[24px]">
	<div class="py-[20px]">
		<h3 class="text-[20px] font-extrabold">My Favorites</h3>
		<p class="text-text-muted mt-1 text-[14px]">
			{favoriteRestaurants.length === 0
				? "You haven't added any favorites yet"
				: `${favoriteRestaurants.length} favorite restaurant${favoriteRestaurants.length === 1 ? '' : 's'}`}
		</p>
	</div>

	{#if favoriteRestaurants.length === 0}
		<div class="flex flex-col items-center justify-center gap-[16px] py-[60px]">
			<iconify-icon icon="mdi:heart-outline" class="text-text-muted text-[64px]"></iconify-icon>
			<div class="text-center">
				<p class="text-text-body text-[16px] font-medium">No favorites yet</p>
				<p class="text-text-muted mt-1 text-[14px]">
					Tap the heart icon on any restaurant to add it to your favorites
				</p>
			</div>
			<a href="/" class="btn"> Browse Restaurants </a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
			{#each favoriteRestaurants as restaurant (restaurant.id)}
				<RestaurantCard {restaurant} fullWidth />
			{/each}
		</div>
	{/if}
</div>
