<script lang="ts">
	import { page } from '$app/state';

	import orders from '$lib/stores/orders.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Breadcrumb from '../../../../../lib/components/Breadcrumb.svelte';

	const orderId = page.params.id;
	let loading = $state(false);
	let order = $state<null | any>(null);

	onMount(async () => {
		loading = true;
		order = await orders.getOrderDetails(orderId);
		if (!order) {
			goto('/404');
		}
		loading = false;
	});
</script>

<div class="flex flex-col gap-4">
	<!-- 
    Layout
    
    - Order Details
    - Order Items
    - Payment Buttons (Pay with Naira, Pay with Momo (Coming Soon))
    -->

	{#if loading}
		<div class="flex h-screen items-center justify-center">
			<iconify-icon icon="eos-icons:loading" width="32" height="32"></iconify-icon>
		</div>
	{:else if order}
		<Breadcrumb text="Back to Orders" href="/orders" />
		<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
			<div class="">
				<div class="mt-1 space-y-1">
					<!-- Restaurant Name -->
					<div class="flex items-center justify-between">
						<p class="text-lg font-bold">{order.restaurant.name}</p>
						<h2 class="text-sm">#{order.id.split('-')[0]}</h2>
					</div>
					<!-- Order Date -->
					<p class="mt-1 text-sm">
						{new Date(order.created_at).toLocaleDateString('en-US', {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit'
						})}
						<span class="font-semibold">at</span>
						{new Date(order.created_at).toLocaleTimeString('en-US', {
							hour: '2-digit',
							minute: '2-digit'
						})}
					</p>
				</div>
			</div>
		</div>

		<!-- Order Progress -->
		<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
			<h2 class="text-lg font-bold">Order Progress</h2>

			<ul
				class="mt-1 flex flex-col gap-2 text-sm font-semibold"
				class:opacity-50={order.order_status in ['completed', 'cancelled']}
			>
				<li class="flex items-center">
					<iconify-icon
						icon="lets-icons:check-fill"
						class="text-accent-green"
						width="20"
						height="20"
					></iconify-icon>
					<span class="ml-2 font-semibold">Order Placed</span>
					<span class="ml-auto text-sm font-semibold">
						{new Date(order.created_at).toLocaleDateString('en-US', {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit'
						})}
						<span class="font-semibold">at</span>
						{new Date(order.created_at).toLocaleTimeString('en-US', {
							hour: '2-digit',
							minute: '2-digit'
						})}
					</span>
				</li>
				<li class="flex items-center justify-between">
					<iconify-icon
						icon={order.payment_status === 'pending'
							? 'ic:baseline-radio-button-unchecked'
							: 'lets-icons:check-fill'}
						class:text-accent-green={order.payment_status !== 'pending'}
						width="20"
						height="20"
					></iconify-icon>
					<span class="ml-2 font-semibold">Payment</span>
					{#if order.payment_status === 'pending'}
						<button
							class="text-primary ml-auto flex items-center justify-center text-sm font-bold hover:underline"
						>
							Pay Now
						</button>
					{/if}
				</li>
				<li class="flex items-center">
					<iconify-icon
						icon={order.order_status === 'pending_confirmation'
							? 'ic:baseline-radio-button-unchecked'
							: 'lets-icons:check-fill'}
						class:text-accent-green={order.order_status !== 'pending_confirmation'}
						width="20"
						height="20"
					></iconify-icon>
					<span class="ml-2 font-semibold">Confirmed by Restaurant</span>
				</li>
				<li class="flex items-center">
					<iconify-icon
						icon={order.order_status === 'in_preparation'
							? 'lets-icons:check-fill'
							: 'ic:baseline-radio-button-unchecked'}
						class:text-accent-green={order.order_status === 'in_preparation'}
						width="20"
						height="20"
					></iconify-icon>
					<span class="ml-2 font-semibold">Preparing</span>
				</li>

				<!-- Out for delivery -->
				<li class="flex items-center">
					<iconify-icon
						icon={order.order_status === 'out_for_delivery'
							? 'lets-icons:check-fill'
							: 'ic:baseline-radio-button-unchecked'}
						class:text-accent-green={order.order_status === 'out_for_delivery'}
						width="20"
						height="20"
					></iconify-icon>
					<span class="ml-2 font-semibold">Out for Delivery</span>
				</li>

				<li class="flex items-center">
					<iconify-icon
						icon={order.order_status === 'delivered'
							? 'lets-icons:check-fill'
							: 'ic:baseline-radio-button-unchecked'}
						class:text-accent-green={order.order_status === 'delivered'}
						width="20"
						height="20"
					></iconify-icon>
					<span class="ml-2 font-semibold">Delivered</span>
				</li>
			</ul>
		</div>
		<!-- Order Details -->
		<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
			<h2 class="text-lg font-bold">Order Details</h2>
			<!-- Name, Address, Phone Number, WhatsApp Number, Special Instructions -->
			<ul class="mt-1 space-y-1 text-sm">
				<li class="font-semibold">Name: {order.name}</li>
				<li class="font-semibold">Address: {order.address}</li>
				<li class="font-semibold">Phone Number: {order.phone}</li>
				<li class="font-semibold">WhatsApp Number: {order.whatsapp}</li>

				{#if order.special_instructions}
					<li class="font-semibold">
						Delivery Instructions: {order.delivery_instructions}
					</li>
				{/if}
			</ul>
		</div>

		<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
			<h2 class="text-lg font-bold">Items</h2>
			<ul class="space-y-2 text-sm font-semibold">
				{#each order.order_items as item, index}
					<li class="span flex items-center justify-between">
						<span>{item.items.name} x ({item.quantity})</span> <span>{item.price} XOF</span>
					</li>
					{#if index < order.order_items.length - 1}
						<hr />
					{/if}
				{/each}
			</ul>
		</div>
		<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
			<h2 class="text-lg font-bold">Payment</h2>
			<!-- Papered color background -->
			<div class="flex flex-col gap-2 rounded-lg bg-gray-100 p-2">
				<ul class="space-y-2 text-sm font-semibold">
					<li class="span flex items-center justify-between">
						<span>Sub-Total:</span> <span>{order.total_price} XOF</span>
					</li>
					<hr />

					<li class="span flex items-center justify-between">
						<span>Delivery Fee:</span> <span>{order.delivery_fee} XOF</span>
					</li>
					<hr />

					{#if order.service_charge > 0}
						<li class="span flex items-center justify-between">
							<span>Service Charge:</span> <span>{order.service_charge} XOF</span>
						</li>
						<hr />
					{/if}
				</ul>
			</div>
			<p class="flex items-center justify-between text-sm font-semibold">
				{#if order.payment_status === 'PENDING'}
					<span>Total:</span>
					<span class="text-lg font-bold">{order.total} XOF or &#8358;{order.total * 2.779}</span>
				{:else}
					<span>Payment Status:</span>
					<span class="text-green-500">Paid</span>
				{/if}
			</p>
			<button class="btn flex items-center justify-center text-sm"> Pay With Naira </button>
			<button class="btn flex items-center justify-center text-sm" disabled>
				Pay With Momo (Coming Soon)
			</button>
		</div>
	{/if}
</div>
