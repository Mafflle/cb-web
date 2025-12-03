<script lang="ts">
	import { replaceState, goto, afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import RestaurantCard from '$lib/components/RestaurantCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageProps } from './$types';
	import { debounce } from '@chowbenin/shared/utils';
	import restaurantRepository from '$lib/repositories/restaurant.repository';

	const { data }: PageProps = $props();

	let searchQuery = $state(data.query || '');
	let restaurants = $state(data.restaurants || []);
	let items = $state(data.items || []);
	let activeTab: 'all' | 'restaurants' | 'items' = $state('all');
	let isSearching = $state(false);

	// Sync with server data on initial load or navigation
	$effect(() => {
		searchQuery = data.query || '';
		restaurants = data.restaurants || [];
		items = data.items || [];
	});

	const performSearch = async (query: string) => {
		const trimmedQuery = query.trim();
		
		const url = new URL(page.url);
		if (trimmedQuery) {
			url.searchParams.set('q', trimmedQuery);
		} else {
			url.searchParams.delete('q');
		}
		replaceState(url, {});

		if (trimmedQuery.length === 0) {
			restaurants = [];
			items = [];
			return;
		}

		isSearching = true;
		try {
			const results = await restaurantRepository.searchAll(data.supabase, trimmedQuery);
			restaurants = results.restaurants;
			items = results.items;
		} catch (err) {
			console.error('Search error:', err);
			restaurants = [];
			items = [];
		} finally {
			isSearching = false;
		}
	};

	const debouncedSearch = debounce(performSearch, 400);

	const handleSearchInput = (event: Event) => {
		const input = event.target as HTMLInputElement;
		searchQuery = input.value;
		debouncedSearch(searchQuery);
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			performSearch(searchQuery);
		}
	};

	const clearSearch = () => {
		searchQuery = '';
		restaurants = [];
		items = [];
		const url = new URL(page.url);
		url.searchParams.delete('q');
		replaceState(url, {});
	};

	const closeSearch = () => {
		goto('/');
	};

	const hasResults = $derived(restaurants.length > 0 || items.length > 0);
	const showRestaurants = $derived(activeTab === 'all' || activeTab === 'restaurants');
	const showItems = $derived(activeTab === 'all' || activeTab === 'items');
</script>

<Seo title="Search - ChowBenin" description="Search for restaurants and food items on ChowBenin" />

<main class="min-h-[60vh]">
	<!-- Search Header -->
	<div class="mb-6">
		<div class="flex items-center justify-between mb-4">
			<h1 class="text-xl font-bold">Search</h1>
			<button
				onclick={closeSearch}
				class="p-2 rounded-full hover:bg-gray-100 transition-colors"
				aria-label="Close search"
			>
				<iconify-icon icon="mdi:close" width="24" height="24"></iconify-icon>
			</button>
		</div>
		
		<!-- Search Input -->
		<div class="search-input-container w-full bg-surface border-[#eaeaea] border">
			<img
				src="/icons/search.svg"
				alt="Search"
				class="icon"
				width="20"
				height="20"
				loading="lazy"
			/>
			<input
				type="text"
				class="search-input"
				placeholder="Search restaurants or dishes..."
				bind:value={searchQuery}
				oninput={handleSearchInput}
				onkeydown={handleKeyDown}
			/>
			{#if isSearching}
				<iconify-icon icon="eos-icons:loading" width="20" height="20" class="text-primary"></iconify-icon>
			{:else if searchQuery.length > 0}
				<button
					class="p-1 hover:bg-gray-200 rounded-full transition-colors"
					onclick={clearSearch}
					aria-label="Clear search"
				>
					<iconify-icon icon="mdi:close" width="20" height="20"></iconify-icon>
				</button>
			{/if}
		</div>
	</div>

	<!-- Tab Navigation -->
	{#if searchQuery.length > 0 && hasResults}
		<div class="flex gap-2 mb-6 border-b border-gray-200">
			<button
				class="px-4 py-2 font-medium transition-colors {activeTab === 'all'
					? 'text-primary border-b-2 border-primary'
					: 'text-gray-500 hover:text-gray-700'}"
				onclick={() => (activeTab = 'all')}
			>
				All
				<span class="ml-1 text-sm text-gray-400">({restaurants.length + items.length})</span>
			</button>
			<button
				class="px-4 py-2 font-medium transition-colors {activeTab === 'restaurants'
					? 'text-primary border-b-2 border-primary'
					: 'text-gray-500 hover:text-gray-700'}"
				onclick={() => (activeTab = 'restaurants')}
			>
				Restaurants
				<span class="ml-1 text-sm text-gray-400">({restaurants.length})</span>
			</button>
			<button
				class="px-4 py-2 font-medium transition-colors {activeTab === 'items'
					? 'text-primary border-b-2 border-primary'
					: 'text-gray-500 hover:text-gray-700'}"
				onclick={() => (activeTab = 'items')}
			>
				Dishes
				<span class="ml-1 text-sm text-gray-400">({items.length})</span>
			</button>
		</div>
	{/if}

	<!-- Search Results -->
	{#if isSearching}
		<!-- Loading state -->
		<div class="flex flex-col items-center justify-center py-16">
			<iconify-icon icon="eos-icons:loading" width="40" height="40" class="text-primary"></iconify-icon>
			<p class="text-sm text-gray-500 mt-4">Searching...</p>
		</div>
	{:else if searchQuery.length === 0}
		<!-- Empty state - no search query -->
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<img
				src="/icons/search.svg"
				alt="Search"
				class="w-16 h-16 mb-4 opacity-30"
				loading="lazy"
			/>
			<p class="text-lg text-gray-500">Start typing to search for restaurants or dishes</p>
			<p class="text-sm text-gray-400 mt-2">Try "jollof", "shawarma", or a restaurant name</p>
		</div>
	{:else if !hasResults}
		<!-- No results found -->
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<iconify-icon icon="mdi:magnify-close" width="64" height="64" class="text-gray-300 mb-4"></iconify-icon>
			<p class="text-lg text-gray-500">No results found for "{searchQuery}"</p>
			<p class="text-sm text-gray-400 mt-2">Try different keywords or check for typos</p>
			<a href="/" class="btn mt-6">Browse All Restaurants</a>
		</div>
	{:else}
		<!-- Results found -->
		<div class="space-y-8">
			<!-- Restaurants Section -->
			{#if showRestaurants && restaurants.length > 0}
				<section>
					{#if activeTab === 'all'}
						<h2 class="text-lg font-bold mb-4 flex items-center gap-2">
							<iconify-icon icon="mdi:store" width="24" height="24"></iconify-icon>
							Restaurants
						</h2>
					{/if}
					<div
						class="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-x-[10px] lg:grid-cols-4 lg:gap-x-[16px]"
					>
						{#each restaurants as restaurant (restaurant.id)}
							<RestaurantCard {restaurant} fullWidth />
						{/each}
					</div>
				</section>
			{/if}

			<!-- Items Section -->
			{#if showItems && items.length > 0}
				<section>
					{#if activeTab === 'all'}
						<h2 class="text-lg font-bold mb-4 flex items-center gap-2">
							<iconify-icon icon="mdi:food" width="24" height="24"></iconify-icon>
							Dishes
						</h2>
					{/if}
					<div
						class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
					>
						{#each items as item (item.id)}
							<a
								href="/restaurants/{item.restaurant?.slug}"
								class="bg-surface border-border rounded-lg border p-4 shadow-md transition-all hover:shadow-lg"
							>
								<div class="relative mb-4 h-[150px] overflow-hidden rounded-lg">
									<img
										src={item.image}
										alt={item.name}
										class="h-full w-full rounded-lg object-cover"
										loading="lazy"
									/>
									{#if item.discount_price}
										<span
											class="bg-accent-green absolute top-2 right-2 rounded px-2 py-1 text-xs font-bold text-white"
										>
											-{Math.round(((item.price - item.discount_price) / item.price) * 100)}%
										</span>
									{/if}
								</div>

								<div>
									<h3 class="text-lg font-bold">{item.name}</h3>
									{#if item.description}
										<p class="line-clamp-2 text-gray-600 text-sm">{item.description}</p>
									{/if}
								</div>

								<!-- Price and Restaurant info -->
								<div class="mt-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										{#if item.restaurant?.logo}
											<img
												src={item.restaurant.logo}
												alt={item.restaurant.name}
												class="h-5 w-5 rounded-full object-cover"
												loading="lazy"
											/>
										{/if}
										<span class="text-xs text-gray-500">{item.restaurant?.name}</span>
									</div>
									<div class="text-right">
										{#if item.discount_price}
											<span class="text-sm text-gray-400 line-through">
												₦{item.price.toLocaleString()}
											</span>
											<span class="ml-1 font-bold text-primary">
												₦{item.discount_price.toLocaleString()}
											</span>
										{:else}
											<span class="font-bold text-primary">
												₦{item.price.toLocaleString()}
											</span>
										{/if}
									</div>
								</div>
							</a>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{/if}
</main>

<style>
	.search-input-container {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		padding-left: 20px;
		padding-right: 20px;
		height: 52px;
		border-radius: 9999px;
		transition: all 0.2s ease;
	}

	.search-input-container:focus-within {
		outline: 1px solid var(--color-primary);
		background-color: white;
		box-shadow: 0 0 0 4px rgba(223, 110, 29, 0.39);
	}

	.search-input {
		flex: 1;
		background: inherit;
		border: none;
		outline: none;
		padding: 10px 0;
		font-size: 1rem;
	}

	.search-input::placeholder {
		color: #949494;
	}
</style>