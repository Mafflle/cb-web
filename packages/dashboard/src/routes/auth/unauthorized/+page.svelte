<script lang="ts">
	import { goto } from '$app/navigation';

	const handleLogout = async () => {
		await fetch('/auth/logout', { method: 'POST' });
		goto('/auth/login');
	};
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-md text-center">
		<div class="rounded-lg bg-white p-8 shadow-lg">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
				<svg
					class="h-8 w-8 text-red-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					></path>
				</svg>
			</div>

			<h1 class="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>

			<p class="mb-6 text-gray-600">
				You don't have permission to access the restaurant dashboard. This area is restricted to
				restaurant owners and staff only.
			</p>

			<p class="mb-6 text-sm text-gray-500">
				If you believe this is an error, please contact your restaurant administrator or our support
				team.
			</p>

			<div class="space-y-3">
				<button
					onclick={handleLogout}
					class="w-full rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700"
				>
					Sign out and try another account
				</button>

				<a
					href="https://chowbenin.com"
					class="block w-full rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
				>
					Go to customer site
				</a>
			</div>
		</div>
	</div>
</div>
