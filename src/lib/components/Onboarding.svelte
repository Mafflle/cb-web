<script lang="ts">
	import { browser } from '$app/environment';
	import { fade, fly } from 'svelte/transition';

	const ONBOARDING_KEY = 'chowbenin_onboarding_completed';

	let showOnboarding = $state(false);
	let currentSlide = $state(0);

	const slides = [
		{
			emoji: '👋',
			title: 'Welcome to ChowBenin',
			description: 'Your favorite food, delivered fast to your doorstep in Benin.'
		},
		{
			emoji: '🍽️',
			title: 'Browse Restaurants',
			description: 'Discover amazing local restaurants and explore their delicious menus.'
		},
		{
			emoji: '🛵',
			title: 'Fast Delivery',
			description: 'Place your order and get it delivered right to you. Simple and easy!'
		}
	];

	$effect(() => {
		if (browser) {
			const completed = localStorage.getItem(ONBOARDING_KEY);
			showOnboarding = !completed;
		}
	});

	const nextSlide = () => {
		if (currentSlide < slides.length - 1) {
			currentSlide++;
		} else {
			completeOnboarding();
		}
	};

	const prevSlide = () => {
		if (currentSlide > 0) {
			currentSlide--;
		}
	};

	const completeOnboarding = () => {
		if (browser) {
			localStorage.setItem(ONBOARDING_KEY, 'true');
		}
		showOnboarding = false;
	};

	const goToSlide = (index: number) => {
		currentSlide = index;
	};
</script>

{#if showOnboarding}
	<div
		class="fixed inset-0 z-50 flex flex-col bg-white"
		transition:fade={{ duration: 200 }}
	>
		<!-- Skip button -->
		<div class="flex justify-end p-4">
			<button
				onclick={completeOnboarding}
				class="text-sm text-text-muted font-medium px-4 py-2"
			>
				Skip
			</button>
		</div>

		<!-- Slide content -->
		<div class="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden relative">
			{#key currentSlide}
				<div
					class="flex flex-col items-center text-center absolute"
					in:fly={{ x: 50, duration: 300, delay: 150 }}
					out:fly={{ x: -50, duration: 150 }}
				>
					<div class="text-[80px] mb-8">
						{slides[currentSlide].emoji}
					</div>
					<h1 class="text-2xl font-extrabold mb-4">
						{slides[currentSlide].title}
					</h1>
					<p class="text-text-muted text-base max-w-[280px]">
						{slides[currentSlide].description}
					</p>
				</div>
			{/key}
		</div>

		<!-- Bottom section -->
		<div class="p-8 pb-12">
			<!-- Dot indicators -->
			<div class="flex justify-center gap-2 mb-8">
				{#each slides as _, index}
					<button
						onclick={() => goToSlide(index)}
						class="w-2 h-2 rounded-full transition-all duration-300 {index === currentSlide
							? 'bg-primary w-6'
							: 'bg-gray-300'}"
						aria-label="Go to slide {index + 1}"
					></button>
				{/each}
			</div>

			<!-- Navigation buttons -->
			<div class="flex gap-3">
				<button
					onclick={prevSlide}
					class="btn rounded-full flex-1 bg-[#f2f2f2] text-black transition-opacity duration-200 {currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}"
				>
					Back
				</button>
				<button
					onclick={nextSlide}
					class="btn btn-primary rounded-full flex-1"
				>
					{currentSlide === slides.length - 1 ? "Get Started" : "Next"}
				</button>
			</div>
		</div>
	</div>
{/if}
