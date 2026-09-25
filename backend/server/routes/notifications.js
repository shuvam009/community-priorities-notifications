import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = Router();

router.get("/", requireAuth, async (request, response, next) => {
  try {
    const notifications = await Notification.find({ userId: request.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      userId: request.user.id,
      isRead: false,
    });
    response.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/read", requireAuth, async (request, response, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: request.params.id, userId: request.user.id },
      { isRead: true },
      { new: true },
    );
    if (!notification)
      return response.status(404).json({ message: "Notification not found." });
    return response.json(notification);
  } catch (error) {
    return next(error);
  }
});

router.patch("/read-all", requireAuth, async (request, response, next) => {
  try {
    await Notification.updateMany(
      { userId: request.user.id, isRead: false },
      { isRead: true },
    );
    response.json({ message: "All notifications marked as read." });
  } catch (error) {
    next(error);
  }
});

export default router;
