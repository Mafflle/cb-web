<script lang="ts">
	import cart from '$lib/stores/cart.svelte';
	import auth from '$lib/stores/auth.svelte';
	import { clickOutside } from '$lib/utils/clickoutside.svelte';
	import LogoutButton from './LogoutButton.svelte';
	import { goto } from '$app/navigation';
	import { debounce } from '$lib/utils/helpers';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';

	let {
		authNav = false,
		showSearchButton = false,
	}: {
		authNav?: boolean;
		showSearchButton?: boolean;
		searchTerm?: string;
	} = $props();

	let dropdownOpen = $state(false);
	let isScrollingDown = $state(false);
	let isNavbarElevated = $state(true);
	let showSearch = $state(showSearchButton);
	let lastScrollY = $state(0);

	const toggleDropdown = () => {
		dropdownOpen = !dropdownOpen;
	};

	const resetScrollState = () => {
		lastScrollY = window.scrollY;
		isScrollingDown = false;
		isNavbarElevated = true;
		showSearch = showSearchButton;
	};

	const handleScroll = () => {
		const currentScrollY = window.scrollY;
		
		// Only track scroll direction if we have scrolled more than 5 pixels to avoid jitter
		if (Math.abs(currentScrollY - lastScrollY) > 5) {
			isScrollingDown = currentScrollY > lastScrollY && currentScrollY > 50;
			
			// Update navbar state based on scroll direction
			isNavbarElevated = !isScrollingDown;
			showSearch = showSearchButton && !isScrollingDown;
			
			lastScrollY = currentScrollY;
		}
	};

	// Reset scroll state when page changes
	$effect(() => {
		$page.url.pathname;
		resetScrollState();
	});

	onMount(() => {
		lastScrollY = window.scrollY;
		
		const debouncedHandleScroll = debounce(handleScroll, 10);
		window.addEventListener('scroll', debouncedHandleScroll);
		
		return () => {
			window.removeEventListener('scroll', debouncedHandleScroll);
		};
	});
</script>

<div
	class="bg-background sticky top-0 z-20 w-screen px-[16px] pt-[8px] pb-[16px] transition-shadow duration-300 {!authNav ? 'shadow' : ''} {isNavbarElevated && showSearchButton ? ' border-gray-200 border-b rounded-b-[40px]' : ''}"
>
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
				<a
					href="/carts"
					aria-label="Cart"
					class="relative flex items-center justify-center rounded-full bg-surface p-[10px]"
				>
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
						class="rounded-full cursor-pointer bg-surface p-[10px]"
						aria-haspopup="true"
						aria-expanded={dropdownOpen}
						aria-label="User menu"
					>
						<img src="/icons/user.svg" alt="" loading="lazy" width="20" height="20" />
					</button>
					{#if dropdownOpen && auth.currentUser}
						<div
							class=" absolute right-0 z-10 mt-2 w-48 rounded-[12px] bg-white shadow-lg focus:outline-none"
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

	{#if showSearch}
		<div transition:slide class="transition-all duration-300 pt-[20px]">
			<a href="/search" class="form-input-icon w-full flex justify-start group bg-surface border-[#eaeaea] border">
				<img
					src="/icons/search.svg"
					alt="Search"
					class="icon"
					width="20"
					height="20"
					loading="lazy"
				/>
				<div class="form-input bg-inherit flex justify-start">
					<span class="text-black/50">Search ChowBenin</span>
				</div>
			</a>
		</div>
	{/if}
</div>
