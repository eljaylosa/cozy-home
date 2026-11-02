import { verifyAccessToken } from "../utils/authTokens.js";

export function authenticate(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required.",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    if (!payload.sub || !payload.sid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid access token.",
      });
    }

    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid,
      username: payload.username,
      email: payload.email,
    };

    return next();
  } catch {
    return res.status(401).json({
      status: "error",
      message: "Your session has expired. Please sign in again.",
    });
  }
}
