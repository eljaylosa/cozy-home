import express from "express";
import { authenticate } from "../middleware/authenticate.js";

import {
  searchFriend,
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  unfriend,
  getFriendProfile,
  getFriendHouses,
} from "../controllers/friendController.js";

const router = express.Router();

router.use(authenticate);

// Friends list and friend discovery
router.get("/", getFriends);
router.get("/search", searchFriend);

// Friend profile and house browsing
router.get("/:friendId/profile", getFriendProfile);
router.get("/:friendId/houses", getFriendHouses);
router.delete("/:friendId", unfriend);

// Friend requests
router.post("/requests", sendFriendRequest);

router.get("/requests/incoming", getIncomingRequests);
router.get("/requests/outgoing", getOutgoingRequests);

router.patch("/requests/:id/accept", acceptFriendRequest);
router.patch("/requests/:id/decline", declineFriendRequest);
router.delete("/requests/:id", cancelFriendRequest);

export default router;
