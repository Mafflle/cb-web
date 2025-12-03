import { PRIVATE_PAYSTACK_SECRET_KEY } from "$env/static/private";

const createService = () => {
	const generateReference = () => {
		const timestamp = Date.now().toString(36);
		const randomString = Math.random().toString(36).substring(2, 8);
		return `${timestamp}-${randomString}`.toUpperCase();
	};

  /**
   * Initiates a Paystack payment
   * @param amount - The amount to be paid in Naira
   * @param email - The email address of the payer
   * @returns An object containing the payment data and reference
   */
	const initiatePayment = async (amount: number, email: string) => {
		const reference = generateReference();

		const response = await fetch('https://api.paystack.co/transaction/initialize', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${PRIVATE_PAYSTACK_SECRET_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email,
				amount: amount * 100,
				currency: 'NGN',
				reference
			})
		});

    if (!response.ok) {
      console.error('Failed to initiate Paystack payment:', await response.text());
      throw new Error('Failed to initiate Paystack payment');
    }

    const data = await response.json();
    return { data, reference };
	};

  /**
   * Verifies a Paystack payment
   * @param reference - The transaction reference to verify
   */
  const verifyPayment = async (reference: string) => {
    const verifyResponse = await fetch(
			`https://api.paystack.co/transaction/verify/${reference}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${PRIVATE_PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);

    if (!verifyResponse.ok) {
      console.error('Failed to verify Paystack payment:', await verifyResponse.text());
      throw new Error('Failed to verify Paystack payment');
    }

    const verifyData = await verifyResponse.json();
    return verifyData;
  }

	return {
    initiatePayment,
    verifyPayment
  };
};

export const paystackService = createService();
