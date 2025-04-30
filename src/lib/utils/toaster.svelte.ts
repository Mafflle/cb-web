import { toast } from 'svelte-sonner';
import NotificationProp from '../components/NotificationProp.svelte';

export const showToast = (options: {
	message: string;
	type: 'success' | 'error' | 'info';
	action?: {
		label: string;
		onClick: () => void;
	};
}) => {
	toast.custom(NotificationProp, {
		componentProps: {
			message: options.message,
			type: options.type,
			action: options.action
		}
	});
};
