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

const toggleVideoLike = asyncHandler(async (req, res) => {
  const videoId = validateId(req.params.videoId);
  const userId = req.user?._id;

  //check whether the video exists or not
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json(new ApiResponse(404, {}, "Video not found"));
  }

  //find whether like by user exist on this video or not
  const isLiked = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });
  if (!isLiked) {
    const like = await Like.create({
      video: videoId,
      likedBy: userId,
    });
    return res.status(201).json(new ApiResponse(201, like, "Liked the video"));
  }

  await isLiked.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "unliked the video"));
});
const toggleCommentLike = asyncHandler(async (req, res) => {
  //toggle like on a comment
  const commentId = validateId(req.params.commentId);
  const userId = req.user?._id;
  //check if comment exist or not
  const comment = await Comment.findById(commentId);
  if (!comment)
    return res.status(404).json(new ApiResponse(404, {}, "Comment not found"));
  const isLiked = await Like.findOne({ comment: commentId, likedBy: userId });
  if (!isLiked) {
    const like = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, like, "Liked the Comment"));
  }
  await isLiked.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "unliked the comment"));
});
const toggleTweetLike = asyncHandler(async (req, res) => {
  const tweetId = validateId(req.params.tweetId);
  const userId = req.user?._id;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet)
    return res.status(404).json(new ApiResponse(404, {}, "Tweet not found"));
  const isLiked = await Like.findOne({ tweet: tweetId, likedBy: userId });
  if (!isLiked) {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    return res.status(201).json(new ApiResponse(201, like, "Liked the Tweet"));
  }
  await isLiked.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "Unliked the Tweet"));
});
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $exists: true }, //filters only likes that belongs to videos
      },
    },
    {
      //lookup the video Details
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      //2nd lookup the owner details from user model
      $lookup: {
        from: "users",
        localField: "videoDetails.owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $project: {
        _id: 0, //hide the id of the like document because we need liked videos (video id)
        likedAt: "$createdAt",
        video: {
          _id: "$videoDetails._id",
          title: "$videoDetails.title",
          thumbnail: "$videoDetails.thumbnail",
          duration: "$videoDetails.duration",
          viewCount: {
            $size: {
              $ifNull: ["$videoDetails.views", []],
            },
          },
          owner: {
            _id: "$ownerDetails._id",
            username: "$ownerDetails.username",
            fullName: "$ownerDetails.fullName",
            avatar: "$ownerDetails.avatar",
          },
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike ,getLikedVideos};
