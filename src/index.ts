import express from "express";
import authRouter from "./routes/auth.js";
import accountRouter from "./routes/account.js";
import transactionRouter from "./routes/transaction.js";
import webHooksRouter from "./routes/webhooks.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import cors from "cors";

const PORT = process.env.PORT || 9000;
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/webhooks", webHooksRouter);

app.use(errorMiddleware);

app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (error) => {
    throw new Error(error.message);
  });
