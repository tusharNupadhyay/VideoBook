import { Router } from "express";
import { verifyJWT,optionalVerifyJwt } from "../middlewares/auth.middleware.js";
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
  getVideoReactions
} from "../controllers/like.controller.js";

const router = Router();
//Auth required
router.post("/videos/:videoId/reaction", verifyJWT, toggleVideoLike);
router.post("/comments/:commentId/reaction", verifyJWT, toggleCommentLike);
router.post("/tweets/:tweetId/reaction", verifyJWT, toggleTweetLike);
router.get("/videos", verifyJWT, getLikedVideos);
//optional auth
router.get("/videos/:videoId/reactions",optionalVerifyJwt,getVideoReactions);


export default router;
