import type { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responses.js";
import { AxiosError } from "axios";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let newError: any;
  if (err instanceof AxiosError) {
    newError = {
      name: err?.name || "AxiosError",
      message: err?.response?.data?.message || "Something went wrong",
      statusCode: err?.response?.status || 500,
      cause: err?.cause || null,
    };
  } else {
    newError = {
      name: err?.name || "Error",
      message: err?.message || "Something went wrong",
      statusCode: err?.statusCode || 500,
      cause: err?.cause || null,
    };
  }

  if (newError.statusCode >= 400 && newError.statusCode < 500) {
    errorResponse(res, newError.statusCode, newError);
    return;
  }

  errorResponse(res, 500, newError);
}
