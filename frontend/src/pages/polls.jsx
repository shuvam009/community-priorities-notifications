import { useMemo, useState } from "react";

const initialPolls = [
  {
    id: 1,
    category: "Infrastructure",
    title: "Prioritise road repair around Sealdah station",
    location: "Ward 36 · Sealdah",
    yes: 74,
    no: 26,
  },
  {
    id: 2,
    category: "Mobility",
    title: "Add protected cycle lanes near Salt Lake Sector V",
    location: "Ward 41 · Salt Lake",
    yes: 68,
    no: 32,
  },
  {
    id: 3,
    category: "Public spaces",
    title: "Create an evening community plaza at Rabindra Sarobar",
    location: "Ward 87 · South Kolkata",
    yes: 81,
    no: 19,
  },
  {
    id: 4,
    category: "Safety",
    title: "Increase street-light coverage near New Town bus stops",
    location: "Ward 39 · New Town",
    yes: 89,
    no: 11,
  },
  {
    id: 5,
    category: "Water",
    title: "Install drinking-water refill stations at local markets",
    location: "Ward 42 · Salt Lake",
    yes: 63,
    no: 37,
  },
  {
    id: 6,
    category: "Electricity",
    title: "Upgrade power backup for neighbourhood health centres",
    location: "Ward 63 · Park Street",
    yes: 76,
    no: 24,
  },
];

export default function Polls({ onBack }) {
  const [polls, setPolls] = useState(initialPolls);
  const [category, setCategory] = useState("All");

  const shownPolls = useMemo(
    () =>
      polls.filter((poll) => category === "All" || poll.category === category),
    [category, polls],
  );

  function vote(id, choice) {
    setPolls((current) =>
      current.map((poll) => {
        if (poll.id !== id || poll.choice) return poll;
        return {
          ...poll,
          choice,
          yes: choice === "yes" ? poll.yes + 1 : poll.yes,
          no: choice === "no" ? poll.no + 1 : poll.no,
        };
      }),
    );
  }

  return (
    <section className="polls-page">
      <div className="polls-heading">
        <div>
          <button className="back-button" onClick={onBack}>
            ← Back to suggestions
          </button>
          <p className="eyebrow">COMMUNITY POLLS</p>
          <h1>Make your vote count.</h1>
          <p>
            Choose one option on each poll. One citizen can cast one vote per
            poll.
          </p>
        </div>
        <div className="poll-summary">
          <b>{polls.length}</b>
          <span>active polls</span>
        </div>
      </div>
      <div className="poll-category-bar" aria-label="Poll category filters">
        {[
          "All",
          "Infrastructure",
          "Mobility",
          "Public spaces",
          "Safety",
          "Water",
          "Electricity",
        ].map((item) => (
          <button
            className={category === item ? "selected" : ""}
            key={item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="poll-grid">
        {shownPolls.map((poll) => {
          const total = poll.yes + poll.no;
          const yesPercent = Math.round((poll.yes / total) * 100);
          const noPercent = 100 - yesPercent;
          return (
            <article className="poll-card" key={poll.id}>
              <div className="poll-card-top">
                <span
                  className={`category category-${poll.category.toLowerCase().replace(" ", "-")}`}
                >
                  {poll.category}
                </span>
                <button
                  className="issue-info"
                  title="Issue details will be connected by the Issue module"
                  aria-label={`Issue information for ${poll.title}`}
                >
                  i
                </button>
              </div>
              <h2>{poll.title}</h2>
              <p className="poll-location">⌖ {poll.location}</p>
              <div className="percentage-row">
                <span>Support</span>
                <b>{yesPercent}%</b>
              </div>
              <div className="poll-track" aria-label={`${yesPercent}% support`}>
                <span style={{ width: `${yesPercent}%` }} />
              </div>
              <div className="poll-results">
                <span>Yes {yesPercent}%</span>
                <span>No {noPercent}%</span>
              </div>
              <div className="poll-vote-buttons">
                <button
                  className={poll.choice === "yes" ? "chosen yes" : "yes"}
                  disabled={Boolean(poll.choice)}
                  onClick={() => vote(poll.id, "yes")}
                >
                  ✓ Support
                </button>
                <button
                  className={poll.choice === "no" ? "chosen no" : "no"}
                  disabled={Boolean(poll.choice)}
                  onClick={() => vote(poll.id, "no")}
                >
                  Not now
                </button>
              </div>
              {poll.choice && (
                <p className="vote-confirmation">
                  Your vote is recorded. Thank you for participating.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
