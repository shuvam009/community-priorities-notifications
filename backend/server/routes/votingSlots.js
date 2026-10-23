import { Router } from "express";
import VotingSlot from "../models/VotingSlot.js";
import Notification from "../models/Notification.js";
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
      await Notification.create({
        audience: "citizens",
        type: "vote",
        title: "New voting poll is open",
        message: `${slot.label} is ready for your vote.`,
        relatedVotingSlot: slot.id,
      });
      response.status(201).json(summary(slot));
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:slotId/progress",
  requireAuth,
  requireModerator,
  async (request, response, next) => {
    try {
      const { progressStatus, progressReport } = request.body;
      const allowedStatuses = [
        "open_for_vote",
        "under_review",
        "accepted",
        "rejected",
      ];
      if (!allowedStatuses.includes(progressStatus))
        return response
          .status(400)
          .json({ message: "Invalid poll progress status." });

      const slot = await VotingSlot.findById(request.params.slotId);
      if (!slot)
        return response.status(404).json({ message: "Voting slot not found." });

      slot.progressStatus = progressStatus;
      slot.progressReport = progressReport?.trim() || "";
      slot.status = progressStatus === "open_for_vote" ? "open" : "closed";
      await slot.save();

      await Notification.create({
        audience: "citizens",
        type: "proposal_status",
        title: "Voting poll progress updated",
        message: `${slot.label} is now ${progressStatus.replaceAll("_", " ")}.`,
        relatedVotingSlot: slot.id,
      });
      response.json(summary(slot));
    } catch (error) {
      next(error);
    }
  },
);

// Move a low-vote issue into the active "Relisted polls" citizen category.
router.post(
  "/:slotId/options/:optionId/relist",
  requireAuth,
  requireModerator,
  async (request, response, next) => {
    try {
      const sourceSlot = await VotingSlot.findById(request.params.slotId);
      if (!sourceSlot)
        return response
          .status(404)
          .json({ message: "Source voting slot not found." });
      const sourceOption = sourceSlot.options.id(request.params.optionId);
      if (!sourceOption)
        return response
          .status(404)
          .json({ message: "Issue option not found." });

      let relistedSlot = await VotingSlot.findOne({
        kind: "relisted",
        status: "open",
      }).sort({ opensAt: -1 });

      if (
        relistedSlot &&
        relistedSlot.options.some(
          (option) => option.issueId === sourceOption.issueId,
        )
      )
        return response
          .status(409)
          .json({ message: "This issue is already relisted." });

      if (!relistedSlot || relistedSlot.options.length >= 3) {
        const closesAt = new Date();
        closesAt.setDate(closesAt.getDate() + 7);
        relistedSlot = new VotingSlot({
          label: "Relisted polls",
          kind: "relisted",
          opensAt: new Date(),
          closesAt,
          status: "open",
          createdBy: request.user.id,
          options: [],
        });
      }

      relistedSlot.options.push({
        issueId: sourceOption.issueId,
        title: sourceOption.title,
        category: sourceOption.category,
      });
      await relistedSlot.save();

      await Notification.create({
        audience: "citizens",
        type: "vote",
        title: "A poll has been relisted",
        message: `${sourceOption.title} is open again for community voting.`,
        relatedVotingSlot: relistedSlot.id,
      });
      response.status(201).json(summary(relistedSlot));
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
