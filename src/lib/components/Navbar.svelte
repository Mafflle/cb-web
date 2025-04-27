<script lang="ts">
	import cart from '$lib/stores/cart.svelte';
	import auth from '$lib/stores/auth.svelte';
	import { clickOutside } from '$lib/utils/clickoutside.svelte';

	let { authNav = false }: { authNav?: boolean } = $props();

	let dropdownOpen = $state(false);

	const toggleDropdown = () => {
		dropdownOpen = !dropdownOpen;
	};

	let loggingOut = $state(false);

	const logout = async () => {
		loggingOut = true;
		await auth.logout();
		loggingOut = false;
	};
</script>

<div class="bg-background sticky top-0 z-50 w-screen border-b border-gray-200 px-5 lg:px-10">
	<nav class="container mx-auto flex items-center justify-between py-4">
		<div>
			<a href="/" class="">
				<img
					src="/images/logo.svg"
					alt="ChowBenin Logo"
					class=" w-28"
					loading="lazy"
					width="100"
					height="40"
				/>
				<small class="ml-0.5 text-xs">Good Food, Fast 🇧🇯</small>
			</a>
		</div>

		{#if !authNav}
			<div class="bg-surface flex items-center gap-4 rounded-md p-2 shadow-sm">
				<a href="/carts" aria-label="Cart" class="relative">
					<iconify-icon icon="solar:cart-3-outline" width="25" height="25"></iconify-icon>

					{#if cart.cartCounts > 0}
						<span
							class="bg-accent-green absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
						>
							{cart.cartCounts}
						</span>
					{/if}
				</a>
				{#if auth.currentUser}
					<!-- Avatar Icon with dropdown -->
					<div class="relative">
						<button
							onclick={toggleDropdown}
							class="flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none"
							aria-haspopup="true"
							aria-expanded={dropdownOpen}
							aria-label="User menu"
						>
							<iconify-icon icon="qlementine-icons:user-24" width="24" height="24"></iconify-icon>
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
									<button class="btn flex w-full items-center justify-center" onclick={logout}>
										{#if loggingOut}
											<iconify-icon icon="eos-icons:loading" width="16" height="16"></iconify-icon>
										{:else}
											<iconify-icon icon="material-symbols:logout" width="16" height="16"
											></iconify-icon>
										{/if}
										<span class="ml-2">Logout</span>
									</button>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<a href="/auth/login" class="btn px-2 py-1">Login</a>
				{/if}
			</div>
		{/if}
	</nav>
</div>
