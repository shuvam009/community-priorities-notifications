import { CheckCircle2, Clock3, ThumbsUp } from "lucide-react";

const historyItems = [
  {
    type: "Vote",
    title: "Install street lights near New Town bus stop",
    category: "Street Lighting",
    date: "8 October 2026",
    status: "Under review",
    step: 2,
    voters: 285,
  },
  {
    type: "Suggestion",
    title: "Repair drainage before monsoon in Ward 42",
    category: "Water Supply",
    date: "5 October 2026",
    status: "Received",
    step: 1,
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
  return (
    <section className="community-history">
      <div className="history-heading">
        <div>
          <p className="eyebrow">YOUR COMMUNITY ACTIVITY</p>
          <h1>Vote &amp; suggestion history</h1>
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
        {historyItems.map((item) => (
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
          </article>
        ))}
      </div>
    </section>
  );
}
