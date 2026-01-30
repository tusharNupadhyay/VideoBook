import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },

    coverImage:{
      type: String,
      default: null,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "public" 
    }
  },
  { timestamps: true }
);

export const PlayList = mongoose.model("PlayList", playlistSchema);
