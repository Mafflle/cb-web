<script lang="ts">
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { enhance } from '$app/forms';
	import { showToast } from '$lib/utils/toaster.svelte.js';
	import { onMount } from 'svelte';

	let loading = $state(false);
	let errors: Record<string, string[]> = $state({});
	let redirectTo: string = page.url.searchParams.get('redirectTo') || '/';

	let {data} = $props()
	const { supabase } = $derived(data);

	onMount(() => {
		if (window.location.hash) {
			const hash = new URLSearchParams(window.location.hash.slice(1));
			const errorDescription = hash.get('error_description');
			if (errorDescription) {
				showToast({
					type: 'error',
					message: errorDescription
				});
				window.location.hash = '';
			}
		}
	})
</script>

<Seo title="Login - ChowBenin" description="Login to ChowBenin" />
<div class=" mt-[50px] flex flex-1 flex-col">
	<Navbar authNav />
	<div class="mx-auto mt-[60px] flex min-h-full w-full flex-1 flex-col px-5">
		<div class="mb-[40px]">
			<div class="flex items-center justify-between">
				<div class="space-y-[4px]">
					<h2 class="text-[28px] font-extrabold">Welcome to ChowBenin</h2>
					<p class="text-text-muted text-sm">Please enter your email to get a login link.</p>
				</div>
			</div>
		</div>

		<form
			class="flex w-full flex-col space-y-[20px]"
			method="POST"
			use:enhance={() => {
				loading = true;
				errors = {};
				return async ({ result, update }) => {
					if (result.type === 'success') {
						const data = result.data;
						if (data && data.success) {
							showToast({
								type: 'success',
								message: 'Login link sent to your email.'
							});
							update();
						} else {
							showToast({
								type: 'error',
								message: 'Failed to send login link. Please try again.'
							});
						}
					} else if (result.type === 'failure') {
						errors = (result.data?.errors as Record<string, string[]>) || {};
						if (errors.general) {
							errors.general.forEach((msg) => {
								showToast({
									type: 'error',
									message: msg
								});
							});
						}
					} else {
						showToast({
							type: 'error',
							message: 'An unexpected error occurred. Please try again.'
						});
					}

					loading = false;
				};
			}}
		>
			<div>
				<input type="text" name="redirectTo" value={redirectTo} class="hidden">
				<input
					type="text"
					placeholder={errors.email ? 'Email Address - ' + errors.email.join(', ') : 'Email Address'}
					class="bg-surface focus:outline-primary w-full rounded-full px-[20px] py-[18px] {errors.email ? 'outline outline-error placeholder:text-error' : ''}"
					name="email"
				/>
			</div>
			<button class="btn rounded-full py-[18px]">Continue</button>
		</form>

		<div class="my-[30px] flex w-full items-center">
			<hr class="borded flex-grow border-t border-[#EAEAEA]" />
			<span class="mx-4 text-[#949494]">Or continue with</span>
			<hr class="flex-grow border border-t border-[#EAEAEA]" />
		</div>

		<div>
			<button
				onclick={async () => {
					await supabase.auth.signInWithOAuth({
						provider: 'google',
						options: {
							redirectTo: `${page.url.origin}/auth/callback`,
						},
					})
				}}
				class="btn text-text-body flex w-full items-center justify-center space-x-[8px] rounded-full bg-[#F1F1F1] py-[18px] font-bold"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						opacity="0.987"
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M7.209 1.06099C7.934 0.979994 8.363 0.979994 9.142 1.06099C10.5209 1.26509 11.7992 1.90248 12.792 2.88099C12.1211 3.51513 11.4591 4.15852 10.806 4.81099C9.55533 3.75099 8.15933 3.50633 6.618 4.07699C5.48733 4.59699 4.7 5.43966 4.256 6.60499C3.53044 6.06482 2.81433 5.51207 2.108 4.94699C2.05891 4.92116 2.00285 4.9117 1.948 4.91999C3.07 2.75666 4.82333 1.46999 7.208 1.05999"
						fill="#F44336"
					/>
					<path
						opacity="0.997"
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M1.94601 4.91994C2.00267 4.91127 2.05634 4.92027 2.10701 4.94694C2.81334 5.51202 3.52945 6.06477 4.25501 6.60494C4.14083 7.059 4.06886 7.52263 4.04001 7.98994C4.06467 8.44194 4.13634 8.8856 4.25501 9.32094L2.00001 11.1159C1.01801 9.06394 1.00001 6.9986 1.94601 4.91994Z"
						fill="#FFC107"
					/>
					<path
						opacity="0.999"
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M12.6851 13.29C11.9829 12.6708 11.2479 12.0899 10.4831 11.55C11.2497 11.0087 11.7151 10.266 11.8791 9.32199H8.12207V6.71299C10.2887 6.69499 12.4544 6.71332 14.6191 6.76799C15.0297 8.99799 14.5554 11.0087 13.1961 12.8C13.0344 12.9718 12.8632 13.1354 12.6851 13.29Z"
						fill="#448AFF"
					/>
					<path
						opacity="0.993"
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M4.255 9.32202C5.075 11.36 6.57833 12.3114 8.765 12.176C9.37883 12.105 9.96735 11.8905 10.483 11.55C11.2483 12.0914 11.9823 12.6714 12.685 13.29C11.5716 14.2905 10.1521 14.8841 8.658 14.974C8.31854 15.0012 7.97746 15.0012 7.638 14.974C5.09267 14.674 3.21333 13.388 2 11.116L4.255 9.32202Z"
						fill="#43A047"
					/>
				</svg>
				<span> Google </span>
			</button>
		</div>
	</div>
</div>
