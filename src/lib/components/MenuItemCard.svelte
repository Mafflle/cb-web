<script lang="ts">
	import appSettings from '$lib/stores/appSettings.svelte';
	import cart from '$lib/stores/cart.svelte';

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

<div
	class="border-border bg-surface rounded-lg border p-4 shadow-md transition-all hover:shadow-lg"
>
	<div class="relative mb-4 h-[200px] overflow-hidden rounded-lg">
		<img
			src={item.image}
			alt="Dish {index + 2}"
			class="mb-4 h-full w-full rounded-lg object-cover"
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
		<p class="line-clamp-3 text-gray-600">{item.description}</p>
	</div>

	<!-- Buttons to increase/decrease quantity and add to cart -->

	<div class="mt-4 flex items-center justify-between">
		<p class="text-text-heading text-sm font-bold">
			{#if item.discount_price}
				<span class=" line-through">{appSettings.formatPrice(item.price)}</span><br />
				<span class="">{appSettings.formatPrice(item.discount_price)}</span>
			{:else}
				{appSettings.formatPrice(item.price)}
			{/if}
		</p>
		{#if cartItems.find((i) => i.id === item.id)}
			<div class="flex items-center gap-2">
				<button
					aria-label="Remove from cart"
					class="bg-primary hover:bg-primary rounded px-2 py-1 text-white"
					onclick={() => cart.removeItem(restaurant.id, item.id)}
				>
					-
				</button>
				<span class="text-lg font-bold">{cartItems.find((i) => i.id === item.id).quantity}</span>
				<button
					aria-label="Add to cart"
					class="bg-primary hover:bg-primary rounded px-2 py-1 text-white"
					onclick={() => cart.addItem(restaurant, item)}
				>
					+
				</button>
			</div>
		{:else}
			<button class="btn" onclick={() => cart.addItem(restaurant, item)}> Add to Cart </button>
		{/if}
	</div>
</div>
