import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  },
  { timestamps: true }
);
//we need uniqueness based on the pair( video + likeyBy), not individually
//enforces that one user can only like a video once
//creates a compound unique index on the pair
likeSchema.index(
  { video: 1, likedBy: 1 },
  {
    unique: true,
    // Use partial indexes to avoid duplicate key errors.
    // MongoDB treats all null values as equal, so without partialFilterExpression,
    // likes for videos/comments/tweets would conflict with each other.
    // The partial filter makes the unique rule apply ONLY when the field exists
    // (video/comment/tweet is not null), ensuring 1 like per user per item.
    partialFilterExpression: { video: { $exists: true, $ne: null } },
  }
);
likeSchema.index(
  { comment: 1, likedBy: 1 },
  {
    unique: true,
    partialFilterExpression: { comment: { $exists: true, $ne: null } },
  }
);
likeSchema.index(
  { tweet: 1, likedBy: 1 },
  {
    unique: true,
    partialFilterExpression: { tweet: { $exists: true, $ne: null } },
  }
);
export const Like = mongoose.model("Like", likeSchema);
