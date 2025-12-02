<script lang="ts">
	import RestaurantCard from '$lib/components/RestaurantCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<Seo title="My Favorites - ChowBenin" description="Your favorite restaurants on ChowBenin" />

<div class="flex flex-col gap-[24px]">
	<div class="py-[20px]">
		<h3 class="text-[20px] font-extrabold">My Favorites</h3>
		<p class="text-text-muted mt-1 text-[14px]">
			{data.restaurants.length === 0
				? 'You haven\'t added any favorites yet'
				: `${data.restaurants.length} favorite restaurant${data.restaurants.length === 1 ? '' : 's'}`}
		</p>
	</div>

	{#if data.restaurants.length === 0}
		<div class="flex flex-col items-center justify-center gap-[16px] py-[60px]">
			<iconify-icon icon="mdi:heart-outline" class="text-text-muted text-[64px]"></iconify-icon>
			<div class="text-center">
				<p class="text-text-body text-[16px] font-medium">No favorites yet</p>
				<p class="text-text-muted mt-1 text-[14px]">
					Tap the heart icon on any restaurant to add it to your favorites
				</p>
			</div>
			<a
				href="/"
				class="bg-primary text-on-primary mt-[16px] rounded-[8px] px-[24px] py-[12px] font-medium"
			>
				Browse Restaurants
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
			{#each data.restaurants as restaurant (restaurant.id)}
				<RestaurantCard {restaurant} fullWidth />
			{/each}
		</div>
	{/if}
</div>
