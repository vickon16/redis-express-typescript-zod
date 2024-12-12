import type { NextFunction, Request, Response, Router } from "express";
import express from "express";
import { nanoid } from "nanoid";
import { validate } from "../middlewares/validate.js";
import { errorResponse, successResponse } from "../utils/responses.js";
import {
  LoginSchema,
  SignupSchema,
  TLoginSchema,
  TSignUpSchema,
} from "../utils/schemas.js";
import db from "../utils/db.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router: Router = express.Router();

router.post("/signup", validate(SignupSchema), async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body as TSignUpSchema;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const exists = await db("users").where({ email }).first();
    if (exists) {
      errorResponse(res, 409, "User already exists");
      return;
    }

    const [userId] = await db("users").insert({
      firstName,
      lastName,
      email,
      hashedPassword: hashedPassword,
    });

    successResponse(res, null, `User with Id ${userId} created successfully`);
  } catch (error) {
    next(error);
  }
});

// User login
router.post("/login", validate(LoginSchema), async (req, res) => {
  const { email, password } = req.body as TLoginSchema;

  try {
    const user = await db("users").where({ email }).first();
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      errorResponse(res, 401, "Invalid credentials");
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});

export default router;
