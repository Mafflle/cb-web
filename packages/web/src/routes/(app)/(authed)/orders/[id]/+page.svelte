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
	import { paymentMethods } from '@chowbenin/shared/constants';
	import { PUBLIC_IS_MOMO_SANDBOX } from '$env/static/public';

	const { data }: PageProps = $props();
	const isMomoSandbox = PUBLIC_IS_MOMO_SANDBOX === 'true';
	let { supabase } = $derived(data);
	let { order } = $state(data);
	let processingPayment = $state(false);
	let processingMomoPayment = $state(false);
	let showPaymentOptions = $state(false);
	let showMomoPhoneModal = $state(false);
	let momoPhoneNumber = $state('');
	let momoPhoneError = $state('');
	let momoPhoneTouched = $state(false);
	let momoFormRef: HTMLFormElement | null = $state(null);
	let paymentDropdownRef: HTMLDivElement | null = $state(null);
	let momoModalStep: 'phone' | 'confirm' = $state('phone');
	let momoTransactionRef = $state('');
	let verifyingMomoPayment = $state(false);

	const validateMomoPhone = (value: string): string => {
		const digitsOnly = value.replace(/\D/g, '');
		if (!digitsOnly) {
			return 'Phone number is required';
		}
		if (digitsOnly.length < 8) {
			return 'Phone number must be 8 digits';
		}
		if (digitsOnly.length > 8) {
			return 'Phone number must be exactly 8 digits';
		}
		return '';
	};

	const isMomoFormValid = $derived(() => {
		const digitsOnly = momoPhoneNumber.replace(/\D/g, '');
		return digitsOnly.length === 8;
	});

	const handleMomoPhoneInput = (e: Event) => {
		const input = e.target as HTMLInputElement;
		let digits = input.value.replace(/\D/g, '');
		if (digits.length > 8) {
			digits = digits.slice(0, 8);
		}
		let formatted = '';
		for (let i = 0; i < digits.length; i++) {
			if (i > 0 && i % 2 === 0) {
				formatted += ' ';
			}
			formatted += digits[i];
		}
		momoPhoneNumber = formatted;
		
		if (momoPhoneTouched) {
			momoPhoneError = validateMomoPhone(momoPhoneNumber);
		}
	};

	const handleMomoPhoneBlur = () => {
		momoPhoneTouched = true;
		momoPhoneError = validateMomoPhone(momoPhoneNumber);
	};

	const verifyMomoPayment = async () => {
		if (!momoTransactionRef) return;
		
		verifyingMomoPayment = true;
		
		try {
			const { success: isPaid, status } = await ordersRepository.verifyOrderPayment(order.id, momoTransactionRef);

			console.log({isPaid, status});
			
			if (isPaid) {
				showToast({
					message: 'Payment verified successfully!',
					type: 'success'
				});
				closeMomoModal();
			} else if (status === 'pending') {
				showToast({
					message: 'Payment not yet confirmed. Please complete the payment on your phone.',
					type: 'error'
				});
			} else {
				showToast({
					message: 'Payment failed. Please try again.',
					type: 'error'
				});
				closeMomoModal();
			}
		} catch (error) {
			showToast({
				message: 'Failed to verify payment. Please try again.',
				type: 'error'
			});
		} finally {
			verifyingMomoPayment = false;
		}
	};

	function handleClickOutside(event: MouseEvent) {
		if (paymentDropdownRef && !paymentDropdownRef.contains(event.target as Node)) {
			showPaymentOptions = false;
		}
	}

	$effect(() => {
		if (showPaymentOptions) {
			document.addEventListener('click', handleClickOutside);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

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
		showPaymentOptions = false;

		return async ({ result }) => {
			try {
				if (result.type === 'success') {
					const paystackData = result.data?.data;
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
							const {success: isPaid} = await ordersRepository.verifyOrderPayment(
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

	const openMomoModal = () => {
		showPaymentOptions = false;
		showMomoPhoneModal = true;
		momoModalStep = 'phone';
	};

	const closeMomoModal = () => {
		showMomoPhoneModal = false;
		momoPhoneNumber = '';
		momoPhoneError = '';
		momoPhoneTouched = false;
		momoModalStep = 'phone';
		momoTransactionRef = '';
	};

	const enhanceMomoPayment: SubmitFunction = () => {
		processingMomoPayment = true;

		return async ({ result }) => {
			try {
				if (result.type === 'success' && result.data?.reference) {
					momoTransactionRef = result.data.reference;
					
					momoModalStep = 'confirm';
					
					showToast({
						message: 'Payment request sent! Check your phone.',
						type: 'success'
					});
				} else if (result.type === 'error' || result.type === 'failure') {
					showMomoPhoneModal = false;
					showToast({
						message: 'Failed to initiate Momo payment. Please try again.',
						type: 'error'
					});
				}
			} catch (error) {
				showMomoPhoneModal = false;
				showToast({
					message: 'Failed to initiate Momo payment. Please try again.',
					type: 'error'
				});
			} finally {
				processingMomoPayment = false;
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
										<div class="relative" bind:this={paymentDropdownRef}>
											<button
												type="button"
												onclick={() => showPaymentOptions = !showPaymentOptions}
												class="btn btn-primary text-xs font-bold px-[16px] py-[8px] rounded-full flex items-center gap-[6px] whitespace-nowrap"
												disabled={processingPayment || processingMomoPayment}
											>
												{#if processingPayment || processingMomoPayment}
													<span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
													Processing
												{:else}
													Pay Now
													<iconify-icon icon="mdi:chevron-down" width="14" height="14" class="transition-transform {showPaymentOptions ? 'rotate-180' : ''}"></iconify-icon>
												{/if}
											</button>
											
											{#if showPaymentOptions}
												<div class="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 overflow-hidden z-10">
													<form action="?/pay" method="POST" use:enhance={enhanceNairaPayment}>
														<input type="hidden" name="payment_method" value={paymentMethods.PAYSTACK} />
														<button
															type="submit"
															class="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
															disabled={processingPayment}
														>
															<iconify-icon icon="mdi:currency-ngn" width="18" height="18" class="text-green-600"></iconify-icon>
															<div>
																<p class="font-medium">Pay with Naira</p>
																<p class="text-xs text-text-muted">{appSettings.formatPrice(appSettings.getConvertedPrice(order.total), 'NGN')}</p>
															</div>
														</button>
													</form>
													<button
														type="button"
														onclick={openMomoModal}
														class="w-full px-4 py-3 text-left text-sm hover:bg-[#FFF8E1] flex items-center gap-3 border-t border-gray-100"
														disabled={processingMomoPayment}
													>
														<iconify-icon icon="mdi:cellphone" width="18" height="18" class="text-[#FFCB05]"></iconify-icon>
														<div>
															<p class="font-medium">Pay with Momo</p>
															<p class="text-xs text-text-muted">{appSettings.formatPrice(order.total)}</p>
														</div>
													</button>
												</div>
											{/if}
										</div>
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
							<input type="hidden" name="payment_method" value={paymentMethods.PAYSTACK} />
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
						<button 
							type="button"
							onclick={openMomoModal}
							class="btn rounded-full w-full bg-[#004F71] text-[#FFCB05] flex items-center justify-center" 
							disabled={processingMomoPayment}
						>
							{#if processingMomoPayment}
								<span
									class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
								></span>
								Processing...
							{:else}
								Pay With Momo ({appSettings.formatPrice(order.total)})
							{/if}
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

				<p class="text-text-muted text-center text-xs mt-4">
					Need help with your order? Check our
					<a href="/legal/refund-policy" class="text-primary underline">Refund Policy</a>
					for information on refunds and cancellations.
				</p>
			</div>
		</div>
	{/if}
</div>

{#if showMomoPhoneModal}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		onclick={(e) => { if (e.target === e.currentTarget && momoModalStep === 'phone') closeMomoModal(); }}
		onkeydown={(e) => { if (e.key === 'Escape' && momoModalStep === 'phone') closeMomoModal(); }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="momo-modal-title"
		tabindex="-1"
	>
		<div class="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
			{#if momoModalStep === 'phone'}
				<div class="flex items-center justify-between mb-4">
					<h2 id="momo-modal-title" class="text-lg font-bold flex items-center gap-2">
						<div class="w-8 h-8 rounded-full bg-[#FFCB05] flex items-center justify-center">
							<iconify-icon icon="mdi:cellphone" width="18" height="18" class="text-[#004F71]"></iconify-icon>
						</div>
						Pay with Momo
					</h2>
					<button 
						type="button" 
						onclick={closeMomoModal}
						class="p-1 rounded-full hover:bg-gray-100 transition-colors"
						aria-label="Close modal"
					>
						<iconify-icon icon="mdi:close" width="20" height="20" class="text-gray-500"></iconify-icon>
					</button>
				</div>

				<!-- Amount -->
				<div class="bg-[#FFF8E1] rounded-lg p-3 mb-4">
					<p class="text-sm text-gray-600">Amount to pay</p>
					<p class="text-xl font-bold text-[#004F71]">{appSettings.formatPrice(order.total)}</p>
				</div>

				<!-- Form -->
				<form 
					action="?/pay" 
					method="POST" 
					use:enhance={enhanceMomoPayment}
					bind:this={momoFormRef}
					class="space-y-4"
				>
					<input type="hidden" name="payment_method" value={paymentMethods.MOMO} />
					
					{#if isMomoSandbox}
						<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
							<p class="text-xs text-amber-700 flex items-center gap-1.5">
								<iconify-icon icon="mdi:test-tube" width="14" height="14"></iconify-icon>
								<span class="font-medium">Test Mode</span> - Any phone number will work
							</p>
						</div>
					{/if}
					
					<div>
						<label for="momo_phone" class="form-label">
							Momo Phone Number
						</label>
						<div 
							class="form-phone-input border {momoPhoneError && momoPhoneTouched ? 'form-error' : ''}"
							style="--tw-ring-color: #FFCB05;"
						>
							<span class="text-text-muted text-sm font-medium pl-[16px]">+229</span>
							<input
								type="tel"
								id="momo_phone"
								name="momo_phone"
								value={momoPhoneNumber}
								oninput={handleMomoPhoneInput}
								onblur={handleMomoPhoneBlur}
								placeholder="XX XX XX XX"
								maxlength="11"
								autocomplete="tel"
							/>
						</div>
						{#if momoPhoneError && momoPhoneTouched}
							<p class="text-xs text-error mt-1 flex items-center gap-1">
								<iconify-icon icon="mdi:alert-circle" width="14" height="14"></iconify-icon>
								{momoPhoneError}
							</p>
						{:else}
							<p class="text-xs text-text-muted mt-1">Enter the 8-digit number linked to your Momo account</p>
						{/if}
					</div>

					<div class="flex gap-3 pt-2">
						<button
							type="button"
							onclick={closeMomoModal}
							class="flex-1 py-3 px-4 rounded-full border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={processingMomoPayment || !isMomoFormValid()}
							class="flex-1 py-3 px-4 rounded-full bg-[#004F71] text-[#FFCB05] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{#if processingMomoPayment}
								<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
								Processing...
							{:else}
								Pay Now
							{/if}
						</button>
					</div>
				</form>
			{:else}
				<!-- Confirmation Step -->
				<div class="text-center">
					<!-- Animated Phone Icon -->
					<div class="mb-6">
						<div class="w-20 h-20 mx-auto rounded-full bg-[#FFF8E1] flex items-center justify-center animate-pulse">
							<iconify-icon icon="mdi:cellphone-message" width="40" height="40" class="text-[#FFCB05]"></iconify-icon>
						</div>
					</div>

					<!-- Title -->
					<h2 id="momo-modal-title" class="text-xl font-bold text-[#004F71] mb-2">
						Check Your Phone
					</h2>

					<!-- Instructions -->
					<div class="space-y-3 mb-6">
						<p class="text-text-muted text-sm">
							A payment request of <span class="font-bold text-[#004F71]">{appSettings.formatPrice(order.total)}</span> has been sent to your phone.
						</p>
						
						{#if isMomoSandbox}
							<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
								<p class="text-sm text-amber-700">
									<iconify-icon icon="mdi:test-tube" width="14" height="14" class="inline mr-1"></iconify-icon>
									<span class="font-medium">Test Mode:</span> Click the button below to verify the payment.
								</p>
							</div>
						{:else}
							<div class="bg-[#FFF8E1] rounded-lg p-4 text-left space-y-2">
								<div class="flex items-start gap-3">
									<div class="w-6 h-6 rounded-full bg-[#FFCB05] flex items-center justify-center flex-shrink-0 mt-0.5">
										<span class="text-[#004F71] text-xs font-bold">1</span>
									</div>
									<p class="text-sm text-gray-700">Check your <strong>MTN MoMo app</strong> for a payment notification</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="w-6 h-6 rounded-full bg-[#FFCB05] flex items-center justify-center flex-shrink-0 mt-0.5">
										<span class="text-[#004F71] text-xs font-bold">2</span>
									</div>
									<p class="text-sm text-gray-700">Or wait for a <strong>USSD popup</strong> on your phone</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="w-6 h-6 rounded-full bg-[#FFCB05] flex items-center justify-center flex-shrink-0 mt-0.5">
										<span class="text-[#004F71] text-xs font-bold">3</span>
									</div>
									<p class="text-sm text-gray-700">Enter your <strong>MoMo PIN</strong> to approve the payment</p>
								</div>
							</div>
						{/if}
					</div>

					<!-- Buttons -->
					<div class="space-y-3">
						<button
							type="button"
							onclick={verifyMomoPayment}
							disabled={verifyingMomoPayment}
							class="w-full py-3 px-4 rounded-full bg-[#004F71] text-[#FFCB05] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{#if verifyingMomoPayment}
								<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
								Verifying...
							{:else}
								<iconify-icon icon="mdi:check-circle" width="20" height="20"></iconify-icon>
								I Have Approved
							{/if}
						</button>
						
						<button
							type="button"
							onclick={closeMomoModal}
							class="w-full py-3 px-4 rounded-full border border-gray-200 font-medium hover:bg-gray-50 transition-colors text-text-muted"
						>
							Cancel Payment
						</button>
					</div>

					<!-- Help text -->
					{#if !isMomoSandbox}
						<p class="text-xs text-text-muted mt-4">
							Didn't receive a prompt? Make sure your phone is on and has network coverage.
						</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}