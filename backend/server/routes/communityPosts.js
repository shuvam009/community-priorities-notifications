import { Router } from "express";
import CommunityPost from "../models/CommunityPost.js";
import Notification from "../models/Notification.js";
import { requireAuth, requireModerator } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const posts = await CommunityPost.find({ status: "published" }).sort({
      createdAt: -1,
    });
    response.json(posts);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireAuth,
  requireModerator,
  async (request, response, next) => {
    try {
      const post = await CommunityPost.create({
        ...request.body,
        createdBy: request.user.id,
      });
      await Notification.create({
        audience: "citizens",
        type: "announcement",
        title: "New community update",
        message: post.title,
        relatedCommunityPost: post.id,
      });
      response.status(201).json(post);
    } catch (error) {
      next(error);
    }
  },
);

router.post("/:id/reviews", requireAuth, async (request, response, next) => {
  try {
    const { rating, text } = request.body;
    const post = await CommunityPost.findById(request.params.id);
    if (!post)
      return response
        .status(404)
        .json({ message: "Community post not found." });
    post.reviews = post.reviews.filter(
      (review) => review.userId.toString() !== request.user.id.toString(),
    );
    post.reviews.push({ userId: request.user.id, rating, text });
    await post.save();
    response.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

export default router;
