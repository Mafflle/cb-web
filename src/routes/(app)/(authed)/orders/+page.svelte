<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import appSettings from '$lib/stores/appSettings.svelte';
	import type { PageProps } from './$types';

	const {data}: PageProps = $props();

	const {orders} = $derived(data);
</script>

<Seo title="My Orders - ChowBenin" description="View and manage your shopping carts." />

<div class="py-[20px]">
	<h3 class="text-[20px] font-extrabold">
		My Orders {#if orders && orders.length > 0}<span class="text-text-muted">({orders.length})</span>{/if}
	</h3>
</div>

{#if (orders && orders.length > 0)}
		<div class="mt-[8px] grid grid-cols-1 gap-[24px] md:grid-cols-2 lg:grid-cols-3">
			{#each orders as order (order.id)}
				<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] p-[20px]">
					<div class="flex items-center gap-[8px] mb-[30px]">
						<img
							src={order.restaurant.logo}
							alt={order.restaurant.name}
							class="h-[32px] w-[32px] rounded-full object-cover"
						/>
						<h2 class="text-lg font-extrabold">{order.restaurant.name}</h2>
					</div>

					<div class="space-y-[24px]">
						<div class="flex flex-col rounded-[7px] bg-white p-[12px]">
							<ul class="space-y-2 text-sm">
								<li class="flex items-center justify-between">
									<span>Sub-Total:</span>
									<span>{appSettings.formatPrice(order.total_price)}</span>
								</li>
								<Separator py="16px" />
								<li class="flex items-center justify-between">
									<span>Delivery Fee:</span>
									<span>{appSettings.formatPrice(order.delivery_fee)}</span>
								</li>
								{#if order.service_charge > 0}
									<Separator py="16px" />
									<li class="flex items-center justify-between">
										<span>Service Charge:</span>
										<span>{appSettings.formatPrice(order.service_charge)}</span>
									</li>
								{/if}
							</ul>
						</div>

						<!-- Total -->
						<div class="flex items-center justify-between px-[12px]">
							<span class=" font-semibold">Total:</span>
							<span class="font-semibold">
								{appSettings.formatPrice(order.total)}
							</span>
						</div>

						<div>
							<a href="/orders/{order.id}" class="btn rounded-full btn-primary block text-center">
								{order.payment_status === 'pending' ? 'Pay Now' : 'View Order'}
							</a>
						</div>

						<p class="text-sm text-center text-text-muted">
							{order.order_status === 'delivered' ? 'Delivered' : 'Delivering'} to
							<span class="font-semibold">{order.address}</span>
						</p>
					</div>
				</div>
			{/each}
		</div>
{:else}
	<div class="flex min-h-[500px] flex-col items-center justify-center">
		<p class="mt-2 text-lg font-semibold">No Orders Found</p>
		<p class="text-sm text-gray-500">You have no orders yet.</p>
		<a href="/" class="btn mt-4">Browse Restaurants</a>
	</div>
{/if}

