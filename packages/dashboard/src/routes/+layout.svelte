<script lang="ts">
	import '../app.css';
	import 'iconify-icon';
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import auth from '$lib/stores/auth.svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	onMount(() => {
		if (browser && !auth.loaded) {
			auth.load(supabase, session);
		}
		return () => {
			auth.cleanup();
		};
	});
</script>

<Toaster richColors position="bottom-right" />

{@render children()}
