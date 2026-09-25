import VoteButton from "./vote_button.jsx";
import CommentSection from "./comment_section.jsx";

const statusLabels = {
  open: "Open for voting",
  under_review: "Under review",
  accepted: "Accepted",
  rejected: "Not selected",
};

export default function ProposalCard({
  proposal,
  onNecessary,
  onNotNecessary,
  onAddComment,
  onShowLocation,
}) {
  return (
    <article className="proposal-card">
      <div className="proposal-card-top">
        <span
          className={`category category-${proposal.category.toLowerCase().replace(" ", "-")}`}
        >
          {proposal.category}
        </span>
        <span className={`status status-${proposal.status}`}>
          {statusLabels[proposal.status]}
        </span>
      </div>
      <h3>{proposal.title}</h3>
      <p>{proposal.description}</p>
      <div className="proposal-meta">
        <span>
          ⌖ {proposal.area} · {proposal.ward}
        </span>
        <span>
          By {proposal.author} · {proposal.createdAt}
        </span>
      </div>
      <div className="proposal-footer">
        <VoteButton
          proposal={proposal}
          onNecessary={onNecessary}
          onNotNecessary={onNotNecessary}
        />
        <button
          className="details-button"
          onClick={() => onShowLocation(proposal)}
        >
          View location →
        </button>
      </div>
      <CommentSection proposal={proposal} onAddComment={onAddComment} />
    </article>
  );
}
