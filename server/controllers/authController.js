import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

import pool from "../config/database.js";
import { sendEmail } from "../config/mailer.js";

import { generateOtp, hashOtp, compareOtp } from "../utils/otp.js";

import {
  createUserSession,
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
  getRefreshTokenFromRequest,
  setRefreshCookie,
  clearRefreshCookie,
} from "../utils/authTokens.js";

const OTP_MINUTES = Math.max(1, Number(process.env.OTP_EXPIRES_MINUTES) || 10);

const OTP_COOLDOWN = Math.max(
  1,
  Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60
);

const OTP_MAX_ATTEMPTS = Math.max(1, Number(process.env.OTP_MAX_ATTEMPTS) || 5);

const REFRESH_DAYS = Math.max(
  1,
  Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30
);

// Generates a code such as LA-4FEBAEA3D7.
function generateFriendCode() {
  return `LA-${randomBytes(5).toString("hex").toUpperCase()}`;
}

function publicUser(user) {
  return {
    id: String(user.id),
    username: user.username,
    friendCode: user.friend_code,
    email: user.email,
    status: user.status,
    emailVerifiedAt: user.email_verified_at,
    createdAt: user.created_at,
  };
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validUsername(username) {
  return /^[a-zA-Z0-9_]{3,24}$/.test(username);
}

function validPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

function otpEmail(username, code) {
  return {
    subject: "Your Cozy Home verification code",
    text: `Hi ${username}! Your Cozy Home verification code is ${code}. It expires in ${OTP_MINUTES} minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f6f2e9;padding:32px;color:#394437;">
        <div style="max-width:480px;margin:auto;background:#fffaf0;padding:32px;border-radius:16px;">
          <h1 style="margin-top:0;color:#718568;">Welcome to Cozy Home!</h1>
          <p>Hi ${username},</p>
          <p>Use this verification code to finish creating your account:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:10px;text-align:center;padding:20px;background:#f6f2e9;border-radius:12px;">
            ${code}
          </div>
          <p>This code expires in ${OTP_MINUTES} minutes.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
          <p style="color:#8b8b7d;font-size:12px;">Cozy Home — a little place to call yours.</p>
        </div>
      </div>
    `,
  };
}

async function sendVerificationEmail(user, code) {
  const email = otpEmail(user.username, code);

  return sendEmail({
    to: user.email,
    ...email,
  });
}

function getCooldownSeconds(lastSentAt) {
  if (!lastSentAt) return 0;

  const elapsed = Math.floor(
    (Date.now() - new Date(lastSentAt).getTime()) / 1000
  );

  return Math.max(0, OTP_COOLDOWN - elapsed);
}

function getClientSessionDetails(req) {
  return {
    userAgent: req.get("user-agent") || null,
    ipAddress: req.ip || null,
  };
}

// POST /api/auth/signup
export async function signup(req, res) {
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = req.body.password;

  if (!validUsername(username)) {
    return res.status(400).json({
      status: "error",
      message:
        "Username must be 3–24 characters and may only contain letters, numbers, and underscores.",
    });
  }

  if (!validEmail(email)) {
    return res.status(400).json({
      status: "error",
      message: "Please provide a valid email address.",
    });
  }

  if (!validPassword(password)) {
    return res.status(400).json({
      status: "error",
      message: "Password must be at least 8 characters long.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const code = generateOtp();
  const codeHash = hashOtp(code);
  const friendCode = generateFriendCode();

  const connection = await pool.getConnection();

  let user;

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT id, username, email
       FROM users
       WHERE email = ? OR username = ?
       LIMIT 1
       FOR UPDATE`,
      [email, username]
    );

    if (existing.length) {
      const conflict =
        existing[0].email === email
          ? "An account with this email already exists."
          : "That username is already taken.";

      await connection.rollback();

      return res.status(409).json({
        status: "error",
        message: conflict,
      });
    }

    const [result] = await connection.query(
      `INSERT INTO users
        (username, friend_code, email, password_hash, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [username, friendCode, email, passwordHash]
    );

    user = {
      id: result.insertId,
      username,
      friend_code: friendCode,
      email,
      status: "pending",
    };

    await connection.query(
      `INSERT INTO email_verifications
        (user_id, code_hash, expires_at, attempts, last_sent_at)
       VALUES (
         ?,
         ?,
         DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE),
         0,
         UTC_TIMESTAMP()
       )`,
      [user.id, codeHash, OTP_MINUTES]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message:
          "That email, username, or friend code is already registered. Please try again.",
      });
    }

    console.error("Signup error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to create your account right now.",
    });
  } finally {
    connection.release();
  }

  try {
    await sendVerificationEmail(user, code);

    return res.status(201).json({
      status: "success",
      message: "Your verification code has been sent.",
      email: user.email,
      username: user.username,
      expiresInSeconds: OTP_MINUTES * 60,
      resendAfterSeconds: OTP_COOLDOWN,
    });
  } catch (error) {
    console.error("Signup verification email error:", error);

    return res.status(502).json({
      status: "error",
      message:
        "Your account was created, but the verification email could not be sent. Please use the resend code option.",
      email: user.email,
      canResend: true,
    });
  }
}

// POST /api/auth/resend-verification
export async function resendVerification(req, res) {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  if (!validEmail(email)) {
    return res.status(400).json({
      status: "error",
      message: "Please provide a valid email address.",
    });
  }

  const connection = await pool.getConnection();

  let user;
  let code;

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT
         u.id,
         u.username,
         u.email,
         u.status,
         ev.last_sent_at,
         ev.verified_at
       FROM users u
       INNER JOIN email_verifications ev ON ev.user_id = u.id
       WHERE u.email = ?
       LIMIT 1
       FOR UPDATE`,
      [email]
    );

    if (!rows.length || rows[0].status !== "pending") {
      await connection.rollback();

      return res.json({
        status: "success",
        message:
          "If your account is awaiting verification, a new code will be sent.",
      });
    }

    user = rows[0];

    if (user.verified_at) {
      await connection.rollback();

      return res.status(400).json({
        status: "error",
        message: "This email address has already been verified.",
      });
    }

    const cooldown = getCooldownSeconds(user.last_sent_at);

    if (cooldown > 0) {
      await connection.rollback();

      return res.status(429).json({
        status: "error",
        message: `Please wait ${cooldown} seconds before requesting another code.`,
        retryAfterSeconds: cooldown,
      });
    }

    code = generateOtp();

    await connection.query(
      `UPDATE email_verifications
       SET code_hash = ?,
           expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE),
           attempts = 0,
           last_sent_at = UTC_TIMESTAMP()
       WHERE user_id = ?`,
      [hashOtp(code), OTP_MINUTES, user.id]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Resend verification error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to resend your verification code.",
    });
  } finally {
    connection.release();
  }

  try {
    await sendVerificationEmail(user, code);

    return res.json({
      status: "success",
      message: "A new verification code has been sent.",
      expiresInSeconds: OTP_MINUTES * 60,
      resendAfterSeconds: OTP_COOLDOWN,
    });
  } catch (error) {
    console.error("Resend email error:", error);

    return res.status(502).json({
      status: "error",
      message: "Unable to send the verification email. Please try again later.",
    });
  }
}

// POST /api/auth/verify-email
export async function verifyEmail(req, res) {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const code = String(req.body.code || "").trim();

  if (!validEmail(email) || !/^\d{6}$/.test(code)) {
    return res.status(400).json({
      status: "error",
      message: "Please enter a valid email and six-digit verification code.",
    });
  }

  const connection = await pool.getConnection();

  let user;
  let session;

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT
         u.id,
         u.username,
         u.friend_code,
         u.email,
         u.status,
         u.email_verified_at,
         u.created_at,
         ev.code_hash,
         ev.expires_at,
         ev.attempts,
         ev.verified_at
       FROM users u
       INNER JOIN email_verifications ev ON ev.user_id = u.id
       WHERE u.email = ?
       LIMIT 1
       FOR UPDATE`,
      [email]
    );

    if (!rows.length || rows[0].status !== "pending") {
      await connection.rollback();

      return res.status(400).json({
        status: "error",
        message: "Invalid or expired verification code.",
      });
    }

    user = rows[0];

    if (user.verified_at || user.email_verified_at) {
      await connection.rollback();

      return res.status(400).json({
        status: "error",
        message: "This email address has already been verified.",
      });
    }

    if (Number(user.attempts) >= OTP_MAX_ATTEMPTS) {
      await connection.rollback();

      return res.status(429).json({
        status: "error",
        message: "Too many incorrect attempts. Request a new code.",
      });
    }

    const expiresAt = new Date(user.expires_at);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      await connection.rollback();

      return res.status(400).json({
        status: "error",
        message: "Your verification code has expired. Request a new one.",
      });
    }

    if (!compareOtp(code, user.code_hash)) {
      await connection.query(
        `UPDATE email_verifications
         SET attempts = attempts + 1
         WHERE user_id = ?`,
        [user.id]
      );

      await connection.commit();

      const attemptsLeft = Math.max(
        0,
        OTP_MAX_ATTEMPTS - Number(user.attempts) - 1
      );

      return res.status(400).json({
        status: "error",
        message: "Incorrect verification code.",
        attemptsLeft,
      });
    }

    await connection.query(
      `UPDATE users
       SET status = 'active',
           email_verified_at = UTC_TIMESTAMP()
       WHERE id = ?`,
      [user.id]
    );

    await connection.query(
      `UPDATE email_verifications
       SET verified_at = UTC_TIMESTAMP()
       WHERE user_id = ?`,
      [user.id]
    );

    await connection.commit();

    user = {
      ...user,
      status: "active",
      email_verified_at: new Date(),
    };
  } catch (error) {
    await connection.rollback();
    console.error("Email verification error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to verify your email right now.",
    });
  } finally {
    connection.release();
  }

  try {
    session = await createUserSession(user, req);
    setRefreshCookie(res, session.refreshToken);

    return res.json({
      status: "success",
      message: "Your email is verified. Welcome to Cozy Home!",
      user: publicUser(user),
      accessToken: session.accessToken,
    });
  } catch (error) {
    console.error("Session creation after verification failed:", error);

    return res.status(500).json({
      status: "error",
      message:
        "Your email was verified, but automatic sign-in failed. Please sign in.",
      emailVerified: true,
    });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = req.body.password;

  if (!validEmail(email) || typeof password !== "string" || !password) {
    return res.status(400).json({
      status: "error",
      message: "Please enter your email and password.",
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         username,
         friend_code,
         email,
         password_hash,
         status,
         email_verified_at,
         created_at
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password.",
      });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password.",
      });
    }

    if (user.status === "pending" || !user.email_verified_at) {
      return res.status(403).json({
        status: "error",
        message: "Please verify your email address before signing in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        status: "error",
        message:
          "This account is currently unavailable. Please contact support.",
      });
    }

    const session = await createUserSession(user, req);
    setRefreshCookie(res, session.refreshToken);

    return res.json({
      status: "success",
      message: "Signed in successfully.",
      user: publicUser(user),
      accessToken: session.accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to sign in right now.",
    });
  }
}

// POST /api/auth/refresh
export async function refreshSession(req, res) {
  const token = getRefreshTokenFromRequest(req);

  if (!token) {
    clearRefreshCookie(res);

    return res.status(401).json({
      status: "error",
      message: "No refresh session found.",
    });
  }

  let payload;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    clearRefreshCookie(res);

    return res.status(401).json({
      status: "error",
      message: "Your refresh session has expired. Please sign in again.",
    });
  }

  if (payload.type !== "refresh" || !payload.sub || !payload.sid) {
    clearRefreshCookie(res);

    return res.status(401).json({
      status: "error",
      message: "Invalid refresh session.",
    });
  }

  const oldHash = hashRefreshToken(token);
  const newToken = createRefreshToken(payload.sub, payload.sid);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT
         s.id AS session_id,
         s.user_id,
         s.expires_at,
         s.revoked_at,
         u.id,
         u.username,
         u.friend_code,
         u.email,
         u.status,
         u.email_verified_at,
         u.created_at
       FROM sessions s
       INNER JOIN users u ON u.id = s.user_id
       WHERE s.id = ?
         AND s.user_id = ?
         AND s.refresh_token_hash = ?
       LIMIT 1
       FOR UPDATE`,
      [payload.sid, payload.sub, oldHash]
    );

    if (
      !rows.length ||
      rows[0].revoked_at ||
      new Date(rows[0].expires_at) <= new Date() ||
      rows[0].status !== "active"
    ) {
      await connection.rollback();
      clearRefreshCookie(res);

      return res.status(401).json({
        status: "error",
        message: "Your session is no longer valid. Please sign in again.",
      });
    }

    const user = rows[0];

    const [updateResult] = await connection.query(
      `UPDATE sessions
       SET refresh_token_hash = ?,
           expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY)
       WHERE id = ?
         AND refresh_token_hash = ?
         AND revoked_at IS NULL`,
      [hashRefreshToken(newToken), REFRESH_DAYS, payload.sid, oldHash]
    );

    if (updateResult.affectedRows !== 1) {
      await connection.rollback();
      clearRefreshCookie(res);

      return res.status(401).json({
        status: "error",
        message: "Your session could not be refreshed. Please sign in again.",
      });
    }

    await connection.commit();

    const accessToken = createAccessToken(user, payload.sid);
    setRefreshCookie(res, newToken);

    return res.json({
      status: "success",
      user: publicUser(user),
      accessToken,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Refresh session error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to refresh your session.",
    });
  } finally {
    connection.release();
  }
}

// POST /api/auth/logout
export async function logout(req, res) {
  const token = getRefreshTokenFromRequest(req);

  if (token) {
    try {
      const hash = hashRefreshToken(token);

      await pool.query(
        `UPDATE sessions
         SET revoked_at = UTC_TIMESTAMP()
         WHERE refresh_token_hash = ?
           AND revoked_at IS NULL`,
        [hash]
      );
    } catch (error) {
      console.error("Logout session error:", error);
    }
  }

  clearRefreshCookie(res);

  return res.json({
    status: "success",
    message: "You have been signed out.",
  });
}

// GET /api/auth/me
export async function getCurrentUser(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         username,
         friend_code,
         email,
         status,
         email_verified_at,
         created_at
       FROM users
       WHERE id = ?
         AND status = 'active'
       LIMIT 1`,
      [req.auth.userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        status: "error",
        message: "Account not found.",
      });
    }

    return res.json({
      status: "success",
      user: publicUser(rows[0]),
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load your account.",
    });
  }
}
