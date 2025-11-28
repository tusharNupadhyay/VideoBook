import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
  getTweetById,
} from "../controllers/tweet.controller.js";

const router = Router();
//Public: without Auth
router.get("/user/:userId", getUserTweets);
router.get("/:tweetId", getTweetById);
//Private: with Auth
router.use(verifyJWT);
router.post("/", createTweet);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
