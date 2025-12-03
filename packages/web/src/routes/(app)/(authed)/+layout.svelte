<script lang="ts">
	import { type Snippet } from 'svelte';
	import auth from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { children }: { children: Snippet } = $props();

	$effect(() => {
		if (browser && auth.loaded && !auth.currentUser) {
			goto('/auth/login?redirectTo=' + encodeURIComponent(window.location.href));
		}
	});
</script>

{@render children()}
