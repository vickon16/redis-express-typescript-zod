import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { CustomError } from "../utils/index.js";

export const validate = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        throw new CustomError(JSON.stringify(result.error.errors), 400);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
