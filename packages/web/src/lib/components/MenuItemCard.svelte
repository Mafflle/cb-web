<script lang="ts">
	import appSettings from '$lib/stores/appSettings.svelte';
	import cart from '$lib/stores/cart.svelte';
	import Minus from './icons/Minus.svelte';
	import Plus from './icons/Plus.svelte';

	let {
		item,
		index,
		restaurant,
		cartItems
	}: {
		item: any;
		index: number;
		restaurant: any;
		cartItems: any[];
	} = $props();
</script>

<div class="flex w-full gap-[12px]">
	<div class="flex flex-col flex-1 min-w-0 justify-between">
		<div>
			<h3 class="mb-[2px] font-medium leading-tight">{item.name}</h3>
			<p class="text-text-muted line-clamp-2 text-[12px] leading-snug">{item.description}</p>
		</div>
		
		<p class="text-text-heading text-[14px] font-medium mt-[6px]">
			{#if item.discount_price}
				<span>{appSettings.formatPrice(item.discount_price)}</span>
				<span class="ml-1 text-[12px] font-light italic line-through">{appSettings.formatPrice(item.price)}</span>
			{:else}
				{appSettings.formatPrice(item.price)}
			{/if}
		</p>

		<div class="mt-[8px]">
			{#if cartItems.find((i) => i.id === item.id)}
				<div class="bg-primary/10 border border-primary inline-flex items-center gap-[10px] rounded-full px-[12px] py-[6px]">
					<button
						aria-label="Remove from cart"
						class="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-primary text-white"
						onclick={() => cart.removeItem(restaurant.id, item.id)}
					>
						<Minus />
					</button>
					<span class="font-bold text-primary min-w-[16px] text-center text-[14px]">{cartItems.find((i) => i.id === item.id).quantity}</span>
					<button
						aria-label="Add to cart"
						class="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-primary text-white"
						onclick={() => cart.addItem(restaurant, item)}
					>
						<Plus />
					</button>
				</div>
			{:else}
				<button
					class="bg-primary text-white inline-flex items-center gap-[6px] rounded-full px-[16px] py-[8px] text-[13px] font-semibold"
					onclick={() => cart.addItem(restaurant, item)}
					aria-label="Add to cart"
				>
					<Plus />
					<span>Add</span>
				</button>
			{/if}
		</div>
	</div>

	<div class="relative h-[120px] w-[120px] flex-shrink-0 overflow-hidden rounded-[12px]">
		{#if item.discount_price}
			<span class="absolute top-0 left-0 z-10 bg-tertiary rounded-br-[12px] px-[10px] py-[4px] text-[11px] font-bold">
				{Math.round(((item.price - item.discount_price) / item.price) * 100)}% OFF
			</span>
		{/if}
		<img
			src={item.image}
			alt="Dish {index + 2}"
			class="h-full w-full rounded-lg object-cover object-center"
		/>
	</div>
</div>