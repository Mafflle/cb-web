<script lang="ts">
    const { size = 14, color = 'currentColor' } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
	<g clip-path="url(#clip0_500_134)">
		<path
			d="M2.1875 7H11.8125"
			stroke={color}
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M7 2.1875V11.8125"
			stroke="{color}"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</g>
	<defs>
		<clipPath id="clip0_500_134">
			<rect width="14" height="14" fill="white" />
		</clipPath>
	</defs>
</svg>
