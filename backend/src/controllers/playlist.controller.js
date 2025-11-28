import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const validateId = (id) => {
  if (!id) throw new ApiError(400, "Id is missing");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid ID");
  return new mongoose.Types.ObjectId(id);
};

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) throw new ApiError(400, "Name of playlist is required");
  const userId = req.user?._id;
  const playlist = await PlayList.create({
    name,
    description: description || "",
    owner: userId,
  });
  if (!playlist) throw new ApiError(500, "failed to create playlist");
  await playlist.populate("owner", "username avatar fullName");
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { playlist, videoCount: playlist.videos.length },
        "Playlist created successfully"
      )
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = validateId(req.params.userId);

  const userPlaylists = await PlayList.find({ owner: userId })
    .sort({ createdAt: -1 }) //newest first
    .populate("owner", "username fullName avatar")
    .populate({
      path: "videos",
      select:
        "videoFile thumbnail title duration description views isPublished",
      populate: {
        path: "owner",
        select: "username fullName avatar",
      },
    });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylists,
        "fetched user's playlists successfully"
      )
    );
});
const getPlaylistById = asyncHandler(async (req, res) => {
  const playlistId = validateId(req.params.playlistId);
  //   const playlist = await PlayList.findById(playlistId).populate({
  //     path: "videos",
  //     select: "videoFile thumbnail title duration description views isPublished",
  //     populate: {
  //       path: "owner",
  //       select: "username fullName avatar",
  //     },
  //   });
  //   // Sort videos by newest first(using node js not mongodb)
  //   playlist.videos = playlist.videos.sort(
  //     (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  //   );
  //using aggregation pipeline
  const playlist = await PlayList.aggregate([
    {
      $match: {
        _id: playlistId,
      },
    },
    //owner lookup
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    //videos lookup
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          //lookup video owner
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          {
            $unwind: "$ownerDetails",
          },
          {
            //for project always refers to field of the current document: here current document is video document from videos collection
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              duration: 1,
              description: 1,
              viewCount: {
                $size: {
                  $ifNull: ["$views", []],
                },
              },
              isPublished: 1,
              createdAt: 1,
              owner: {
                _id: "$ownerDetails._id",
                username: "$ownerDetails.username",
                fullName: "$ownerDetails.fullName",
                avatar: "$ownerDetails.avatar",
              },
            },
          },
          // Sort videos (newest first)
          { $sort: { createdAt: -1 } },
        ],
      },
    },
    // ---- FINAL PROJECT ----
    {
      $project: {
        name: 1,
        description: 1,
        owner: {
          _id: "$owner._id",
          username: "$owner.username",
          fullName: "$owner.fullName",
          avatar: "$owner.avatar",
        },
        videos: 1,
      },
    },
  ]);

  if (!playlist || playlist.length === 0)
    throw new ApiError(404, "Playlist do not exist");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist: playlist[0], videoCount: playlist[0].videos.length },
        "Fetched playlist successfully"
      )
    );
});
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const playlistId = validateId(req.params.playlistId);
  const videoId = validateId(req.body.videoId);

  const playlist = await PlayList.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId }, // prevents duplicates
    },
    { new: true }
  )
    .populate("owner", "username fullName avatar")
    .populate("videos", "thumbnail title duration");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          playlist: updatedPlaylist,
          videoCount: updatedPlaylist.videos.length,
        },
        "Video added to playlist"
      )
    );
});
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const playlistId = validateId(req.params.playlistId);
  const videoId = validateId(req.body.videoId);

  const playlist = await PlayList.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  )
    .populate("owner", "username fullName avatar")
    .populate({
      path: "videos",
      select:
        "videoFile thumbnail duration title description views isPublished",
      populate: { path: "owner", select: "username fullName avatar" },
    });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          playlist: updatedPlaylist,
          videoCount: updatedPlaylist.videos.length,
        },
        "Video removed from playlist"
      )
    );
});
const deletePlaylist = asyncHandler(async (req, res) => {
  const playlistId = validateId(req.params.playlistId);
  const userId = validateId(req.user?._id);
  const playlist = await PlayList.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist do not exist");

  //Only owner can delete the playlist
  if (playlist.owner.toString() !== userId.toString())
    throw new ApiError(403, "You are not authorized to delete the playlist");
  await PlayList.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});
const updatePlaylist = asyncHandler(async (req, res) => {
  const playlistId = validateId(req.params.playlistId);
  const { name, description } = req.body;
  const playlist = await PlayList.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist does not exist");
  if (!name?.trim()) throw new ApiError(400, "Name is required");
  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description: description || "",
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          playlist: updatedPlaylist,
          videoCount: updatedPlaylist.videos.length,
        },
        "Playlist updated successfully"
      )
    );
});
export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
