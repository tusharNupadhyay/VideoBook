import { Router } from "express";
import { verifyJWT ,optionalVerifyJwt} from "../middlewares/auth.middleware.js";
import {
  getVideoComments,
  addComment,
  editComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();
//optional auth
router.get("/:videoId",optionalVerifyJwt, getVideoComments);

//Private: with Auth
router.use(verifyJWT);
router.post("/:videoId", addComment); //add a comment
router.route("/id/:commentId").delete(deleteComment).patch(editComment); //edit or delete a comment

export default router;
