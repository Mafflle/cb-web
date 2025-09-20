import type {
  InitializeTransactionPayload,
  InitializeTransactionResponse,
} from "./types";


const createService = () => {
  return {
    initializeTransaction: async (
      options: InitializeTransactionPayload,
      user_session_token: string
    ): Promise<InitializeTransactionResponse> => {
      const response = await fetch("/api/paystack/initialize-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user_session_token}`
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize transaction");
      }

      const data = await response.json();

      return data;
    },


    verifyOrder: async (
      ordersId: string,
      user_session_token: string
    ): Promise<boolean> => {
      const response = await fetch(`/api/paystack/verify-order/${ordersId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user_session_token}`
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to verify order");
      }

      const data = await response.json();
      return data.success;
    }


  };


};

const paystackService = createService();
export default paystackService;
