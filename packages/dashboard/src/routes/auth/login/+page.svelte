<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import OtpInput from '$lib/components/OtpInput.svelte';
	import { showToast } from '$lib/utils/toaster.svelte.js';
	import { onMount } from 'svelte';
	import auth from '$lib/stores/auth.svelte.js';

	// State
	let step: 'email' | 'otp' = $state('email');
	let email = $state('');
	let otpCode = $state('');
	let loading = $state(false);
	let errors: Record<string, string[]> = $state({});
	let resendCooldown = $state(0);
	let otpInputRef: OtpInput | undefined = $state(undefined);

	// Validate redirectTo to prevent open redirect attacks
	let rawRedirectTo = page.url.searchParams.get('redirectTo') || '/';
	let redirectTo: string =
		rawRedirectTo.startsWith('/') && !rawRedirectTo.startsWith('//') ? rawRedirectTo : '/';

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
					shouldCreateUser: false
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
			await tick();
			otpInputRef?.focus();
		} catch {
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
				message: 'Welcome to ChowBenin Dashboard!'
			});
			goto(redirectTo);
			await auth.refresh();
		} catch {
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
					shouldCreateUser: false
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
		} catch {
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

<svelte:head>
	<title>Login - ChowBenin Dashboard</title>
	<meta name="description" content="Login to ChowBenin Restaurant Dashboard" />
</svelte:head>

<div class="login-page">
	<div class="login-container">
		<!-- Logo -->
		<div class="logo-section">
			<img src="/images/logo-primary.svg" alt="ChowBenin" class="logo" />
			<span class="badge">Restaurant Dashboard</span>
		</div>

		{#if step === 'email'}
			<!-- Step 1: Email Input -->
			<div class="form-section">
				<div class="header">
					<h1>Welcome back</h1>
					<p>Enter your email to access your restaurant dashboard.</p>
				</div>

				<div class="form">
					<div class="input-group">
						<input
							type="email"
							bind:value={email}
							placeholder={errors.email ? errors.email.join(', ') : 'Email Address'}
							class="input"
							class:error={errors.email}
							onkeydown={handleEmailKeydown}
							disabled={loading}
						/>
					</div>

					<button class="btn-primary" onclick={handleSendOtp} disabled={loading}>
						{#if loading}
							<span class="spinner"></span>
							Sending code...
						{:else}
							Continue
						{/if}
					</button>
				</div>
			</div>
		{:else}
			<!-- Step 2: OTP Verification -->
			<div class="form-section">
				<button class="back-button" onclick={handleBackToEmail} disabled={loading}>
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

				<div class="header otp-header">
					<div class="email-icon">
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<h1>Check your email</h1>
					<p>
						We sent a 6-digit code to<br />
						<strong>{email}</strong>
					</p>
				</div>

				<div class="form otp-form">
					<OtpInput
						bind:this={otpInputRef}
						bind:value={otpCode}
						disabled={loading}
						onComplete={handleVerifyOtp}
					/>

					<button
						class="btn-primary"
						onclick={() => handleVerifyOtp()}
						disabled={loading || otpCode.length !== 6}
					>
						{#if loading}
							<span class="spinner"></span>
							Verifying...
						{:else}
							Verify & Sign In
						{/if}
					</button>

					<div class="resend-section">
						<p>
							Didn't receive the code?
							{#if resendCooldown > 0}
								<span class="cooldown">Resend in {resendCooldown}s</span>
							{:else}
								<button class="resend-button" onclick={handleResendOtp} disabled={loading}>
									Resend code
								</button>
							{/if}
						</p>
					</div>

					<div class="tip-box">
						<p>
							💡 <strong>Tip:</strong> Check your spam folder if you don't see the email. The code expires
							in 10 minutes.
						</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="footer">
			<p>Only authorized restaurant staff can access this dashboard.</p>
		</div>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #f1f1f1 100%);
	}

	.login-container {
		width: 100%;
		max-width: 420px;
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.logo-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.logo {
		height: 48px;
	}

	.badge {
		display: inline-flex;
		padding: 6px 12px;
		background: var(--color-primary);
		color: white;
		font-size: 12px;
		font-weight: 600;
		border-radius: 20px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.form-section {
		background: white;
		border-radius: 24px;
		padding: 32px;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -2px rgba(0, 0, 0, 0.1);
	}

	.header {
		text-align: center;
		margin-bottom: 24px;
	}

	.header h1 {
		font-size: 24px;
		font-weight: 700;
		color: var(--color-text-heading);
		margin: 0 0 8px 0;
	}

	.header p {
		font-size: 14px;
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.5;
	}

	.otp-header {
		margin-bottom: 32px;
	}

	.email-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		margin: 0 auto 16px;
		background: linear-gradient(135deg, var(--color-primary) 0%, #f59e0b 100%);
		border-radius: 50%;
		color: white;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.otp-form {
		align-items: center;
	}

	.input-group {
		width: 100%;
	}

	.input {
		width: 100%;
		padding: 16px 20px;
		font-size: 16px;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		background: #f9fafb;
		transition: all 0.2s ease;
	}

	.input:focus {
		outline: none;
		border-color: var(--color-primary);
		background: white;
		box-shadow: 0 0 0 3px rgba(223, 110, 29, 0.1);
	}

	.input.error {
		border-color: var(--color-error);
	}

	.input.error::placeholder {
		color: var(--color-error);
	}

	.btn-primary {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 16px 24px;
		background: linear-gradient(135deg, var(--color-primary) 0%, #f59e0b 100%);
		color: white;
		font-size: 16px;
		font-weight: 600;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 14px rgba(223, 110, 29, 0.3);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(223, 110, 29, 0.4);
	}

	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid white;
		border-right-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.back-button {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 8px 0;
		margin-bottom: 16px;
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: 14px;
		cursor: pointer;
		transition: color 0.2s ease;
	}

	.back-button:hover {
		color: var(--color-text-body);
	}

	.resend-section {
		text-align: center;
	}

	.resend-section p {
		font-size: 14px;
		color: var(--color-text-muted);
	}

	.cooldown {
		color: var(--color-text-muted);
	}

	.resend-button {
		background: none;
		border: none;
		color: var(--color-primary);
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}

	.resend-button:hover {
		text-decoration: underline;
	}

	.resend-button:disabled {
		opacity: 0.5;
	}

	.tip-box {
		width: 100%;
		padding: 16px;
		background: #f9fafb;
		border-radius: 12px;
		text-align: center;
	}

	.tip-box p {
		font-size: 13px;
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.5;
	}

	.footer {
		text-align: center;
	}

	.footer p {
		font-size: 13px;
		color: var(--color-text-muted);
		margin: 0;
	}

	/* Responsive adjustments for larger screens */
	@media (min-width: 640px) {
		.login-container {
			max-width: 480px;
		}

		.form-section {
			padding: 40px;
		}

		.header h1 {
			font-size: 28px;
		}

		.logo {
			height: 56px;
		}
	}

	/* Mobile adjustments */
	@media (max-width: 400px) {
		.login-page {
			padding: 16px;
		}

		.form-section {
			padding: 24px;
		}

		.header h1 {
			font-size: 22px;
		}
	}
</style>
