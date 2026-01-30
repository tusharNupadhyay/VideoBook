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
  const userId = req.user?._id;
  const videoId = req.query.videoId ? validateId(req.query.videoId) : null; //to compute hasVideo field in playlists

  const channelId = validateId(req.params.channelId); // same as userId (compulsory)

  const isOwner = userId && userId.toString() === channelId.toString();

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const result = await PlayList.aggregate([
    {
      $match: {
        owner: channelId,
        //returns both public and private playlists if isOwner is true
        ...(isOwner ? {} : { privacy: "public" }),
      },
    },
    {
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $addFields: {
              hasVideo: videoId ? { $in: [videoId, "$videos"] } : false,
            },
          },
          {
            //playlist owner lookup
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$owner" },

          {
            $project: {
              name: 1,
              description: 1,
              privacy: 1,
              coverImage: 1,
              hasVideo: 1,
              videos: 1,
              owner: {
                _id: "$owner._id",
                username: "$owner.username",
                avatar: "$owner.avatar",
              },
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);
  const playlists = result[0].data;
  const total = result[0].totalCount[0]?.count || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlists,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "fetched user's playlists successfully"
    )
  );
});
const getPlaylistById = asyncHandler(async (req, res) => {
  const playlistId = validateId(req.params.playlistId);

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  //to find out owner of playlist so we can check whether req.user._id = owner to fetch private playlist
  const playlist = await PlayList.findById(playlistId).select("owner privacy");
  if (!playlist) throw new ApiError(404, "Playlist do not exist");
  const isOwner =
    req.user && playlist.owner.toString() === req.user._id.toString();
  //no need to check in match stage using $or
  if (playlist.privacy === "private" && !isOwner)
    throw new ApiError(403, "Playlist is private");

  //using aggregation pipeline
  const result = await PlayList.aggregate([
    {
      $match: {
        _id: playlistId,
      },
    },
    {
      $facet: {
        playlist: [
          //playlist owner lookup
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
          {
            $project: {
              name: 1,
              description: 1,
              coverImage: 1,
              privacy: 1,
              owner: {
                _id: "$owner._id",
                username: "$owner.username",
                avatar: "$owner.avatar",
              },
            },
          },
        ],
        videos: [
          //without unwind pagination and sorting wouldn't be possible
          { $unwind: "$videos" },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "videos",
              localField: "videos",
              foreignField: "_id",
              as: "video",
              pipeline: [
                //lookup the owner of the video
                {
                  $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                  },
                },
                { $unwind: "$owner" },
                {
                  $project: {
                    title: 1,
                    thumbnail: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1,
                    owner: {
                      _id: "$owner._id",
                      username: "$owner.username",
                      avatar: "$owner.avatar",
                    },
                  },
                },
              ],
            },
          },
          { $unwind: "$video" },

          {
            $project: {
              _id: "$video._id",
              title: "$video.title",
              thumbnail: "$video.thumbnail",
              duration: "$video.duration",
              createdAt: "$video.createdAt",
              viewCount: {
                $size: { $ifNull: ["$video.views", []] },
              },
              owner: "$video.owner",
            },
          },
        ],

        totalVideos: [{ $project: { count: { $size: "$videos" } } }],
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlist: result[0].playlist[0],//single object
        videos: result[0].videos, // array
        pagination: {
          total: result[0].totalVideos[0]?.count || 0,
          page,
          limit,
          totalPages: Math.ceil((result[0].totalVideos[0]?.count || 0) / limit),
        },
      },
      "Fetched playlist successfully"
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
        // videoCount: updatedPlaylist.videos.length,
        // coverImage: video.thumbnail,
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
    throw new ApiError(403, "You are not allowed to modify this playlist");
  }
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  //remove videoID from playlist
  let updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  ).populate("owner", "username avatar");

  if (!updatedPlaylist) throw new ApiError(404, "Playlist not found");

  //now check if cover image needs to be updated or not

  if (updatedPlaylist.coverImage === video.thumbnail) {
    //findOne returns arbitrary any document so we sort to only fetch latest video
    const latestVideo = await Video.findOne({
      _id: { $in: updatedPlaylist.videos },
    })
      .sort({ createdAt: -1 })
      .select("thumbnail");

    updatedPlaylist.coverImage = latestVideo ? latestVideo.thumbnail : null;
    await updatedPlaylist.save();
  }

  return res.status(200).json(
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
  );
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlist: updatedPlaylist,
        // videoCount: updatedPlaylist.videos.length,
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
        videoCount: updatedPlaylist.videos.length,
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
