import { useState } from "react";

export default function VoteButton({ proposal, onNecessary, onNotNecessary }) {
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function submitReason(event) {
    event.preventDefault();
    if (!reason.trim()) {
      setError("Please explain why this proposal is not necessary.");
      return;
    }
    onNotNecessary(proposal.id, reason.trim());
    setReason("");
    setError("");
    setShowReason(false);
  }

  return (
    <>
      <div className="vote-controls" aria-label="Vote on this proposal">
        <button
          className={`necessary-button ${proposal.voteChoice === "necessary" ? "selected" : ""}`}
          onClick={() => onNecessary(proposal.id)}
          aria-pressed={proposal.voteChoice === "necessary"}
        >
          ✓ Necessary <b>{proposal.votes}</b>
        </button>
        <button
          className={`unnecessary-button ${proposal.voteChoice === "not_necessary" ? "selected" : ""}`}
          onClick={() => setShowReason(true)}
          aria-pressed={proposal.voteChoice === "not_necessary"}
        >
          ✕ Not necessary <b>{proposal.notNecessaryVotes}</b>
        </button>
      </div>
      {showReason && (
        <div
          className="feedback-backdrop"
          role="presentation"
          onMouseDown={() => setShowReason(false)}
        >
          <form
            className="feedback-dialog"
            onSubmit={submitReason}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              type="button"
              aria-label="Close feedback form"
              onClick={() => setShowReason(false)}
            >
              ×
            </button>
            <span className="eyebrow">COMMUNITY FEEDBACK</span>
            <h3>Why is this not necessary?</h3>
            <p>
              Your explanation helps moderators understand different community
              needs.
            </p>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Write your reason here..."
              rows="5"
              maxLength="500"
              autoFocus
            />
            {error && (
              <span className="feedback-error" role="alert">
                {error}
              </span>
            )}
            <button className="feedback-submit">Send feedback</button>
          </form>
        </div>
      )}
    </>
  );
}
