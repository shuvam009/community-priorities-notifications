import { useState } from "react";

export default function CommentSection({ proposal, onAddComment }) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    onAddComment(proposal.id, comment.trim());
    setComment("");
  }

  return (
    <section className="comment-section">
      <button
        className="comment-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        ◌ Comments ({proposal.comments.length})
      </button>
      {isOpen && (
        <div className="comment-panel">
          {proposal.comments.length === 0 ? (
            <p className="no-comments">Be the first person to comment.</p>
          ) : (
            <div className="comments-list">
              {proposal.comments.map((comment) => (
                <article key={comment.id}>
                  <b>{comment.author}</b>
                  <p>{comment.text}</p>
                </article>
              ))}
            </div>
          )}
          <form className="comment-form" onSubmit={submit}>
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a respectful comment..."
              maxLength="300"
            />
            <button>Add</button>
          </form>
        </div>
      )}
    </section>
  );
}
