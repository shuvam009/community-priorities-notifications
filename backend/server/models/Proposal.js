import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: undefined },
  },
  { _id: false },
);

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true, maxlength: 300 },
  createdAt: { type: Date, default: Date.now },
});

const proposalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    category: {
      type: String,
      required: true,
      enum: [
        "Infrastructure",
        "Safety",
        "Mobility",
        "Public spaces",
        "Environment",
      ],
    },
    ward: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    location: locationSchema,
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    necessaryVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notNecessaryFeedback: [feedbackSchema],
    comments: [commentSchema],
    status: {
      type: String,
      enum: ["open", "under_review", "accepted", "rejected"],
      default: "open",
    },
  },
  { timestamps: true },
);

proposalSchema.index({ location: "2dsphere" });
proposalSchema.index({ status: 1, createdAt: -1 });
proposalSchema.index({
  title: "text",
  description: "text",
  area: "text",
  ward: "text",
});

export default mongoose.model("Proposal", proposalSchema);
