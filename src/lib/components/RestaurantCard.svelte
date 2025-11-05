<script lang="ts">
	import type { Restaurant } from '$lib/types/restaurants.types';
	import { isRestaurantOpen } from '../utils/helpers';

	let { restaurant, fullWidth = false }: { restaurant: Restaurant; fullWidth?: boolean } = $props();
</script>

<div
	class="shadow {fullWidth
		? 'w-full'
		: 'max-w-[300px]'} bg-background overflow-hidden rounded-[16px]"
>
	<a href="/restaurants/{restaurant.slug}" class="w-full">
		<div class="relative h-[{fullWidth ? '150px' : '134px'}] overflow-hidden rounded-t-[16px]">
			{#if !isRestaurantOpen(restaurant.opening_hours as any)}
				<div class="absolute z-10 flex h-full w-full items-center justify-center bg-black/70">
					<span
						class="absolute top-0 left-0 rounded-[4px] rounded-br-[23px] bg-red-600 px-[12px] py-[6px] text-[12px] font-bold text-white"
					>
						CLOSED
					</span>
					<span>
						<iconify-icon icon="mdi:store-off-outline" class="text-surface text-[32px]"
						></iconify-icon>
					</span>
				</div>
			{/if}
			<img src={restaurant.cover_image} alt={restaurant.name} class="h-full w-full object-cover" />
		</div>
	</a>
	<div class=" bg-background flex w-full items-center justify-between p-[16px]">
		<div class="flex items-center gap-[8px]">
			<img
				src={restaurant.logo}
				alt={restaurant.name}
				class="text-text-body h-[20px] w-[20px] rounded-full"
			/>
			<a href="/restaurants/{restaurant.slug}" class="text-h6 font-extrabold font-sans">
				{restaurant.name}
			</a>
		</div>

		<button aria-label="Favorite" class="flex h-[20px] w-[20px]">
			<svg
				width="20"
				height="21"
				viewBox="0 0 20 21"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g clip-path="url(#clip0_176_268)">
					<path
						d="M10 18C10 18 1.875 13.625 1.875 8.46875C1.875 7.34987 2.31947 6.27681 3.11064 5.48564C3.90181 4.69447 4.97487 4.25 6.09375 4.25C7.85859 4.25 9.37031 5.21172 10 6.75C10.6297 5.21172 12.1414 4.25 13.9062 4.25C15.0251 4.25 16.0982 4.69447 16.8894 5.48564C17.6805 6.27681 18.125 7.34987 18.125 8.46875C18.125 13.625 10 18 10 18Z"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</g>
				<defs>
					<clipPath id="clip0_176_268">
						<rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
					</clipPath>
				</defs>
			</svg>
		</button>
	</div>
</div>

<style>
	.shadow {
		/* Box shadow syntax: offset-x | offset-y | blur-radius | spread-radius | color */
		box-shadow: 0 0.5 4 0 rgba(0, 0, 0, 0.12);
	}
</style>
