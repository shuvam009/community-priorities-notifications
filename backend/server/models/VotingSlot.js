import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    issueId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { _id: true },
);

const votingSlotSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    opensAt: { type: Date, required: true },
    closesAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "open", "closed"],
      default: "draft",
    },
    kind: {
      type: String,
      enum: ["standard", "relisted"],
      default: "standard",
    },
    progressStatus: {
      type: String,
      enum: ["open_for_vote", "under_review", "accepted", "rejected"],
      default: "open_for_vote",
    },
    progressReport: { type: String, trim: true, maxlength: 1000, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    options: {
      type: [optionSchema],
      validate: {
        validator(value) {
          return this.kind === "relisted"
            ? value.length >= 1 && value.length <= 3
            : value.length === 3;
        },
        message:
          "A standard slot needs exactly three issues; a relisted slot can hold up to three.",
      },
    },
  },
  { timestamps: true },
);

votingSlotSchema.index({ opensAt: -1 });
export default mongoose.model("VotingSlot", votingSlotSchema);
