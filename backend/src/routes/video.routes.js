import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT,optionalVerifyJwt } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllUserVideos,
  getAllVideos,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVideoDetails,
} from "../controllers/video.controller.js";

const router = Router();

//use the same base route "/" for all operations on the same resource collection(videos)
router
  .route("/")
  .get(getAllVideos)
  .post(
    verifyJWT,
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishVideo
  );
//get all videos of a user (public)
router.route("/user/:userId").get(getAllUserVideos);
// single video operations
router
  .route("/:videoId")
  .get(optionalVerifyJwt,getVideoById) //public
  .delete(verifyJWT, deleteVideo) //protected
  .patch(verifyJWT, upload.single("thumbnail"), updateVideoDetails); //protected

//for special actions like toggle publish status special endpoints should be used
router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);
export default router;
