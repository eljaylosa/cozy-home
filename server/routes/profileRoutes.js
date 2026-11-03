import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import uploadAvatar from "../middleware/avatarUpload.js";

import {
  getProfile,
  updateProfile,
  updatePresetAvatar,
} from "../controllers/profileController.js";

import { uploadProfileAvatar } from "../controllers/avatarController.js";

const router = express.Router();

router.use(authenticate);

// Profile information
router.get("/", getProfile);
router.put("/", updateProfile);

// Preset pixel-art character
router.put("/avatar/preset", updatePresetAvatar);

// Custom profile picture upload
router.post("/avatar", uploadAvatar.single("avatar"), uploadProfileAvatar);

export default router;
