<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { z } from 'zod';
	import { supportedCountries } from '$lib/utils/constants';
	import { goto } from '$app/navigation';
	import { showToast } from '$lib/utils/toaster.svelte';

	import Seo from '$lib/components/Seo.svelte';
	import PhoneInput from '$lib/components/forms/PhoneInput.svelte';

	import cart from '$lib/stores/cart.svelte';
	import appSettings from '$lib/stores/appSettings.svelte';
	import ordersRepository from '$lib/repositories/orders.repository';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	let { supabase, session } = $derived(data);

	const orderChargeDetails = $state({
		deliveryFee: 700,
		serviceCharge: 100
	});

	let restaurantId = page.url.searchParams.get('restaurant');
	let cartDetails: any = $state(null);
	let loading = $state(true);
	let errors = $state<any>({
		name: null,
		address: null,
		phoneCode: null,
		phone: null,
		specialInstructions: null
	});

	let ordering = $state(false);

	let deliveryDetails = $state({
		name: '',
		address: '',
		phoneCode: '+229',
		phone: '',
		whatsappCode: '+229',
		whatsapp: '',
		specialInstructions: ''
	});

	const schema = z.object({
		name: z.string().trim().min(1, 'Name is required'),
		address: z.string().trim().min(1, 'Address is required'),
		phoneCode: z.enum(Object.keys(supportedCountries) as [string, ...string[]], {
			errorMap: () => ({ message: 'Invalid country code' })
		}),
		phone: z
			.string()
			.trim()
			.superRefine((val, ctx) => {
				if (
					val.trim().length < supportedCountries[deliveryDetails.phoneCode].maxlength ||
					val.trim().length > supportedCountries[deliveryDetails.phoneCode].maxlength
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `Phone number must be ${supportedCountries[deliveryDetails.phoneCode].maxlength} digits.`,
						fatal: true
					});

					return z.NEVER;
				}
			}),
		specialInstructions: z.string().optional()
	});

	onMount(async () => {
		loading = true;

		if (!cart.loaded) {
			await cart.load();
		}

		if (!restaurantId) {
			showToast({ message: 'No restaurant ID provided', type: 'error' });
			goto('/');
			return;
		}
		cartDetails = cart.getCart(restaurantId);

		if (!cartDetails) {
			showToast({ message: 'There is no cart for this restaurant', type: 'error' });
			goto('/');
		}
		loading = false;
	});

	const handleCheckout = async () => {
		ordering = true;
		errors = {
			name: null,
			address: null,
			phoneCode: null,
			phone: null,
			specialInstructions: null
		};

		try {
			const { phoneCode, ...parsedData } = schema.parse(deliveryDetails);
			const dataToSend = {
				...parsedData,
				phone: `${phoneCode}${parsedData.phone.replace(/\D/g, '')}`,
				restaurantId: restaurantId as string,
				items: cartDetails.items.map((item: any) => ({
					id: item.id,
					quantity: item.quantity,
					price: item.discount_price || item.price
				}))
			};
			let order = await ordersRepository.placeOrder(supabase, dataToSend, session?.user.id as string);
			cart.deleteCart(restaurantId as string);
			showToast({ message: 'Order placed successfully', type: 'success' });
			if (order?.payment_status === 'pending') {
				showToast({
					message: 'Please complete your payment to confirm your order',
					type: 'info'
				});
				goto(`/orders/${order.id}`);
			}
		} catch (error) {
			if (error instanceof z.ZodError) {
				errors = error.flatten().fieldErrors;
			} else {
				console.error('Unexpected error:', error);
				showToast({ message: 'An unexpected error occurred', type: 'error' });
			}
		} finally {
			ordering = false;
		}
	};
</script>

<Seo
	title="Checkout {cartDetails?.restaurantDetails.name || ''} - ChowBenin"
	description="Checkout your order on ChowBenin"
/>

<div class="flex h-full w-full flex-col items-center justify-center">
	{#if loading}
		<p>Loading...</p>
	{:else if cartDetails}
		<div class="bg-background flex w-full max-w-2xl flex-col justify-center p-4">
			<!-- <Breadcrumb
				text={`Back to ${cartDetails.restaurantDetails.name}`}
				href={`/restaurants/${cartDetails.restaurantDetails.slug}`}
			/> -->
			<h2 class="text-2xl font-bold">Checkout for {cartDetails.restaurantDetails.name}</h2>

			<form>
				<div class="mt-4">
					<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
					<input
						type="text"
						id="name"
						class="form-input mt-1 block"
						class:form-error={errors.name}
						bind:value={deliveryDetails.name}
						placeholder="John Doe"
					/>
					{#if errors.name}
						{#each errors.name as error, index (index)}
							<p class="mt-2 text-sm text-red-600">{error}</p>
						{/each}
					{/if}
				</div>
				<div class="mt-4">
					<label for="address" class="block text-sm font-medium text-gray-700">Address</label>
					<input
						type="text"
						id="address"
						class="form-input mt-1 block"
						class:form-error={errors.address}
						bind:value={deliveryDetails.address}
						placeholder="123 Main St, Cotonou"
					/>
					{#if errors.address}
						{#each errors.address as error, index (index)}
							<p class="mt-2 text-sm text-red-600">{error}</p>
						{/each}
					{/if}
				</div>
				<div class="mt-4">
					<label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
					<PhoneInput
						bind:countryCode={deliveryDetails.phoneCode}
						bind:phoneNumber={deliveryDetails.phone}
						error={errors.phone}
					/>
					{#if errors.phone}
						{#each errors.phone as error, index (index)}
							<p class="mt-2 text-sm text-red-600">{error}</p>
						{/each}
					{/if}
					<p class="mt-2 text-sm text-gray-500">
						The delivery person will contact you on this number.
					</p>
				</div>

				<div
					class="mt-4"
					aria-live="polite"
					aria-atomic="true"
					role="alert"
					aria-relevant="all"
					aria-label="Special Instructions"
				>
					<label for="specialInstructions" class="block text-sm font-medium text-gray-700">
						Special Instructions
					</label>

					<textarea
						id="specialInstructions"
						class="form-textarea mt-1 block"
						bind:value={deliveryDetails.specialInstructions}
						placeholder="Any special requests or instructions for the restaurant?"
						rows="3"
						class:form-error={errors.specialInstructions}
					></textarea>

					{#if errors.specialInstructions}
						{#each errors.specialInstructions as error, index (index)}
							<p class="mt-2 text-sm text-red-600">{error}</p>
						{/each}
					{/if}
				</div>

				<div class="bg-surface mt-4 p-4 text-sm">
					<ul class="w-full">
						{#each cartDetails.items as item, index (index)}
							<li class="flex justify-between border-b p-2">
								<span>{item.name}</span>
								<span
									>{item.quantity} x {appSettings.formatPrice(
										item.discount_price || item.price
									)}</span
								>
							</li>
						{/each}
					</ul>
					<ul class="mt-4 w-full space-y-2 px-2">
						<li class="flex justify-between">
							<span>Sub-Total:</span>
							<span>{appSettings.formatPrice(cartDetails.total)}</span>
						</li>
						<li class="flex justify-between">
							<span>Delivery Fee:</span>
							<span>{appSettings.formatPrice(appSettings.deliveryFee)}</span>
						</li>
						<li class="flex justify-between">
							<span>Service Fee:</span>
							<span>{appSettings.formatPrice(appSettings.serviceCharge)}</span>
						</li>
						<li class="flex justify-between">
							<span>Total:</span>
							<span
								>{appSettings.formatPrice(
									cartDetails.total +
										orderChargeDetails.deliveryFee +
										orderChargeDetails.serviceCharge
								)}</span
							>
						</li>
					</ul>
				</div>
				<button
					class="btn mt-4 w-full"
					onclick={async (event) => {
						event.preventDefault();
						// Handle checkout logic here
						await handleCheckout();
					}}
				>
					{#if ordering}
						<iconify-icon icon="eos-icons:loading" width="20" height="20" style="color: #fff"
						></iconify-icon>
					{:else}
						<span>Place Order</span>
					{/if}
				</button>
			</form>
		</div>
	{:else}
		<p>No cart found for this restaurant.</p>
	{/if}
</div>
