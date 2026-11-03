import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const avatarDirectory = path.resolve("uploads/avatars");

fs.mkdirSync(avatarDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, avatarDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${req.auth.userId}-${crypto.randomUUID()}${extension}`;

    callback(null, uniqueName);
  },
});

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const uploadAvatar = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new Error("Only JPG, PNG, and WebP images are allowed."));
    }

    callback(null, true);
  },
});

export default uploadAvatar;
