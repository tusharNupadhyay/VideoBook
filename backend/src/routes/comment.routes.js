import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVideoComments,
  addComment,
  editComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();
//Public: without auth
router.get("/:videoId", getVideoComments);

//Private: with Auth
router.use(verifyJWT);
router.post("/:videoId", addComment); //add a comment
router.route("/comment/:commentId").delete(deleteComment).patch(editComment); //edit or delete a comment

export default router;
