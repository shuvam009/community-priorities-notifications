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
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    options: {
      type: [optionSchema],
      validate: [
        (value) => value.length === 3,
        "A voting slot must contain exactly three issues.",
      ],
    },
  },
  { timestamps: true },
);

votingSlotSchema.index({ opensAt: -1 });
export default mongoose.model("VotingSlot", votingSlotSchema);
