import { z } from "zod";

const requiredString = z
  .string({ message: "Field is required" })
  .trim()
  .min(1, "Minimum length is 1");

// restaurant
export const SignupSchema = z.object({
  firstName: requiredString,
  lastName: requiredString,
  email: requiredString.email(),
  password: requiredString.min(8, "Minimum length is 8"),
});

export type TSignUpSchema = z.infer<typeof SignupSchema>;

// reviews
export const LoginSchema = z.object({
  email: requiredString.email(),
  password: requiredString,
});

export type TLoginSchema = z.infer<typeof LoginSchema>;

export const AccountCreateSchema = z.object({
  firstName: requiredString,
  lastName: requiredString,
  phone: requiredString,
  email: requiredString.email(),
  depositAmount: z.number().min(1000, "Minimum amount is 1000"),
});

export type TAccountCreateSchema = z.infer<typeof AccountCreateSchema>;

export const TransactionTransferSchema = z.object({
  amount: z.number().positive(),
  fromBankName: requiredString,
  fromAccountNumber: requiredString,
  toBankName: requiredString,
  toAccountNumber: requiredString,
  currency: z.enum(["NGN"]),
  narration: z.string().optional(),
});

export type TTransactionTransferSchema = z.infer<
  typeof TransactionTransferSchema
>;
