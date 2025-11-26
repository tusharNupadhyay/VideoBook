import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/like.controller.js";

const router = Router();
//all routes are private
router.use(verifyJWT);
//we use patch to modify the field inside an existing document (like publish status for a video) whereas use post to modify or create/delete a relationship between documents (like toggling a like , following a user,etc)
router.route("/toggle/videos/:videoId").post(toggleVideoLike);
router.route("/toggle/comments/:commentId").post(toggleCommentLike);
router.route("/toggle/tweets/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router;
