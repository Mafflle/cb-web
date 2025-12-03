<script lang="ts">
	import network from '$lib/stores/network.svelte';

	let isRefreshing = $state(false);

	async function handleRefresh() {
		isRefreshing = true;
		await network.refresh();
		// Keep spinner for a moment to show activity
		setTimeout(() => {
			isRefreshing = false;
		}, 1000);
	}
</script>

<div class="offline-page">
	<div class="offline-content">
		<!-- Animated illustration -->
		<div class="illustration-container">
			<div class="signal-rings">
				<div class="pulse-ring pulse-ring-1"></div>
				<div class="pulse-ring pulse-ring-2"></div>
				<div class="pulse-ring pulse-ring-3"></div>
			</div>
			<div class="icon-wrapper">
				<iconify-icon
					icon="mdi:wifi-off"
					width="48"
					height="48"
				></iconify-icon>
			</div>
		</div>

		<!-- Content -->
		<div class="text-content">
			<h1>You're Offline</h1>
			<p>
				It looks like you've lost your internet connection. 
				Check your Wi-Fi or mobile data and try again.
			</p>
		</div>

		<!-- Action button -->
		<button
			onclick={handleRefresh}
			class="refresh-btn"
			type="button"
			disabled={isRefreshing}
		>
			{#if isRefreshing}
				<iconify-icon icon="eos-icons:loading" width="22" height="22"></iconify-icon>
				Checking connection...
			{:else}
				<iconify-icon icon="mdi:refresh" width="22" height="22"></iconify-icon>
				Try Again
			{/if}
		</button>

		<!-- Tips -->
		<div class="tips">
			<p class="tips-title">Quick tips:</p>
			<ul>
				<li>
					<iconify-icon icon="mdi:wifi" width="16" height="16"></iconify-icon>
					Check your Wi-Fi connection
				</li>
				<li>
					<iconify-icon icon="mdi:signal-cellular-3" width="16" height="16"></iconify-icon>
					Try switching to mobile data
				</li>
				<li>
					<iconify-icon icon="mdi:airplane-off" width="16" height="16"></iconify-icon>
					Make sure airplane mode is off
				</li>
			</ul>
		</div>
	</div>

	<!-- Logo at bottom -->
	<div class="logo-container">
		<img src="/images/logo-primary.svg" alt="ChowBenin" class="logo" />
	</div>
</div>

<style>
	.offline-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		min-height: 100dvh;
		background: linear-gradient(180deg, #fff9f5 0%, #ffffff 100%);
		padding: 24px;
		position: relative;
	}

	.offline-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		max-width: 400px;
		width: 100%;
	}

	/* Illustration with animated rings */
	.illustration-container {
		position: relative;
		width: 160px;
		height: 160px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 32px;
	}

	.signal-rings {
		position: absolute;
		inset: 0;
	}

	.pulse-ring {
		position: absolute;
		border: 2px solid #ff572233;
		border-radius: 50%;
		animation: pulse-ring 3s ease-out infinite;
	}

	.pulse-ring-1 {
		inset: 30%;
		animation-delay: 0s;
	}

	.pulse-ring-2 {
		inset: 15%;
		animation-delay: 0.5s;
	}

	.pulse-ring-3 {
		inset: 0;
		animation-delay: 1s;
	}

	@keyframes pulse-ring {
		0% {
			opacity: 0.6;
			transform: scale(0.8);
		}
		50% {
			opacity: 0.3;
		}
		100% {
			opacity: 0;
			transform: scale(1.1);
		}
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 88px;
		height: 88px;
		background: linear-gradient(135deg, #ff5722 0%, #ff7a50 100%);
		border-radius: 50%;
		color: white;
		box-shadow: 0 8px 32px rgba(255, 87, 34, 0.3);
	}

	/* Text content */
	.text-content {
		margin-bottom: 32px;
	}

	.text-content h1 {
		font-size: 28px;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 12px 0;
	}

	.text-content p {
		font-size: 16px;
		line-height: 1.6;
		color: #666666;
		margin: 0;
	}

	/* Refresh button */
	.refresh-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 16px 32px;
		background: linear-gradient(135deg, #ff5722 0%, #ff7a50 100%);
		color: white;
		font-size: 16px;
		font-weight: 600;
		border: none;
		border-radius: 50px;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 16px rgba(255, 87, 34, 0.3);
		min-width: 200px;
	}

	.refresh-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 24px rgba(255, 87, 34, 0.4);
	}

	.refresh-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.refresh-btn:disabled {
		opacity: 0.8;
		cursor: not-allowed;
	}

	/* Tips section */
	.tips {
		margin-top: 48px;
		padding: 20px 24px;
		background: #f8f8f8;
		border-radius: 16px;
		width: 100%;
	}

	.tips-title {
		font-size: 14px;
		font-weight: 600;
		color: #888888;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0 0 16px 0;
	}

	.tips ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.tips li {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 14px;
		color: #555555;
		text-align: left;
	}

	.tips li iconify-icon {
		color: #ff5722;
		flex-shrink: 0;
	}

	/* Logo */
	.logo-container {
		position: absolute;
		bottom: 32px;
		left: 50%;
		transform: translateX(-50%);
	}

	.logo {
		height: 28px;
		opacity: 0.6;
	}

	/* Responsive adjustments */
	@media (max-width: 480px) {
		.offline-page {
			padding: 20px;
		}

		.illustration-container {
			width: 140px;
			height: 140px;
			margin-bottom: 24px;
		}

		.icon-wrapper {
			width: 72px;
			height: 72px;
		}

		.icon-wrapper iconify-icon {
			width: 40px;
			height: 40px;
		}

		.text-content h1 {
			font-size: 24px;
		}

		.text-content p {
			font-size: 15px;
		}

		.tips {
			margin-top: 36px;
			padding: 16px 20px;
		}
	}
</style>

