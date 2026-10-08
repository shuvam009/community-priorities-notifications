import { useMemo, useState } from "react";

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
  publishedAt: "Published on 8 October 2026",
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
  const shownGroups = useMemo(
    () =>
      groups.filter(
        (group) => category === "All" || group.category === category,
      ),
    [category, groups],
  );

  function castVote(categoryName, choiceId) {
    if (selectedVotes[categoryName]) return;
    setSelectedVotes((current) => ({ ...current, [categoryName]: choiceId }));
    setGroups((current) =>
      current.map((group) =>
        group.category !== categoryName
          ? group
          : {
              ...group,
              choices: group.choices.map((choice) =>
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
          <b>7</b>
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
                  {selectedVotes[group.category]
                    ? "Vote submitted"
                    : group.publishedAt}
                </span>
              </div>
              <b>{group.publishedAt}</b>
            </div>
            <div className="ballot-options">
              {group.choices.map((choice) => {
                const isChosen = selectedVotes[group.category] === choice.id;
                return (
                  <button
                    className={`ballot-option ${isChosen ? "chosen" : ""}`}
                    key={choice.id}
                    disabled={Boolean(selectedVotes[group.category])}
                    onClick={() => castVote(group.category, choice.id)}
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
