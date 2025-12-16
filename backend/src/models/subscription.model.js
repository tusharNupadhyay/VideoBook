import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
//improves read performance,prevents duplicate subscription, slight write cost(but worth it as writes(subscribing to a channel) are rare and reads (get total subs of channel) are frequent)
subscriptionSchema.index({subscriber: 1,channel: 1},{unique: true})
//helpful for quering total subs of channel
subscriptionSchema.index({channel: 1});
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
