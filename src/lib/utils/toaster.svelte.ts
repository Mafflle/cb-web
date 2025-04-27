import { toast } from 'svelte-sonner';

export const showToast = (options: {
	title?: string;
	message: string;
	type: 'success' | 'error' | 'info';
}) => {
	toast[options.type](options.title || options.message, {
		description: options.title ? options.message : undefined,
		duration: 5000
	});
};
