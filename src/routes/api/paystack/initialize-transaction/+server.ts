import { z } from "zod";
import { InitializeTransactionSchema } from "./schema";
import { PRIVATE_PAYSTACK_SECRET_KEY } from "$env/static/private";


export const POST = async ({ request, fetch }) => {
  const body = await request.json();

  try {
    const parsedBody = InitializeTransactionSchema.parse(body);
    const { email, amount, reference } = parsedBody;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PRIVATE_PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        amount,
        reference,
        currency: "NGN",
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ error: errorData.message || "Failed to initialize transaction" }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {

    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: error.errors }), { status: 400 });
    }

  }




  return new Response("Not implemented", { status: 501 });
};
