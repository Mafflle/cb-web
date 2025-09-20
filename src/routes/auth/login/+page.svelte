<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import PhoneInput from '$lib/components/forms/PhoneInput.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { enhance } from '$app/forms';
	import auth from '$lib/stores/auth.svelte';

	const { data } = $props();

	let step = $state(1);
	let loading = $state(false);
	let errors: any = $state({
		1: null,
		2: null
	});

	let phoneNumber = $state('');
	let countryCode = $state('+234');

	let cleanedPhoneNumber = $derived(phoneNumber.replace(/\s/g, '').trim());
	const redirectTo = page.url.searchParams.get('redirectTo') || '/';

	let otp = $state('');
</script>

<Seo title="Login - ChowBenin" description="Login to ChowBenin" />
<div class=" flex flex-1 flex-col">
	<Navbar authNav />
	<div class="mx-auto flex min-h-full w-full flex-1 flex-col items-center justify-center px-5">
		<div class="bg-surface w-full max-w-[500px] rounded-md p-4 shadow-md">
			<div class="mb-4">
				<div class="flex items-center justify-between">
					<h2 class="ml-1 text-lg font-bold">
						{step === 1 ? 'Welcome to ChowBenin' : 'Enter OTP'}
					</h2>

					{#if step === 2}
						<button
							onclick={(event) => {
								event.preventDefault();
								step = 1;
							}}
							class="text-primary hover:underline"
						>
							Change Phone Number
						</button>
					{/if}
				</div>
				{#if errors[step]}
					<div class="mt-2 rounded-md bg-red-100 p-2">
						<p class=" text-sm text-red-700">{errors[step]}</p>
					</div>
				{/if}
			</div>
			{#if step === 1}
				<form
					method="POST"
					action="?/sendOtp"
					use:enhance={() => {
						loading = true;

						return async ({ update, result }) => {
							update({ reset: false });
							if (result.status === 200) {
								step = 2;
							} else if (result.status === 400) {
								errors[1] =
									result.data.error ||
									'Error sending OTP. Please try again later or contact support.';
							} else {
								errors[1] = 'Error sending OTP. Please try again later or contact support.';
							}
							loading = false;
						};
					}}
				>
					<PhoneInput bind:countryCode bind:phoneNumber bind:error={errors[1]} />
					<p class="mt-2 mb-4 text-sm text-gray-500">
						Enter your phone number to receive a one-time password (OTP).
					</p>
					<button type="submit" class="btn w-full" disabled={loading}>
						{#if loading}
							<iconify-icon icon="eos-icons:loading" width="16" height="16"></iconify-icon>
						{:else}
							Continue
						{/if}
					</button>
				</form>
			{:else if step === 2}
				<form
					method="post"
					action="?/verifyOtp"
					use:enhance={() => {
						loading = true;
						return async ({ update, result }) => {
							update({ reset: true });

							if (result.status === 200) {
								await auth.refresh();
								await goto(redirectTo || '/');
							} else if (result.status === 400) {
								errors[2] = result.data.error || 'Error verifying OTP. Please try again.';
							} else {
								errors[2] = 'Error verifying OTP. Please try again.';
							}

							loading = false;
						};
					}}
				>
					<div
						class="my-3 flex w-full items-center overflow-hidden rounded-md border border-gray-300 bg-gray-100"
					>
						<input
							type="text"
							value="{countryCode}{cleanedPhoneNumber}"
							class="hidden"
							name="phone_number"
						/>
						<input
							type="text"
							bind:value={otp}
							class="form-input"
							name="otp"
							placeholder="Enter OTP"
						/>
					</div>
					<p class="mb-4 text-sm text-gray-500">Enter the OTP sent to your phone number.</p>
					<button type="submit" class="btn w-full" disabled={loading}>
						{#if loading}
							<iconify-icon icon="eos-icons:loading" width="16" height="16"></iconify-icon>
						{:else}
							Login
						{/if}
					</button>
					<p class="mt-4 text-sm text-gray-500">
						Didn’t receive the OTP?
						<button
							type="button"
							onclick={(event) => {
								step = 1;
							}}
							class="text-primary hover:underline"
						>
							Resend OTP
						</button>
					</p>
					<p class="mt-4 text-sm text-gray-500">
						By logging in, you agree to our
						<a href="/privacy-policy" class="text-primary hover:underline">Privacy Policy</a>
						and
						<a href="/terms-of-service" class="text-primary hover:underline">Terms of Service</a>.
					</p>
				</form>
			{/if}
		</div>
	</div>
</div>
