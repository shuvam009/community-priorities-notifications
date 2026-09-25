import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["proposal_status", "comment", "vote", "system"],
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 250 },
    relatedProposal: { type: mongoose.Schema.Types.ObjectId, ref: "Proposal" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
