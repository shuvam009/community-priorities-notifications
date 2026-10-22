import { Router } from "express";
import VotingSlot from "../models/VotingSlot.js";
import { requireAuth, requireModerator } from "../middleware/auth.js";

const router = Router();
const summary = (slot) => ({
  ...slot.toObject(),
  options: slot.options.map((option) => ({
    ...option.toObject(),
    voteCount: option.votes.length,
    votes: undefined,
  })),
});

router.get("/", requireAuth, async (_request, response, next) => {
  try {
    response.json((await VotingSlot.find().sort({ opensAt: -1 })).map(summary));
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
      const slot = await VotingSlot.create({
        ...request.body,
        createdBy: request.user.id,
      });
      response.status(201).json(summary(slot));
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/:slotId/options/:optionId/vote",
  requireAuth,
  async (request, response, next) => {
    try {
      const slot = await VotingSlot.findById(request.params.slotId);
      if (!slot)
        return response.status(404).json({ message: "Voting slot not found." });
      if (slot.status !== "open")
        return response
          .status(400)
          .json({ message: "This voting slot is not open." });
      if (
        slot.options.some((option) =>
          option.votes.some(
            (id) => id.toString() === request.user.id.toString(),
          ),
        )
      )
        return response
          .status(409)
          .json({ message: "You have already voted in this slot." });
      const option = slot.options.id(request.params.optionId);
      if (!option)
        return response
          .status(404)
          .json({ message: "Issue option not found." });
      option.votes.push(request.user.id);
      await slot.save();
      response.json(summary(slot));
    } catch (error) {
      next(error);
    }
  },
);

export default router;
