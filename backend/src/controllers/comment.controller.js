import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const validateId = (id) => {
  if (!id) throw new ApiError(400, "Id is missing");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid ID");
  return new mongoose.Types.ObjectId(id);
};
const getVideoComments = asyncHandler(async (req, res) => {
  //get all comments for a video
  const { videoId } = req.params;
  const {
    page = 1,
    limit = 10,
    // sortBy = "createdAt",
    // sortType = "desc",
  } = req.query;

  //validate video id
  const id = validateId(videoId);

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const options = {
    page: pageNumber,
    limit: limitNumber,
  };
  //   const sortOrder = sortType === "asc" ? 1 : -1;
  //   const sortStage = {
  //     [sortBy]: sortOrder,
  //   };
  const pipeline = [
    {
      $match: {
        video: id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentator",
      },
    },
    {
      $unwind: "$commentator",
    },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        commentator: {
          _id: 1,
          username: 1,
          avatar: 1,
          fullName: 1,
          createdAt: 1,
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ];
  const aggregate = Comment.aggregate(pipeline);
  const result = await Comment.aggregatePaginate(aggregate, options);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "All comments fetched successfully"));
});
const addComment = asyncHandler(async (req, res) => {
  // add a comment to a video
  const { content } = req.body;
  const videoId = validateId(req.params.videoId);
  const userId = req.user?._id; //no need to validate as it is already validated from auth
  if (!content?.trim()) throw new ApiError(400, "content is missing");
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  //replace the owner ID with actual user info
  const commentDetails = await Comment.findById(comment._id).populate(
    "owner",
    "username avatar fullName"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, commentDetails, "Comment created successfully"));
});
const editComment = asyncHandler(async (req, res) => {
  //edit a comment
  const { content } = req.body;
  const commentId = validateId(req.params.commentId);
  const userId = req.user?._id;
  if (!content?.trim()) throw new ApiError(400, "content is missing");

  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: userId },
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  ).populate("owner", "username fullName avatar");
  if (!updatedComment) throw new ApiError(403, "You cannot edit this comment");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedComment,
        "Comment has been updated successfully"
      )
    );
});
const deleteComment = asyncHandler(async (req, res) => {
  //delete a comment
  const commentId = validateId(req.params.commentId);
  const userId = req.user?._id;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  //Only Owner can delete the comment
  if (comment.owner.toString() !== userId.toString())
    throw new ApiError(403, "you are not allowed to delete this comment");

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully."));
});
export { getVideoComments, addComment, editComment,deleteComment };
