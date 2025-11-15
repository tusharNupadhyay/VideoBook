import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {ApiError} from "../utils/ApiError.js";

const router = Router();
//since we can only handle json data in registeruser method(like email,username,etc) not files so we will use multer middleware here to handle files
//upload(multer) middleware intercepts two fields that are sent from frontend(postman) stores them in req.files and passes the control to registeruser method
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
