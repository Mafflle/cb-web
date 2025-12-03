<script lang="ts">
	const {
		message,
		type = 'info',
		action
	}: {
		message: string;
		type?: 'success' | 'error' | 'info' | 'warning';
		action?: {
			label: string;
			onClick: () => void;
		};
	} = $props();

	const typeIcon = {
		success: 'ix:success',
		error: 'material-symbols:error-rounded',
		info: 'material-symbols:info-outline',
		warning: 'material-symbols:warning-rounded'
	};

	const typeText = {
		success: 'text-success',
		error: 'text-error',
		info: 'text-info',
		warning: 'text-warning'
	};
</script>

<div
	class="bg-surface text-text-body flex items-center border border-border p-4 text-sm wrapper"
>
	<div class="flex items-center">
		<iconify-icon
			icon={typeIcon[type]}
			width="24"
			height="24"
			class={typeText[type]}
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


<style>
	.wrapper {
		border-radius: 12px;
		box-shadow: 0 4px 17.6px rgba(0, 0, 0, 0.08);
	}
</style>