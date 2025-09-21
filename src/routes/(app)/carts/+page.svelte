<script lang="ts">
	import { browser } from '$app/environment';
	import cart from '$lib/stores/cart.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { onMount } from 'svelte';
	import appSettings from '$lib/stores/appSettings.svelte';

	onMount(() => {
		if (browser && !cart.loaded) {
			cart.load();
		}
	});
</script>

<Seo title="Carts - ChowBenin" description="View and manage your shopping carts." />

{#if cart.loaded}
	{#if cart.keys.length > 0}
		<div class=" grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each cart.keys as key (key)}
				<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
					{#if cart.carts[key]?.restaurantDetails}
						<div class="flex justify-between gap-2">
							<h2 class="text-lg font-bold">{cart.carts[key].restaurantDetails.name}</h2>
							<div>
								<a
									href="/restaurants/{cart.carts[key].restaurantDetails.slug}"
									class="text-primary flex items-center px-2 py-1 text-sm font-semibold hover:underline"
								>
									View Selection
									<iconify-icon icon="ic:round-play-arrow" width="16" height="16"></iconify-icon>
								</a>
							</div>
						</div>
					{/if}
					{#if cart.carts[key]?.items.length > 0}
						<!-- Papered color background -->
						<div class="flex flex-col gap-2 rounded-lg bg-gray-100 p-2">
							<h3 class="text-md font-semibold">Items in Cart:</h3>
							<ul class="space-y-2 text-sm">
								{#each cart.carts[key].items as item, index (index)}
									<li class="flex items-center justify-between">
										<div>
											<p>{item.name} x {item.quantity}</p>
										</div>
										<div class="relative">
											<p>
												<!-- Calculated Price: -->
												{appSettings.formatPrice(item.discount_price
													? item.discount_price * item.quantity
													: item.price * item.quantity)}
											</p>
										</div>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Total -->
						<div class="flex items-center justify-between">
							<span class=" font-semibold">Total:</span>
							<span class="font-semibold">
								{appSettings.formatPrice(cart.carts[key].total)}
							</span>
						</div>
						<div>
							<a href="/checkout?restaurant={key}" class="btn btn-primary mt-2 block text-center">
								Checkout
							</a>
							<button
								onclick={() => {
									cart.deleteCart(key);
								}}
								class="link hover:text-primary mt-2 block w-full text-center text-sm"
							>
								Clear Cart
							</button>
						</div>
					{:else}
						<p>No items in this cart.</p>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex h-[500px] flex-col items-center justify-center">
			<p>Your cart is empty.</p>
			<a href="/" class="btn mt-2 text-sm">Discover Restaurants</a>
		</div>
	{/if}
{:else}
	<div class="flex h-[500px] items-center justify-center">
		<iconify-icon icon="eos-icons:loading" width="30" height="30"></iconify-icon>
	</div>
{/if}
