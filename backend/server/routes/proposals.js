import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, requireModerator } from "../middleware/auth.js";
import Notification from "../models/Notification.js";
import Proposal from "../models/Proposal.js";

const router = Router();

function proposalSummary(proposal, userId) {
  const document = proposal.toObject ? proposal.toObject() : proposal;
  return {
    ...document,
    necessaryVotes: document.necessaryVotes.length,
    notNecessaryVotes: document.notNecessaryFeedback.length,
    commentsCount: document.comments.length,
    currentUserVote: document.necessaryVotes.some(
      (id) => id.toString() === userId?.toString(),
    )
      ? "necessary"
      : document.notNecessaryFeedback.some(
            (item) => item.user.toString() === userId?.toString(),
          )
        ? "not_necessary"
        : null,
  };
}

router.get("/", requireAuth, async (request, response, next) => {
  try {
    const { status, ward, search, sort = "popular" } = request.query;
    const filter = {};
    if (status) filter.status = status;
    if (ward) filter.ward = ward;
    if (search) filter.$text = { $search: search };
    const proposals = await Proposal.find(filter).sort(
      sort === "latest" ? { createdAt: -1 } : { createdAt: -1 },
    );
    const results = proposals
      .map((proposal) => proposalSummary(proposal, request.user.id))
      .sort((a, b) =>
        sort === "popular" ? b.necessaryVotes - a.necessaryVotes : 0,
      );
    response.json(results);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", requireAuth, async (request, response, next) => {
  try {
    const proposal = await Proposal.findById(request.params.id).populate(
      "comments.user",
      "name",
    );
    if (!proposal)
      return response.status(404).json({ message: "Proposal not found." });
    return response.json(proposalSummary(proposal, request.user.id));
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, async (request, response, next) => {
  try {
    const proposal = await Proposal.create({
      ...request.body,
      proposedBy: request.user.id,
    });
    response.status(201).json(proposalSummary(proposal, request.user.id));
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:id/vote/necessary",
  requireAuth,
  async (request, response, next) => {
    try {
      const proposal = await Proposal.findById(request.params.id);
      if (!proposal)
        return response.status(404).json({ message: "Proposal not found." });
      proposal.notNecessaryFeedback = proposal.notNecessaryFeedback.filter(
        (feedback) => feedback.user.toString() !== request.user.id.toString(),
      );
      if (
        !proposal.necessaryVotes.some(
          (id) => id.toString() === request.user.id.toString(),
        )
      )
        proposal.necessaryVotes.push(request.user.id);
      await proposal.save();
      return response.json(proposalSummary(proposal, request.user.id));
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/:id/vote/not-necessary",
  requireAuth,
  async (request, response, next) => {
    try {
      const reason = request.body.reason?.trim();
      if (!reason)
        return response
          .status(400)
          .json({ message: "A reason is required for a Not necessary vote." });
      const proposal = await Proposal.findById(request.params.id);
      if (!proposal)
        return response.status(404).json({ message: "Proposal not found." });
      proposal.necessaryVotes = proposal.necessaryVotes.filter(
        (id) => id.toString() !== request.user.id.toString(),
      );
      proposal.notNecessaryFeedback = proposal.notNecessaryFeedback.filter(
        (feedback) => feedback.user.toString() !== request.user.id.toString(),
      );
      proposal.notNecessaryFeedback.push({ user: request.user.id, reason });
      await proposal.save();
      return response.json(proposalSummary(proposal, request.user.id));
    } catch (error) {
      return next(error);
    }
  },
);

router.post("/:id/comments", requireAuth, async (request, response, next) => {
  try {
    const text = request.body.text?.trim();
    if (!text)
      return response
        .status(400)
        .json({ message: "A comment cannot be empty." });
    const proposal = await Proposal.findById(request.params.id);
    if (!proposal)
      return response.status(404).json({ message: "Proposal not found." });
    proposal.comments.push({ user: request.user.id, text });
    await proposal.save();
    if (proposal.proposedBy.toString() !== request.user.id.toString())
      await Notification.create({
        userId: proposal.proposedBy,
        type: "comment",
        message: "Someone commented on your community proposal.",
        relatedProposal: proposal.id,
      });
    return response.status(201).json(proposal.comments.at(-1));
  } catch (error) {
    return next(error);
  }
});

router.patch(
  "/:id/status",
  requireAuth,
  requireModerator,
  async (request, response, next) => {
    try {
      const { status } = request.body;
      if (!["open", "under_review", "accepted", "rejected"].includes(status))
        return response
          .status(400)
          .json({ message: "Invalid proposal status." });
      const proposal = await Proposal.findByIdAndUpdate(
        request.params.id,
        { status },
        { new: true },
      );
      if (!proposal)
        return response.status(404).json({ message: "Proposal not found." });
      await Notification.create({
        userId: proposal.proposedBy,
        type: "proposal_status",
        message: `Your proposal is now ${status.replace("_", " ")}.`,
        relatedProposal: proposal.id,
      });
      return response.json(proposalSummary(proposal, request.user.id));
    } catch (error) {
      return next(error);
    }
  },
);

router.get("/nearby/search", requireAuth, async (request, response, next) => {
  try {
    const { longitude, latitude, distance = 3000 } = request.query;
    if (!longitude || !latitude)
      return response
        .status(400)
        .json({ message: "longitude and latitude are required." });
    const proposals = await Proposal.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: Number(distance),
        },
      },
    });
    return response.json(
      proposals.map((proposal) => proposalSummary(proposal, request.user.id)),
    );
  } catch (error) {
    return next(error);
  }
});

router.use((error, _request, response, _next) => {
  if (error instanceof mongoose.Error.ValidationError)
    return response.status(400).json({ message: error.message });
  return response
    .status(500)
    .json({ message: "Unable to process the proposal request." });
});

export default router;
