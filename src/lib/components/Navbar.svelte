<script lang="ts">
	import cart from '$lib/stores/cart.svelte';
	import auth from '$lib/stores/auth.svelte';
	import { clickOutside } from '$lib/utils/clickoutside.svelte';
	import LogoutButton from './LogoutButton.svelte';
	import { goto } from '$app/navigation';

	let { authNav = false }: { authNav?: boolean } = $props();

	let dropdownOpen = $state(false);

	const toggleDropdown = () => {
		dropdownOpen = !dropdownOpen;
	};
</script>

<div class="bg-background sticky top-0 z-50 w-screen border-b rounded-b-[40px] shadow border-gray-200 px-[16px] pb-[16px] pt-[8px] space-y-[20px]">
	<nav class="container mx-auto flex items-center justify-between">
		<div>
			<a href="/" class="">
				<img
					src="/images/logo-primary.svg"
					alt="ChowBenin Logo"
					class="w-[51px]"
					loading="lazy"
					width="100"
					height="40"
				/>
			</a>
		</div>

		{#if !authNav}
			<div class=" flex items-center gap-[12px] p-2">
				<a href="/carts" aria-label="Cart" class="relative flex items-center justify-center rounded-full p-[10px] bg-[#f2f2f2]">
					<img src="/icons/basket.svg" alt="Cart" width="20" height="20" loading="lazy" />

					{#if cart.cartCounts > 0}
						<span
							class="bg-accent-green absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
						>
							{cart.cartCounts}
						</span>
					{/if}
				</a>
				<div class="relative">
					<button
						onclick={auth.currentUser ? toggleDropdown : async () => await goto('/auth/login')}
						class="p-[10px] rounded-full bg-[#f2f2f2]"
						aria-haspopup="true"
						aria-expanded={dropdownOpen}
						aria-label="User menu"
					>
						<img
							src='/icons/user.svg'
							alt=""
							loading="lazy"
							width="20"
							height="20"
						/>
					</button>
					{#if dropdownOpen}
						<div
							class=" absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg focus:outline-none"
							role="menu"
							aria-orientation="vertical"
							aria-labelledby="user-menu"
							use:clickOutside
							onclickoutside={() => (dropdownOpen = false)}
						>
							<a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>Profile</a
							>
							<a href="/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>Orders</a
							>
							<div class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
								<LogoutButton />
							</div>
						</div>
					{/if}
				</div>
				
			</div>
		{/if}
	</nav>

	<div>
		<div class="form-input-icon bg-[#fafafa] group">
			<img src="/icons/search.svg" alt="Search" class="icon" width="20" height="20" loading="lazy">
			<input type="text" placeholder="Search..." class="form-input" />
		</div>
	</div>
</div>
