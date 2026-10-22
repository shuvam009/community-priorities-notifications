import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    rating: { type: Number, min: 1, max: 5 },
    text: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

const communityPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, default: "Community update", trim: true },
    status: {
      type: String,
      enum: ["published", "archived"],
      default: "published",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    reviews: [reviewSchema],
  },
  { timestamps: true },
);

export default mongoose.model("CommunityPost", communityPostSchema);
