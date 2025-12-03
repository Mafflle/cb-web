<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import appSettings from '$lib/stores/appSettings.svelte';
	import type { PageProps } from './$types';

	const {data}: PageProps = $props();

	const {orders} = $derived(data);

	// Track expanded state for each order card
	let expandedOrders = $state<Record<string, boolean>>({});

	// Tab state: 'in-progress' or 'completed'
	let activeTab = $state<'in-progress' | 'completed'>('in-progress');

	// Completed statuses
	const completedStatuses = ['delivered', 'cancelled', 'failed', 'refunded'];

	// Filter orders based on active tab
	const inProgressOrders = $derived(
		orders?.filter(order => !completedStatuses.includes(order.order_status)) ?? []
	);

	const completedOrders = $derived(
		orders?.filter(order => completedStatuses.includes(order.order_status)) ?? []
	);

	const filteredOrders = $derived(
		activeTab === 'in-progress' ? inProgressOrders : completedOrders
	);

	function toggleOrder(orderId: string) {
		expandedOrders[orderId] = !expandedOrders[orderId];
	}
</script>

<Seo title="My Orders - ChowBenin" description="View and manage your shopping carts." />

<div class="py-[20px]">
	<h3 class="text-[20px] font-extrabold">
		My Orders {#if orders && orders.length > 0}<span class="text-text-muted">({orders.length})</span>{/if}
	</h3>
</div>

{#if (orders && orders.length > 0)}
	<!-- Tabs -->
	<div class="flex gap-[8px] mb-[16px]">
		<button
			type="button"
			onclick={() => activeTab = 'in-progress'}
			class="px-[16px] py-[10px] rounded-full text-[14px] font-semibold transition-colors {activeTab === 'in-progress' ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'}"
		>
			In Progress {#if inProgressOrders.length > 0}<span class="ml-1">({inProgressOrders.length})</span>{/if}
		</button>
		<button
			type="button"
			onclick={() => activeTab = 'completed'}
			class="px-[16px] py-[10px] rounded-full text-[14px] font-semibold transition-colors {activeTab === 'completed' ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'}"
		>
			Completed {#if completedOrders.length > 0}<span class="ml-1">({completedOrders.length})</span>{/if}
		</button>
	</div>

	{#if filteredOrders.length > 0}
		<div class="grid grid-cols-1 gap-[12px] md:grid-cols-2 lg:grid-cols-3">
			{#each filteredOrders as order (order.id)}
				{@const isExpanded = expandedOrders[order.id] ?? false}
				<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] overflow-hidden">
					<!-- Collapsed Header (Always Visible) -->
					<button
						type="button"
						onclick={() => toggleOrder(order.id)}
						class="flex items-center justify-between p-[14px] w-full text-left hover:bg-gray-50 transition-colors"
					>
						<div class="flex items-center gap-[12px] flex-1 min-w-0">
							<img
								src={order.restaurant.logo}
								alt={order.restaurant.name}
								class="h-[40px] w-[40px] rounded-full object-cover flex-shrink-0"
							/>
							<div class="flex flex-col min-w-0 flex-1">
								<h2 class="text-[15px] font-bold truncate">{order.restaurant.name}</h2>
								<p class="text-[12px] text-text-muted">
									{new Date(order.created_at).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric'
									})} • {appSettings.formatPrice(order.total)}
								</p>
							</div>
						</div>
						<svg
							class="h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					<!-- Expandable Content -->
					{#if isExpanded}
						<div class="px-[14px] pb-[14px] space-y-[16px]">
							<div class="flex flex-col rounded-[7px] bg-white p-[12px]">
								<ul class="space-y-2 text-sm">
									<li class="flex items-center justify-between">
										<span class="text-text-muted">Sub-Total</span>
										<span>{appSettings.formatPrice(order.total_price)}</span>
									</li>
									<Separator py="12px" />
									<li class="flex items-center justify-between">
										<span class="text-text-muted">Delivery Fee</span>
										<span>{appSettings.formatPrice(order.delivery_fee)}</span>
									</li>
									{#if order.service_charge > 0}
										<Separator py="12px" />
										<li class="flex items-center justify-between">
											<span class="text-text-muted">Service Charge</span>
											<span>{appSettings.formatPrice(order.service_charge)}</span>
										</li>
									{/if}
									<Separator py="12px" />
									<li class="flex items-center justify-between">
										<span class="font-semibold">Total</span>
										<span class="font-semibold">{appSettings.formatPrice(order.total)}</span>
									</li>
								</ul>
							</div>

							<a href="/orders/{order.id}" class="btn rounded-full btn-primary block text-center">
								{order.payment_status === 'pending' ? 'Pay Now' : 'View Order'}
							</a>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex min-h-[300px] flex-col items-center justify-center">
			<p class="text-lg font-semibold">
				{activeTab === 'in-progress' ? 'No orders in progress' : 'No completed orders'}
			</p>
			<p class="text-sm text-gray-500 mt-1">
				{activeTab === 'in-progress' ? 'Your active orders will appear here' : 'Your past orders will appear here'}
			</p>
		</div>
	{/if}
{:else}
	<div class="flex min-h-[500px] flex-col items-center justify-center">
		<p class="mt-2 text-lg font-semibold">No Orders Found</p>
		<p class="text-sm text-gray-500">You have no orders yet.</p>
		<a href="/" class="btn mt-4">Browse Restaurants</a>
	</div>
{/if}

