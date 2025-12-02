<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Separator from '$lib/components/Separator.svelte';

	// import orders from '$lib/stores/orders.svelte';
	import appSettings from '$lib/stores/appSettings.svelte';
	import { showToast } from '$lib/utils/toaster.svelte';
	import type { PageProps, SubmitFunction } from './$types';
	import ordersRepository from '$lib/repositories/orders.repository';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import Seo from '$lib/components/Seo.svelte';
	import { enhance } from '$app/forms';

	const { data }: PageProps = $props();

	let { supabase } = $derived(data);
	let { order } = $state(data);
	let processingPayment = $state(false);

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
	
					const { default: PaystackPop } = await import('@paystack/inline-js');
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

<div class="flex flex-col gap-[24px] max-w-2xl mx-auto">
	{#if order}
		<Breadcrumb text="Back to Orders" href="/orders" />

		<!-- Restaurant Header Card -->
		<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] p-[20px]">
			<div class="flex items-center gap-[12px]">
				<img
					src={order.restaurant.logo}
					alt={order.restaurant.name}
					class="h-[48px] w-[48px] rounded-full object-cover"
				/>
				<div class="flex-1">
					<h2 class="text-lg font-extrabold">{order.restaurant.name}</h2>
					<p class="text-sm text-text-muted">
						Order #{order.id.split('-')[0]} • {new Date(order.created_at).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'short',
							day: 'numeric'
						})}
					</p>
				</div>
			</div>
		</div>

		<!-- Order Progress Card -->
		<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] p-[20px]">
			<h2 class="text-lg font-extrabold mb-[20px]">Order Progress</h2>

			<div class="relative">
				<!-- Timeline line -->
				<div class="absolute left-[11px] top-[24px] bottom-[24px] w-[2px] bg-[#E5E5E5]"></div>

				<ul class="relative flex flex-col gap-[28px] text-sm">
						<!-- Order Placed -->
						<li class="relative flex items-start gap-[16px]">
							<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-accent-green">
								<iconify-icon icon="mdi:check" class="text-white" width="14" height="14"></iconify-icon>
							</div>
							<div class="flex-1 pt-[2px]">
								<p class="font-semibold">Order Placed</p>
								<p class="text-xs text-text-muted mt-[2px]">
									{new Date(order.created_at).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric'
									})} at {new Date(order.created_at).toLocaleTimeString('en-US', {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
							</div>
						</li>

						<!-- Payment -->
						<li class="relative flex items-start gap-[16px]">
							{#if order.payment_status !== 'pending'}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-accent-green">
									<iconify-icon icon="mdi:check" class="text-white" width="14" height="14"></iconify-icon>
								</div>
							{:else}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-primary bg-white">
									<div class="h-[8px] w-[8px] rounded-full bg-primary animate-pulse"></div>
								</div>
							{/if}
							<div class="flex-1 pt-[2px]">
								<div class="flex items-center justify-between gap-[8px]">
									<div>
										<p class="font-semibold">
											{order.payment_status === 'pending' ? 'Awaiting Payment' : 'Payment Completed'}
										</p>
										<p class="text-xs text-text-muted mt-[2px]">
											{order.payment_status === 'pending' ? 'Complete payment to confirm order' : 'Payment received successfully'}
										</p>
									</div>
									{#if order.payment_status === 'pending'}
										<form action="?/pay" method="POST" use:enhance={enhanceNairaPayment}>
											<button
												type="submit"
												class="btn btn-primary text-xs font-bold px-[16px] py-[8px] rounded-full flex items-center gap-[6px] whitespace-nowrap"
												disabled={processingPayment}
											>
												{#if processingPayment}
													<span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
													Processing
												{:else}
													Pay Now
													<iconify-icon icon="mdi:arrow-right" width="14" height="14"></iconify-icon>
												{/if}
											</button>
										</form>
									{/if}
								</div>
							</div>
						</li>

						<!-- Confirmed by Restaurant -->
						<li class="relative flex items-start gap-[16px]">
							{#if isProgressCompleted('confirmed')}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-accent-green">
									<iconify-icon icon="mdi:check" class="text-white" width="14" height="14"></iconify-icon>
								</div>
							{:else}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-[#E5E5E5] bg-white">
									<div class="h-[8px] w-[8px] rounded-full bg-[#E5E5E5]"></div>
								</div>
							{/if}
							<div class="flex-1 pt-[2px]">
								<p class="font-semibold {isProgressCompleted('confirmed') ? '' : 'text-text-muted'}">Confirmed by Restaurant</p>
								<p class="text-xs text-text-muted mt-[2px]">Restaurant will confirm your order</p>
							</div>
						</li>

						<!-- Preparing -->
						<li class="relative flex items-start gap-[16px]">
							{#if isProgressCompleted('in_preparation')}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-accent-green">
									<iconify-icon icon="mdi:check" class="text-white" width="14" height="14"></iconify-icon>
								</div>
							{:else if currentProgress === progressMap['in_preparation'] - 1 && order.payment_status === 'paid'}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-primary bg-white">
									<div class="h-[8px] w-[8px] rounded-full bg-primary animate-pulse"></div>
								</div>
							{:else}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-[#E5E5E5] bg-white">
									<div class="h-[8px] w-[8px] rounded-full bg-[#E5E5E5]"></div>
								</div>
							{/if}
							<div class="flex-1 pt-[2px]">
								<p class="font-semibold {isProgressCompleted('in_preparation') ? '' : 'text-text-muted'}">Preparing Your Order</p>
								<p class="text-xs text-text-muted mt-[2px]">Your food is being prepared</p>
							</div>
						</li>

						<!-- Out for Delivery -->
						<li class="relative flex items-start gap-[16px]">
							{#if isProgressCompleted('out_for_delivery')}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-accent-green">
									<iconify-icon icon="mdi:check" class="text-white" width="14" height="14"></iconify-icon>
								</div>
							{:else if currentProgress === progressMap['out_for_delivery'] - 1 && order.payment_status === 'paid'}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-primary bg-white">
									<div class="h-[8px] w-[8px] rounded-full bg-primary animate-pulse"></div>
								</div>
							{:else}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-[#E5E5E5] bg-white">
									<div class="h-[8px] w-[8px] rounded-full bg-[#E5E5E5]"></div>
								</div>
							{/if}
							<div class="flex-1 pt-[2px]">
								<p class="font-semibold {isProgressCompleted('out_for_delivery') ? '' : 'text-text-muted'}">Out for Delivery</p>
								<p class="text-xs text-text-muted mt-[2px]">Your order is on its way</p>
							</div>
						</li>

						<!-- Delivered -->
						<li class="relative flex items-start gap-[16px]">
							{#if isProgressCompleted('delivered')}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-accent-green">
									<iconify-icon icon="mdi:check" class="text-white" width="14" height="14"></iconify-icon>
								</div>
							{:else}
								<div class="relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-[#E5E5E5] bg-white">
									<div class="h-[8px] w-[8px] rounded-full bg-[#E5E5E5]"></div>
								</div>
							{/if}
							<div class="flex-1 pt-[2px]">
								<p class="font-semibold {isProgressCompleted('delivered') ? '' : 'text-text-muted'}">Delivered</p>
								<p class="text-xs text-text-muted mt-[2px]">Enjoy your meal!</p>
							</div>
						</li>
					</ul>
				</div>
		</div>

		<!-- Delivery Details Card -->
		<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] p-[20px]">
			<h2 class="text-lg font-extrabold mb-[20px]">Delivery Details</h2>

			<div class="rounded-[7px] bg-white p-[16px]">
				<ul class="space-y-[12px] text-sm">
					<li class="flex items-center justify-between">
						<span class="text-text-muted">Name</span>
						<span class="font-semibold">{order.name}</span>
					</li>
					<Separator py="12px" />
					<li class="flex items-center justify-between">
						<span class="text-text-muted">Address</span>
						<span class="font-semibold text-right max-w-[60%]">{order.address}</span>
					</li>
					<Separator py="12px" />
					<li class="flex items-center justify-between">
						<span class="text-text-muted">Phone</span>
						<span class="font-semibold">{order.phone}</span>
					</li>
					{#if order.special_instructions}
						<Separator py="12px" />
						<li class="flex flex-col gap-1">
							<span class="text-text-muted">Delivery Instructions</span>
							<span class="font-semibold">{order.special_instructions}</span>
						</li>
					{/if}
				</ul>
			</div>
		</div>

		<!-- Order Items Card -->
		<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] p-[20px]">
			<h2 class="text-lg font-extrabold mb-[20px]">Items</h2>

			<div class="rounded-[7px] bg-white p-[16px]">
				<ul class="space-y-2 text-sm">
					{#each order.order_items as item, index (index)}
						<li class="flex items-center justify-between">
							<span>{item.items.name} x {item.quantity}</span>
							<span>{appSettings.formatPrice(item.price)}</span>
						</li>
						{#if index < order.order_items.length - 1}
							<Separator py="12px" />
						{/if}
					{/each}
				</ul>
			</div>
		</div>

		<!-- Payment Summary Card -->
		<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] p-[20px]">
			<h2 class="text-lg font-extrabold mb-[20px]">Payment Summary</h2>

			<div class="space-y-[24px]">
				<div class="rounded-[7px] bg-white p-[16px]">
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
					</ul>
				</div>

				<!-- Total -->
				<div class="flex items-center justify-between px-[12px]">
					<span class="font-semibold">Total</span>
					<span class="font-semibold text-lg">
						{appSettings.formatPrice(order.total)}
					</span>
				</div>

				{#if order.payment_status === 'pending' || order.payment_status === 'failed'}
					<div class="space-y-[12px]">
						<form action="?/pay" class="w-full" method="POST" use:enhance={enhanceNairaPayment}>
							<button class="btn btn-primary rounded-full w-full flex items-center justify-center" disabled={processingPayment}>
								{#if processingPayment}
									<span
										class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
									></span>
									Processing...
								{:else}
									Pay With Naira ({appSettings.formatPrice(
										appSettings.getConvertedPrice(order.total),
										'NGN'
									)})
								{/if}
							</button>
						</form>
						<button class="btn rounded-full w-full bg-[#f2f2f2] text-text-muted" disabled>
							Pay With Momo (Coming Soon)
						</button>
					</div>
				{:else if order.payment_status === 'paid'}
					<div class="flex items-center justify-center gap-2 py-[12px] rounded-full bg-green-50 text-green-600">
						<iconify-icon icon="lets-icons:check-fill" width="20" height="20"></iconify-icon>
						<span class="font-semibold">Payment Completed</span>
					</div>
				{:else}
					<div class="flex items-center justify-center gap-2 py-[12px] rounded-full bg-red-50 text-red-600">
						<iconify-icon icon="ic:baseline-error" width="20" height="20"></iconify-icon>
						<span class="font-semibold">Payment Status: {order.payment_status}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
