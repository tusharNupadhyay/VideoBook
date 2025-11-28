import { Router } from "express";
import {
  toggleSubscription,
  getSubscribedChannels,
  getSubscribersOfChannel,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//Public routes
router.get("/channel/:channelId", getSubscribersOfChannel);

//Private routes
router.use(verifyJWT);
router.post("/channel/:channelId/toggle", toggleSubscription);
router.get("/user", getSubscribedChannels);

export default router;
