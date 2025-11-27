import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
//Public Routes
router.get("/user/:userId", getUserPlaylists); //put this first as express matches routes from top to bottom
router.get("/:playlistId", getPlaylistById);

//Private Routes
router.use(verifyJWT);
router.post("/", createPlaylist);
router.route("/:playlistId").patch(updatePlaylist).delete(deletePlaylist);
router.patch("/:playlistId/videos/add", addVideoToPlaylist);
router.patch("/:playlistId/videos/remove", removeVideoFromPlaylist);

export default router;
