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

<div class="flex w-full justify-between gap-[12px]">
	<div>
		<h3 class="mb-[8px] font-medium" style="line-height: 20px;">{item.name}</h3>
		<p class="text-text-muted line-clamp-2 text-[12px]">{item.description}</p>
		<div class="mt-[16px] space-y-[12px]">
			{#if item.discount_price}
				<span
					class="bg-tertiary mt-[16px] rounded-[4px] px-2 py-1 text-xs font-bold"
				>
					{Math.round(((item.price - item.discount_price) / item.price) * 100)}% OFF
				</span>
			{/if}
			<p class="text-text-heading inline-flex text-[14px] font-medium">
				{#if item.discount_price}
					<span class="">{appSettings.formatPrice(item.discount_price)}</span>
					<span class="font-light italic line-through">{appSettings.formatPrice(item.price)}</span><br
					/>
				{:else}
					{appSettings.formatPrice(item.price)}
				{/if}
			</p>
		</div>
	</div>

	<div class="relative h-[138px] w-[180px] overflow-hidden rounded-[16px]">
		<img
			src={item.image}
			alt="Dish {index + 2}"
			class="h-full w-full rounded-lg object-cover object-center"
		/>

		<div class="absolute right-[12px] bottom-[12px] items-center justify-between">
			{#if cartItems.find((i) => i.id === item.id)}
				<div class="bg-background flex items-center gap-3 rounded-full p-[8px]">
					<button
						aria-label="Add to cart"
						class="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#efefef] shadow-sm"
						onclick={() => cart.addItem(restaurant, item)}
					>
						<Plus />
					</button>
					<span class="font-medium">{cartItems.find((i) => i.id === item.id).quantity}</span>
					<button
						aria-label="Remove from cart"
						class="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#efefef] shadow-sm"
						onclick={() => cart.removeItem(restaurant.id, item.id)}
					>
						<Minus />
					</button>
				</div>
			{:else}
				<button
					class="bg-background text-text-body h-[36px] w-[36px] rounded-full p-[10px]"
					onclick={() => cart.addItem(restaurant, item)}
					aria-label="Add to cart"
				>
					<Plus />
				</button>
			{/if}
		</div>

		
	</div>
</div>
