import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";

const validateId = (id) => {
  if (!id) throw new ApiError(400, "Id is missing");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid ID");
  return new mongoose.Types.ObjectId(id);
};

const getChannelStats = asyncHandler(async (req, res) => {
  // Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = validateId(req.user?._id);

  //aggregation query
  const channelStats = await User.aggregate([
    {
      $match: { _id: userId },
    },
    {
      $facet: {
        userDetails: [
          {
            //get total subscribers
            $lookup: {
              from: "subscribers",
              localField: "_id",
              foreignField: "channel",
              as: "totalSubs",
            },
          },
          //get channel user is subscribed to
          {
            $lookup: {
              from: "subscribers",
              localField: "_id",
              foreignField: "subscriber",
              as: "subscribedTo",
            },
          },

          {
            //get total tweets of user
            $lookup: {
              from: "tweets",
              localField: "_id",
              foreignField: "owner",
              as: "tweets",
            },
          },
          {
            $addFields: {
              totalSubs: { $size: "$totalSubs" },
              channelsSubscribedTo: { $size: "$subscribedTo" },
              totalTweets: { $size: "$tweets" },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              totalSubs: 1,
              channelsSubscribedTo: 1,
              totalTweets: 1,
              coverImage: 1,
            },
          },
        ],
        videoDetails: [
          {
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "owner",
              as: "videoArray",
              pipeline: [
                {
                  $match: { isPublished: true }, //fetch only published videos
                },
                {
                  $project: {
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    viewCount: {
                      $size: { $ifNull: ["$views", []] },
                    },
                    //videoFile: 1,
                    isPublished: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              //no need to use $ifNull because $lookup always returns an array(even if empty), never null
              totalVideos: { $size: "$videoArray" },
              totalViews: { $sum: "$videoArray.viewCount" }, //for numeric values(viewCount) , no need to use $map inside $sum
            },
          },
          {
            $project: {
              videoArray: 1,
              totalVideos: 1,
              totalViews: 1,
            },
          },
        ],
        totalVideoLikes: [
          //lookup user's videos : only id's are needed
          {
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "owner",
              as: "userVideos",
            },
          },
          {
            //build array of only video id's because uservideos is an array of objects containing Id and other things, and for "let" comparison we need an array with only id's
            $addFields: {
              videoIds: {
                $map: { input: "$userVideos", as: "v", in: "$$v._id" },
              },
            },
          },
          {
            //now lookup likes for these video id's
            $lookup: {
              from: "likes",
              let: { vids: "$videoIds" }, //pass parent field because pipeline inside lookups are isolated , they cannot directly access videoIds
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $in: ["$video", "$$vids"] }, //video is from like document
                        { $eq: ["$value", 1] }, // ONLY likes
                      ],
                    },
                  },
                },
              ],
              as: "videoLikes",
            },
          },
          {
            $addFields: {
              totalVideoLikes: { $size: "$videoLikes" },
            },
          },
          {
            $project: {
              _id: 0,
              totalVideoLikes: 1,
            },
          },
        ],
        totalPlaylists: [
          {
            $lookup: {
              from: "playlists",
              localField: "_id",
              foreignField: "owner",
              as: "playlistArray",
            },
          },
          {
            $addFields: {
              totalPlaylists: { $size: "$playlistArray" },
              totalPlaylistVideos: {
                $sum: {
                  $map: {  //loop over playlistArray
                    input: "$playlistArray",
                    as: "pl",
                    in: { $size: { $ifNull: ["$$pl.videos", []] } }, //$ifNull is safety check, it treats missing/null as empty array[]
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalPlaylists: 1,
              totalPlaylistVideos: 1
            },
          },
        ],
      },
    },
    {
      $project: {
        userDetails: 1,
        videoDetails: 1,
        totalVideoLikes: 1,
        totalPlaylists: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelStats,
        "All channel details fetched successfully"
      )
    );
});

export { getChannelStats };
