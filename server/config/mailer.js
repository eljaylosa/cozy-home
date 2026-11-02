
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(currentDirectory, "../.env");

const envResult = dotenv.config({
  path: envPath,
  override: true,
});

if (envResult.error) {
  console.error("Failed to load server/.env:", envResult.error.message);
} else {
  console.log("SMTP environment loaded from:", envPath);
}

const smtpConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
};

console.log("SMTP runtime configuration:", {
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  usernameConfigured: Boolean(process.env.SMTP_USER),
  passwordConfigured: Boolean(process.env.SMTP_PASS),
});

const transporter = nodemailer.createTransport({
  ...smtpConfig,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  logger: true,
  debug: true,
});

function serializeError(error) {
  return {
    code: error?.code || "UNKNOWN",
    responseCode: error?.responseCode || null,
    command: error?.command || null,
    details: error?.message || "Unknown SMTP error.",
    response: error?.response || null,
    syscall: error?.syscall || null,
    address: error?.address || null,
    port: error?.port || null,
    errno: error?.errno || null,
    cause: error?.cause
      ? {
          code: error.cause.code || null,
          message: error.cause.message || String(error.cause),
        }
      : null,
    stack: error?.stack || null,
  };
}

export async function diagnoseMailer() {
  const diagnostics = {
    configuration: {
      envFileLoaded: !envResult.error,
      envFilePath: envPath,
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      usernameConfigured: Boolean(process.env.SMTP_USER),
      usernameLength: process.env.SMTP_USER?.length || 0,
      passwordConfigured: Boolean(process.env.SMTP_PASS),
      passwordLength: process.env.SMTP_PASS?.length || 0,
      passwordHasWhitespace: /\s/.test(process.env.SMTP_PASS || ""),
    },
    unauthenticated: null,
    authenticated: null,
  };

  const connectionTester = nodemailer.createTransport({
    ...smtpConfig,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    logger: true,
    debug: true,
  });

  try {
    await connectionTester.verify();

    diagnostics.unauthenticated = {
      success: true,
      message: "SMTP connection successful without authentication.",
    };
  } catch (error) {
    diagnostics.unauthenticated = {
      success: false,
      message: "Unauthenticated SMTP connection failed.",
      ...serializeError(error),
    };
  } finally {
    connectionTester.close();
  }

  try {
    await transporter.verify();

    diagnostics.authenticated = {
      success: true,
      message: "SMTP connection and authentication successful.",
    };
  } catch (error) {
    console.error("Authenticated SMTP verification error:", error);

    diagnostics.authenticated = {
      success: false,
      message: "SMTP authentication test failed.",
      ...serializeError(error),
    };
  }

  return diagnostics;
}

export async function verifyMailer() {
  return transporter.verify();
}

export async function sendEmail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

export default transporter;
