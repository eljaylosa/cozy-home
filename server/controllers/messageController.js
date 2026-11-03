import pool from "../config/database.js";
import { getIO } from "../config/socket.js";

const MESSAGE_MAX_LENGTH = 5000;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

const isValidId = (value) => {
  if (value === undefined || value === null) return false;

  const text = String(value);

  if (!/^\d+$/.test(text)) return false;

  try {
    return BigInt(text) > 0n;
  } catch {
    return false;
  }
};

const normalizeId = (value) => String(value);

// Generate the same direct_key regardless of who starts the conversation.
const createDirectKey = (userId, friendId) => {
  const first = BigInt(normalizeId(userId));
  const second = BigInt(normalizeId(friendId));

  return first < second ? `${first}:${second}` : `${second}:${first}`;
};

// Check whether two users are currently accepted friends.
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

// Check whether a user belongs to a conversation.
const isConversationMember = async (conversationId, userId, db = pool) => {
  const [rows] = await db.query(
    `
    SELECT id
    FROM conversation_members
    WHERE conversation_id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [conversationId, userId]
  );

  return rows.length > 0;
};

// Emit an event to a user's private Socket.IO room.
// Socket delivery must not cause a successfully saved API request to fail.
const emitToUser = (userId, event, payload) => {
  try {
    getIO().to(`user:${userId}`).emit(event, payload);
  } catch (error) {
    console.error(`[Messages] Socket emit failed (${event}):`, error.message);
  }
};

const emitToConversation = (conversationId, event, payload) => {
  try {
    getIO().to(`conversation:${conversationId}`).emit(event, payload);
  } catch (error) {
    console.error(`[Messages] Socket emit failed (${event}):`, error.message);
  }
};

// ==========================================
// GET CONVERSATIONS
// ==========================================
export const getConversations = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const [conversations] = await pool.query(
      `
      SELECT
        c.id AS conversation_id,
        c.type,
        c.created_at AS conversation_created_at,
        c.updated_at,

        other_user.id AS friend_id,
        other_user.username AS friend_username,
        other_user.friend_code,
        other_profile.display_name AS friend_display_name,
        other_profile.avatar_path AS friend_avatar_path,

        latest_message.id AS last_message_id,
        latest_message.sender_id AS last_message_sender_id,
        latest_message.content AS last_message_content,
        latest_message.is_deleted AS last_message_is_deleted,
        latest_message.created_at AS last_message_created_at

      FROM conversation_members my_members

      INNER JOIN conversations c
        ON c.id = my_members.conversation_id

      INNER JOIN conversation_members other_members
        ON other_members.conversation_id = c.id
        AND other_members.user_id <> my_members.user_id

      INNER JOIN users other_user
        ON other_user.id = other_members.user_id

      LEFT JOIN user_profiles other_profile
        ON other_profile.user_id = other_user.id

      LEFT JOIN messages latest_message
        ON latest_message.id = (
          SELECT m.id
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT 1
        )

      WHERE my_members.user_id = ?
        AND c.type = 'direct'

      ORDER BY
        COALESCE(latest_message.created_at, c.updated_at) DESC,
        c.id DESC
      `,
      [userId]
    );

    return res.json({ conversations });
  } catch (error) {
    console.error("[Messages] Get conversations error:", error);

    return res.status(500).json({
      message: "Failed to load conversations.",
    });
  }
};

// ==========================================
// CREATE OR GET DIRECT CONVERSATION
// ==========================================
export const createConversation = async (req, res) => {
  let connection;

  try {
    const userId = req.auth.userId;
    const friendId = req.body.friend_id;

    if (!isValidId(friendId) || BigInt(friendId) === BigInt(userId)) {
      return res.status(400).json({
        message: "Invalid friend ID.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `
      SELECT id
      FROM users
      WHERE id IN (?, ?)
      ORDER BY id
      FOR UPDATE
      `,
      [userId, friendId]
    );

    const [friendRows] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [friendId]
    );

    if (!friendRows.length) {
      await connection.rollback();

      return res.status(404).json({
        message: "Friend not found.",
      });
    }

    const isFriend = await hasAcceptedFriendship(userId, friendId, connection);

    if (!isFriend) {
      await connection.rollback();

      return res.status(403).json({
        message: "You can only message accepted friends.",
      });
    }

    const directKey = createDirectKey(userId, friendId);

    const [result] = await connection.query(
      `
      INSERT INTO conversations (type, direct_key)
      VALUES ('direct', ?)
      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
      `,
      [directKey]
    );

    const conversationId = result.insertId;

    await connection.query(
      `
      INSERT IGNORE INTO conversation_members
        (conversation_id, user_id)
      VALUES
        (?, ?),
        (?, ?)
      `,
      [conversationId, userId, conversationId, friendId]
    );

    await connection.commit();

    // Notify both users that a conversation is available.
    const conversationPayload = {
      conversation_id: String(conversationId),
    };

    emitToUser(userId, "conversation:created", conversationPayload);
    emitToUser(friendId, "conversation:created", conversationPayload);

    return res.status(200).json({
      message: "Conversation ready.",
      conversation_id: conversationId,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("[Messages] Create conversation error:", error);

    return res.status(500).json({
      message: "Failed to create conversation.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// ==========================================
// GET MESSAGES
// ==========================================
export const getMessages = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const conversationId = req.params.conversationId;

    if (!isValidId(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID.",
      });
    }

    const isMember = await isConversationMember(conversationId, userId);

    if (!isMember) {
      return res.status(403).json({
        message: "You do not have access to this conversation.",
      });
    }

    const requestedLimit = Number(req.query.limit);

    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

    const beforeId = req.query.before_id;

    if (beforeId !== undefined && !isValidId(beforeId)) {
      return res.status(400).json({
        message: "Invalid message cursor.",
      });
    }

    let query = `
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.is_edited,
        m.is_deleted,
        m.created_at,
        m.updated_at,
        m.deleted_at,
        u.username AS sender_username,
        up.display_name AS sender_display_name,
        up.avatar_path AS sender_avatar_path

      FROM messages m

      INNER JOIN users u
        ON u.id = m.sender_id

      LEFT JOIN user_profiles up
        ON up.user_id = u.id

      WHERE m.conversation_id = ?
    `;

    const params = [conversationId];

    if (beforeId !== undefined) {
      query += " AND m.id < ?";
      params.push(beforeId);
    }

    query += `
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT ?
    `;

    params.push(limit);

    const [messages] = await pool.query(query, params);

    messages.reverse();

    return res.json({
      messages,
      has_more: messages.length === limit,
    });
  } catch (error) {
    console.error("[Messages] Get messages error:", error);

    return res.status(500).json({
      message: "Failed to load messages.",
    });
  }
};

// ==========================================
// SEND MESSAGE
// ==========================================
export const sendMessage = async (req, res) => {
  let connection;

  try {
    const userId = req.auth.userId;
    const conversationId = req.params.conversationId;
    const content = String(req.body.content || "").trim();

    if (!isValidId(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID.",
      });
    }

    if (!content) {
      return res.status(400).json({
        message: "Message cannot be empty.",
      });
    }

    if (content.length > MESSAGE_MAX_LENGTH) {
      return res.status(400).json({
        message: `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters.`,
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [members] = await connection.query(
      `
      SELECT id
      FROM conversation_members
      WHERE conversation_id = ?
        AND user_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [conversationId, userId]
    );

    if (!members.length) {
      await connection.rollback();

      return res.status(403).json({
        message: "You do not have access to this conversation.",
      });
    }

    const [conversations] = await connection.query(
      `
      SELECT id
      FROM conversations
      WHERE id = ?
      LIMIT 1
      `,
      [conversationId]
    );

    if (!conversations.length) {
      await connection.rollback();

      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    const [result] = await connection.query(
      `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        content
      )
      VALUES (?, ?, ?)
      `,
      [conversationId, userId, content]
    );

    await connection.query(
      `
      UPDATE conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [conversationId]
    );

    const [newMessages] = await connection.query(
      `
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.is_edited,
        m.is_deleted,
        m.created_at,
        m.updated_at,
        u.username AS sender_username,
        up.display_name AS sender_display_name,
        up.avatar_path AS sender_avatar_path

      FROM messages m

      INNER JOIN users u
        ON u.id = m.sender_id

      LEFT JOIN user_profiles up
        ON up.user_id = u.id

      WHERE m.id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    // Get participants before committing, for personal-room updates.
    const [participants] = await connection.query(
      `
      SELECT user_id
      FROM conversation_members
      WHERE conversation_id = ?
      `,
      [conversationId]
    );

    await connection.commit();

    const sentMessage = newMessages[0];

    // Deliver to everyone currently inside the conversation room.
    emitToConversation(conversationId, "message:new", sentMessage);

    // Update each participant's conversation preview and ordering.
    for (const participant of participants) {
      emitToUser(participant.user_id, "conversation:updated", {
        conversation_id: String(conversationId),
        message: sentMessage,
      });
    }

    return res.status(201).json({
      message: "Message sent successfully.",
      sent_message: sentMessage,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("[Messages] Send message error:", error);

    return res.status(500).json({
      message: "Failed to send message.",
    });
  } finally {
    if (connection) connection.release();
  }
};
