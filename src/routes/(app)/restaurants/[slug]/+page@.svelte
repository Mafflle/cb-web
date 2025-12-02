<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	import cartStore, { type Cart } from '$lib/stores/cart.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import appSettings from '$lib/stores/appSettings.svelte';
	import MenuItemCard from '$lib/components/MenuItemCard.svelte';
	import {
		getCurrentDayString,
		getFormattedTime,
		isRestaurantOpen
	} from '$lib/utils/helpers';
	import { slide } from 'svelte/transition';
	import Separator from '$lib/components/Separator.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import userStore from '$lib/stores/user.svelte';
	import auth from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { showToast } from '../../../../lib/utils/toaster.svelte';

	let { data }: PageProps = $props();

	let { restaurant, items, featuredItems } = $derived(data);
	let cart = $derived<Cart | null>(cartStore.carts[restaurant?.id as string] ?? null);
	let cartItems = $derived(cart ? cart.items : []);

	let isTogglingFavorite = $state(false);
	let isFavorited = $derived(restaurant ? userStore.isFavorite(restaurant.id) : false);

	async function handleFavoriteClick() {
		if (!restaurant) return;

		// Check if user is logged in
		if (!auth.currentUser) {
			goto('/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname));
			return;
		}

		if (isTogglingFavorite) return;

		isTogglingFavorite = true;
		try {
			const isNowFavorite = await userStore.toggleFavorite(restaurant.id);
			showToast({
				type: 'success',
				message: isNowFavorite ? 'Added to favorites' : 'Removed from favorites'
			});
		} catch (error) {
			console.error('Failed to toggle favorite:', error);
			showToast({
				type: 'error',
				message: 'Failed to update favorites'
			});
		} finally {
			isTogglingFavorite = false;
		}
	}

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
<Navbar />
<div class="mb-[100px]">
	{#if restaurant && items}
		<header class="relative">
			<div class="relative flex h-[164px] items-center">
				<!-- Restaurant cover image -->
				<img
					src={restaurant.cover_image}
					alt="{restaurant.name} Cover Image"
					class="h-full w-full object-cover"
					loading="lazy"
				/>
	
				<!-- Buttons for back and share -->
				<div
					class="absolute top-1/2 left-0 flex w-full -translate-y-1/2 transform justify-between px-[16px]"
				>
					<a
						href="/"
						class="btn bg-surface-transparent rounded-full p-[10px] text-white hover:bg-black/90"
						aria-label="Back to Restaurants"
					>
						<img src="/icons/caret-left.svg" alt="Go back" height="20" width="20" />
					</a>
					<button
						onclick={handleFavoriteClick}
						disabled={isTogglingFavorite}
						class="btn bg-surface-transparent rounded-full p-[10px] text-white hover:bg-black/90 disabled:opacity-50"
						aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
					>
						{#if isTogglingFavorite}
							<iconify-icon icon="svg-spinners:ring-resize" class="text-[20px]"></iconify-icon>
						{:else}
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 21"
								fill={isFavorited ? 'currentColor' : 'none'}
								xmlns="http://www.w3.org/2000/svg"
								class={isFavorited ? 'text-red-500' : 'text-white'}
							>
								<g clip-path="url(#clip0_176_268)">
									<path
										d="M10 18C10 18 1.875 13.625 1.875 8.46875C1.875 7.34987 2.31947 6.27681 3.11064 5.48564C3.90181 4.69447 4.97487 4.25 6.09375 4.25C7.85859 4.25 9.37031 5.21172 10 6.75C10.6297 5.21172 12.1414 4.25 13.9062 4.25C15.0251 4.25 16.0982 4.69447 16.8894 5.48564C17.6805 6.27681 18.125 7.34987 18.125 8.46875C18.125 13.625 10 18 10 18Z"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</g>
								<defs>
									<clipPath id="clip0_176_268">
										<rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
									</clipPath>
								</defs>
							</svg>
						{/if}
					</button>
				</div>
	
				<!-- Restaurant name and description (centered align at the bottom) -->
				<div class="absolute bottom-[-51px] left-1/2 flex -translate-x-1/2 items-center">
					<img
						src={restaurant.logo}
						alt="{restaurant.name} Logo"
						class="h-[102px] w-[102px] rounded-full border-[3px] border-white object-cover"
						loading="lazy"
					/>
				</div>
			</div>
			<div class="mt-[72px] flex flex-col items-center">
				<h1 class="text-h4 mb-[8px] font-[800]">{restaurant.name}</h1>
				<div class="flex items-center">
					<span
						class="h-[8px] w-[8px] rounded-full {isRestaurantOpen(restaurant.opening_hours as any)
							? 'bg-green-600'
							: 'bg-red-600'}"
					></span>
					<!-- If restaurant opens today show open from time am - time pm else show closed for today -->
					<p class="ml-2 text-sm font-[600] text-gray-600">
						{#if restaurant.opening_hours && restaurant.opening_hours[getCurrentDayString()]?.open}
							{#if restaurant.opening_hours[getCurrentDayString()].open === '00:00' &&
								restaurant.opening_hours[getCurrentDayString()].close === '23:59'}
								open 24 hours
							{:else}
								open from {getFormattedTime(
									restaurant.opening_hours[getCurrentDayString()].open as string
								)} - {getFormattedTime(restaurant.opening_hours[getCurrentDayString()].close as string)}
							{/if}
						{:else}
							closed for today
						{/if}
					</p>
				</div>
			</div>
		</header>

		<Separator py="36px" />

		<main class="relative px-[16px] pt-[30px]">
	
			{#if featuredItems && featuredItems.length > 0 }
				<section class="mb-10">
					<div class="items-center justify-between md:flex">
						<h2 class="text-2xl font-bold">Featured items</h2>
					</div>
	
					<div class="mt-6">
						<div
							class="grid grid-cols-1 gap-x-[8px] gap-y-5 md:grid-cols-2 md:gap-x-[10px] lg:grid-cols-3 lg:gap-x-[16px]"
						>
							{#each featuredItems as item, index (index)}
								<MenuItemCard {item} {index} {restaurant} {cartItems} />
							{/each}
						</div>
					</div>
				</section>

				<Separator py="36px" />
			{/if}


			
			<section class="" class:mb-20={cartItems.length > 0}>
				<div class="items-center justify-between md:flex">
					<h2 class="text-2xl font-bold">
						Menu
					</h2>
				</div>
	
				<div class="mt-6">
					{#if items.length > 0}
						<div
							class="grid grid-cols-1 gap-x-[8px] gap-y-5 md:grid-cols-2 md:gap-x-[10px] lg:grid-cols-3 lg:gap-x-[16px]"
						>
							{#each items as item, index (index)}
								<MenuItemCard {item} {index} {restaurant} {cartItems} />

								<Separator py="36px" />
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
					transition:slide
					class="bg-background border-[#EAEAEA] summary shadow-t-lg fixed right-0 bottom-0 left-0 z-50 border-t-2 p-4 text-[14px]"
				>
					<div class="flex flex-col">
						<p class="font-extrabold">
							Total:
							{appSettings.formatPrice(cartStore.carts[restaurant.id].total)}
						</p>
						<p class="text-sm text-text-muted">
							({cartItems.length}) item{cartItems.length > 1 ? 's' : ''} in cart
						</p>
						<a
							href="/checkout?restaurant={restaurant.id}"
							aria-disabled={!isRestaurantOpen(restaurant.opening_hours as any)}
							class="btn btn-primary mt-2 block text-center rounded-full {!isRestaurantOpen(restaurant.opening_hours as any) ? 'btn-disabled' : ''}"
						>
							Proceed
						</a>
						<button
							onclick={(event) => {
								event.preventDefault();
								cartStore.deleteCart(restaurant?.id as string);
							}}
							class="link hover:text-error mt-2 block w-full text-center text-s font-bold btn bg-transparent text-text-body text-[14px]"
						>
							Clear Cart
						</button>
					</div>
				</div>
			{/if}
		</main>
	{/if}
</div>
<Footer />

<style>
	.summary {
		box-shadow: 0 -6px 18.1px 0 rgba(0, 0, 0, 0.045);
	}
</style>