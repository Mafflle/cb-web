<script lang="ts">
	const {
		title = 'ChowBenin - Online Food Delivery in Benin | Pay with Naira or CFA',
		description = 'ChowBenin is the best online food delivery service in Benin. Order food from your favorite restaurants and pay with Naira or CFA.'
	} = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<!-- TODO: Add seo tags for social media -->
</svelte:head>
