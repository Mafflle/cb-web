import { z } from "zod";

export const InitializeTransactionSchema = z.object({
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  }).email(),
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).min(100, "Minimum amount is 100 kobo (1 NGN)"),
  reference: z.string({
    required_error: "Reference is required",
    invalid_type_error: "Reference must be a string",
  }).min(1, "Reference cannot be empty"),
});
