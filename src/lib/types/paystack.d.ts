declare module '@paystack/inline-js' {
	interface ResumeTransactionOptions {
		onSuccess?: (response: PaystackResponse) => void;
		onCancel?: () => void;
		onError?: (error: { message: string }) => void;
	}

	interface PaystackResponse {
		reference: string;
		status: string;
		trans: string;
		transaction: string;
		message: string;
	}

	interface PaystackOptions {
		key: string;
		email: string;
		amount: number;
		currency?: string;
		ref?: string;
		channels?: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer')[];
		metadata?: Record<string, unknown>;
		onSuccess?: (response: PaystackResponse) => void;
		onCancel?: () => void;
		onError?: (error: { message: string }) => void;
	}

	export default class PaystackPop {
		newTransaction(options: PaystackOptions): void;
		resumeTransaction(accessCode: string, options?: ResumeTransactionOptions): void;
	}
}
