import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { fileURLToPath } from "url";
import path from "path";

import pool from "./config/database.js";
import { sendEmail, diagnoseMailer } from "./config/mailer.js";
import { initializeSocket } from "./config/socket.js";

import authRoutes from "./routes/authRoutes.js";
import houseRoutes from "./routes/houseRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config({
  path: fileURLToPath(new URL("./.env", import.meta.url)),
});

const app = express();
const httpServer = createServer(app);

app.set("trust proxy", 1);

const allowedOrigins = ["http://localhost:5173", "http://localhost:5175"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// Serve uploaded profile pictures.
app.use(
  "/uploads",
  express.static(path.resolve("uploads"), {
    maxAge: "7d",
    immutable: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Cozy Home API!",
  });
});

// API and database health check
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS connected");

    res.json({
      status: "success",
      message: "Cozy Home API and MySQL are connected!",
      database: rows[0].connected === 1,
    });
  } catch (error) {
    console.error("MySQL connection failed:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed.",
    });
  }
});

// Authentication endpoints
app.use("/api/auth", authRoutes);

// House management endpoints
app.use("/api/houses", houseRoutes);

// Profile endpoints
app.use("/api/profile", profileRoutes);

// Friends endpoints
app.use("/api/friends", friendRoutes);

// Messages endpoints
app.use("/api/messages", messageRoutes);

// Development-only email testing endpoints
if (process.env.NODE_ENV !== "production") {
  app.get("/api/dev/test-smtp", async (req, res) => {
    try {
      const diagnostics = await diagnoseMailer();
      const success = diagnostics.authenticated?.success === true;

      return res.status(success ? 200 : 500).json({
        status: success ? "success" : "error",
        message: success
          ? "Gmail SMTP connection and authentication successful!"
          : "SMTP authentication test failed.",
        diagnostics,
      });
    } catch (error) {
      console.error("SMTP diagnostic endpoint failed:", error);

      return res.status(500).json({
        status: "error",
        message: "Unable to complete SMTP diagnostics.",
      });
    }
  });

  app.post("/api/dev/test-email", async (req, res) => {
    const email = req.body.email;

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid recipient email address.",
      });
    }

    const recipient = email.trim();

    try {
      const info = await sendEmail({
        to: recipient,
        subject: "Cozy Home - Email Test",
        text: "Your Cozy Home email service is working!",
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;">
            <h1>Cozy Home</h1>
            <p>Your Cozy Home email service is working!</p>
          </div>
        `,
      });

      console.log("Test email sent:", {
        recipient,
        messageId: info.messageId,
      });

      return res.json({
        status: "success",
        message: `Test email sent to ${recipient}!`,
        recipient,
      });
    } catch (error) {
      console.error("Test email error:", error);

      return res.status(500).json({
        status: "error",
        message: "Unable to send the test email.",
        error: {
          code: error.code || "UNKNOWN",
          details: error.message || "Unknown email error.",
        },
      });
    }
  });
}

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "API endpoint not found.",
  });
});

// General error handler
app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  res.status(500).json({
    status: "error",
    message: "An unexpected server error occurred.",
  });
});

// Initialize Socket.IO before accepting connections.
initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Cozy Home API running at http://localhost:${PORT}`);
  console.log(`Cozy Home Socket.IO ready on port ${PORT}`);
});
