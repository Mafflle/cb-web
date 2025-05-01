/**
 * Configuration options for initializing a payment with Monnify.
 *
 * @param {Object} PaymentRequest - Monnify Payment request object.
 * @param {number} PaymentRequest.amount - Amount to be paid.
 * @param {string} PaymentRequest.currency - Currency code (e.g., 'NGN').
 * @param {string} PaymentRequest.reference - Unique reference for the payment transaction.
 * @param {string} PaymentRequest.customerFullName - Full name of the customer making the payment.
 * @param {string} PaymentRequest.customerEmail - Email address of the customer.
 * @param {string} PaymentRequest.paymentDescription - Description of the payment.
 * @param {string} [PaymentRequest.redirectUrl] - Optional redirect URL after payment completion.
 * @param {Array<string>} [PaymentRequest.paymentMethods] - Optional array of payment methods to display defaults to all.
 * @param {Object} [PaymentRequest.metadata] - Optional metadata for additional information.
 * @param {Array<Object>} [PaymentRequest.incomeSplitConfig] - Optional configuration for splitting payments between sub-accounts.
 * @param {function} [PaymentRequest.onLoadStart] - Callback function executed on Monnify SDK load start.
 * @param {function} [PaymentRequest.onLoadComplete] - Callback function executed on Monnify SDK load complete.
 * @param {function} [PaymentRequest.onComplete] - Callback function executed on successful completion of the transaction.
 * @param {function} [PaymentRequest.onClose] - Callback function executed when the payment modal is closed.
 */

/**
 * Response returned by Monnify upon successful payment completion.
 *
 * @param {Object} PaymentResponse - Monnify Payment response object.
 * @param {number} PaymentResponse.amount - Amount to be paid.
 * @param {number} PaymentResponse.amountPaid - Amount actually paid.
 * @param {boolean} PaymentResponse.completed - Indicates if the transaction was completed successfully.
 * @param {string} PaymentResponse.completedOn - Timestamp when the transaction was completed.
 * @param {string} PaymentResponse.createdOn - Timestamp when the transaction was created.
 * @param {string} PaymentResponse.currencyCode - Currency code of the payment (e.g., 'NGN').
 * @param {string} PaymentResponse.customerEmail - Email address of the customer.
 * @param {string} PaymentResponse.customerName - Full name of the customer.
 * @param {number} PaymentResponse.fee - Fees charged for the transaction.
 * @param {Object} PaymentResponse.metaData - Metadata related to the transaction (device type, IP address, etc.).
 * @param {number} PaymentResponse.payableAmount - Total amount due for payment.
 * @param {string} PaymentResponse.paymentMethod - Payment method used (e.g., 'CARD').
 * @param {string} PaymentResponse.paymentReference - Unique reference for the payment transaction.
 * @param {string} PaymentResponse.paymentStatus - Status of the payment (e.g., 'PAID').
 * @param {string} PaymentResponse.transactionReference - Unique transaction reference.
 */

/**
 * Response returned by Monnify if a user cancels the transaction.
 *
 * @param {Object} UserCancelledResponse - User cancelled response object.
 * @param {number} UserCancelledResponse.authorizedAmount - Amount authorized before cancellation.
 * @param {string} UserCancelledResponse.paymentStatus - Status of the payment at the time of cancellation.
 * @param {string} [UserCancelledResponse.redirectUrl] - Optional redirect URL.
 * @param {string} UserCancelledResponse.responseCode - Code representing the response status (e.g., 'USER_CANCELLED').
 * @param {string} UserCancelledResponse.responseMessage - Message describing the cancellation event.
 */

/**
 * Monnify class for handling payment initialization with the Monnify SDK.
 */
class Monnify {
	constructor(apiKey, contractCode) {
		this.apiKey = apiKey;
		this.contractCode = contractCode;
		this.VALID_PAYMENT_METHODS = ['CARD', 'ACCOUNT_TRANSFER', 'USSD', 'PHONE_NUMBER'];

		// Load the SDK script asynchronously
		this.loadSDK();
	}

	// Asynchronously loads the Monnify SDK
	loadSDK() {
		return new Promise((resolve, reject) => {
			if (window.MonnifySDK) {
				resolve();
			} else {
				const script = document.createElement('script');
				script.src = 'https://sdk.monnify.com/plugin/monnify.js';
				script.async = true;
				script.onload = () => {
					if (window.MonnifySDK) {
						resolve();
					} else {
						reject(new Error('Failed to load Monnify SDK'));
					}
				};
				script.onerror = () => reject(new Error('Failed to load Monnify SDK script'));
				document.body.appendChild(script);
			}
		});
	}

	// Validates the provided payment request object
	validatePaymentRequest(paymentRequest) {
		const requiredFields = [
			'amount',
			'currency',
			'reference',
			'customerFullName',
			'customerEmail',
			'paymentDescription'
		];
		let isValid = true;
		requiredFields.forEach((field) => {
			if (!paymentRequest[field]) {
				console.error(`Missing required field: ${field}`);
				isValid = false;
			}
		});
		if (
			paymentRequest.paymentMethods &&
			Array.isArray(paymentRequest.paymentMethods) &&
			paymentRequest.paymentMethods.length === 0
		) {
			console.error('Error: No payment methods specified.');
			isValid = false;
		}
		if (paymentRequest.paymentMethods) {
			const invalidMethods = paymentRequest.paymentMethods.filter(
				(method) => !this.VALID_PAYMENT_METHODS.includes(method)
			);
			if (invalidMethods.length > 0) {
				console.error(`Invalid payment methods: ${invalidMethods.join(', ')}`);
				isValid = false;
			}
		}
		return isValid;
	}

	// Initializes the payment process
	initializePayment(paymentRequest) {
		if (!this.validatePaymentRequest(paymentRequest)) {
			console.error('Payment initialization aborted due to invalid paymentRequest object.');
			return;
		}
		this.loadSDK()
			.then(() => {
				const paymentConfig = {
					...paymentRequest,
					apiKey: this.apiKey,
					contractCode: this.contractCode,
					onLoadStart:
						paymentRequest.onLoadStart || (() => console.log('Monnify SDK loading started')),
					onLoadComplete:
						paymentRequest.onLoadComplete || (() => console.log('Monnify SDK is ready')),
					onComplete:
						paymentRequest.onComplete ||
						((response) => console.log('Transaction complete:', response)),
					onClose:
						paymentRequest.onClose ||
						((response) => console.log('Transaction modal closed:', response))
				};
				if (window.MonnifySDK) {
					window.MonnifySDK.initialize(paymentConfig);
				} else {
					throw new Error('Monnify SDK not available');
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}
}
export default Monnify;
