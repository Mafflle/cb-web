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

<div class="form-phone-input" class:form-error={error !== null}>
	<select
		bind:value={countryCode}
		autocomplete="tel-country-code"
		aria-label="Country code"
		aria-invalid={error !== null}
		name="country_code"
	>
		{#each Object.keys(supportedCountries) as code, index (index)}
			<option value={code}>{code}</option>
		{/each}
	</select>
	<input
		type="tel"
		bind:value={phoneNumber}
		placeholder={supportedCountries[countryCode].placeholder}
		name="phone_number"
	/>
</div>
