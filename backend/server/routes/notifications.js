import { Router } from "express";
import { requireAuth, requireModerator } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = Router();

router.get("/", requireAuth, async (request, response, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: request.user.id }, { audience: "citizens" }],
    })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = notifications.filter((notification) =>
      notification.audience === "citizens"
        ? !notification.readBy.some(
            (id) => id.toString() === request.user.id.toString(),
          )
        : !notification.isRead,
    ).length;
    response.json({
      notifications: notifications.map((notification) => ({
        ...notification.toObject(),
        isRead:
          notification.audience === "citizens"
            ? notification.readBy.some(
                (id) => id.toString() === request.user.id.toString(),
              )
            : notification.isRead,
      })),
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/read", requireAuth, async (request, response, next) => {
  try {
    const notification = await Notification.findOne({
      _id: request.params.id,
      $or: [{ userId: request.user.id }, { audience: "citizens" }],
    });
    if (!notification)
      return response.status(404).json({ message: "Notification not found." });
    if (notification.audience === "citizens") {
      if (
        !notification.readBy.some(
          (id) => id.toString() === request.user.id.toString(),
        )
      ) {
        notification.readBy.push(request.user.id);
        await notification.save();
      }
    } else {
      notification.isRead = true;
      await notification.save();
    }
    return response.json(notification);
  } catch (error) {
    return next(error);
  }
});

router.patch("/read-all", requireAuth, async (request, response, next) => {
  try {
    await Notification.updateMany(
      { userId: request.user.id, audience: "user", isRead: false },
      { isRead: true },
    );
    await Notification.updateMany(
      { audience: "citizens", readBy: { $ne: request.user.id } },
      { $addToSet: { readBy: request.user.id } },
    );
    response.json({ message: "All notifications marked as read." });
  } catch (error) {
    next(error);
  }
});

// Admin announcements are broadcast to each citizen when they open notifications.
router.post(
  "/broadcast",
  requireAuth,
  requireModerator,
  async (request, response, next) => {
    try {
      const title = request.body.title?.trim();
      const message = request.body.message?.trim();
      if (!title || !message)
        return response
          .status(400)
          .json({ message: "Announcement title and message are required." });
      const notification = await Notification.create({
        audience: "citizens",
        type: "announcement",
        title,
        message,
      });
      response.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
