import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT secrets are missing from server/.env");
}

const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";

const REFRESH_DAYS = Math.max(
  1,
  Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30
);

export const REFRESH_COOKIE_NAME = "cozy_home_refresh";

export function createAccessToken(user, sessionId) {
  return jwt.sign(
    {
      sub: String(user.id),
      sid: String(sessionId),
      username: user.username,
      email: user.email,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

export function createRefreshToken(userId, sessionId) {
  return jwt.sign(
    {
      sub: String(userId),
      sid: String(sessionId),
      type: "refresh",
    },
    REFRESH_SECRET,
    { expiresIn: `${REFRESH_DAYS}d` }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

export function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
  };
}

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, getRefreshCookieOptions());
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });
}

export function getRefreshTokenFromRequest(req) {
  const cookieHeader = req.headers.cookie || "";

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${REFRESH_COOKIE_NAME}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.slice(REFRESH_COOKIE_NAME.length + 1));
}

export async function createUserSession(user, req, connection = pool) {
  const temporaryHash = crypto.randomBytes(32).toString("hex");

  const [result] = await connection.query(
    `INSERT INTO sessions
      (user_id, refresh_token_hash, expires_at, user_agent, ip_address)
     VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY), ?, ?)`,
    [
      user.id,
      temporaryHash,
      REFRESH_DAYS,
      req.get("user-agent") || null,
      req.ip || null,
    ]
  );

  const sessionId = result.insertId;
  const refreshToken = createRefreshToken(user.id, sessionId);

  await connection.query(
    `UPDATE sessions
     SET refresh_token_hash = ?
     WHERE id = ?`,
    [hashRefreshToken(refreshToken), sessionId]
  );

  return {
    sessionId,
    refreshToken,
    accessToken: createAccessToken(user, sessionId),
  };
}
