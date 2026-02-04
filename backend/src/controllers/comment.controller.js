import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";

const validateId = (id) => {
  if (!id) throw new ApiError(400, "Id is missing");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid ID");
  return new mongoose.Types.ObjectId(id);
};
const getVideoComments = asyncHandler(async (req, res) => {
  /*
  for a given video: get paginated comments,
  for each comment,
  get comment owner details like username ,avatar,
  get total likes and dislikes for each comment,
  if user is logged in get userReaction which checks whether user has liked the comment or not
  */
  const { page = 1, limit = 10 } = req.query;

  const videoId = validateId(req.params.videoId);

  const userId = req.user?._id || null;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;

  const commentsAggregation = await Comment.aggregate([
    // 1. Filter comments for the specific video
    { $match: { video: videoId } },

    // 2. Sort by newest first
    { $sort: { createdAt: -1 } },

    // 3. Use Facet to get Total Count and Paginated Data in one go
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: (pageNumber - 1) * limitNumber },
          { $limit: limitNumber },

          // Lookup Owner Details
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          { $unwind: "$owner" },

          // Lookup Reactions for each comment
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "comment",
              as: "reactions",
            },
          },

          // Project the fields exactly how you want them
          {
            $project: {
              _id: 1,
              content: 1,
              createdAt: 1,
              owner: {
                _id: 1,
                username: 1,
                avatar: 1,
              },
              // Calculate likes/dislikes count from the reactions array
              likesCount: {
                $size: {
                  $filter: {
                    input: "$reactions",
                    as: "r",
                    cond: { $eq: ["$$r.value", 1] },
                  },
                },
              },
              dislikesCount: {
                $size: {
                  $filter: {
                    input: "$reactions",
                    as: "r",
                    cond: { $eq: ["$$r.value", -1] },
                  },
                },
              },
              // Find the specific reaction for the logged-in user
              userReaction: {
                $ifNull: [
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$reactions",
                          as: "r",
                          cond: { $eq: ["$$r.likedBy", userId] },
                        },
                      },
                      0,
                    ],
                  },
                  null,
                ],
              },
            },
          },
        ],
      },
    },
  ]);

  const totalComments = commentsAggregation[0].metadata[0]?.total || 0;
  const comments = commentsAggregation[0].data;

  // Clean up userReaction to just return the value (1, -1, or null)
  const finalComments = comments.map((c) => ({
    ...c,
    userReaction: c.userReaction ? c.userReaction.value : null,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments: finalComments,
        totalComments,
        page: pageNumber,
        totalPages: Math.ceil(totalComments / limitNumber),
        hasNextPage: pageNumber * limitNumber < totalComments,
      },
      "Comments fetched successfully"
    )
  );

  // //fetch comments + owner
  // const comments = await Comment.aggregate([
  //   { $match: { video: videoId } },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "owner",
  //       foreignField: "_id",
  //       as: "owner",
  //     },
  //   },
  //   { $unwind: "$owner" },
  //   {
  //     $project: {
  //       _id: 1,
  //       content: 1,
  //       createdAt: 1,
  //       owner: {
  //         _id: 1,
  //         username: 1,
  //         avatar: 1,
  //       },
  //     },
  //   },
  //   { $sort: { createdAt: -1 } },
  //   { $skip: (pageNumber - 1) * limitNumber },
  //   { $limit: limitNumber },
  // ]);

  // //array of comment id's
  // const commentIds = comments.map((c) => c._id);

  // //Initialize reactionsMap with all comments (default 0/0/null)
  // const reactionsMap = {};
  // comments.forEach((c) => {
  //   reactionsMap[c._id] = { likes: 0, dislikes: 0, userReaction: null };
  // });

  // //fetch likes and dislikes for all comments (* comments which have 0 likes or 0 dislikes will not be present in reactionstats)
  // const reactionStats = await Like.aggregate([
  //   {
  //     $match: {
  //       comment: { $in: commentIds },
  //       value: { $in: [1, -1] },
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$comment",
  //       likes: { $sum: { $cond: [{ $eq: ["$value", 1] }, 1, 0] } },
  //       dislikes: { $sum: { $cond: [{ $eq: ["$value", -1] }, 1, 0] } },
  //     },
  //   },
  // ]);

  // //update reactionStats with aggregated likes and dislikes
  // reactionStats.forEach((r) => {
  //   reactionsMap[r._id].likes = r.likes;
  //   reactionsMap[r._id].dislikes = r.dislikes;
  // });
  // if (userId) {
  //   //fetch all the comments which user have liked if user is logged in
  //   const userReactions = await Like.find({
  //     comment: { $in: commentIds },
  //     likedBy: userId,
  //   }).select("comment value");

  //   //update the value in the reactionsMap
  //   userReactions.forEach((r) => {
  //     //r is a like document so r.comment is comment id
  //     reactionsMap[r.comment].userReaction = r.value;
  //   });
  // }

  // //now merge reactions into comments
  // const finalComments = comments.map((c) => ({
  //   ...c,
  //   reactions: reactionsMap[c._id],
  // }));

  // //total comment count for pagination
  // const totalComments = await Comment.countDocuments({ video: videoId });

  // return res.status(200).json(
  //   new ApiResponse(
  //     200,
  //     {
  //       comments: finalComments,
  //       totalComments,
  //       page,
  //       totalPages: Math.ceil(totalComments / limit),
  //     },
  //     "All comments fetched successfully"
  //   )
  // );
});
const addComment = asyncHandler(async (req, res) => {
  // add a comment to a video
  const { content } = req.body;
  const videoId = validateId(req.params.videoId);
  const userId = validateId(req.user._id);
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
  if (!content?.trim()) {
    throw new ApiError(400, "Comment content cannot be empty");
  }

  const comment = await Comment.findById(commentId).populate(
    "owner",
    "username avatar"
  );
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  if (comment.owner._id.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to edit this comment");
  }

  comment.content = content;
  await comment.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, comment, "Comment has been updated successfully")
    );
});
const deleteComment = asyncHandler(async (req, res) => {
  //delete a comment
  const commentId = validateId(req.params.commentId);
  const userId = req.user?._id;

  const comment = await Comment.findById(commentId).populate("video", "owner"); //so that you can access comment.video.owner
  if (!comment) throw new ApiError(404, "Comment not found");

  //Only comment owner and video owner can delete the comment
  const isCommentOwner = comment.owner.toString() === userId.toString();

  const isVideoOwner = comment.video.owner.toString() === userId.toString();

  if (!isCommentOwner && !isVideoOwner) {
    throw new ApiError(403, "You are not allowed to delete this comment");
  }

  await comment.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, commentId, "Comment deleted successfully."));
});
export { getVideoComments, addComment, editComment, deleteComment };
