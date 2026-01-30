import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const validateId = (id) => {
  if (!id) throw new ApiError(400, "Id is missing");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid ID");
  return new mongoose.Types.ObjectId(id);
};

//reusable helper for toggling likes on videos,comments and tweets
const toggleReaction = async ({ filter, userId, value }) => {
  if (![1, -1].includes(value)) {
    throw new ApiError(400, "Invalid reaction value");
  }

  //find whether like by user exist on this or not
  const reaction = await Like.findOne({ ...filter, likedBy: userId });
  if (!reaction) {
    await Like.create({
      ...filter,
      likedBy: userId,
      value,
    });
  }
  // Same reaction then toggle off
  else if (reaction.value === value) {
    await reaction.deleteOne();
  }
  // else Switch reaction (like <--> dislike)
  else {
    reaction.value = value;
    await reaction.save();
  }
  //Compute total likes and dislikes
  const stats = await Like.aggregate([
    { $match: filter }, //since we are matching with exact Id in filter so we don't need to check for null and exists
    {
      //groupt combines all documents given my $match based on _id for id = null it combines all documents into singe document
      $group: {
        _id: null,
        likesCount: {
          $sum: { $cond: [{ $eq: ["$value", 1] }, 1, 0] },
        },
        dislikesCount: {
          $sum: { $cond: [{ $eq: ["$value", -1] }, 1, 0] },
        },
      },
    },
  ]);
  //find current user's reaction after toggle -1,0,1
  const userReaction = await Like.findOne({
    ...filter,
    likedBy: userId,
  });
  return {
    likes: stats[0]?.likesCount || 0,
    dislikes: stats[0]?.dislikesCount || 0,
    userReaction: userReaction?.value || null,
  };
};

const toggleVideoLike = asyncHandler(async (req, res) => {
  const videoId = validateId(req.params.videoId);
  const userId = validateId(req.user?._id);

  const { value } = req.body; // FROM BODY

  //check whether the video exists or not
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video does not exist");

  const result = await toggleReaction({
    filter: { video: videoId },
    userId,
    value,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Video reaction updated"));
});
const toggleCommentLike = asyncHandler(async (req, res) => {
  //toggle like on a comment
  const commentId = validateId(req.params.commentId);
  const userId = validateId(req.user?._id);

  const { value } = req.body;

  //check if comment exist or not
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment does not exist");

  const result = await toggleReaction({
    filter: { comment: commentId },
    userId,
    value,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comment reaction updated"));
});
const toggleTweetLike = asyncHandler(async (req, res) => {
  const tweetId = validateId(req.params.tweetId);
  const userId = validateId(req.user?._id);

  const { value } = req.body;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "Tweet does not exist");

  const result = await toggleReaction({
    filter: { tweet: tweetId },
    userId,
    value,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Tweet reaction updated"));
});
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = validateId(req.user?._id);

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $exists: true, $ne: null }, //$exists: true alone is not enough,MongoDB treats null as existing so $ne:null
        value: 1, //only likes no dislikes
      },
    },
    {
      $sort: { createdAt: -1 }, // most recent first
    },
    { $skip: skip },
    { $limit: limit },
    {
      //lookup the video Details
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $match: { isPublished: true },
          },
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
              thumbnail: 1,
              title: 1,
              duration: 1,
              viewCount: { $size: { $ifNull: ["$views", []] } },
              owner: {
                username: "$owner.username",
                avatar: "$owner.avatar",
              },
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      //throws away the current document(like) and make videoDetails the new current document
      $replaceRoot: {newRoot: "$videoDetails"},
    }
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});
const getVideoReactions = asyncHandler(async (req, res) => {
  //get likes dislikes for a video
  const videoId = validateId(req.params.videoId);
  const userId = req.user?._id || null;

  const stats = await Like.aggregate([
    {
      $match: {
        video: videoId,
        value: { $in: [1, -1] },
      },
    },
    {
      $group: {
        _id: null,
        likes: {
          $sum: { $cond: [{ $eq: ["$value", 1] }, 1, 0] },
        },
        dislikes: {
          $sum: { $cond: [{ $eq: ["$value", -1] }, 1, 0] },
        },
      },
    },
  ]);
  //find user's last reaction if logged in
  let userReaction = null;
  if (userId) {
    const doc = await Like.findOne({
      video: videoId,
      likedBy: userId,
    }).select("value");
    userReaction = doc?.value ?? null;
  }
  return res.status(200).json(
    new ApiResponse(200, {
      likes: stats[0]?.likes || 0,
      dislikes: stats[0]?.dislikes || 0,
      userReaction,
    })
  );
});

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
  getVideoReactions,
};
