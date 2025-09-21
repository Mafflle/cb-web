<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	
	import cartStore, { type Cart } from '$lib/stores/cart.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import appSettings from '$lib/stores/appSettings.svelte';
	import MenuItemCard from '$lib/components/MenuItemCard.svelte';

	let {data}: PageProps = $props();

	let {restaurant} = $derived(data);
	let cart = $derived<Cart | null>(cartStore.carts[restaurant?.id as string] ?? null);
	let cartItems = $derived(cart ? cart.items : []);

	onMount(async () => {
		if (!cartStore.loaded) {
			await cartStore.load();
		}
	});
</script>

<Seo
	title={restaurant ? `${restaurant.name} - ChowBenin` : 'Restaurant - ChowBenin'}
	description={restaurant
		? `${restaurant.description} - ChowBenin`
		: 'Restaurant details - ChowBenin'}
/>

{#if restaurant}
	<main class="relative">
		<header class="relative">
			<!-- Breadcrumb (back button) -->
			<Breadcrumb />

			<div class="relative h-[200px]">
				<!-- Restaurant cover image -->
				<img
					src={restaurant.cover_image}
					alt="{restaurant.name} Cover Image"
					class="h-full w-full rounded-lg object-cover"
					loading="lazy"
				/>
				<!-- Overlay for the cover image -->
				<div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>

				<!-- Restaurant name and description (below the cover) -->
				<div class="absolute bottom-4 left-4 flex items-center">
					<img
						src={restaurant.logo}
						alt="{restaurant.name} Logo"
						class="h-16 w-16 rounded-full border-2 border-white object-cover"
						loading="lazy"
					/>
					<div class="ml-4 flex flex-col">
						<!-- Restaurant name and description (below the cover) -->
						<div class="flex flex-col">
							<h1 class="text-2xl font-bold text-white">{restaurant.name}</h1>
							<p class="text-sm text-gray-300">{restaurant.description}</p>
						</div>
					</div>
				</div>
			</div>
			<div class="flex items-center md:items-start">
				<!-- Restaurant logo -->
				<!-- Restaurant name and description (below the cover) -->
			</div>
		</header>

		<!-- Our Menu -->
		<section class="mt-10" class:mb-20={cartItems.length > 0}>
			<!-- Section Header (With title and search bar) -->
			<div class="items-center justify-between md:flex">
				<h2 class="text-2xl font-bold">Our Menu</h2>
				<div class="relative mt-4 w-full md:mt-0 md:ml-4 md:max-w-xs">
					<div class="form-input-icon">
						<iconify-icon
							icon="material-symbols-light:search-rounded"
							class="icon"
							width="24"
							height="24"
						></iconify-icon>
						<input type="text" class="form-input" placeholder="Search for a dish..." />
					</div>
				</div>
			</div>

			<div class="mt-6">
				{#if (restaurant && restaurant.items && restaurant.items.length > 0)}
					<div
						class="grid grid-cols-1 gap-x-[8px] gap-y-5 md:grid-cols-2 md:gap-x-[10px] lg:grid-cols-3 lg:gap-x-[16px]"
					>
						{#each restaurant.items as item, index (index)}
							<MenuItemCard
								{item}
								{index}
								{restaurant}
								{cartItems}
							/>
						{/each}
					</div>
				{:else}
					<div class="rounded-lg bg-white p-4 text-center">
						<p class="text-lg font-bold">No menu available for this restaurant yet.</p>
						<p class="mt-2 text-gray-600">Please check back later or contact the</p>

						<a href="/" class="btn mt-4">Back to Restaurants</a>
					</div>
				{/if}
			</div>
		</section>

		{#if cartStore.carts[restaurant.id] && cartItems.length > 0}
			<div
				class="bg-background border-border shadow-t-lg fixed right-0 bottom-0 left-0 z-50 border-t-2 p-4"
			>
				<!--
				Cart Summary
				
				- Total price 
				- Number of items in the cart
				- Checkout button
				- Clear cart button
				-->

				<div class="flex flex-col">
					<p class=" font-bold">
						Total:
						{appSettings.formatPrice(cartStore.carts[restaurant.id].total)}
					</p>
					<p class="text-sm text-gray-600">
						{cartItems.length} item{cartItems.length > 1 ? 's' : ''} in cart
					</p>
					<a
						href="/checkout?restaurant={restaurant.id}"
						class="btn btn-primary mt-2 block text-center">Checkout</a
					>
					<button
						onclick={(event) => {
							event.preventDefault();
							cartStore.deleteCart(restaurant?.id as string);
						}}
						class="link hover:text-primary mt-2 block w-full text-center text-sm"
					>
						Clear Cart
					</button>
				</div>
			</div>
		{/if}
	</main>
{/if}
