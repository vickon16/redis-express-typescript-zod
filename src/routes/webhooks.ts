import type { Router } from "express";
import express from "express";
import db from "../utils/db.js";
import { errorResponse, successResponse } from "../utils/responses.js";

const router: Router = express.Router();

// Transfer money
router.post("/transactions/transfer", async (req, res, next) => {
  try {
    const headerExist = req.headers["x-task-raven"];
    if (!headerExist || headerExist !== "backend-task-raven") {
      errorResponse(res, 400, "Invalid headers");
      return;
    }

    const payload = req.body as WebhookData;
    if (!payload.type || payload.type !== "transfer" || !payload.reference) {
      errorResponse(res, 400, "Invalid payload");
      return;
    }

    const transactions = await db("transactions").where({
      reference: payload.reference,
    });

    if (transactions.length === 0) {
      errorResponse(res, 400, "No transaction found");
      return;
    }

    await db("transactions")
      .where({ reference: payload.reference })
      .update({ status: "completed" });

    // Notification, such as email/sms notification can be sent here

    successResponse(res, null, "Transfer successful");
  } catch (error) {
    next(error);
  }
});

export default router;
