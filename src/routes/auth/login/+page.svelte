<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import supabase from '$lib/supabase';
	import Seo from '$lib/components/Seo.svelte';
	import { supportedCountries } from '$lib/utils/constants';
	import PhoneInput from '../../../lib/components/forms/PhoneInput.svelte';
	import Navbar from '../../../lib/components/Navbar.svelte';

	let step = $state(1);
	let loading = $state(false);
	let errors: any = $state({
		1: null,
		2: null
	});

	let phoneNumber = $state('');
	let countryCode = $state('+234');

	let cleanedPhoneNumber = $derived(phoneNumber.replace(/\s/g, '').trim());

	let otp = $state('');

	const sendOtp = async () => {
		if (loading) return; // Prevent multiple clicks

		loading = true;
		errors[1] = null;
		errors[2] = null;

		if (!phoneNumber || phoneNumber.length === 0) {
			errors[1] = 'Please enter your phone number.';
			loading = false;
			return;
		} else if (phoneNumber.length < supportedCountries[countryCode].maxlength) {
			errors[1] = `Phone number must be ${supportedCountries[countryCode].maxlength} digits.`;
			loading = false;
			return;
		}

		const { error } = await supabase.auth.signInWithOtp({
			phone: `${countryCode}${cleanedPhoneNumber}`,
			options: {
				channel: 'whatsapp'
			}
		});

		if (error) {
			errors[1] = 'Error sending OTP. Are you sure this number is a WhatsApp number?';
		} else {
			step = 2;
		}
		loading = false;
	};

	const verifyOtp = async () => {
		loading = true;
		errors[2] = null;

		if (!otp || otp.length === 0) {
			errors[2] = 'Please enter the OTP.';
			loading = false;
			return;
		}

		const { data, error } = await supabase.auth.verifyOtp({
			phone: `${countryCode}${cleanedPhoneNumber}`,
			token: otp,
			type: 'sms'
		});

		if (error) {
			errors[2] = 'Error verifying OTP. Please try again.';
		} else {
			const redirectTo = page.url.searchParams.get('redirectTo');
			if (redirectTo) {
				goto(redirectTo);
			} else {
				goto('/'); // Redirect to the home page or any other page after successful verification
			}
		}
		loading = false;
	};
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
				<form>
					<PhoneInput bind:countryCode bind:phoneNumber bind:error={errors[1]} />
					<p class="mt-2 mb-4 text-sm text-gray-500">
						Enter your phone number to receive a one-time password (OTP).
					</p>
					<button
						onclick={(event) => {
							event.preventDefault();
							sendOtp();
						}}
						class="btn w-full"
						disabled={loading}
					>
						{#if loading}
							<iconify-icon icon="eos-icons:loading" width="16" height="16"></iconify-icon>
						{:else}
							Continue
						{/if}
					</button>
				</form>
			{:else if step === 2}
				<form>
					<div
						class="my-3 flex w-full items-center overflow-hidden rounded-md border border-gray-300 bg-gray-100"
					>
						<input type="text" bind:value={otp} class="form-input" placeholder="Enter OTP" />
					</div>
					<p class="mb-4 text-sm text-gray-500">Enter the OTP sent to your phone number.</p>
					<button
						onclick={(event) => {
							event.preventDefault();
							verifyOtp();
						}}
						class="btn w-full"
						disabled={loading}
					>
						{#if loading}
							<iconify-icon icon="eos-icons:loading" width="16" height="16"></iconify-icon>
						{:else}
							Login
						{/if}
					</button>
					<p class="mt-4 text-sm text-gray-500">
						Didn’t receive the OTP?{' '}
						<button
							onclick={(event) => {
								event.preventDefault();
								step = 1;
							}}
							class="text-primary hover:underline"
						>
							Resend OTP
						</button>
					</p>
					<p class="mt-4 text-sm text-gray-500">
						By logging in, you agree to our{' '}
						<a href="/privacy-policy" class="text-primary hover:underline">Privacy Policy</a>
						and{' '}
						<a href="/terms-of-service" class="text-primary hover:underline">Terms of Service</a>.
					</p>
				</form>
			{/if}
		</div>
	</div>
</div>
