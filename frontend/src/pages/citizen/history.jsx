import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, ThumbsUp } from "lucide-react";
import { communityApi } from "../../services/communityApi.js";

const historyItems = [
  {
    type: "Vote",
    title: "Install street lights near New Town bus stop",
    category: "Street Lighting",
    date: "8 October 2026",
    status: "Open for vote",
    step: 1,
    voters: 285,
  },
  {
    type: "Suggestion",
    title: "Repair drainage before monsoon in Ward 42",
    category: "Water Supply",
    date: "5 October 2026",
    status: "Under review",
    step: 2,
    voters: 198,
  },
  {
    type: "Vote",
    title: "Add safer crossings near Park Street Metro",
    category: "Roads & Traffic",
    date: "30 September 2026",
    status: "Accepted",
    step: 3,
    voters: 122,
  },
];

const progressLabels = ["Submitted", "Under review", "Decision published"];

export default function History() {
  const [items, setItems] = useState(historyItems);
  useEffect(() => {
    communityApi
      .getVotingSlots()
      .then((slots) => {
        const liveItems = slots.flatMap((slot) =>
          slot.options.map((option) => ({
            type: "Vote",
            title: option.title,
            category: option.category,
            date: new Date(slot.updatedAt || slot.createdAt).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            ),
            status: statusLabel(slot.progressStatus),
            step: progressStep(slot.progressStatus),
            voters: option.voteCount,
            report: slot.progressReport,
          })),
        );
        if (liveItems.length) setItems(liveItems);
      })
      .catch(() => {});
  }, []);
  return (
    <section className="community-history">
      <div className="history-heading">
        <div>
          <p className="eyebrow">YOUR COMMUNITY ACTIVITY</p>
          <h1>Progress history</h1>
          <p>
            Follow every contribution you have made and see its current
            city-review progress.
          </p>
        </div>
      </div>
      <div className="history-summary">
        <article>
          <ThumbsUp size={18} />
          <b>2</b>
          <span>votes cast</span>
        </article>
        <article>
          <Clock3 size={18} />
          <b>1</b>
          <span>suggestion submitted</span>
        </article>
        <article>
          <CheckCircle2 size={18} />
          <b>1</b>
          <span>accepted contribution</span>
        </article>
      </div>
      <div className="history-list">
        {items.map((item) => (
          <article className="history-card" key={item.title}>
            <div className="history-card-top">
              <span className="history-type">{item.type}</span>
              <time>{item.date}</time>
            </div>
            <h2>{item.title}</h2>
            <p className="history-category">
              {item.category} · {item.voters} people voted
            </p>
            <div
              className="history-progress"
              aria-label={`Progress: ${item.status}`}
            >
              {progressLabels.map((label, index) => (
                <span className={index < item.step ? "done" : ""} key={label}>
                  <i>{index + 1}</i>
                  <b>{label}</b>
                </span>
              ))}
            </div>
            <div className="history-status">
              <span
                className={`history-status-dot status-${item.status.toLowerCase().replaceAll(" ", "-")}`}
              />
              Current status: <b>{item.status}</b>
            </div>
            {item.report && <p className="history-report">{item.report}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function statusLabel(status) {
  return (
    {
      open_for_vote: "Open for vote",
      under_review: "Under review",
      accepted: "Accepted",
      rejected: "Rejected",
    }[status] || "Open for vote"
  );
}

function progressStep(status) {
  return (
    { open_for_vote: 1, under_review: 2, accepted: 3, rejected: 3 }[status] || 1
  );
}
