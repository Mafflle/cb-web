<script lang="ts">
	import { browser } from '$app/environment';
	import orders from '$lib/stores/orders.svelte';
	import Seo from '$lib/components/Seo.svelte';

	$effect(() => {
		if (browser && !orders.loaded) {
			orders.load();
		}
	});
</script>

<Seo title="My Orders - ChowBenin" description="View and manage your shopping carts." />

{#if orders.loaded}
	{#if orders.keys.length > 0}
		<div class=" grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each orders.keys as key (key)}
				<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
					<div class="">
						<h2 class="text-lg font-bold">{orders.orders[key].restaurant.name}</h2>

						<p class="mt-1 text-sm">
							{orders.orders[key].order_status === 'COMPLETED' ? 'Delivered' : 'Delivering'} to
							<span class="font-semibold">{orders.orders[key].address}</span>
						</p>
					</div>

					<!-- Papered color background -->
					<div class="flex flex-col gap-2 rounded-lg bg-gray-100 p-2">
						<h3 class="text-md font-semibold">Order Details:</h3>
						<ul class="space-y-2 text-sm font-semibold">
							<li class="span flex items-center justify-between">
								<span>Sub-Total:</span> <span>{orders.orders[key].total_price} XOF</span>
							</li>
							<hr />

							<li class="span flex items-center justify-between">
								<span>Delivery Fee:</span> <span>{orders.orders[key].delivery_fee} XOF</span>
							</li>
							<hr />

							{#if orders.orders[key].service_charge > 0}
								<li class="span flex items-center justify-between">
									<span>Service Charge:</span> <span>{orders.orders[key].service_charge} XOF</span>
								</li>
								<hr />
							{/if}
							<li class="span flex items-center justify-between">
								<span>Total:</span> <span>{orders.orders[key].total} XOF</span>
							</li>
						</ul>
					</div>

					<div>
						<a
							href="/orders/{orders.orders[key].id}"
							class="btn flex items-center justify-center text-sm"
						>
							{#if orders.orders[key].payment_status === 'PENDING'}
								Pay Now
								<iconify-icon icon="ic:round-play-arrow" width="16" height="16"></iconify-icon>
							{:else}
								View Order
								<iconify-icon icon="ic:round-play-arrow" width="16" height="16"></iconify-icon>
							{/if}
						</a>
					</div>

					<!-- Total -->
					<!-- <div class="flex items-center justify-between">
							<span class=" font-semibold">Total:</span>
							<span class="font-semibold">
								XOF
								{cart.carts[key].total}
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
						</div> -->
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex h-[500px] flex-col items-center justify-center">
			<p class="mt-2 text-lg font-semibold">No Orders Found</p>
			<p class="text-sm text-gray-500">You have no orders yet.</p>
			<a href="/" class="btn mt-4">Browse Restaurants</a>
		</div>
	{/if}
{:else}
	<div class="flex h-[500px] items-center justify-center">
		<iconify-icon icon="eos-icons:loading" width="30" height="30"></iconify-icon>
	</div>
{/if}
