import { useEffect, useMemo, useState } from "react";
import { communityApi } from "../../services/communityApi.js";

const pollGroups = [
  {
    category: "Roads & Traffic",
    choices: [
      ["Repair potholes near Sealdah station", 26],
      ["Improve traffic flow near Salt Lake market", 24],
      ["Upgrade footpaths around Esplanade", 25],
    ],
  },
  {
    category: "Street Lighting",
    choices: [
      ["Install street lights near Park Street Metro", 29],
      ["Repair damaged lights in Sector V", 21],
      ["Add lights at New Town bus stops", 18],
    ],
  },
  {
    category: "Water Supply",
    choices: [
      ["Repair pipeline damage in Salt Lake", 30],
      ["Address water shortage in Sealdah", 22],
      ["Improve water supply in Rajarhat", 19],
    ],
  },
  {
    category: "Waste Management",
    choices: [
      ["Add waste collection bins near markets", 31],
      ["Improve doorstep waste collection", 23],
      ["Clear waste near canal-side roads", 20],
    ],
  },
  {
    category: "Electricity",
    choices: [
      ["Improve power backup for health centres", 26],
      ["Repair frequent outages in Ward 39", 24],
      ["Add solar lights in public parks", 25],
    ],
  },
  {
    category: "Public Safety",
    choices: [
      ["Add CCTV near local market entrances", 27],
      ["Improve pedestrian signals after dark", 22],
      ["Make school zones safer", 24],
    ],
  },
  {
    category: "Other",
    choices: [
      ["Add a community notice board", 20],
      ["Organise a neighbourhood clean-up drive", 17],
      ["Create a local senior-citizen help desk", 15],
    ],
  },
].map((group) => ({
  ...group,
  id: group.category,
  publishedAt: "Published on 8 October 2026",
  closesAt: "Voting closes on 31 October 2026",
  choices: group.choices.map(([title, votes], index) => ({
    id: `${group.category}-${index}`,
    title,
    votes,
  })),
}));

export default function Polls({ onBack }) {
  const [groups, setGroups] = useState(pollGroups);
  const [category, setCategory] = useState("All");
  const [selectedVotes, setSelectedVotes] = useState({});
  useEffect(() => {
    communityApi
      .getVotingSlots()
      .then((slots) => {
        const liveGroups = slots
          .filter((slot) => slot.status === "open")
          .map((slot) => ({
            id: slot._id,
            category: slot.kind === "relisted" ? "Relisted polls" : slot.label,
            publishedAt: `Published on ${formatDate(slot.createdAt || slot.opensAt)}`,
            closesAt: `Voting closes on ${formatDate(slot.closesAt)}`,
            liveSlot: true,
            choices: slot.options.map((option) => ({
              id: option._id,
              title: option.title,
              votes: option.voteCount,
            })),
          }));
        if (liveGroups.length) setGroups(liveGroups);
      })
      // Demo polls remain visible until the API, citizen JWT, and admin polls are connected.
      .catch(() => {});
  }, []);
  const shownGroups = useMemo(
    () =>
      groups.filter(
        (group) => category === "All" || group.category === category,
      ),
    [category, groups],
  );

  async function castVote(group, choiceId) {
    if (selectedVotes[group.id]) return;
    setSelectedVotes((current) => ({ ...current, [group.id]: choiceId }));
    if (group.liveSlot) {
      try {
        const updatedSlot = await communityApi.voteInSlot(group.id, choiceId);
        setGroups((current) =>
          current.map((item) =>
            item.id === group.id
              ? {
                  ...item,
                  choices: updatedSlot.options.map((option) => ({
                    id: option._id,
                    title: option.title,
                    votes: option.voteCount,
                  })),
                }
              : item,
          ),
        );
      } catch {
        setSelectedVotes((current) => ({ ...current, [group.id]: null }));
      }
      return;
    }
    setGroups((current) =>
      current.map((currentGroup) =>
        currentGroup.id !== group.id
          ? currentGroup
          : {
              ...currentGroup,
              choices: currentGroup.choices.map((choice) =>
                choice.id === choiceId
                  ? { ...choice, votes: choice.votes + 1 }
                  : choice,
              ),
            },
      ),
    );
  }

  return (
    <section className="polls-page ballot-page">
      <div className="polls-heading">
        <div>
          <button className="back-button" onClick={onBack}>
            ← Back to suggestions
          </button>
          <p className="eyebrow">VOTING POLLS</p>
          <h1>Choose one local priority.</h1>
          <p>
            One citizen can vote once in each category. Results update after you
            vote.
          </p>
        </div>
        <div className="poll-summary">
          <b>{groups.length}</b>
          <span>poll categories</span>
        </div>
      </div>
      <div className="poll-category-bar" aria-label="Poll category filters">
        {["All", ...groups.map((group) => group.category)].map((item) => (
          <button
            className={category === item ? "selected" : ""}
            key={item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="ballot-groups">
        {shownGroups.map((group) => (
          <article className="ballot-group" key={group.category}>
            <div className="ballot-group-heading">
              <div>
                <p>{group.category} issues</p>
                <span>
                  {selectedVotes[group.id] ? "Vote submitted" : group.closesAt}
                </span>
              </div>
              <b>{group.closesAt}</b>
            </div>
            <div className="ballot-options">
              {group.choices.map((choice) => {
                const isChosen = selectedVotes[group.id] === choice.id;
                return (
                  <button
                    className={`ballot-option ${isChosen ? "chosen" : ""}`}
                    key={choice.id}
                    disabled={Boolean(selectedVotes[group.id])}
                    onClick={() => castVote(group, choice.id)}
                  >
                    <span className="choice-icon">⌖</span>
                    <span className="choice-copy">
                      <b>{choice.title}</b>
                      <small>{choice.votes} people voted</small>
                    </span>
                    <span
                      className="issue-info"
                      title="koushik part"
                      aria-label={`Issue information for ${choice.title}`}
                    >
                      i
                    </span>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
