import { PRIVATE_MOMO_API_KEY, PRIVATE_MOMO_BASE_URL, PRIVATE_MOMO_PRIMARY_KEY, PRIVATE_MOMO_REFERENCE_ID, PRIVATE_MOMO_TARGET_ENV } from "$env/static/private";
import { PUBLIC_IS_MOMO_SANDBOX } from "$env/static/public";

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

const createService = () => {
  const TOKEN_EXPIRY_BUFFER_MS = 30 * 1000;

  const getBasicAuthToken = () => {
    const apiUser = PRIVATE_MOMO_REFERENCE_ID;
    const apiKey = PRIVATE_MOMO_API_KEY;

    return Buffer.from(`${apiUser}:${apiKey}`).toString('base64');
  }

  const fetchNewAccessToken = async (): Promise<{ access_token: string; expires_in: number }> => {
    const url = `${PRIVATE_MOMO_BASE_URL}/collection/token/`;
    const basicAuthToken = getBasicAuthToken();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuthToken}`,
        'Ocp-Apim-Subscription-Key': PRIVATE_MOMO_PRIMARY_KEY,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    });

    if (!response.ok) {
      console.error('Failed to create access token:', await response.text());
      throw new Error('Failed to create access token');
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      expires_in: data.expires_in || 3600 // Default to 1 hour if not provided
    };
  }

  const getAccessToken = async (): Promise<string> => {
    const now = Date.now();

    if (cachedToken && tokenExpiresAt - TOKEN_EXPIRY_BUFFER_MS > now) {
      return cachedToken;
    }

    const { access_token, expires_in } = await fetchNewAccessToken();
    
    cachedToken = access_token;
    tokenExpiresAt = now + (expires_in * 1000);

    return cachedToken;
  }

  const generateReferenceId = () => {
    return crypto.randomUUID();
  };

  const requestToPay = async (
    options: {
      amount: number,
      currency: string,
      callbackUrl: string,
      payerPhoneNumber: string
    }
  ) => {
    const accessToken = await getAccessToken();

    const { amount, currency, callbackUrl, payerPhoneNumber } = options;

    const url = `${PRIVATE_MOMO_BASE_URL}/collection/v1_0/requesttopay`;
    const reference = generateReferenceId();

    const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'X-Reference-Id': reference,
				'X-Target-Environment': PRIVATE_MOMO_TARGET_ENV,
				'X-Callback-Url': callbackUrl,
				'Ocp-Apim-Subscription-Key': PRIVATE_MOMO_PRIMARY_KEY,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				amount: amount.toString(),
				currency: PUBLIC_IS_MOMO_SANDBOX ? 'EUR' : currency,
				payer: {
					partyIdType: 'MSISDN',
					partyId: payerPhoneNumber
				},
				externalId: reference,
				payerMessage: 'Payment for order',
				payeeNote: 'Thank you for your payment'
			})
		});

    if (!response.ok) {
      console.error('Failed to initiate MoMo payment:', await response.text());
      throw new Error('Failed to initiate MoMo payment');
    }

    return { reference };
  }

  const getTransactionStatus = async (reference: string) => {
    const accessToken = await getAccessToken();

    const url = `${PRIVATE_MOMO_BASE_URL}/collection/v1_0/requesttopay/${reference}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Target-Environment': PRIVATE_MOMO_TARGET_ENV,
        'Ocp-Apim-Subscription-Key': PRIVATE_MOMO_PRIMARY_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch MoMo transaction status:', await response.text());
      throw new Error('Failed to fetch MoMo transaction status');
    }

    const data = await response.json();
    return data;
  }

  return {
    generateReferenceId,
    requestToPay,
    getTransactionStatus
  };
}

export const momoService = createService();
export default momoService;