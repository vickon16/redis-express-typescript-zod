import { errorResponse } from "../utils/responses.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Middleware to verify JWT
export const JWTAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    errorResponse(res, 401, "Unauthorized");
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!!err || !user) {
      errorResponse(res, 401, "Unauthorized");
      return;
    }
    req.user = user as RequestUser;
    next();
  });
};
