import { browser } from '$app/environment';
import Monnify from 'monnify-js';
import { showToast } from '../utils/toaster.svelte';

const MONNIFY_API_KEY = import.meta.env.VITE_MONNIFY_API_KEY;
const MONNIFY_CONTRACT_CODE = import.meta.env.VITE_MONNIFY_CONTRACT_CODE;

const createService = () => {
	const getMonnifyInstance = () => {
		if (!browser) {
			throw new Error('Monnify can only be used in the browser');
		} else if (!MONNIFY_API_KEY || !MONNIFY_CONTRACT_CODE) {
			throw new Error('Monnify API keys are not set');
		}

		return new Monnify(MONNIFY_API_KEY, MONNIFY_CONTRACT_CODE);
	};

	const generateReference = () => {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

		return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
	};

	const initialize = (
		options: {
			amount: number;
			email: string;
			fullName: string;
			description: string;
		},
		callback: (response: any) => void
	) => {
		const monnify = getMonnifyInstance();

		if (options.amount < 100) {
			throw new Error('Amount must be greater than 100');
		}

		const reference = generateReference();
		const data = {
			reference,
			currency: 'NGN',
			amount: options.amount,
			customerFullName: options.fullName,
			customerEmail: options.email,
			paymentDescription: options.description,
			onComplete: callback,
			onClose: (response: any) => {
				if (!response.status || response.status !== 'SUCCESS') {
					console.log('Here');
					showToast({
						message: 'Payment was not successful',
						type: 'error'
					});
				}
			}
		};

		monnify.initializePayment(data);
	};

	return {
		initialize
	};
};

const service = createService();

export default service;
