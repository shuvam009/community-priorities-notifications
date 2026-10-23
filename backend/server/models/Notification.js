import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    audience: {
      type: String,
      enum: ["user", "citizens"],
      default: "user",
      index: true,
    },
    type: {
      type: String,
      enum: ["proposal_status", "comment", "vote", "announcement", "system"],
      required: true,
    },
    title: { type: String, trim: true, maxlength: 100 },
    message: { type: String, required: true, trim: true, maxlength: 250 },
    relatedProposal: { type: mongoose.Schema.Types.ObjectId, ref: "Proposal" },
    relatedVotingSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VotingSlot",
    },
    relatedCommunityPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityPost",
    },
    isRead: { type: Boolean, default: false },
    // Broadcast notifications keep a separate read state for each citizen.
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
