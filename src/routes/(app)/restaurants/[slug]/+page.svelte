<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import supabase from '$lib/supabase';
	import restaurantStore from '$lib/stores/restaurant.svelte';
	import cart from '$lib/stores/cart.svelte';
	import { goto } from '$app/navigation';
	import Seo from '../../../../lib/components/Seo.svelte';
	import Breadcrumb from '../../../../lib/components/Breadcrumb.svelte';

	let loading = $state(true);
	let menuItems = $state<null | any[]>(null);
	let restaurant = $state<null | any>(null);

	let slug = page.params.slug;

	// Fetch restaurant details based on the slug
	const fetchRestaurantDetails = async () => {
		restaurant = await restaurantStore.getBySlug(slug);

		if (!restaurant) {
			goto('/404');
		}
	};

	// Fetch menu items for the restaurant
	const fetchMenuItems = async () => {
		if (!restaurant || !restaurant.id) {
			console.error('Restaurant ID is not available');
			return;
		}

		const { data, error } = await supabase
			.from('items')
			.select('id, name, description, image, price, discount_price')
			.eq('restaurant_id', restaurant.id);

		if (error) {
			console.error('Error fetching menu items:', error);
			return;
		}

		menuItems = data;
	};

	let cartItems = $state<any[]>([]);

	$effect(() => {
		if (restaurant) {
			const carts = cart.carts;
			const restaurantCart = carts[restaurant.id];
			cartItems = restaurantCart ? restaurantCart.items : [];
		}
	});

	onMount(async () => {
		loading = true;
		await fetchRestaurantDetails();
		await fetchMenuItems();
		loading = false;
	});
</script>

<Seo
	title={restaurant ? `${restaurant.name} - ChowBenin` : 'Restaurant - ChowBenin'}
	description={restaurant
		? `${restaurant.description} - ChowBenin`
		: 'Restaurant details - ChowBenin'}
/>

{#if loading}
	<div class="flex h-screen items-center justify-center">
		<iconify-icon icon="eos-icons:loading" width="40" height="40" class=" text-[#3333338C]"
		></iconify-icon>
	</div>
{:else if !restaurant}
	<div class="flex h-screen items-center justify-center">
		<p class="text-lg font-bold text-[#3333338C]">Restaurant not found</p>
	</div>
{:else}
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
				{#if menuItems && menuItems.length > 0}
					<div
						class="grid grid-cols-1 gap-x-[8px] gap-y-5 md:grid-cols-2 md:gap-x-[10px] lg:grid-cols-3 lg:gap-x-[16px]"
					>
						{#each menuItems as item, index}
							<div
								class="border-border bg-surface rounded-lg border p-4 shadow-md transition-all hover:shadow-lg"
							>
								<div class="relative mb-4 h-[200px] overflow-hidden rounded-lg">
									<img
										src={item.image}
										alt="Dish {index + 2}"
										class="mb-4 h-full w-full rounded-lg object-cover"
									/>
									{#if item.discount_price}
										<span
											class="bg-accent-green absolute top-2 right-2 rounded px-2 py-1 text-xs font-bold text-white"
										>
											-{Math.round(((item.price - item.discount_price) / item.price) * 100)}%
										</span>
									{/if}
								</div>

								<div>
									<h3 class="text-lg font-bold">{item.name}</h3>
									<p class="line-clamp-3 text-gray-600">{item.description}</p>
								</div>

								<!-- Buttons to increase/decrease quantity and add to cart -->

								<div class="mt-4 flex items-center justify-between">
									<p class="text-text-heading text-lg font-bold">
										{#if item.discount_price}
											<span class=" line-through">XOF {item.price}</span>
											<span class="">XOF {item.discount_price}</span>
										{:else}
											XOF {item.price}
										{/if}
									</p>
									{#if cartItems.find((i) => i.id === item.id)}
										<div class="flex items-center gap-2">
											<button
												aria-label="Remove from cart"
												class="bg-primary hover:bg-primary rounded px-2 py-1 text-white"
												onclick={() => cart.removeItem(restaurant.id, item.id)}
											>
												-
											</button>
											<span class="text-lg font-bold"
												>{cartItems.find((i) => i.id === item.id).quantity}</span
											>
											<button
												aria-label="Add to cart"
												class="bg-primary hover:bg-primary rounded px-2 py-1 text-white"
												onclick={() => cart.addItem(restaurant.id, item)}
											>
												+
											</button>
										</div>
									{:else}
										<button class="btn" onclick={() => cart.addItem(restaurant.id, item)}>
											Add to Cart
										</button>
									{/if}
								</div>
							</div>
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

		{#if cart.carts[restaurant.id] && cartItems.length > 0}
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
						Total: XOF
						{cart.carts[restaurant.id].total}
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
							cart.deleteCart(restaurant.id);
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
