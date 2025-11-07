<script lang="ts">
	import { enhance } from "$app/forms";
	import auth from "../stores/auth.svelte";

    let loggingOut = $state(false);
</script>

<form action="/?/logout" method="POST" use:enhance={() => {
    loggingOut = true;

    return async ({ update, result }) => {
        update({ reset: true });
        await auth.refresh(); 
        console.log('Current user', auth.currentUser)
        loggingOut = false;
    }
}}>
    <button class="btn flex w-full items-center justify-center" type="submit">
        {#if loggingOut}
            <iconify-icon icon="eos-icons:loading" width="16" height="16"></iconify-icon>
        {:else}
            <iconify-icon icon="material-symbols:logout" width="16" height="16"></iconify-icon>
        {/if}
        <span class="ml-2">Logout</span>
    </button>
</form>
