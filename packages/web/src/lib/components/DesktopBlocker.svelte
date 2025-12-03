<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	let { children } = $props();

	let isDesktop = $state(false);

	$effect(() => {
		if (browser) {
			const checkScreenSize = () => {
				isDesktop = window.innerWidth > 1024;
			};

			checkScreenSize();
			window.addEventListener('resize', checkScreenSize);

			return () => {
				window.removeEventListener('resize', checkScreenSize);
			};
		}
	});
</script>

{#if isDesktop}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
		<div class="flex max-w-md flex-col items-center gap-6 p-8 text-center">
			<img
				src="/images/logo-primary.svg"
				alt="ChowBenin Logo"
				class="w-24"
			/>
			
			<div class="flex flex-col gap-2">
				<h1 class="text-2xl font-extrabold text-gray-900">
					Mobile Experience Only
				</h1>
				<p class="text-gray-600">
					ChowBenin is designed for mobile devices and tablets. Please visit us on your phone or tablet for the best experience.
				</p>
			</div>

			<div class="flex flex-col items-center gap-4 rounded-xl bg-gray-50 p-6">
				<iconify-icon icon="mdi:cellphone" class="text-primary text-5xl"></iconify-icon>
				<div class="text-sm text-gray-500">
					Scan this QR code or visit<br />
					<span class="text-primary font-semibold">{page.url.host}</span><br />
					on your mobile device
				</div>
			</div>

			<div class="mt-4 flex items-center gap-2 text-sm text-gray-400">
				<iconify-icon icon="mdi:information-outline"></iconify-icon>
				<span>Screen width must be 1024px or less</span>
			</div>
		</div>
	</div>
{:else}
	{@render children()}
{/if}
