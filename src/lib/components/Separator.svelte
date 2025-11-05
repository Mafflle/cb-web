<script lang="ts">
	const {
		color = "#E0E0E0",
		width = "100%",
		height = "1px",
		py = "0",
		px = "0"
	}: { color?: string; width?: string; height?: string; py?: string; px?: string } = $props();
</script>


<div
	style="background-color: {color}; width: {width}; height: {height}; margin: {py} {px};"
>
    <span class="sr-only">Separator</span>
</div>