import { useMemo, useState } from "react";

const pollGroups = [
  {
    category: "Infrastructure",
    choices: [
      ["Repair potholes near Sealdah station", 26],
      ["Repair drainage before monsoon in Ward 42", 24],
      ["Upgrade footpaths around Esplanade", 25],
    ],
  },
  {
    category: "Mobility",
    choices: [
      ["Add safer crossings near Park Street Metro", 29],
      ["Create a dedicated cycle lane in Sector V", 21],
      ["Improve bus-stop signage in New Town", 18],
    ],
  },
  {
    category: "Public spaces",
    choices: [
      ["Add shaded seating at Rabindra Sarobar", 30],
      ["Restore neighbourhood playground equipment", 22],
      ["Create a community garden in Ward 63", 19],
    ],
  },
  {
    category: "Safety",
    choices: [
      ["Install street lights near New Town bus stop", 31],
      ["Add CCTV near local market entrances", 23],
      ["Improve pedestrian signals after dark", 20],
    ],
  },
  {
    category: "Water",
    choices: [
      ["Repair pipeline damage in Salt Lake", 26],
      ["Address water shortage in Sealdah", 24],
      ["Improve water supply in Rajarhat", 25],
    ],
  },
  {
    category: "Electricity",
    choices: [
      ["Improve power backup for health centres", 27],
      ["Repair frequent outages in Ward 39", 22],
      ["Add solar lights in public parks", 24],
    ],
  },
].map((group) => ({
  ...group,
  total: 36,
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
              total: group.total + 1,
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
          <p className="eyebrow">COMMUNITY POLLS</p>
          <h1>Choose one local priority.</h1>
          <p>
            One citizen can vote once in each category. Results update after you
            vote.
          </p>
        </div>
        <div className="poll-summary">
          <b>6</b>
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
                    : "Choose one issue to prioritise"}
                </span>
              </div>
              <b>{group.total} votes</b>
            </div>
            <div className="ballot-options">
              {group.choices.map((choice) => {
                const percent = Math.round((choice.votes / group.total) * 100);
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
                      <small>
                        <i style={{ width: `${percent}%` }} />
                        {percent}% of votes
                      </small>
                    </span>
                    <span className="vote-total">
                      {choice.votes}/{group.total}
                    </span>
                    <span
                      className="issue-info"
                      title="Issue details will be connected by the Issue module"
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
