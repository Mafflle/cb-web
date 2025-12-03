<script lang="ts">
	import cart from '$lib/stores/cart.svelte';
	import auth from '$lib/stores/auth.svelte';
	import { clickOutside } from '$lib/utils/clickoutside.svelte';
	import LogoutButton from './LogoutButton.svelte';
	import { goto } from '$app/navigation';
	import { debounce } from '$lib/utils/helpers';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { page } from '$app/state';

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
	let scrollDirection = $state<'up' | 'down' | null>(null);

	const toggleDropdown = () => {
		dropdownOpen = !dropdownOpen;
	};

	const resetScrollState = () => {
		lastScrollY = window.scrollY;
		isScrollingDown = false;
		isNavbarElevated = true;
		showSearch = showSearchButton;
		scrollDirection = null;
	};

	const handleScroll = () => {
		const currentScrollY = window.scrollY;
		const scrollDelta = currentScrollY - lastScrollY;
		
		const threshold = 10;
		
		if (scrollDelta > threshold) {
			scrollDirection = 'down';
		} else if (scrollDelta < -threshold) {
			scrollDirection = 'up';
		}
		
		if (scrollDirection && currentScrollY > 50) {
			const newIsScrollingDown = scrollDirection === 'down';
			
			if (isScrollingDown !== newIsScrollingDown) {
				isScrollingDown = newIsScrollingDown;
				isNavbarElevated = !isScrollingDown;
				showSearch = showSearchButton && !isScrollingDown;
			}
		} else if (currentScrollY <= 50) {
			isScrollingDown = false;
			isNavbarElevated = true;
			showSearch = showSearchButton;
		}
		
		lastScrollY = currentScrollY;
	};

	$effect(() => {
		page.url.pathname;
		resetScrollState();
		dropdownOpen = false;
	});

	onMount(() => {
		lastScrollY = window.scrollY;
		
		const debouncedHandleScroll = debounce(handleScroll, 16);
		window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
		
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

				{#if auth.currentUser}
					<div class="relative">
						<button
							onclick={toggleDropdown}
							class="rounded-full cursor-pointer bg-surface p-[10px]"
							aria-haspopup="true"
							aria-expanded={dropdownOpen}
							aria-label="User menu"
						>
							<img src="/icons/user.svg" alt="" loading="lazy" width="20" height="20" />
						</button>
						{#if dropdownOpen}
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
								<a href="/favorites" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									>Favorites</a
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
				{:else}
					<a
						href="/auth/login"
						class="btn py-[10px] text-sm font-extrabold"
					>
						Login
					</a>
				{/if}
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
