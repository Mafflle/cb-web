<script lang="ts">
	import type { Restaurant } from '$lib/types/restaurants.types';
	import { showToast } from '../utils/toaster.svelte';
	import appSettings from '$lib/stores/appSettings.svelte';

	let { restaurant, fullWidth = false }: { restaurant: Restaurant; fullWidth?: boolean } = $props();
</script>

<div class={fullWidth ? 'w-full' : 'max-w-[300px]'}>
	<a href="/restaurants/{restaurant.slug}" class="w-full">
		<div class="relative h-[164px] overflow-hidden rounded-[16px]">
			<img src={restaurant.cover_image} alt={restaurant.name} class="h-full w-full object-cover" />
		</div>
	</a>
	<div class="mt-[12px] flex items-center justify-between px-[4px]">
		<div class="flex flex-col gap-[10px]">
			<h4 class=" text-[16px] font-[700]">{restaurant.name}</h4>
			<div>
				<div class="text-text-muted flex items-center text-[14px]">
					<img
						src="/icons/bike.svg"
						alt="Delivery"
						height="18"
						width="18"
						class="mr-[6px] inline-block"
					/>
					<span>Starts {appSettings.formatPrice(restaurant.start_price)}</span>
					<span class="mx-[6px]">•</span>
					<!-- Format preparation_time to 30 mins -->
					<span>
						{restaurant.preparation_time} {restaurant.preparation_time === 1 ? 'min' : 'mins'}
					</span>
				</div>
			</div>
		</div>
		<div>
			<button onclick={() => showToast({ message: 'Feature coming soon!', type: 'info' })}>
				<img src="/icons/heart.svg" alt="Favorite" height="20" width="20" />
			</button>
		</div>
	</div>
</div>
