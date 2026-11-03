import pool from "../config/database.js";

const ALLOWED_AVATARS = [
  "farmer-01",
  "farmer-02",
  "farmer-03",
  "farmer-04",
  "farmer-05",
  "farmer-06",
  "farmer-07",
  "farmer-08",
];

function validUsername(username) {
  return /^[a-zA-Z0-9_]{3,24}$/.test(username);
}

// GET /api/profile
export async function getProfile(req, res) {
  const userId = req.auth.userId;

  try {
    await pool.execute(
      `INSERT IGNORE INTO user_profiles (user_id)
       SELECT id
       FROM users
       WHERE id = ? AND status = 'active'`,
      [userId]
    );

    const [rows] = await pool.execute(
      `SELECT
          u.id,
          u.username,
          u.friend_code,
          u.email,
          u.status,
          u.email_verified_at,
          u.created_at AS account_created_at,
          p.bio,
          p.avatar_path,
          p.created_at AS profile_created_at,
          p.updated_at AS profile_updated_at
       FROM users u
       LEFT JOIN user_profiles p
          ON p.user_id = u.id
       WHERE u.id = ?
         AND u.status = 'active'
       LIMIT 1`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        status: "error",
        message: "Account not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      profile: rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load your profile.",
    });
  }
}

// PUT /api/profile
export async function updateProfile(req, res) {
  const userId = req.auth.userId;

  const username =
    typeof req.body.username === "string" ? req.body.username.trim() : "";

  const bio = typeof req.body.bio === "string" ? req.body.bio.trim() : "";

  if (!validUsername(username)) {
    return res.status(400).json({
      status: "error",
      message:
        "Username must be 3–24 characters and may only contain letters, numbers, and underscores.",
    });
  }

  if (bio.length > 160) {
    return res.status(400).json({
      status: "error",
      message: "Bio cannot exceed 160 characters.",
    });
  }

  try {
    const [users] = await pool.execute(
      `SELECT id
       FROM users
       WHERE id = ? AND status = 'active'
       LIMIT 1`,
      [userId]
    );

    if (!users.length) {
      return res.status(404).json({
        status: "error",
        message: "Active account not found.",
      });
    }

    const [existingUsers] = await pool.execute(
      `SELECT id
       FROM users
       WHERE username = ?
         AND id != ?
       LIMIT 1`,
      [username, userId]
    );

    if (existingUsers.length) {
      return res.status(409).json({
        status: "error",
        message: "That username is already taken.",
      });
    }

    await pool.execute(
      `UPDATE users
       SET username = ?
       WHERE id = ?
         AND status = 'active'`,
      [username, userId]
    );

    await pool.execute(
      `INSERT INTO user_profiles (user_id, bio)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         bio = VALUES(bio)`,
      [userId, bio || null]
    );

    const [rows] = await pool.execute(
      `SELECT
          u.id,
          u.username,
          u.friend_code,
          u.email,
          u.status,
          u.email_verified_at,
          u.created_at AS account_created_at,
          p.bio,
          p.avatar_path,
          p.created_at AS profile_created_at,
          p.updated_at AS profile_updated_at
       FROM users u
       INNER JOIN user_profiles p
          ON p.user_id = u.id
       WHERE u.id = ?
         AND u.status = 'active'
       LIMIT 1`,
      [userId]
    );

    return res.status(200).json({
      status: "success",
      message: "Your profile has been updated!",
      profile: rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message: "That username is already taken.",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Unable to update your profile.",
    });
  }
}

// PUT /api/profile/avatar/preset
export async function updatePresetAvatar(req, res) {
  const userId = req.auth.userId;
  const avatarPath = req.body?.avatar_path;

  if (typeof avatarPath !== "string" || !avatarPath.startsWith("preset:")) {
    return res.status(400).json({
      status: "error",
      message: "Invalid avatar selection.",
    });
  }

  const presetId = avatarPath.replace("preset:", "");

  if (!ALLOWED_AVATARS.includes(presetId)) {
    return res.status(400).json({
      status: "error",
      message: "This avatar is not available.",
    });
  }

  try {
    const [users] = await pool.execute(
      `SELECT id
       FROM users
       WHERE id = ? AND status = 'active'
       LIMIT 1`,
      [userId]
    );

    if (!users.length) {
      return res.status(404).json({
        status: "error",
        message: "Active account not found.",
      });
    }

    const savedAvatarPath = `preset:${presetId}`;

    await pool.execute(
      `INSERT INTO user_profiles (user_id, avatar_path)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         avatar_path = VALUES(avatar_path)`,
      [userId, savedAvatarPath]
    );

    return res.status(200).json({
      status: "success",
      message: "Your character has been updated!",
      avatar_path: savedAvatarPath,
    });
  } catch (error) {
    console.error("Update preset avatar error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to save your character.",
    });
  }
}
