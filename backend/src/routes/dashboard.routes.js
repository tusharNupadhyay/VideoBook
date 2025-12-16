import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getChannelStats,
} from "../controllers/dashboard.controller.js";

const router = Router();

//Private routes
router.use(verifyJWT);
router.get("/channel/stats", getChannelStats);

export default router;
