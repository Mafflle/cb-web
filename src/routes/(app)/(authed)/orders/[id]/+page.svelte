<script lang="ts">
	import { page } from '$app/state';

	import orders from '$lib/stores/orders.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const orderId = page.params.id;
	let loading = $state(false);
	let order = $state<null | any>(null);

	let progressPercent = $derived.by(() => {
		if (order) {
			if (order.payment_status === 'FAILED') {
				return 0;
			} else if (order.payment_status === 'PENDING') {
				return 5;
			} else if (order.payment_status === 'PAID') {
				return 15;
			} else if (order.order_status === 'PENDING_CONFIRMATION') {
				return 15;
			} else if (order.order_status === 'CONFIRMED') {
				return 30;
			} else if (order.order_status === 'PREPARED') {
				return 50;
			} else if (order.order_status === 'SENT') {
				return 75;
			} else if (order.order_status === 'DELIVERED') {
				return 100;
			} else if (order.order_status === 'CANCELLED') {
				return 0;
			}
		}
		return 0;
	});

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
		<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
			<div class="">
				<h2 class="text-sm">Order #{order.id.split('-')[0]}</h2>
				<div class="mt-1 space-y-1">
					<!-- Restaurant Name -->
					<p class="text-lg font-bold">{order.restaurant.name} - {order.restaurant.address}</p>
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
					<!-- Order Status -->
					<p class="mt-1 text-sm">
						{order.order_status === 'COMPLETED' ? 'Delivered' : 'Delivering'} to
						<span class="font-semibold">{order.address}</span>
					</p>
				</div>
			</div>
		</div>

		<!-- Order Status -->
		<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
			<!-- 
			Show What Is Going On

			We have 2 status for the order:
			- payment_status
			- order_status

			- payment_status: PENDING, PAID, FAILED
			- order_status: PENDING_CONFIRMATION, CONFIRMED, PREPARED, SENT, DELIVERED, CANCELLED

			- PENDING_CONFIRMATION: We are waiting for the restaurant to confirm the order
			- CONFIRMED: The restaurant has confirmed the order and is preparing it
			- PREPARED: The order is ready for delivery
			- SENT: The order has been sent for delivery
			- DELIVERED: The order has been delivered
			- CANCELLED: The order was cancelled

			Flow:
			1. User places an order
			2. User pays for the order to confirm it
			3. Restaurant confirms the order
			4. Restaurant prepares the order
			5. Order is sent for delivery
			6. Order is delivered
			7. Order is completed

			Use a personalized text with a progress bar to show the user what is going on with their order.
			- payment_status (FAILED): 0% - (Your payment failed, please try again)
			- payment_status (PENDING): 5% - (Pay for your order to confirm it)
			- payment_status (PAID): 15% - (We are waiting for the restaurant to confirm your order)
			- order_status (PENDING_CONFIRMATION): 15%  - (We are waiting for the restaurant to confirm your order)
			- order_status (CONFIRMED): 30% - (The restaurant has confirmed your order and is preparing it)
			- order_status (PREPARED): 50% - (The order is ready for delivery)
			- order_status (SENT): 75% - (The order has been sent for delivery)
			- order_status (DELIVERED): 100% - (The order has been delivered)
			- order_status (CANCELLED): 0% - (The order was cancelled)
			-->

			<h2 class="text-lg font-bold">Order Status</h2>

			<!-- Vertical progress bar with stop points -->
			<div class="mt-4 flex items-center justify-between">
				<div class="relative w-full">
					<div class="absolute top-0 left-0 h-1 w-full bg-gray-200"></div>
					<div
						class="bg-accent-green absolute top-0 left-0 h-1"
						style="width: {progressPercent}%"
					></div>
					{#if order.payment_status === 'FAILED'}
						<span class="absolute -top-[20px] left-0 text-xs font-semibold text-red-500"> 0% </span>
					{:else if order.payment_status === 'PENDING'}
						<span class="absolute -top-[20px] left-0 text-xs font-semibold text-red-500"> 5% </span>
					{:else if order.payment_status === 'PAID'}
						<span class="absolute -top-[20px] left-0 text-xs font-semibold text-red-500">
							15%
						</span>
					{:else if order.order_status === 'PENDING_CONFIRMATION'}
						<span class="absolute -top-[20px] left-0 text-xs font-semibold text-red-500">
							15%
						</span>
					{:else if order.order_status === 'CONFIRMED'}
						<span class="absolute -top-[20px] left-0 text-xs font-semibold text-red-500">
							30%
						</span>
					{:else if order.order_status === 'PREPARED'}
						<span class="absolute -top-[20px] left-0 text-xs font-semibold text-red-500">
							50%
						</span>
					{:else if order.order_status === 'SENT'}
						<span class="absolute -top-[20px] left-0 text-xs font-semibold text-red-500">
							75%
						</span>
					{:else if order.order_status === 'DELIVERED'}
						<span class="absolute -top-[20px] left-0 text-xs font-semibold text-red-500">
							100%
						</span>
					{:else if order.order_status === 'CANCELLED'}
						<span class="absolute -top-[20px] left-0 text-xs font-semibold text-red-500">
							CANCELLED
						</span>
					{/if}
				</div>
				{#if order.payment_status === 'PENDING'}
					<a
						href="/checkout?orderId={order.id}"
						class="btn flex items-center justify-center text-sm"
					>
						Pay Now
					</a>
				{:else if order.payment_status === 'FAILED'}
					<a
						href="/checkout?orderId={order.id}"
						class="btn flex items-center justify-center text-sm"
					>
						Retry Payment
					</a>
				{/if}
			</div>
		</div>

		<!-- Order Details -->
		<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
			<h2 class="text-lg font-bold">Order Details</h2>
			<!-- Name, Address, Phone Number, WhatsApp Number, Special Instructions -->
			<ul class="mt-1 space-y-1 text-sm">
				<li class="font-semibold">Name: {order.name}</li>
				<li class="font-semibold">Address: {order.address}</li>
				<li class="font-semibold">Phone Number: {order.phone_number}</li>
				<li class="font-semibold">WhatsApp Number: {order.whatsapp_number}</li>
				<li class="font-semibold">
					Special Instructions: {order.special_instructions}
				</li>
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
