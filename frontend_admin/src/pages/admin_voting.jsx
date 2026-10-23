import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartCityMark from "../components/smart_city_mark_ad.jsx";
import { communityApi } from "../services/communityApi.js";

const incomingIssues = [
  {
    id: "ISS-204",
    title: "Repair drainage before monsoon in Ward 42",
    category: "Water Supply",
    ward: "Ward 42",
    date: "Today",
    description:
      "Blocked drains near the market are causing waterlogging during heavy rain.",
    reporter: "S. Das",
  },
  {
    id: "ISS-198",
    title: "Install street lights near New Town bus stop",
    category: "Street Lighting",
    ward: "Ward 39",
    date: "Yesterday",
    description:
      "Commuters have reported an unsafe, poorly lit walking route after sunset.",
    reporter: "R. Roy",
  },
  {
    id: "ISS-191",
    title: "Repair potholes near Sealdah station",
    category: "Roads & Traffic",
    ward: "Ward 36",
    date: "2 days ago",
    description:
      "Multiple potholes near the station entrance create a risk for pedestrians and buses.",
    reporter: "A. Khan",
  },
];
const initialPolls = [
  {
    id: "P-72",
    title: "Add safer crossings near Park Street Metro",
    category: "Roads & Traffic",
    ward: "Ward 63",
    voters: 122,
    status: "Open for vote",
    progress: "Poll is open. Citizen votes are being collected.",
    updated: "Updated today",
  },
  {
    id: "P-68",
    title: "Create shaded seating at Rabindra Sarobar",
    category: "Other",
    ward: "Ward 87",
    voters: 156,
    status: "Under review",
    progress: "City team is reviewing cost estimates and site availability.",
    updated: "Updated 2 days ago",
  },
];

export default function AdminVoting() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState(incomingIssues);
  const [polls, setPolls] = useState(initialPolls);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedPoll, setSelectedPoll] = useState(initialPolls[0]);
  const [reportText, setReportText] = useState(initialPolls[0].progress);
  const [filter, setFilter] = useState("All");
  const [statusMessage, setStatusMessage] = useState("");
  useEffect(() => {
    communityApi
      .getVotingSlots()
      .then((slots) => {
        if (!slots.length) return;
        const livePolls = slots.map((slot) => ({
          id: slot._id,
          title: slot.label,
          category:
            slot.kind === "relisted" ? "Relisted polls" : "Community poll",
          ward: "Kolkata",
          voters: slot.options.reduce(
            (total, option) => total + option.voteCount,
            0,
          ),
          status: statusLabel(slot.progressStatus),
          progress:
            slot.progressReport || "No progress update has been published yet.",
          updated: `Updated ${new Date(slot.updatedAt).toLocaleDateString("en-IN")}`,
          liveSlot: true,
        }));
        setPolls(livePolls);
        setSelectedPoll(livePolls[0]);
        setReportText(livePolls[0].progress);
      })
      .catch(() => {});
  }, []);
  const displayedIssues = useMemo(
    () =>
      filter === "All"
        ? issues
        : issues.filter((issue) => issue.category === filter),
    [filter, issues],
  );
  function createPoll(event) {
    event.preventDefault();
    if (!selectedIssue) return;
    const poll = {
      id: `P-${80 + polls.length}`,
      title: selectedIssue.title,
      category: selectedIssue.category,
      ward: selectedIssue.ward,
      voters: 0,
      status: "Open",
      progress: "Poll created. Citizen voting will begin shortly.",
      updated: "Created just now",
    };
    setPolls((current) => [poll, ...current]);
    setIssues((current) =>
      current.filter((issue) => issue.id !== selectedIssue.id),
    );
    setSelectedPoll(poll);
    setReportText(poll.progress);
    setSelectedIssue(null);
  }
  async function saveProgress(event) {
    event.preventDefault();
    const updated = {
      ...selectedPoll,
      progress: reportText,
      updated: "Updated just now",
    };
    setPolls((current) =>
      current.map((poll) => (poll.id === updated.id ? updated : poll)),
    );
    setSelectedPoll(updated);
    if (updated.liveSlot) {
      try {
        const slot = await communityApi.updateVotingProgress(updated.id, {
          progressStatus: statusKey(updated.status),
          progressReport: updated.progress,
        });
        const saved = {
          ...updated,
          status: statusLabel(slot.progressStatus),
          progress: slot.progressReport,
          updated: "Updated just now",
        };
        setPolls((current) =>
          current.map((poll) => (poll.id === saved.id ? saved : poll)),
        );
        setSelectedPoll(saved);
        setStatusMessage("Progress history updated for citizens.");
      } catch (error) {
        setStatusMessage(error.message);
      }
    } else {
      setStatusMessage(
        "Demo progress updated. Connect an admin JWT to save it to MongoDB.",
      );
    }
  }
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div>
            <SmartCityMark />
            <small>ADMIN CONSOLE</small>
          </div>
        </div>
        <nav>
          <button className="active">
            ▦ <span>Voting workspace</span>
          </button>
          <button>
            ◫ <span>Issue management</span>
          </button>
          <button onClick={() => navigate("/admin/announcements")}>
            ♧ <span>Citizen announcements</span>
          </button>
          <button onClick={() => navigate("/admin/voting-history")}>
            $ <span>Vote history</span>
          </button>
          <button onClick={() => navigate("/admin/community-history")}>
            !<span>Community history</span>
          </button>
        </nav>
        <div className="admin-account">
          <span>AS</span>
          <div>
            <b>Admin user</b>
            <small>City administrator</small>
          </div>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p>ADMIN · COMMUNITY VOTING</p>
            <h1>Voting control centre</h1>
          </div>
          <span className="admin-live">● System live</span>
        </header>
        <section className="admin-stats">
          <article>
            <span>Incoming issues</span>
            <b>{issues.length}</b>
            <small>Ready for assessment</small>
          </article>
          <article>
            <span>Active polls</span>
            <b>{polls.length}</b>
            <small>Citizen votes are open</small>
          </article>
          <article>
            <span>Votes recorded</span>
            <b>{polls.reduce((total, poll) => total + poll.voters, 0)}</b>
            <small>Across all active polls</small>
          </article>
        </section>
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <p>FROM ISSUE MANAGEMENT</p>
              <h2>Issues ready for a community poll</h2>
              <span>
                Review a reported issue, then create a citizen voting poll.
              </span>
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option>All</option>
              <option>Roads & Traffic</option>
              <option>Street Lighting</option>
              <option>Water Supply</option>
              <option>Waste Management</option>
              <option>Electricity</option>
              <option>Public Safety</option>
              <option>Other</option>
            </select>
          </div>
          <div className="issue-list">
            {displayedIssues.map((issue) => (
              <article className="admin-issue" key={issue.id}>
                <div className="issue-id">{issue.id}</div>
                <div>
                  <span className="admin-category">{issue.category}</span>
                  <h3>{issue.title}</h3>
                  <p>{issue.description}</p>
                  <small>
                    {issue.ward} · Reported by {issue.reporter} · {issue.date}
                  </small>
                </div>
                <button onClick={() => setSelectedIssue(issue)}>
                  Create voting poll →
                </button>
              </article>
            ))}
            {displayedIssues.length === 0 && (
              <p className="admin-empty">No issues match this category.</p>
            )}
          </div>
        </section>
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <p>ACTIVE POLLS</p>
              <h2>Edit progress report</h2>
              <span>
                Publish a short, transparent update for citizens following each
                poll.
              </span>
            </div>
          </div>
          <div className="progress-layout">
            <div className="poll-admin-list">
              {polls.map((poll) => (
                <button
                  key={poll.id}
                  onClick={() => {
                    setSelectedPoll(poll);
                    setReportText(poll.progress);
                  }}
                  className={selectedPoll.id === poll.id ? "selected" : ""}
                >
                  <span>
                    <b>{poll.title}</b>
                    <small>
                      {poll.category} · {poll.ward}
                    </small>
                  </span>
                  <em>{poll.voters} votes</em>
                </button>
              ))}
            </div>
            <form className="progress-editor" onSubmit={saveProgress}>
              <div className="editor-title">
                <div>
                  <span className="admin-category">
                    {selectedPoll.category}
                  </span>
                  <h3>{selectedPoll.title}</h3>
                  <small>
                    {selectedPoll.ward} · {selectedPoll.voters} people voted
                  </small>
                </div>
                <span
                  className={`poll-status ${selectedPoll.status.toLowerCase().replaceAll(" ", "-")}`}
                >
                  {selectedPoll.status}
                </span>
              </div>
              <label>
                Poll status
                <select
                  value={selectedPoll.status}
                  onChange={(event) =>
                    setSelectedPoll((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                >
                  <option>Open for vote</option>
                  <option>Under review</option>
                  <option>Accepted</option>
                  <option>Rejected</option>
                </select>
              </label>
              <label>
                Citizen progress report
                <textarea
                  value={reportText}
                  onChange={(event) => setReportText(event.target.value)}
                  rows="5"
                />
              </label>
              <div className="editor-actions">
                <small>{statusMessage || selectedPoll.updated}</small>
                <button type="submit">Save progress report</button>
              </div>
            </form>
          </div>
        </section>
      </main>
      {selectedIssue && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal" onSubmit={createPoll}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedIssue(null)}
            >
              ×
            </button>
            <p>CREATE COMMUNITY POLL</p>
            <h2>{selectedIssue.title}</h2>
            <span>
              {selectedIssue.category} · {selectedIssue.ward}
            </span>
            <label>
              Poll question
              <input
                defaultValue={`Should the city prioritise: ${selectedIssue.title}?`}
                required
              />
            </label>
            <label>
              Voting closes on
              <input type="date" required />
            </label>
            <div>
              <button
                type="button"
                className="cancel"
                onClick={() => setSelectedIssue(null)}
              >
                Cancel
              </button>
              <button type="submit">Publish voting poll</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function statusKey(label) {
  return {
    "Open for vote": "open_for_vote",
    "Under review": "under_review",
    Accepted: "accepted",
    Rejected: "rejected",
  }[label];
}

function statusLabel(key) {
  return (
    {
      open_for_vote: "Open for vote",
      under_review: "Under review",
      accepted: "Accepted",
      rejected: "Rejected",
    }[key] || "Open for vote"
  );
}
