import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/authTokens.js";
import pool from "./database.js";

let io;

const allowedOrigins = ["http://localhost:5173", "http://localhost:5175"];

const isValidId = (value) => {
  if (typeof value !== "string" && typeof value !== "number") {
    return false;
  }

  const text = String(value);

  if (!/^\d+$/.test(text)) return false;

  try {
    return BigInt(text) > 0n;
  } catch {
    return false;
  }
};

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Socket origin is not allowed by CORS."));
        }
      },
      credentials: true,
    },
  });

  // Authenticate every socket connection using the same access token
  // verification function used by the Express authentication middleware.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token || typeof token !== "string") {
        return next(new Error("Authentication required."));
      }

      const payload = verifyAccessToken(token);

      if (!payload.sub || !payload.sid) {
        return next(new Error("Invalid access token."));
      }

      socket.auth = {
        userId: String(payload.sub),
        sessionId: String(payload.sid),
        username: payload.username || null,
      };

      return next();
    } catch {
      return next(new Error("Your session has expired. Please sign in again."));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.auth.userId;

    // Every authenticated user gets a private personal room.
    socket.join(`user:${userId}`);

    console.log(`[Socket.IO] User ${userId} connected. Socket: ${socket.id}`);

    // Join a conversation only after checking database membership.
    socket.on("conversation:join", async (conversationId, callback) => {
      try {
        if (!isValidId(conversationId)) {
          return callback?.({
            success: false,
            message: "Invalid conversation ID.",
          });
        }

        const [members] = await pool.query(
          `
          SELECT id
          FROM conversation_members
          WHERE conversation_id = ?
            AND user_id = ?
          LIMIT 1
          `,
          [String(conversationId), userId]
        );

        if (!members.length) {
          return callback?.({
            success: false,
            message: "You do not have access to this conversation.",
          });
        }

        const room = `conversation:${conversationId}`;

        await socket.join(room);

        console.log(
          `[Socket.IO] User ${userId} joined conversation ${conversationId}`
        );

        return callback?.({
          success: true,
          conversation_id: String(conversationId),
        });
      } catch (error) {
        console.error("[Socket.IO] Join conversation error:", error);

        return callback?.({
          success: false,
          message: "Unable to join conversation.",
        });
      }
    });

    socket.on("conversation:leave", async (conversationId, callback) => {
      try {
        if (!isValidId(conversationId)) {
          return callback?.({
            success: false,
            message: "Invalid conversation ID.",
          });
        }

        await socket.leave(`conversation:${conversationId}`);

        return callback?.({
          success: true,
          conversation_id: String(conversationId),
        });
      } catch (error) {
        console.error("[Socket.IO] Leave conversation error:", error);

        return callback?.({
          success: false,
          message: "Unable to leave conversation.",
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] User ${userId} disconnected. Reason: ${reason}`);
    });
  });

  console.log("[Socket.IO] Initialized.");

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
}
