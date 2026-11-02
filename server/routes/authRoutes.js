import express from "express";

import {
  signup,
  resendVerification,
  verifyEmail,
  login,
  refreshSession,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";

import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/resend-verification", resendVerification);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh", refreshSession);
router.post("/logout", logout);
router.get("/me", authenticate, getCurrentUser);

export default router;
