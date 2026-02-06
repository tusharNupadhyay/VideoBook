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
  const { name, description, privacy } = req.body;

  if (!name?.trim()) throw new ApiError(400, "Name of playlist is required");
  const userId = req.user?._id;
  const playlist = await PlayList.create({
    name,
    description: description || "",
    owner: userId,
    privacy,
  });
  if (!playlist) throw new ApiError(500, "failed to create playlist");
  await playlist.populate("owner", "username avatar ");
  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getChannelPlaylists = asyncHandler(async (req, res) => {
  //fetch only playlists of channel not the videos

  const { channelId } = req.params;
  const { page = 1, limit = 10,  } = req.query;

  const userId = req.user?._id;
  const targetChannelId = validateId(channelId);

  const videoId = req.query.videoId ? validateId(req.query.videoId) : null; //to compute hasVideo field in playlists

  // Check if the requester is the owner of the channel
  const isOwner = userId?.toString() === targetChannelId.toString();

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);


 const result = await PlayList.aggregate([
    {
      $match: {
        owner: targetChannelId,
        // Only show private playlists to the owner
        ...(isOwner ? {} : { privacy: "public" }),
      },
    },
    { $sort: { createdAt: -1 } },

    {
      $facet: {
        //  The Playlist Data
        playlists: [
          { $skip: (pageNumber - 1) * limitNumber },
          { $limit: limitNumber },
          {
            $addFields: {
              // Check if a specific video is in this playlist (for UI checkboxes)
              hasVideo: videoId 
                ? { $in: [videoId, "$videos"] } 
                : false,
              totalVideos: { $size: "$videos" }
            }
          },
          {
            $project: {
              name: 1,
              description: 1,
              privacy: 1,
              coverImage: 1,
              hasVideo: 1,
              totalVideos: 1,
              createdAt: 1
            }
          }
        ],
        // total number of playlists
        totalCount: [{ $count: "count" }]
      }
    }
  ]);

  const playlists = result[0]?.playlists || [];
  const total = result[0]?.totalCount[0]?.count || 0;


return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlists,
        totalPlaylists: total,
        currentPage: pageNumber,
        hasNextPage: pageNumber * limitNumber < total,
        totalPages: Math.ceil(total / limitNumber)
      },
      "channel playlists fetched successfully"
    )
  );
});
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const targetPlaylistId = validateId(playlistId);
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const result = await PlayList.aggregate([
    { $match: { _id: targetPlaylistId } },
    {
      $facet: {
        // Part A: Playlist Information (Header)
        metadata: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{ $project: { username: 1, avatar: 1 } }]
            }
          },
          { $unwind: "$owner" },
          {
            $project: {
              name: 1,
              description: 1,
              coverImage: 1,
              privacy: 1,
              owner: 1,
              totalVideos: { $size: "$videos" }
            }
          }
        ],
        // Part B: Paginated Videos List
        videos: [
          { $unwind: "$videos" },
          // sort the IDs or creation dates here if needed
          { $skip: (pageNumber - 1) * limitNumber },
          { $limit: limitNumber },
          {
            $lookup: {
              from: "videos",
              localField: "videos",
              foreignField: "_id",
              as: "videoDetails",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [{ $project: { username: 1, avatar: 1 } }]
                  }
                },
                { $unwind: "$owner" },
                {
                  $project: {
                    title: 1,
                    thumbnail: 1,
                    duration: 1,
                    createdAt: 1,
                    viewCount: { $size: { $ifNull: ["$views", []] } },
                    owner: 1
                  }
                }
              ]
            }
          },
          { $unwind: "$videoDetails" },
          { $replaceRoot: { newRoot: "$videoDetails" } }
        ]
      }
    }
  ]);

  const playlistInfo = result[0]?.metadata[0];
  if (!playlistInfo) throw new ApiError(404, "Playlist not found");

  // Security Check: If private, ensure req.user is the owner
  if (playlistInfo.privacy === "private" && 
      playlistInfo.owner._id.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "This playlist is private");
  }

  const videos = result[0]?.videos || [];
  const total = playlistInfo.totalVideos;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlist: playlistInfo,
        videos,
        totalVideos: total,
        currentPage: pageNumber,
        hasNextPage: pageNumber * limitNumber < total,
        totalPages: Math.ceil(total / limitNumber)
      },
      "Playlist details fetched successfully"
    )
  );

});
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const playlistId = validateId(req.params.playlistId);
  const videoId = validateId(req.body.videoId);

  const playlist = await PlayList.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to modify this playlist");
  }

  const video = await Video.findById(videoId).select("thumbnail");
  if (!video) throw new ApiError(404, "Video not found");

  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId }, // prevents duplicates
      $set: { coverImage: video.thumbnail },
    },
    { new: true }
  ).populate("owner", "username avatar");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlist: updatedPlaylist,
        totalVideos: updatedPlaylist.videos.length,
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

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const video = await Video.findById(videoId);
  
  //  Pull the video
  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
  ).populate("owner", "username avatar");

  //  update cover image if we just deleted the cover video
  if (updatedPlaylist.coverImage === video?.thumbnail) {
    const latestVideo = await Video.findOne({ _id: { $in: updatedPlaylist.videos } })
      .sort({ createdAt: -1 });
    
    updatedPlaylist.coverImage = latestVideo ? latestVideo.thumbnail : null;
    await updatedPlaylist.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlist: updatedPlaylist,
        totalVideos: updatedPlaylist.videos.length, 
      },
      "Video removed successfully"
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
    .json(new ApiResponse(200, playlistId, "Playlist deleted successfully"));
});
const updatePlaylist = asyncHandler(async (req, res) => {
  const playlistId = validateId(req.params.playlistId);
  const { name, description,privacy } = req.body;
  const playlist = await PlayList.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist does not exist");

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to modify this playlist");
  }
  if (!name?.trim()) throw new ApiError(400, "Name is required");
  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description: description || "",
        privacy
      },
    },
    { new: true }
  ).populate("owner", "username avatar");
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlist: updatedPlaylist,
        totalVideos: updatedPlaylist.videos.length,
      },
      "Playlist updated successfully"
    )
  );
});
const togglePrivacy = asyncHandler(async (req, res) => {
  const playlistId = validateId(req.params.playlistId);
  const playlist = await PlayList.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist does not exist");
  //only owner can update
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to modify this playlist");
  }

  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    [
      {
        $set: {
          privacy: {
            $cond: [{ $eq: ["$privacy", "public"] }, "private", "public"],
          },
        },
      },
    ],
    { new: true }
  ).populate("owner", "username avatar");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlist: updatedPlaylist,
        totalVideos: updatedPlaylist.videos.length,
      },
      "Playlist updated successfully"
    )
  );
});
export {
  createPlaylist,
  getChannelPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  togglePrivacy,
};
