export type InitializeTransactionPayload = {
  /**
   * Customer's email address
   */
  email: string;
  /**
   * Amount in kobo (e.g., 1000 kobo = 10 NGN)
   */
  amount: number; // in kobo
  /**
   * Unique transaction reference
   */
  reference: string;
};

export type InitializeTransactionResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};


export type VerifyTransactionResponse = {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    receipt_number: string | null;
    [field: string]: any; // Additional fields can be added as needed
  };
};