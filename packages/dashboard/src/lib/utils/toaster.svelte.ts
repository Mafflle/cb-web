import { toast } from 'svelte-sonner';
import NotificationProp from '$lib/components/NotificationProp.svelte';
import type { ComponentType } from 'svelte';

export const showToast = (options: {
	message: string;
	type: 'success' | 'error' | 'info';
	action?: {
		label: string;
		onClick: () => void;
	};
}) => {
	// Type assertion needed for Svelte 5 compatibility with svelte-sonner
	toast.custom(NotificationProp as unknown as ComponentType, {
		componentProps: {
			message: options.message,
			type: options.type,
			action: options.action
		}
	});
};
