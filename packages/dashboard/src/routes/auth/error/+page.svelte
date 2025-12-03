<script lang="ts">
	import { page } from '$app/state';

	// Get error details from URL params if available
	let errorType = $derived(page.url.searchParams.get('type') || 'unknown');
	let errorMessage = $derived(page.url.searchParams.get('message') || '');

	// Error configurations
	const errorConfigs: Record<string, { icon: string; title: string; description: string }> = {
		expired: {
			icon: 'mdi:clock-alert-outline',
			title: 'Link Expired',
			description:
				'This magic link has expired. Magic links are only valid for a short time for your security.'
		},
		invalid: {
			icon: 'mdi:link-off',
			title: 'Invalid Link',
			description:
				'This link is invalid or has already been used. Each magic link can only be used once.'
		},
		email_not_confirmed: {
			icon: 'mdi:email-alert-outline',
			title: 'Email Not Verified',
			description:
				'Please check your email and click the verification link to confirm your account.'
		},
		access_denied: {
			icon: 'mdi:shield-alert-outline',
			title: 'Access Denied',
			description:
				"You don't have permission to access this resource. Please sign in with an authorized account."
		},
		unknown: {
			icon: 'mdi:alert-circle-outline',
			title: 'Authentication Failed',
			description: 'Something went wrong while trying to sign you in. Please try again.'
		}
	};

	let currentError = $derived(errorConfigs[errorType] || errorConfigs.unknown);
</script>

<svelte:head>
	<title>Authentication Error - ChowBenin Dashboard</title>
</svelte:head>

<div class="error-page">
	<div class="error-content">
		<!-- Error Icon -->
		<div class="icon-container">
			<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"
				/>
			</svg>
		</div>

		<!-- Error Message -->
		<h1>{currentError.title}</h1>
		<p class="description">{currentError.description}</p>

		{#if errorMessage}
			<div class="error-details">
				<iconify-icon icon="mdi:information-outline" width="16" height="16"></iconify-icon>
				<span>{errorMessage}</span>
			</div>
		{/if}

		<!-- Actions -->
		<div class="actions">
			<a href="/auth/login" class="btn-primary">
				<iconify-icon icon="mdi:login" width="20" height="20"></iconify-icon>
				Try Again
			</a>
		</div>

		<!-- Help Section -->
		<div class="help-section">
			<p class="help-title">Still having trouble?</p>
			<ul class="help-list">
				<li>
					<iconify-icon icon="mdi:email-refresh-outline" width="18" height="18"></iconify-icon>
					<span>Request a new code from the login page</span>
				</li>
				<li>
					<iconify-icon icon="mdi:clock-outline" width="18" height="18"></iconify-icon>
					<span>Make sure to use the code within a few minutes</span>
				</li>
				<li>
					<iconify-icon icon="mdi:email-check-outline" width="18" height="18"></iconify-icon>
					<span>Check that you're using the most recent email</span>
				</li>
			</ul>
		</div>
	</div>

	<!-- Logo at bottom -->
	<div class="logo-container">
		<img src="/images/logo-primary.svg" alt="ChowBenin" />
	</div>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		min-height: 100dvh;
		background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%);
		padding: 24px;
		text-align: center;
		position: relative;
	}

	.error-content {
		max-width: 420px;
		width: 100%;
	}

	.icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100px;
		height: 100px;
		margin: 0 auto 24px;
		background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
		border-radius: 50%;
		color: white;
		box-shadow: 0 8px 32px rgba(239, 68, 68, 0.25);
	}

	.icon-container svg {
		flex-shrink: 0;
	}

	h1 {
		font-size: 26px;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 12px 0;
	}

	.description {
		font-size: 16px;
		color: #666666;
		line-height: 1.6;
		margin: 0 0 24px 0;
	}

	.error-details {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		background: #fef3c7;
		border-radius: 10px;
		color: #92400e;
		font-size: 13px;
		margin-bottom: 24px;
	}

	.error-details iconify-icon {
		flex-shrink: 0;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 32px;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 16px 24px;
		background: linear-gradient(135deg, var(--color-primary) 0%, #f59e0b 100%);
		color: white;
		font-size: 16px;
		font-weight: 600;
		border: none;
		border-radius: 50px;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 16px rgba(223, 110, 29, 0.3);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 24px rgba(223, 110, 29, 0.4);
	}

	.help-section {
		padding: 24px;
		background: #f8f8f8;
		border-radius: 16px;
		text-align: left;
	}

	.help-title {
		font-size: 14px;
		font-weight: 600;
		color: #888888;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0 0 16px 0;
	}

	.help-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.help-list li {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		font-size: 14px;
		color: #555555;
		line-height: 1.4;
	}

	.help-list li iconify-icon {
		color: var(--color-primary);
		flex-shrink: 0;
		margin-top: 1px;
	}

	.logo-container {
		position: absolute;
		bottom: 32px;
		left: 50%;
		transform: translateX(-50%);
	}

	.logo-container img {
		height: 28px;
		opacity: 0.6;
	}

	@media (max-width: 480px) {
		.error-page {
			padding: 20px;
		}

		.icon-container {
			width: 88px;
			height: 88px;
		}

		.icon-container svg {
			width: 48px;
			height: 48px;
		}

		h1 {
			font-size: 22px;
		}

		.description {
			font-size: 15px;
		}

		.help-section {
			padding: 20px;
		}
	}
</style>
