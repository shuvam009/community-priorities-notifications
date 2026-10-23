import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { communityApi } from "../services/communityApi.js";

const demoSlots = [
  {
    _id: "slot-oct-1",
    label: "October community slot · Week 1",
    opensAt: "2026-10-01",
    closesAt: "2026-10-07",
    status: "closed",
    options: [
      {
        _id: "1",
        title: "Repair drainage in Ward 42",
        category: "Water Supply",
        voteCount: 94,
      },
      {
        _id: "2",
        title: "Install bus-stop street lights",
        category: "Street Lighting",
        voteCount: 41,
      },
      {
        _id: "3",
        title: "Repair Sealdah station potholes",
        category: "Roads & Traffic",
        voteCount: 27,
      },
    ],
  },
];

export default function VotingHistory() {
  const [slots, setSlots] = useState(demoSlots);
  const [relistedIds, setRelistedIds] = useState([]);
  const [message, setMessage] = useState(
    "Demo data shown until the API and admin token are connected.",
  );
  useEffect(() => {
    communityApi
      .getVotingSlots()
      .then((data) => {
        setSlots(data);
        setMessage("Live voting slots from Community API.");
      })
      .catch(() => {});
  }, []);
  const relistedIssueIds = useMemo(
    () =>
      new Set(
        slots
          .filter((slot) => slot.kind === "relisted")
          .flatMap((slot) => slot.options.map((option) => option.issueId)),
      ),
    [slots],
  );
  const leastVoted = useMemo(
    () =>
      slots
        .flatMap((slot) =>
          slot.kind === "relisted"
            ? []
            : slot.options
                .filter((option) => !relistedIssueIds.has(option.issueId))
                .map((option) => ({
                  ...option,
                  slot: slot.label,
                  slotId: slot._id,
                })),
        )
        .sort((a, b) => a.voteCount - b.voteCount)
        .slice(0, 3),
    [relistedIssueIds, slots],
  );
  async function relistIssue(issue) {
    try {
      const relistedSlot = await communityApi.relistVotingOption(
        issue.slotId,
        issue._id,
      );
      setRelistedIds((current) => [...current, issue._id]);
      setSlots((current) => {
        const withoutOldRelisted = current.filter(
          (slot) => slot._id !== relistedSlot._id,
        );
        return [relistedSlot, ...withoutOldRelisted];
      });
      setMessage(
        "Issue relisted. It is now visible to citizens under Relisted polls.",
      );
    } catch (error) {
      setMessage(error.message);
    }
  }
  return (
    <main className="history-admin-page">
      <header className="page-top">
        <Link to="/admin/voting">← Voting workspace</Link>
        <p>VOTING ANALYTICS</p>
        <h1>Voting history</h1>
        <span>
          Every voting slot contains three issues, grouped by its opening and
          closing date.
        </span>
      </header>
      <p className="api-message">{message}</p>
      <section className="slot-history">
        <div className="history-section-title">
          <p>PAST VOTING SLOTS</p>
          <h2>Votes recorded per issue</h2>
        </div>
        {slots.map((slot) => (
          <article className="vote-slot" key={slot._id}>
            <header>
              <div>
                <h3>{slot.label}</h3>
                <span>
                  {new Date(slot.opensAt).toLocaleDateString("en-IN")} —{" "}
                  {new Date(slot.closesAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <b className={`slot-${slot.status}`}>{slot.status}</b>
            </header>
            <div className="slot-options">
              {slot.options.map((option) => (
                <div key={option._id}>
                  <span>{option.category}</span>
                  <b>{option.title}</b>
                  <em>{option.voteCount} votes</em>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
      <section className="least-voted">
        <div>
          <p>RELISTING QUEUE</p>
          <h2>Least-voted issues</h2>
          <span>
            These issues can be selected for a future three-issue voting slot.
          </span>
        </div>
        <div>
          {leastVoted.map((issue) => (
            <article key={issue._id}>
              <b>{issue.title}</b>
              <span>
                {issue.category} · {issue.voteCount} votes · {issue.slot}
              </span>
              <button
                disabled={relistedIds.includes(issue._id)}
                onClick={() => relistIssue(issue)}
              >
                {relistedIds.includes(issue._id)
                  ? "Relisted"
                  : "Relist for citizens"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
