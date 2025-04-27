<script lang="ts">
	import { page } from '$app/state';
	import cart from '$lib/stores/cart.svelte';
	import { onMount } from 'svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { toast } from 'svelte-sonner';
	import PhoneInput from '$lib/components/forms/PhoneInput.svelte';
	import { z } from 'zod';
	import { supportedCountries } from '$lib/utils/constants';
	import orders from '$lib/stores/orders.svelte';
	import { goto } from '$app/navigation';

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
		whatsappCode: null,
		whatsapp: null,
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
		whatsappCode: z.enum(Object.keys(supportedCountries) as [string, ...string[]], {
			errorMap: () => ({ message: 'Invalid country code' })
		}),
		whatsapp: z.string().superRefine((val, ctx) => {
			if (
				val.trim().length < supportedCountries[deliveryDetails.whatsappCode].maxlength ||
				val.trim().length > supportedCountries[deliveryDetails.whatsappCode].maxlength
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Phone number must be ${supportedCountries[deliveryDetails.whatsappCode].maxlength} digits.`,
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
			toast.error('No restaurant ID provided');
			goto('/');
			return;
		}
		cartDetails = cart.getCart(restaurantId);

		if (!cartDetails) {
			toast.error('There is no cart for this restaurant');
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
			whatsappCode: null,
			whatsapp: null,
			specialInstructions: null
		};

		try {
			const { phoneCode, whatsappCode, ...parsedData } = schema.parse(deliveryDetails);
			const dataToSend = {
				...parsedData,
				phone: `${phoneCode}${parsedData.phone.replace(/\D/g, '')}`,
				whatsapp: `${whatsappCode}${parsedData.whatsapp.replace(/\D/g, '')}`,
				restaurantId: restaurantId as string,
				items: cartDetails.items.map((item: any) => ({
					id: item.id,
					quantity: item.quantity,
					price: item.discount_price || item.price
				}))
			};
			let order = await orders.placeOrder(dataToSend);
			toast.success('Order placed successfully');
			goto(`/orders/${order.id}`);
		} catch (error) {
			if (error instanceof z.ZodError) {
				errors = error.flatten().fieldErrors;
			} else {
				console.error('Unexpected error:', error);
				toast.error('Checkout failed. Please try again.');
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
						{#each errors.name as error}
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
						{#each errors.address as error}
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
						{#each errors.phone as error}
							<p class="mt-2 text-sm text-red-600">{error}</p>
						{/each}
					{/if}
					<p class="mt-2 text-sm text-gray-500">
						The delivery person will contact you on this number.
					</p>
				</div>
				<div class="mt-4">
					<label for="whatsapp" class="block text-sm font-medium text-gray-700">WhatsApp</label>
					<PhoneInput
						bind:countryCode={deliveryDetails.whatsappCode}
						bind:phoneNumber={deliveryDetails.whatsapp}
						error={errors.whatsapp}
					/>
					{#if errors.whatsapp}
						{#each errors.whatsapp as error}
							<p class="mt-2 text-sm text-red-600">{error}</p>
						{/each}
					{/if}
					<p class="mt-2 text-sm text-gray-500">
						We will send you updates about your order on WhatsApp.
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
						{#each errors.specialInstructions as error}
							<p class="mt-2 text-sm text-red-600">{error}</p>
						{/each}
					{/if}
				</div>

				<div class="bg-surface mt-4 p-4 text-sm">
					<ul class="w-full">
						{#each cartDetails.items as item}
							<li class="flex justify-between border-b p-2">
								<span>{item.name}</span>
								<span>{item.quantity} x {item.discount_price || item.price} XOF</span>
							</li>
						{/each}
					</ul>
					<ul class="mt-4 w-full space-y-2 px-2">
						<li class="flex justify-between">
							<span>Sub-Total:</span>
							<span>{cartDetails.total} XOF</span>
						</li>
						<li class="flex justify-between">
							<span>Delivery Fee:</span>
							<span> {orderChargeDetails.deliveryFee} XOF</span>
						</li>
						<li class="flex justify-between">
							<span>Service Fee:</span>
							<span> {orderChargeDetails.serviceCharge} XOF</span>
						</li>
						<li class="flex justify-between">
							<span>Total:</span>
							<span
								>{cartDetails.total +
									orderChargeDetails.deliveryFee +
									orderChargeDetails.serviceCharge} XOF</span
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
