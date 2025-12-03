<script lang="ts">
	let { title = 'Contact Us' }: { title?: string } = $props();
</script>

<div>
	<h2 class="text-lg font-bold">{title}</h2>
	<p class="text-text-body mt-2 text-sm leading-relaxed">
		For questions or concerns, please contact us:
	</p>
	<div class="bg-surface text-text-body mt-3 rounded-lg p-4 text-sm">
		<p><strong>Mafflle Technology Enterprise</strong></p>
		<p>7, Oladapo Street, Agbede Olosugbo</p>
		<p>Nigeria</p>
		<p class="mt-2">
			Email:
			<a href="mailto:oluwaseyifunmi@mafflle.com" class="text-primary underline">
				oluwaseyifunmi@mafflle.com
			</a>
		</p>
	</div>
</div>
