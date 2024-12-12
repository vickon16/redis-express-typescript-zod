import express from "express";
import restaurantsRouter from "./routes/restaurants.js";
import cuisinesRouter from "./routes/cuisines.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.json());

app.use("/api/restaurants", restaurantsRouter);
app.use("/api/cuisines", cuisinesRouter);

app.use(errorMiddleware);

app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}..`);
  })
  .on("error", (error) => {
    throw new Error(error.message);
  });
