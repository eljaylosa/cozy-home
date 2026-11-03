import express from "express";
import { authenticate } from "../middleware/authenticate.js";

import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getConversations);

router.post("/conversations", createConversation);

router.get("/conversations/:conversationId/messages", getMessages);

router.post("/conversations/:conversationId/messages", sendMessage);

export default router;
