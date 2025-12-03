<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Seo from '$lib/components/Seo.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import OtpInput from '$lib/components/OtpInput.svelte';
	import { showToast } from '$lib/utils/toaster.svelte.js';
	import { onMount } from 'svelte';
	import auth from '$lib/stores/auth.svelte.js';

	// State
	let step: 'email' | 'otp' = $state('email');
	let email = $state('');
	let otpCode = $state('');
	let loading = $state(false);
	let googleLoading = $state(false);
	let errors: Record<string, string[]> = $state({});
	let resendCooldown = $state(0);
	let otpInputRef: OtpInput | undefined = $state(undefined);

	let redirectTo: string = page.url.searchParams.get('redirectTo') || '/';

	let { data } = $props();
	const { supabase } = $derived(data);

	// Resend cooldown timer
	$effect(() => {
		if (resendCooldown > 0) {
			const timer = setTimeout(() => {
				resendCooldown--;
			}, 1000);
			return () => clearTimeout(timer);
		}
	});

	onMount(() => {
		// Check for OAuth errors in URL hash
		if (window.location.hash) {
			const hash = new URLSearchParams(window.location.hash.slice(1));
			const errorDescription = hash.get('error_description');
			if (errorDescription) {
				showToast({
					type: 'error',
					message: errorDescription
				});
				window.location.hash = '';
			}
		}
	});

	function validateEmail(email: string): boolean {
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailRegex.test(email);
	}

	async function handleSendOtp() {
		errors = {};

		if (!email) {
			errors = { email: ['Email is required'] };
			return;
		}

		if (!validateEmail(email)) {
			errors = { email: ['Please enter a valid email address'] };
			return;
		}

		loading = true;

		try {
			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					shouldCreateUser: true
				}
			});

			if (error) {
				showToast({
					type: 'error',
					message: error.message || 'Failed to send verification code'
				});
				loading = false;
				return;
			}

			// Success - move to OTP step
			step = 'otp';
			resendCooldown = 60;
			showToast({
				type: 'success',
				message: 'Verification code sent to your email'
			});

			// Focus OTP input after transition
			setTimeout(() => {
				otpInputRef?.focus();
			}, 100);
		} catch (err) {
			showToast({
				type: 'error',
				message: 'An unexpected error occurred. Please try again.'
			});
		} finally {
			loading = false;
		}
	}

	async function handleVerifyOtp(code?: string) {
		const codeToVerify = code || otpCode;

		if (codeToVerify.length !== 6) {
			return;
		}

		loading = true;

		try {
			const { error } = await supabase.auth.verifyOtp({
				email,
				token: codeToVerify,
				type: 'email'
			});

			if (error) {
				showToast({
					type: 'error',
					message: error.message || 'Invalid verification code'
				});
				otpInputRef?.clear();
				loading = false;
				return;
			}
			showToast({
				type: 'success',
				message: 'Welcome to ChowBenin!'
			});
			goto(redirectTo);
			await auth.refresh();
		} catch (err) {
			showToast({
				type: 'error',
				message: 'An unexpected error occurred. Please try again.'
			});
			otpInputRef?.clear();
		} finally {
			loading = false;
		}
	}

	async function handleResendOtp() {
		if (resendCooldown > 0) return;

		loading = true;

		try {
			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					shouldCreateUser: true
				}
			});

			if (error) {
				showToast({
					type: 'error',
					message: error.message || 'Failed to resend code'
				});
			} else {
				resendCooldown = 60;
				otpInputRef?.clear();
				showToast({
					type: 'success',
					message: 'New verification code sent'
				});
			}
		} catch (err) {
			showToast({
				type: 'error',
				message: 'Failed to resend code. Please try again.'
			});
		} finally {
			loading = false;
		}
	}

	function handleBackToEmail() {
		step = 'email';
		otpCode = '';
		errors = {};
	}

	function handleEmailKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSendOtp();
		}
	}
</script>

<Seo title="Login - ChowBenin" description="Login to ChowBenin" />

<div class="mt-[50px] flex flex-1 flex-col">
	<Navbar authNav />

	<div class="mx-auto mt-[60px] flex min-h-full w-full flex-1 flex-col px-5 max-w-md">
		{#if step === 'email'}
			<!-- Step 1: Email Input -->
			<div class="mb-[40px]">
				<div class="space-y-[4px]">
					<h2 class="text-[28px] font-extrabold">Welcome to ChowBenin</h2>
					<p class="text-text-muted text-sm">Enter your email to receive a verification code.</p>
				</div>
			</div>

			<div class="flex w-full flex-col space-y-[20px]">
				<div>
					<input
						type="email"
						bind:value={email}
						placeholder={errors.email ? errors.email.join(', ') : 'Email Address'}
						class="bg-surface focus:outline-primary w-full rounded-full px-[20px] py-[18px] {errors.email
							? 'outline outline-error placeholder:text-error'
							: ''}"
						onkeydown={handleEmailKeydown}
						disabled={loading}
					/>
				</div>

				<button
					class="btn rounded-full py-[18px]"
					onclick={handleSendOtp}
					disabled={loading || googleLoading}
				>
					{#if loading}
						<span
							class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
						></span>
						Sending code...
					{:else}
						Continue
					{/if}
				</button>
			</div>

			<div class="my-[30px] flex w-full items-center">
				<hr class="flex-grow border-t border-[#EAEAEA]" />
				<span class="mx-4 text-[#949494]">Or continue with</span>
				<hr class="flex-grow border-t border-[#EAEAEA]" />
			</div>

			<div>
				<button
					onclick={async () => {
						googleLoading = true;
						try {
							await supabase.auth.signInWithOAuth({ provider: 'google' });
						} catch (error) {
							showToast({
								type: 'error',
								message: 'Failed to sign in with Google. Please try again.'
							});
							googleLoading = false;
						}
					}}
					class="btn text-text-body flex w-full items-center justify-center space-x-[8px] rounded-full bg-[#F1F1F1] py-[18px] font-bold"
					disabled={loading || googleLoading}
				>
					{#if googleLoading}
						<span
							class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
						></span>
						<span>Connecting to Google...</span>
					{:else}
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								opacity="0.987"
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M7.209 1.06099C7.934 0.979994 8.363 0.979994 9.142 1.06099C10.5209 1.26509 11.7992 1.90248 12.792 2.88099C12.1211 3.51513 11.4591 4.15852 10.806 4.81099C9.55533 3.75099 8.15933 3.50633 6.618 4.07699C5.48733 4.59699 4.7 5.43966 4.256 6.60499C3.53044 6.06482 2.81433 5.51207 2.108 4.94699C2.05891 4.92116 2.00285 4.9117 1.948 4.91999C3.07 2.75666 4.82333 1.46999 7.208 1.05999"
								fill="#F44336"
							/>
							<path
								opacity="0.997"
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M1.94601 4.91994C2.00267 4.91127 2.05634 4.92027 2.10701 4.94694C2.81334 5.51202 3.52945 6.06477 4.25501 6.60494C4.14083 7.059 4.06886 7.52263 4.04001 7.98994C4.06467 8.44194 4.13634 8.8856 4.25501 9.32094L2.00001 11.1159C1.01801 9.06394 1.00001 6.9986 1.94601 4.91994Z"
								fill="#FFC107"
							/>
							<path
								opacity="0.999"
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M12.6851 13.29C11.9829 12.6708 11.2479 12.0899 10.4831 11.55C11.2497 11.0087 11.7151 10.266 11.8791 9.32199H8.12207V6.71299C10.2887 6.69499 12.4544 6.71332 14.6191 6.76799C15.0297 8.99799 14.5554 11.0087 13.1961 12.8C13.0344 12.9718 12.8632 13.1354 12.6851 13.29Z"
								fill="#448AFF"
							/>
							<path
								opacity="0.993"
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M4.255 9.32202C5.075 11.36 6.57833 12.3114 8.765 12.176C9.37883 12.105 9.96735 11.8905 10.483 11.55C11.2483 12.0914 11.9823 12.6714 12.685 13.29C11.5716 14.2905 10.1521 14.8841 8.658 14.974C8.31854 15.0012 7.97746 15.0012 7.638 14.974C5.09267 14.674 3.21333 13.388 2 11.116L4.255 9.32202Z"
								fill="#43A047"
							/>
						</svg>
						<span> Google </span>
					{/if}
				</button>
			</div>
		{:else}
			<!-- Step 2: OTP Verification -->
			<div class="mb-[32px]">
				<button
					class="mb-6 flex items-center gap-2 text-sm text-text-muted hover:text-text-body transition-colors"
					onclick={handleBackToEmail}
					disabled={loading}
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M15 18L9 12L15 6"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					Back
				</button>

				<div class="space-y-[8px] text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
					>
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
								stroke="#ff5722"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<h2 class="text-[24px] font-extrabold">Check your email</h2>
					<p class="text-text-muted text-sm">
						We sent a 6-digit code to<br />
						<span class="font-medium text-text-body">{email}</span>
					</p>
				</div>
			</div>

			<div class="flex w-full flex-col items-center space-y-[24px]">
				<OtpInput
					bind:this={otpInputRef}
					bind:value={otpCode}
					disabled={loading}
					onComplete={handleVerifyOtp}
				/>

				<button
					class="btn w-full rounded-full py-[18px]"
					onclick={() => handleVerifyOtp()}
					disabled={loading || otpCode.length !== 6}
				>
					{#if loading}
						<span
							class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
						></span>
						Verifying...
					{:else}
						Verify & Sign In
					{/if}
				</button>

				<div class="text-center">
					<p class="text-sm text-text-muted">
						Didn't receive the code?
						{#if resendCooldown > 0}
							<span class="text-text-muted">Resend in {resendCooldown}s</span>
						{:else}
							<button
								class="font-medium text-primary hover:underline disabled:opacity-50"
								onclick={handleResendOtp}
								disabled={loading}
							>
								Resend code
							</button>
						{/if}
					</p>
				</div>

				<div class="mt-4 rounded-xl bg-surface p-4 text-center">
					<p class="text-xs text-text-muted">
						💡 <strong>Tip:</strong> Check your spam folder if you don't see the email. The code expires
						in 10 minutes.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
