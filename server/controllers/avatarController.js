import fs from "fs/promises";
import path from "path";
import pool from "../config/database.js";

const avatarDirectory = path.resolve("uploads/avatars");

async function removeFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Unable to remove avatar file:", error);
    }
  }
}

async function isValidImage(filePath, mimeType) {
  const handle = await fs.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buffer, 0, 12, 0);

    if (mimeType === "image/jpeg") {
      return (
        bytesRead >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );
    }

    if (mimeType === "image/png") {
      return (
        bytesRead >= 8 &&
        buffer
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      );
    }

    if (mimeType === "image/webp") {
      return (
        bytesRead >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );
    }

    return false;
  } finally {
    await handle.close();
  }
}

// POST /api/profile/avatar
export async function uploadProfileAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "Please select an image to upload.",
    });
  }

  const userId = req.auth.userId;
  const uploadedFile = req.file;

  try {
    const validImage = await isValidImage(
      uploadedFile.path,
      uploadedFile.mimetype
    );

    if (!validImage) {
      await removeFile(uploadedFile.path);

      return res.status(400).json({
        status: "error",
        message: "The uploaded file is not a valid JPG, PNG, or WebP image.",
      });
    }

    const [users] = await pool.execute(
      `SELECT id
       FROM users
       WHERE id = ? AND status = 'active'
       LIMIT 1`,
      [userId]
    );

    if (!users.length) {
      await removeFile(uploadedFile.path);

      return res.status(404).json({
        status: "error",
        message: "Active account not found.",
      });
    }

    const avatarPath = `avatars/${uploadedFile.filename}`;

    await pool.execute(
      `INSERT INTO user_profiles (user_id, avatar_path)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         avatar_path = VALUES(avatar_path)`,
      [userId, avatarPath]
    );

    return res.status(200).json({
      status: "success",
      message: "Your profile picture has been updated!",
      avatar_path: avatarPath,
      avatar_url: `/uploads/${avatarPath}`,
    });
  } catch (error) {
    console.error("Upload profile avatar error:", error);

    await removeFile(uploadedFile.path);

    return res.status(500).json({
      status: "error",
      message: "Unable to upload your profile picture.",
    });
  }
}
