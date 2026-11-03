import crypto from "crypto";
import pool from "../config/database.js";

const ALLOWED_THEMES = [
  "cozy-cottage",
  "japanese-home",
  "forest-retreat",
  "seaside-home",
];

const HOUSE_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateHouseCode() {
  let code = "";

  for (let i = 0; i < 8; i++) {
    code +=
      HOUSE_CODE_CHARACTERS[crypto.randomInt(0, HOUSE_CODE_CHARACTERS.length)];
  }

  return code;
}

function isValidHouseId(id) {
  return /^\d+$/.test(String(id));
}

// CREATE HOUSE
export async function createHouse(req, res) {
  const userId = req.auth.userId;
  const connection = await pool.getConnection();

  let transactionStarted = false;

  try {
    const name = String(req.body.name || "").trim();
    const theme = String(req.body.theme || "cozy-cottage");
    const visibility = String(req.body.visibility || "private");

    if (!name || name.length > 40) {
      return res.status(400).json({
        status: "error",
        message: "House name must contain 1–40 characters.",
      });
    }

    if (!ALLOWED_THEMES.includes(theme)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid house theme.",
      });
    }

    if (!["public", "private"].includes(visibility)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid house visibility.",
      });
    }

    await connection.beginTransaction();
    transactionStarted = true;

    const [users] = await connection.execute(
      `SELECT id, username
       FROM users
       WHERE id = ? AND status = 'active'
       FOR UPDATE`,
      [userId]
    );

    if (!users.length) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(403).json({
        status: "error",
        message: "Your account is not active.",
      });
    }

    const username = users[0].username;
    let houseId = null;
    let houseCode = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      houseCode = generateHouseCode();

      try {
        const [result] = await connection.execute(
          `INSERT INTO houses
            (owner_id, name, theme, house_code, visibility)
           VALUES (?, ?, ?, ?, ?)`,
          [userId, name, theme, houseCode, visibility]
        );

        houseId = result.insertId;
        break;
      } catch (error) {
        if (error.code !== "ER_DUP_ENTRY" || attempt === 4) {
          throw error;
        }
      }
    }

    if (!houseId) {
      throw new Error("Unable to generate a unique house code.");
    }

    await connection.execute(
      `INSERT INTO house_members (house_id, user_id, role)
       VALUES (?, ?, 'owner')`,
      [houseId, userId]
    );

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      status: "success",
      message: "Your house has been created!",
      house: {
        id: houseId,
        owner_id: userId,
        owner_username: username,
        name,
        theme,
        house_code: houseCode,
        visibility,
        member_count: 1,
        role: "owner",
        archived_at: null,
      },
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    console.error("Create house error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to create your house.",
    });
  } finally {
    connection.release();
  }
}

// GET HOUSES BELONGING TO THE CURRENT USER
// ?archived=true returns archived houses.
// Without it, only active houses are returned.
export async function getMyHouses(req, res) {
  const userId = req.auth.userId;
  const showArchived = req.query.archived === "true";

  try {
    const [houses] = await pool.execute(
      `SELECT
          h.id,
          h.owner_id,
          owner.username AS owner_username,
          h.name,
          h.theme,
          h.house_code,
          h.visibility,
          h.created_at,
          h.updated_at,
          h.archived_at,
          hm.role,
          (
            SELECT COUNT(*)
            FROM house_members member_count
            WHERE member_count.house_id = h.id
          ) AS member_count
       FROM house_members hm
       INNER JOIN houses h
          ON h.id = hm.house_id
       INNER JOIN users owner
          ON owner.id = h.owner_id
       WHERE hm.user_id = ?
         AND ${
           showArchived ? "h.archived_at IS NOT NULL" : "h.archived_at IS NULL"
         }
       ORDER BY hm.joined_at DESC, h.id DESC`,
      [userId]
    );

    return res.status(200).json({
      status: "success",
      count: houses.length,
      houses,
    });
  } catch (error) {
    console.error("Get my houses error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load your houses.",
    });
  }
}

// UPDATE HOUSE DETAILS
// Only the owner can edit the house.
export async function updateHouse(req, res) {
  const userId = req.auth.userId;
  const houseId = req.params.id;

  if (!isValidHouseId(houseId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid house ID.",
    });
  }

  const name = String(req.body.name || "").trim();
  const theme = String(req.body.theme || "");
  const visibility = String(req.body.visibility || "");

  if (!name || name.length > 40) {
    return res.status(400).json({
      status: "error",
      message: "House name must contain 1–40 characters.",
    });
  }

  if (!ALLOWED_THEMES.includes(theme)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid house theme.",
    });
  }

  if (!["public", "private"].includes(visibility)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid house visibility.",
    });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE houses
       SET name = ?, theme = ?, visibility = ?
       WHERE id = ?
         AND owner_id = ?
         AND archived_at IS NULL`,
      [name, theme, visibility, houseId, userId]
    );

    if (result.affectedRows === 0) {
      const [houses] = await pool.execute(
        `SELECT id, owner_id, archived_at
         FROM houses
         WHERE id = ?
         LIMIT 1`,
        [houseId]
      );

      if (!houses.length) {
        return res.status(404).json({
          status: "error",
          message: "House not found.",
        });
      }

      if (String(houses[0].owner_id) !== String(userId)) {
        return res.status(403).json({
          status: "error",
          message: "Only the house owner can edit this house.",
        });
      }

      return res.status(409).json({
        status: "error",
        message: "Archived houses cannot be edited. Restore it first.",
      });
    }

    const [updatedHouses] = await pool.execute(
      `SELECT
          h.id,
          h.owner_id,
          owner.username AS owner_username,
          h.name,
          h.theme,
          h.house_code,
          h.visibility,
          h.created_at,
          h.updated_at,
          h.archived_at
       FROM houses h
       INNER JOIN users owner ON owner.id = h.owner_id
       WHERE h.id = ?`,
      [houseId]
    );

    return res.status(200).json({
      status: "success",
      message: "House details updated successfully.",
      house: updatedHouses[0],
    });
  } catch (error) {
    console.error("Update house error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to update this house.",
    });
  }
}

// ARCHIVE HOUSE
// Only the owner can archive the house.
export async function archiveHouse(req, res) {
  const userId = req.auth.userId;
  const houseId = req.params.id;

  if (!isValidHouseId(houseId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid house ID.",
    });
  }

  try {
    const [houses] = await pool.execute(
      `SELECT id, owner_id, archived_at
       FROM houses
       WHERE id = ?
       LIMIT 1`,
      [houseId]
    );

    if (!houses.length) {
      return res.status(404).json({
        status: "error",
        message: "House not found.",
      });
    }

    const house = houses[0];

    if (String(house.owner_id) !== String(userId)) {
      return res.status(403).json({
        status: "error",
        message: "Only the house owner can archive this house.",
      });
    }

    if (house.archived_at) {
      return res.status(409).json({
        status: "error",
        message: "This house is already archived.",
      });
    }

    await pool.execute(
      `UPDATE houses
       SET archived_at = CURRENT_TIMESTAMP
       WHERE id = ? AND owner_id = ? AND archived_at IS NULL`,
      [houseId, userId]
    );

    return res.status(200).json({
      status: "success",
      message: "House archived successfully.",
    });
  } catch (error) {
    console.error("Archive house error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to archive this house.",
    });
  }
}

// RESTORE HOUSE
// Only the owner can restore the house.
export async function restoreHouse(req, res) {
  const userId = req.auth.userId;
  const houseId = req.params.id;

  if (!isValidHouseId(houseId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid house ID.",
    });
  }

  try {
    const [houses] = await pool.execute(
      `SELECT id, owner_id, archived_at
       FROM houses
       WHERE id = ?
       LIMIT 1`,
      [houseId]
    );

    if (!houses.length) {
      return res.status(404).json({
        status: "error",
        message: "House not found.",
      });
    }

    const house = houses[0];

    if (String(house.owner_id) !== String(userId)) {
      return res.status(403).json({
        status: "error",
        message: "Only the house owner can restore this house.",
      });
    }

    if (!house.archived_at) {
      return res.status(409).json({
        status: "error",
        message: "This house is not archived.",
      });
    }

    await pool.execute(
      `UPDATE houses
       SET archived_at = NULL
       WHERE id = ? AND owner_id = ? AND archived_at IS NOT NULL`,
      [houseId, userId]
    );

    return res.status(200).json({
      status: "success",
      message: "House restored successfully.",
    });
  } catch (error) {
    console.error("Restore house error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to restore this house.",
    });
  }
}

// JOIN HOUSE USING HOUSE CODE
export async function joinHouse(req, res) {
  const userId = req.auth.userId;
  const houseCode = String(req.body.house_code || "")
    .trim()
    .toUpperCase();

  if (!/^[A-HJ-NP-Z2-9]{8}$/.test(houseCode)) {
    return res.status(400).json({
      status: "error",
      message: "Please enter a valid 8-character house code.",
    });
  }

  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    const [users] = await connection.execute(
      `SELECT id, username
       FROM users
       WHERE id = ? AND status = 'active'
       FOR UPDATE`,
      [userId]
    );

    if (!users.length) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(403).json({
        status: "error",
        message: "Your account is not active.",
      });
    }

    const [houses] = await connection.execute(
      `SELECT
          h.id,
          h.owner_id,
          owner.username AS owner_username,
          h.name,
          h.theme,
          h.house_code,
          h.visibility,
          h.archived_at
       FROM houses h
       INNER JOIN users owner ON owner.id = h.owner_id
       WHERE h.house_code = ?
       FOR UPDATE`,
      [houseCode]
    );

    if (!houses.length) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        status: "error",
        message: "We couldn't find a house with that code.",
      });
    }

    const house = houses[0];

    if (house.archived_at) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(403).json({
        status: "error",
        message: "This house is currently archived.",
      });
    }

    const [existingMembership] = await connection.execute(
      `SELECT id
       FROM house_members
       WHERE house_id = ? AND user_id = ?
       LIMIT 1`,
      [house.id, userId]
    );

    if (existingMembership.length) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(409).json({
        status: "error",
        message: "You're already a member of this house.",
      });
    }

    const [members] = await connection.execute(
      `SELECT COUNT(*) AS member_count
       FROM house_members
       WHERE house_id = ?`,
      [house.id]
    );

    const memberCount = Number(members[0].member_count);

    if (memberCount >= 12) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(409).json({
        status: "error",
        message: "This house is already full (12/12 members).",
      });
    }

    await connection.execute(
      `INSERT INTO house_members (house_id, user_id, role)
       VALUES (?, ?, 'member')`,
      [house.id, userId]
    );

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      status: "success",
      message: `You joined ${house.name}!`,
      house: {
        ...house,
        archived_at: null,
        member_count: memberCount + 1,
        role: "member",
      },
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    console.error("Join house error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to join this house.",
    });
  } finally {
    connection.release();
  }
}
