<script lang="ts">
	const {
		message,
		type = 'info',
		action
	}: {
		message: string;
		type?: 'success' | 'error' | 'info';
		action?: {
			label: string;
			onClick: () => void;
		};
	} = $props();

	const typeIcon = {
		success: 'ix:success',
		error: 'material-symbols:error-rounded',
		info: 'material-symbols:info-outline'
	};
</script>

<div
	class="bg-surface border-border text-text-body flex items-center rounded-lg border p-4 text-sm shadow-lg"
>
	<div class="flex items-center">
		<iconify-icon
			icon={typeIcon[type]}
			width="24"
			height="24"
			class:text-success={type === 'success'}
			class:text-error={type === 'error'}
			class:text-blue-600={type === 'info'}
			style="margin-right: 0.5rem"
		></iconify-icon>
	</div>
	<!-- Message -->
	<p class="text-text-body mr-2 flex-1 text-sm text-wrap">
		{message}
	</p>
	<!-- Action -->
	{#if action}
		<button class="btn ml-auto px-2 py-1 text-sm" onclick={action.onClick}>
			{action.label}
		</button>
	{/if}
</div>
