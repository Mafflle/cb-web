<script lang="ts">
	import { supportedCountries } from '$lib/utils/constants';

	let {
		countryCode = $bindable(),
		phoneNumber = $bindable(),
		error = $bindable(null)
	}: {
		countryCode: string;
		phoneNumber: string;
		error: string | null;
	} = $props();
</script>

<div class="form-phone-input" class:border-red-500={error !== null}>
	<select
		bind:value={countryCode}
		autocomplete="tel-country-code"
		aria-label="Country code"
		aria-invalid={error !== null}
	>
		{#each Object.keys(supportedCountries) as code}
			<option value={code}>{code}</option>
		{/each}
	</select>
	<input
		type="tel"
		bind:value={phoneNumber}
		placeholder={supportedCountries[countryCode].placeholder}
	/>
</div>
