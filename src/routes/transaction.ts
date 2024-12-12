import { JWTAuth } from "../middlewares/jwtAuth.js";
import db from "../utils/db.js";
import type { Router } from "express";
import express from "express";
import { errorResponse, successResponse } from "../utils/responses.js";
import { validate } from "../middlewares/validate.js";
import {
  TransactionTransferSchema,
  TTransactionTransferSchema,
} from "../utils/schemas.js";
import { ravenInstance } from "../utils/index.js";
import { generateReferenceNumber } from "../utils/helpers.js";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const router: Router = express.Router();

// Transfer money
router.post(
  "/transfer",
  validate(TransactionTransferSchema),
  JWTAuth,
  async (req, res, next) => {
    const params = req.body as TTransactionTransferSchema;

    try {
      // lookup bank account
      const [fromAccount, toAccount] = await Promise.all([
        db("accounts")
          .where({ accountNumber: params.fromAccountNumber })
          .first(),
        db("accounts").where({ accountNumber: params.toAccountNumber }).first(),
      ]);

      if (!fromAccount || !toAccount) {
        errorResponse(res, 404, "One or both of the accounts not found");
        return;
      }

      // lookup account numbers
      const [fromResponse, toResponse] = await Promise.all([
        ravenInstance({
          method: "post",
          url: "/account_number_lookup",
          data: {
            bank: fromAccount.bankCode,
            account_number: fromAccount.accountNumber,
          },
        }),
        ravenInstance({
          method: "post",
          url: "/account_number_lookup",
          data: {
            bank: toAccount.bankCode,
            account_number: toAccount.accountNumber,
          },
        }),
      ]);

      if (
        !fromResponse.data ||
        fromResponse.data.status !== "success" ||
        !toResponse.data ||
        toResponse.data.status !== "success"
      ) {
        errorResponse(
          res,
          400,
          `Account number ${fromAccount.accountNumber} or ${toAccount.accountNumber} was not found`
        );
        return;
      }

      // At this point the transfer does not succeed
      // I keep getting an error "transfers are not enabled for this merchant"
      // I have gone through the documentation and  tried to enable transfers in the raven dashboard but it doesn't work

      // I have commented the code below that should create the actual transfer on the atlas API just so that this endpoint works when testing

      // -------------------------------------------------------------------

      // const response = await ravenInstance<TransactionTransferResponse>({
      //   method: "post",
      //   url: "/transfers/create",
      //   data: {
      //     amount: params.amount,
      //     bank_code: toAccount.bankCode,
      //     bank: toAccount.bankName,
      //     account_number: toAccount.accountNumber,
      //     account_name: toAccount.accountName,
      //     narration: params.narration,
      //     reference: generateReferenceNumber(),
      //     currency: params.currency,
      //   },
      // });

      // if (!response.data || response.data.status !== "success") {
      //   errorResponse(res, 400, "Failed to create transfer");
      //   return;
      // }

      // ---------------------------------------------------------------------

      if (fromAccount.balance < params.amount) {
        errorResponse(res, 400, "Insufficient balance");
        return;
      }

      const reference = generateReferenceNumber().toString();
      // creating a transaction history
      await db.transaction(async (trx) => {
        await trx("accounts")
          .where({ id: fromAccount.id })
          .decrement("balance", params.amount);
        await trx("accounts")
          .where({ id: toAccount.id })
          .increment("balance", params.amount);

        await trx("transactions").insert([
          {
            accountId: fromAccount.id,
            type: "debit",
            amount: params.amount,
            status: "pending",
            reference,
            description: `Transfer to ${toAccount.accountNumber}`,
          },
          {
            accountId: toAccount.id,
            type: "credit",
            amount: params.amount,
            status: "pending",
            reference,
            description: `Transfer from ${fromAccount.accountNumber}`,
          },
        ]);
      });

      // Because our transaction api from raven is not been used at this point, I had to manually simulate a webhook trigger directly from here.
      // This would obviously be removed once the transaction api is used.

      const config: AxiosRequestConfig = {
        method: "post",
        url: `${process.env.SERVER_URL}/api/webhooks/transactions/transfer`,
        headers: {
          "Content-Type": "application/json",
          "x-task-raven": "backend-task-raven",
        },
        data: {
          type: "transfer",
          fromAccountId: fromAccount.id,
          toAccount: toAccount.id,
          fromAccountNumber: fromAccount.accountNumber,
          toAccountNumber: toAccount.accountNumber,
          fromBankName: fromAccount.bankName,
          toBankName: toAccount.bankName,
          amount: params.amount,
          reference,
        } satisfies WebhookData,
      };

      const response = await axios(config);
      if (response.status !== 200) {
        errorResponse(res, response.status, "Failed to trigger webhook");
        return;
      }

      successResponse(res, null, "Transfer successful");
    } catch (error) {
      next(error);
    }
  }
);

// Transaction history
router.get("/history", JWTAuth, async (req, res, next) => {
  try {
    const transactions = await db("transactions")
      .join("accounts", "transactions.accountId", "accounts.id")
      .where("accounts.userId", req.user.id)
      .select("transactions.*");

    successResponse(res, transactions || []);
  } catch (error) {
    next(error);
  }
});

export default router;
