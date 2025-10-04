<script lang="ts">
	const {
		color,
		width,
		height,
		py,
		px
	}: { color: string; width: string; height: string; py: string; px: string } = $props();
</script>


<div
	style="background-color: {color}; width: {width}; height: {height}; margin: {py} {px};"
>
    <span class="sr-only">Separator</span>
</div>