import { Router } from "./user.routes";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addView,
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
  .get(getVideoById) //public
  .delete(verifyJWT, deleteVideo) //protected
  .patch(verifyJWT, upload.single("thumbnail"), updateVideoDetails); //protected

//for special actions like toggle publish status special endpoints should be used
router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);
//adding a view
router.route("/:videoId/views").patch(verifyJWT, addView);
export default router;
