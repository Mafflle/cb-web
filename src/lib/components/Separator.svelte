<script lang="ts">
	const {
		color = "#E0E0E0",
		width = "100%",
		height = "1px",
		py = "0",
		px = "0",
		variant = "solid"
	}: {
		color?: string;
		width?: string;
		height?: string;
		py?: string;
		px?: string;
		variant?: "solid" | "dashed" | "dotted";
	} = $props();
</script>

{#if variant === "solid"}
	<div
		style="background-color: {color}; width: {width}; height: {height}; margin: {py} {px};"
	>
		<span class="sr-only">Separator</span>
	</div>
{:else}
	<div
		style="width: {width}; height: 0; border-top: {height} {variant} {color}; margin: {py} {px};"
	>
		<span class="sr-only">Separator</span>
	</div>
{/if}