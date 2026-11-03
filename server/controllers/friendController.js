import pool from "../config/database.js";

const FRIEND_CODE_REGEX = /^LA-[A-F0-9]{10}$/;

const isValidId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0;
};

const hasAcceptedFriendship = async (userId, friendId, db = pool) => {
  const [rows] = await db.query(
    `
    SELECT id
    FROM friend_requests
    WHERE (
      (sender_id = ? AND receiver_id = ?)
      OR
      (sender_id = ? AND receiver_id = ?)
    )
    AND status = 'accepted'
    LIMIT 1
    `,
    [userId, friendId, friendId, userId]
  );

  return rows.length > 0;
};

// ==========================================
// SEARCH PLAYER BY FRIEND CODE
// ==========================================
export const searchFriend = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const friendCode = String(req.query.code || "")
      .trim()
      .toUpperCase();

    if (!FRIEND_CODE_REGEX.test(friendCode)) {
      return res.status(400).json({
        message: "Please enter a valid Friend Code.",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.friend_code,
        up.avatar_path
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.friend_code = ?
        AND u.id <> ?
      LIMIT 1
      `,
      [friendCode, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Player not found." });
    }

    const player = rows[0];

    const [relationships] = await pool.query(
      `
      SELECT id, sender_id, receiver_id, status
      FROM friend_requests
      WHERE (
        (sender_id = ? AND receiver_id = ?)
        OR
        (sender_id = ? AND receiver_id = ?)
      )
      AND status IN ('pending', 'accepted')
      ORDER BY
        CASE WHEN status = 'accepted' THEN 0 ELSE 1 END,
        id DESC
      LIMIT 1
      `,
      [userId, player.id, player.id, userId]
    );

    let relationship = null;

    if (relationships.length) {
      const request = relationships[0];

      relationship = {
        status: request.status,
        direction:
          Number(request.sender_id) === Number(userId)
            ? "outgoing"
            : "incoming",
      };
    }

    return res.json({ player, relationship });
  } catch (error) {
    console.error("[Friends] Search error:", error);
    return res.status(500).json({
      message: "Failed to search for player.",
    });
  }
};

// ==========================================
// SEND FRIEND REQUEST
// ==========================================
export const sendFriendRequest = async (req, res) => {
  let connection;

  try {
    const userId = req.auth.userId;
    const friendCode = String(req.body.friend_code || "")
      .trim()
      .toUpperCase();

    if (!FRIEND_CODE_REGEX.test(friendCode)) {
      return res.status(400).json({
        message: "Please enter a valid Friend Code.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [players] = await connection.query(
      `
      SELECT id, username, friend_code
      FROM users
      WHERE friend_code = ?
      LIMIT 1
      `,
      [friendCode]
    );

    if (!players.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Player not found." });
    }

    const receiver = players[0];

    if (Number(receiver.id) === Number(userId)) {
      await connection.rollback();
      return res.status(400).json({
        message: "You cannot add yourself.",
      });
    }

    await connection.query(
      `
      SELECT id
      FROM users
      WHERE id IN (?, ?)
      ORDER BY id
      FOR UPDATE
      `,
      [userId, receiver.id]
    );

    const [existing] = await connection.query(
      `
      SELECT id, sender_id, receiver_id, status
      FROM friend_requests
      WHERE (
        (sender_id = ? AND receiver_id = ?)
        OR
        (sender_id = ? AND receiver_id = ?)
      )
      AND status IN ('pending', 'accepted')
      ORDER BY
        CASE WHEN status = 'accepted' THEN 0 ELSE 1 END,
        id DESC
      LIMIT 1
      `,
      [userId, receiver.id, receiver.id, userId]
    );

    if (existing.length) {
      await connection.rollback();
      const request = existing[0];

      if (request.status === "accepted") {
        return res.status(409).json({
          message: "You are already friends.",
        });
      }

      if (Number(request.sender_id) === Number(userId)) {
        return res.status(409).json({
          message: "You already sent a friend request to this player.",
        });
      }

      return res.status(409).json({
        message: "This player has already sent you a friend request.",
      });
    }

    const [result] = await connection.query(
      `
      INSERT INTO friend_requests (sender_id, receiver_id, status)
      VALUES (?, ?, 'pending')
      `,
      [userId, receiver.id]
    );

    await connection.commit();

    return res.status(201).json({
      message: "Friend request sent successfully.",
      request: {
        id: result.insertId,
        receiver_id: receiver.id,
        username: receiver.username,
        friend_code: receiver.friend_code,
        status: "pending",
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("[Friends] Send request error:", error);
    return res.status(500).json({
      message: "Failed to send friend request.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// ==========================================
// GET INCOMING FRIEND REQUESTS
// ==========================================
export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const [requests] = await pool.query(
      `
      SELECT
        fr.id,
        fr.sender_id,
        fr.receiver_id,
        fr.status,
        fr.created_at,
        u.username,
        u.friend_code,
        up.avatar_path
      FROM friend_requests fr
      INNER JOIN users u ON u.id = fr.sender_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE fr.receiver_id = ?
        AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
      `,
      [userId]
    );

    return res.json({ requests });
  } catch (error) {
    console.error("[Friends] Incoming requests error:", error);
    return res.status(500).json({
      message: "Failed to load incoming requests.",
    });
  }
};

// ==========================================
// GET OUTGOING FRIEND REQUESTS
// ==========================================
export const getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const [requests] = await pool.query(
      `
      SELECT
        fr.id,
        fr.sender_id,
        fr.receiver_id,
        fr.status,
        fr.created_at,
        u.username,
        u.friend_code,
        up.avatar_path
      FROM friend_requests fr
      INNER JOIN users u ON u.id = fr.receiver_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE fr.sender_id = ?
        AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
      `,
      [userId]
    );

    return res.json({ requests });
  } catch (error) {
    console.error("[Friends] Outgoing requests error:", error);
    return res.status(500).json({
      message: "Failed to load outgoing requests.",
    });
  }
};

// ==========================================
// ACCEPT FRIEND REQUEST
// ==========================================
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const requestId = Number(req.params.id);

    if (!isValidId(requestId)) {
      return res.status(400).json({
        message: "Invalid friend request ID.",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE friend_requests
      SET status = 'accepted'
      WHERE id = ?
        AND receiver_id = ?
        AND status = 'pending'
      `,
      [requestId, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Friend request not found or already processed.",
      });
    }

    return res.json({ message: "Friend request accepted." });
  } catch (error) {
    console.error("[Friends] Accept request error:", error);
    return res.status(500).json({
      message: "Failed to accept friend request.",
    });
  }
};

// ==========================================
// DECLINE FRIEND REQUEST
// ==========================================
export const declineFriendRequest = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const requestId = Number(req.params.id);

    if (!isValidId(requestId)) {
      return res.status(400).json({
        message: "Invalid friend request ID.",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE friend_requests
      SET status = 'declined'
      WHERE id = ?
        AND receiver_id = ?
        AND status = 'pending'
      `,
      [requestId, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Friend request not found or already processed.",
      });
    }

    return res.json({ message: "Friend request declined." });
  } catch (error) {
    console.error("[Friends] Decline request error:", error);
    return res.status(500).json({
      message: "Failed to decline friend request.",
    });
  }
};

// ==========================================
// CANCEL OUTGOING FRIEND REQUEST
// ==========================================
export const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const requestId = Number(req.params.id);

    if (!isValidId(requestId)) {
      return res.status(400).json({
        message: "Invalid friend request ID.",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE friend_requests
      SET status = 'cancelled'
      WHERE id = ?
        AND sender_id = ?
        AND status = 'pending'
      `,
      [requestId, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Friend request not found or already processed.",
      });
    }

    return res.json({ message: "Friend request cancelled." });
  } catch (error) {
    console.error("[Friends] Cancel request error:", error);
    return res.status(500).json({
      message: "Failed to cancel friend request.",
    });
  }
};

// ==========================================
// GET ACCEPTED FRIENDS
// ==========================================
export const getFriends = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const [friends] = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.friend_code,
        up.avatar_path,
        fr.updated_at AS friends_since
      FROM friend_requests fr
      INNER JOIN users u
        ON u.id = CASE
          WHEN fr.sender_id = ? THEN fr.receiver_id
          ELSE fr.sender_id
        END
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE (fr.sender_id = ? OR fr.receiver_id = ?)
        AND fr.status = 'accepted'
      ORDER BY u.username ASC, fr.id DESC
      `,
      [userId, userId, userId]
    );

    // Keep one result per friend in case old duplicate accepted rows exist.
    const uniqueFriends = [
      ...new Map(friends.map((friend) => [String(friend.id), friend])).values(),
    ];

    return res.json({ friends: uniqueFriends });
  } catch (error) {
    console.error("[Friends] Get friends error:", error);
    return res.status(500).json({
      message: "Failed to load your friends.",
    });
  }
};

// ==========================================
// UNFRIEND
// ==========================================
export const unfriend = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const friendId = Number(req.params.friendId);

    if (!isValidId(friendId) || Number(userId) === friendId) {
      return res.status(400).json({
        message: "Invalid friend ID.",
      });
    }

    const [result] = await pool.query(
      `
      DELETE FROM friend_requests
      WHERE (
        (sender_id = ? AND receiver_id = ?)
        OR
        (sender_id = ? AND receiver_id = ?)
      )
      AND status = 'accepted'
      `,
      [userId, friendId, friendId, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Friendship not found.",
      });
    }

    return res.json({
      message: "Friend removed successfully.",
    });
  } catch (error) {
    console.error("[Friends] Unfriend error:", error);
    return res.status(500).json({
      message: "Failed to remove friend.",
    });
  }
};

// ==========================================
// GET FRIEND PROFILE
// ==========================================
export const getFriendProfile = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const friendId = Number(req.params.friendId);

    if (!isValidId(friendId) || Number(userId) === friendId) {
      return res.status(400).json({
        message: "Invalid friend ID.",
      });
    }

    const isFriend = await hasAcceptedFriendship(userId, friendId);

    if (!isFriend) {
      return res.status(403).json({
        message: "You can only view the profile of an accepted friend.",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.friend_code,
        u.created_at,
        up.display_name,
        up.bio,
        up.avatar_path
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.id = ?
      LIMIT 1
      `,
      [friendId]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Friend not found.",
      });
    }

    return res.json({ profile: rows[0] });
  } catch (error) {
    console.error("[Friends] Get friend profile error:", error);
    return res.status(500).json({
      message: "Failed to load friend profile.",
    });
  }
};

// ==========================================
// GET FRIEND'S ACCESSIBLE HOUSES
// ==========================================
export const getFriendHouses = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const friendId = Number(req.params.friendId);

    if (!isValidId(friendId) || Number(userId) === friendId) {
      return res.status(400).json({
        message: "Invalid friend ID.",
      });
    }

    const isFriend = await hasAcceptedFriendship(userId, friendId);

    if (!isFriend) {
      return res.status(403).json({
        message: "You can only view houses belonging to an accepted friend.",
      });
    }

    const [houses] = await pool.query(
      `
      SELECT
        h.id,
        h.name,
        h.theme,
        h.visibility,
        h.owner_id,
        h.created_at,
        (
          SELECT COUNT(*)
          FROM house_members hm_count
          WHERE hm_count.house_id = h.id
        ) AS member_count,
        EXISTS (
          SELECT 1
          FROM house_members hm_me
          WHERE hm_me.house_id = h.id
            AND hm_me.user_id = ?
        ) AS is_member
      FROM houses h
      WHERE h.owner_id = ?
        AND h.archived_at IS NULL
        AND (
          h.visibility = 'public'
          OR EXISTS (
            SELECT 1
            FROM house_members hm_access
            WHERE hm_access.house_id = h.id
              AND hm_access.user_id = ?
          )
        )
      ORDER BY h.created_at DESC
      `,
      [userId, friendId, userId]
    );

    return res.json({ houses });
  } catch (error) {
    console.error("[Friends] Get friend houses error:", error);
    return res.status(500).json({
      message: "Failed to load your friend's houses.",
    });
  }
};
