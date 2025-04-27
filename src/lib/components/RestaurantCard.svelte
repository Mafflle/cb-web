<script lang="ts">
	let { details } = $props();
</script>

<a href="/restaurants/{details.slug}">
	<div
		class=" bg-surface border-border flex flex-col rounded-md border shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg"
	>
		<div class="relative h-[150px] overflow-hidden rounded-t-[5px]">
			<img
				src={details.cover_image}
				alt={details.name}
				class="h-full w-full rounded-t-[5px] object-cover transition-all duration-300 ease-in-out hover:scale-105"
				loading="lazy"
			/>
		</div>
		<div class="my-2 flex h-full flex-col space-y-1 p-2">
			<div class="flex flex-1 items-center gap-2">
				<!-- Logo -->
				<img
					src={details.logo}
					alt={details.name}
					class="h-[50px] w-[50px] rounded-full border-2 border-white object-cover"
					loading="lazy"
				/>
				<!-- Restaurant Name -->
				<div>
					<h4 class=" text-lg font-semibold">{details.name}</h4>
					<p class="text-sm text-[#3333338C]">{details.description}</p>
				</div>
			</div>
		</div>
	</div>
</a>
