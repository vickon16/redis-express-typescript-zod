import { JWTAuth } from "../middlewares/jwtAuth.js";
import db from "../utils/db.js";
import type { Router } from "express";
import express from "express";
import { errorResponse, successResponse } from "../utils/responses.js";
import { AccountCreateSchema, TAccountCreateSchema } from "../utils/schemas.js";
import { validate } from "../middlewares/validate.js";
import { ravenInstance } from "../utils/index.js";
import { getBanks } from "../utils/helpers.js";

const router: Router = express.Router();

// Get account details
router.post(
  "/create",
  validate(AccountCreateSchema),
  JWTAuth,
  async (req, res, next) => {
    const params = req.body as TAccountCreateSchema;

    try {
      const user = await db("users").where({ id: req.user.id }).first();

      if (!user) {
        errorResponse(res, 404, "User not found");
        return;
      }

      const response = await ravenInstance<AccountCreationResponse>({
        method: "post",
        url: "/pwbt/generate_account",
        data: {
          first_name: params.firstName,
          last_name: params.lastName,
          phone: params.phone,
          amount: params.depositAmount,
          email: params.email,
        },
      });

      if (!response.data || response.data.status !== "success") {
        errorResponse(res, 400, "Failed to create account");
        return;
      }

      const accountData = response.data.data;

      const banks = await getBanks();
      const bank = banks
        .map((bank) => {
          if (bank.name === "Beststar Microfinance Bank") {
            return { ...bank, name: "BestStar MFB" };
          }
          return bank;
        })
        .find((bank) => bank.name === "BestStar MFB");

      if (!bank) {
        errorResponse(res, 400, "Failed to get bank with the given name");
        return;
      }

      await db("accounts").insert({
        userId: user.id,
        accountNumber: accountData.account_number,
        accountName: accountData.account_name,
        bankName: bank.name,
        email: params.email,
        bankCode: bank.code,
        balance: accountData.amount,
      });

      successResponse(res, null, "Account created successfully");
    } catch (error) {
      next(error);
    }
  }
);

// Get all accounts
router.get("/", JWTAuth, async (req, res, next) => {
  try {
    const accounts = await db("accounts").where({ userId: req.user.id });
    successResponse(res, accounts, "Accounts retrieved successfully");
  } catch (error) {
    next(error);
  }
});

// Get account details
router.get("/:id", JWTAuth, async (req, res, next) => {
  const { id } = req.params;
  try {
    const account = await db("accounts")
      .where({ userId: req.user.id, id })
      .first();

    if (!account) {
      errorResponse(res, 404, "Account not found");
      return;
    }

    successResponse(res, account);
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete("/:id", JWTAuth, async (req, res, next) => {
  const { id } = req.params;
  try {
    const account = await db("accounts")
      .where({ userId: req.user.id, id })
      .first();

    if (!account) {
      errorResponse(res, 404, "Account not found");
      return;
    }

    await db("accounts").where({ id }).delete();
    successResponse(res, null, "Account deleted successfully");
  } catch (error) {
    next(error);
  }
});

export default router;
