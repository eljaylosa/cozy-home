import express from "express";

import { authenticate } from "../middleware/authenticate.js";

import {
  createHouse,
  getMyHouses,
  joinHouse,
  updateHouse,
  archiveHouse,
  restoreHouse,
} from "../controllers/houseController.js";

const router = express.Router();

router.use(authenticate);

router.get("/my", getMyHouses);
router.post("/join", joinHouse);
router.post("/", createHouse);

router.put("/:id", updateHouse);
router.patch("/:id/archive", archiveHouse);
router.patch("/:id/restore", restoreHouse);

export default router;
