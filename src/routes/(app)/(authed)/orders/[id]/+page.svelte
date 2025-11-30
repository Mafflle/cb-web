<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	// import orders from '$lib/stores/orders.svelte';
	import appSettings from '$lib/stores/appSettings.svelte';
	import { showToast } from '$lib/utils/toaster.svelte';
	import type { PageProps, SubmitFunction } from './$types';
	import ordersRepository from '$lib/repositories/orders.repository';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import Seo from '$lib/components/Seo.svelte';
	import { enhance } from '$app/forms';
	import PaystackPop from '@paystack/inline-js';

	const { data }: PageProps = $props();

	let { supabase } = $derived(data);
	let { order } = $state(data);
	let processingPayment = $state(false);
	let transactionRef: string | null = $derived(null);

	let orderSub: RealtimeChannel | null = null;

	onMount(async () => {
		orderSub = await ordersRepository.subscribeToOrderChanges(
			supabase,
			order.id,
			(updatedOrder) => {
				if (updatedOrder) {
					order = { ...order, ...updatedOrder };
				}
			}
		);
	});

	onDestroy(() => {
		orderSub?.unsubscribe();
	});

	const progressMap: any = {
		confirmed: 1,
		in_preparation: 2,
		out_for_delivery: 3,
		delivered: 4,
		cancelled: 5
	};
	const currentProgress = $derived(progressMap[order?.order_status] || 0);

	const isProgressCompleted = (status: string) => {
		return order.payment_status === 'paid' && currentProgress >= progressMap[status];
	};

	const enhanceNairaPayment: SubmitFunction = () => {
		processingPayment = true;

		return async ({ result }) => {
			try {
				if (result.type === 'success') {
					const paystackData = result.data?.paystackData;
					const accessCode = paystackData?.data?.access_code;
	
					if (!accessCode) {
						showToast({
							message: 'Invalid payment data received. Please try again.',
							type: 'error'
						});
						return;
					}
	
					const popup = new PaystackPop();
	
					popup.resumeTransaction(paystackData.data.access_code, {
						onCancel: () => {
							showToast({
								message: 'Payment process was cancelled.',
								type: 'error'
							});
							processingPayment = false;
						},
						onError: (error: { message: string }) => {
							showToast({
								message: `Payment failed: ${error.message}`,
								type: 'error'
							});
							processingPayment = false;
						},
						onSuccess: async (transaction: { reference: string }) => {
							const isPaid = await ordersRepository.verifyOrderPayment(
								supabase,
								order.id,
								transaction.reference
							);
							
							if (isPaid) {
								showToast({
									message: 'Payment successful! Thank you for your order.',
									type: 'success'
								});
							}
							processingPayment = false;
						}
					});
	
					showToast({
						message: 'Redirecting to payment gateway...',
						type: 'success'
					});
				} else if (result.type === 'error') {
					showToast({
						message: 'Failed to initiate payment. Please try again.',
						type: 'error'
					});
					processingPayment = false;
				} else {
					showToast({
						message: 'Payment process was cancelled.',
						type: 'info'
					});
					processingPayment = false;
				}

				
			} catch (error) {
				showToast({
					message: 'An unexpected error occurred during payment. Please try again.',
					type: 'error'
				});
				processingPayment = false;
			}
		};
	};
</script>

<Seo
	title="Order Details - ChowBenin"
	description="View your order details and payment options on ChowBenin"
/>

<div class="flex flex-col gap-4">
	{#if order}
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
				<li class="flex items-center">
					<iconify-icon
						icon={order.payment_status === 'pending'
							? 'ic:baseline-radio-button-unchecked'
							: 'lets-icons:check-fill'}
						class:text-accent-green={order.payment_status !== 'pending'}
						width="20"
						height="20"
					></iconify-icon>
					<span class="ml-2 font-semibold">
						Payment {order.payment_status === 'pending' ? 'Pending' : 'Completed'}
					</span>
					{#if order.payment_status === 'pending'}
						<form action="?/pay" class="ml-auto" method="POST" use:enhance={enhanceNairaPayment}>
							<button
								type="submit"
								class="text-primary flex items-center justify-center text-sm font-bold hover:underline focus:outline-none"
								disabled={processingPayment}
							>
								{processingPayment ? 'Processing...' : 'Pay Now'}
							</button>
						</form>
					{/if}
				</li>
				<li class="flex items-center">
					<iconify-icon
						icon={isProgressCompleted('confirmed')
							? 'lets-icons:check-fill'
							: 'ic:baseline-radio-button-unchecked'}
						class:text-accent-green={isProgressCompleted('confirmed')}
						width="20"
						height="20"
					></iconify-icon>
					<span class="ml-2 font-semibold">Confirmed by Restaurant</span>
				</li>
				<li class="flex items-center">
					<iconify-icon
						icon={isProgressCompleted('in_preparation')
							? 'lets-icons:check-fill'
							: 'ic:baseline-radio-button-unchecked'}
						class:text-accent-green={isProgressCompleted('in_preparation')}
						width="20"
						height="20"
					></iconify-icon>
					<span class="ml-2 font-semibold">Preparing</span>
				</li>

				<!-- Out for delivery -->
				<li class="flex items-center">
					<iconify-icon
						icon={isProgressCompleted('out_for_delivery')
							? 'lets-icons:check-fill'
							: 'ic:baseline-radio-button-unchecked'}
						class:text-accent-green={isProgressCompleted('out_for_delivery')}
						width="20"
						height="20"
					></iconify-icon>
					<span class="ml-2 font-semibold">Out for Delivery</span>
				</li>

				<li class="flex items-center">
					<iconify-icon
						icon={isProgressCompleted('delivered')
							? 'lets-icons:check-fill'
							: 'ic:baseline-radio-button-unchecked'}
						class:text-accent-green={isProgressCompleted('delivered')}
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
			<!-- Name, Address, Phone Number, Special Instructions -->
			<ul class="mt-1 space-y-1 text-sm">
				<li class="font-semibold">Name: {order.name}</li>
				<li class="font-semibold">Address: {order.address}</li>
				<li class="font-semibold">Phone Number: {order.phone}</li>

				{#if order.special_instructions}
					<li class="font-semibold">
						Delivery Instructions: {order.special_instructions}
					</li>
				{/if}
			</ul>
		</div>

		<div class="bg-surface border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
			<h2 class="text-lg font-bold">Items</h2>
			<ul class="space-y-2 text-sm font-semibold">
				{#each order.order_items as item, index (index)}
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
					<li class="span flex items-center justify-between">
						<span>Total:</span> <span>{order.total} XOF</span>
					</li>
				</ul>
			</div>

			{#if order.payment_status === 'pending' || order.payment_status === 'failed'}
				<form action="?/pay" class="w-full" method="POST" use:enhance={enhanceNairaPayment}>
					<button class="btn flex w-full items-center justify-center text-sm">
						{#if processingPayment}
							<span
								class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
							></span>
						{/if}
						Pay With Naira ({appSettings.formatPrice(
							appSettings.getConvertedPrice(order.total),
							'NGN'
						)})
					</button>
				</form>
				<button class="btn flex items-center justify-center text-sm" disabled>
					Pay With Momo (Coming Soon)
				</button>
			{:else if order.payment_status === 'paid'}
				<p class="text-sm font-semibold text-green-500">Payment Completed</p>
			{:else}
				<p class="text-sm font-semibold text-red-500">Payment Status: {order.payment_status}</p>
			{/if}
		</div>
	{/if}
</div>
