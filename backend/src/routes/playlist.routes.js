import { Router } from "express";
import {
  createPlaylist,
  getChannelPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  togglePrivacy
} from "../controllers/playlist.controller.js";
import { verifyJWT,optionalVerifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/channel/:channelId", optionalVerifyJwt,getChannelPlaylists); //put this first as express matches routes from top to bottom
router.get("/:playlistId",optionalVerifyJwt, getPlaylistById);

//Private Routes
router.use(verifyJWT);
router.post("/", createPlaylist);
router.route("/:playlistId").patch(updatePlaylist).delete(deletePlaylist);
router.patch("/:playlistId/videos/add", addVideoToPlaylist);
router.patch("/:playlistId/videos/remove", removeVideoFromPlaylist);
router.patch("/toggle/privacy/:playlistId",togglePrivacy);

export default router;
