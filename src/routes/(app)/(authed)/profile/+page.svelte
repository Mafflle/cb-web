<script lang="ts">
	import { enhance } from '$app/forms';
	import Seo from '$lib/components/Seo.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import LogoutButton from '$lib/components/LogoutButton.svelte';
	import { showToast } from '$lib/utils/toaster.svelte';
	import type { PageProps } from './$types';

	const { data, form }: PageProps = $props();

	let { user, session } = $derived(data);

	let isEditingName = $state(false);
	let isEditingEmail = $state(false);

	let fullName = $derived(user.fullName);
	let email = $derived(user.email || '');

	let savingName = $state(false);
	let savingEmail = $state(false);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const getInitials = (name: string) => {
		if (!name) return '?';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};
</script>

<Seo title="My Profile - ChowBenin" description="View and manage your ChowBenin profile" />

<div class="flex flex-col gap-[24px] max-w-2xl mx-auto">
	<div class="py-[20px]">
		<h3 class="text-[20px] font-extrabold">My Profile</h3>
	</div>

	<!-- Profile Header Card -->
	<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] p-[20px]">
		<div class="flex items-center gap-[16px]">
			<!-- Avatar -->
			{#if user.avatarUrl}
				<img
					src="/images/default-avatar.png"
					alt={user.fullName}
					class="h-[72px] w-[72px] rounded-full object-cover"
				/>
			{:else}
				<div
					class="h-[72px] w-[72px] rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold"
				>
					{getInitials(user.fullName)}
				</div>
			{/if}
			<div class="flex-1">
				<h2 class="text-xl font-extrabold">{user.fullName || 'ChowBenin User'}</h2>
				<p class="text-sm text-text-muted">{user.email}</p>
				<p class="text-xs text-text-muted mt-1">Member since {formatDate(user.createdAt)}</p>
			</div>
		</div>
	</div>

	<!-- Personal Information Card -->
	<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] p-[20px]">
		<h2 class="text-lg font-extrabold mb-[20px]">Personal Information</h2>

		<div class="rounded-[7px] bg-white p-[16px]">
			<!-- Full Name -->
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-xs text-text-muted uppercase">Full Name</p>
					{#if isEditingName}
						<form
							action="?/updateProfile"
							method="POST"
							use:enhance={() => {
								savingName = true;
								return async ({ result, update }) => {
									savingName = false;
									if (result.type === 'success') {
										isEditingName = false;
										showToast({ message: 'Name updated successfully', type: 'success' });
										await update();
									} else if (result.type === 'failure') {
										showToast({
											message: result.data?.error || 'Failed to update name',
											type: 'error'
										});
									}
								};
							}}
							class="flex items-center gap-[8px] mt-[8px]"
						>
							<input
								type="text"
								name="fullName"
								bind:value={fullName}
								class="form-input flex-1"
								placeholder="Enter your full name"
							/>
							<button
								type="submit"
								class="btn btn-primary rounded-full px-[16px] py-[8px] text-sm"
								disabled={savingName}
							>
								{savingName ? 'Saving...' : 'Save'}
							</button>
							<button
								type="button"
								onclick={() => {
									isEditingName = false;
									fullName = user.fullName;
								}}
								class="btn rounded-full px-[16px] py-[8px] text-sm bg-[#f2f2f2]"
							>
								Cancel
							</button>
						</form>
					{:else}
						<p class="font-semibold mt-[4px]">{user.fullName || 'Not set'}</p>
					{/if}
				</div>
				{#if !isEditingName}
					<button
						onclick={() => (isEditingName = true)}
						class="text-primary text-sm font-semibold hover:underline"
					>
						Edit
					</button>
				{/if}
			</div>

			<Separator py="16px" />

			<!-- Email -->
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-xs text-text-muted uppercase">Email Address</p>
					{#if isEditingEmail}
						<form
							action="?/updateEmail"
							method="POST"
							use:enhance={() => {
								savingEmail = true;
								return async ({ result, update }) => {
									savingEmail = false;
									if (result.type === 'success') {
										isEditingEmail = false;
										showToast({
											message: 'Verification email sent. Check your inbox.',
											type: 'success'
										});
										await update();
									} else if (result.type === 'failure') {
										showToast({
											message: result.data?.error || 'Failed to update email',
											type: 'error'
										});
									}
								};
							}}
							class="flex items-center gap-[8px] mt-[8px]"
						>
							<input
								type="email"
								name="email"
								bind:value={email}
								class="form-input flex-1"
								placeholder="Enter your email"
							/>
							<button
								type="submit"
								class="btn btn-primary rounded-full px-[16px] py-[8px] text-sm"
								disabled={savingEmail}
							>
								{savingEmail ? 'Saving...' : 'Save'}
							</button>
							<button
								type="button"
								onclick={() => {
									isEditingEmail = false;
									email = user.email || '';
								}}
								class="btn rounded-full px-[16px] py-[8px] text-sm bg-[#f2f2f2]"
							>
								Cancel
							</button>
						</form>
					{:else}
						<p class="font-semibold mt-[4px]">{user.email}</p>
					{/if}
				</div>
				{#if !isEditingEmail}
					<button
						onclick={() => (isEditingEmail = true)}
						class="text-primary text-sm font-semibold hover:underline"
					>
						Edit
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Quick Links Card -->
	<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] p-[20px]">
		<h2 class="text-lg font-extrabold mb-[20px]">Quick Links</h2>

		<div class="rounded-[7px] bg-white p-[16px]">
			<a href="/orders" class="flex items-center justify-between py-[8px] group">
				<div class="flex items-center gap-[12px]">
					<div class="h-[40px] w-[40px] rounded-full bg-[#f2f2f2] flex items-center justify-center">
						<iconify-icon icon="mdi:receipt-text-outline" width="20" height="20"></iconify-icon>
					</div>
					<span class="font-semibold">My Orders</span>
				</div>
				<iconify-icon
					icon="mdi:chevron-right"
					width="24"
					height="24"
					class="text-text-muted group-hover:text-primary transition-colors"
				></iconify-icon>
			</a>

			<Separator py="8px" />

			<a href="/carts" class="flex items-center justify-between py-[8px] group">
				<div class="flex items-center gap-[12px]">
					<div class="h-[40px] w-[40px] rounded-full bg-[#f2f2f2] flex items-center justify-center">
						<iconify-icon icon="mdi:cart-outline" width="20" height="20"></iconify-icon>
					</div>
					<span class="font-semibold">My Carts</span>
				</div>
				<iconify-icon
					icon="mdi:chevron-right"
					width="24"
					height="24"
					class="text-text-muted group-hover:text-primary transition-colors"
				></iconify-icon>
			</a>
		</div>
	</div>

	<!-- Logout Card -->
	<div class="border-border flex flex-col rounded-lg border bg-[#fafafa] p-[20px]">
		<div class="rounded-[7px] bg-white p-[16px]">
			<LogoutButton />
		</div>
	</div>
</div>
