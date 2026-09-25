import { useMemo, useState } from "react";
import ProposalCard from "../components/proposal_card.jsx";
import LocationModal from "../components/location_modal.jsx";

export default function Voting({
  proposals,
  onNecessary,
  onNotNecessary,
  onAddComment,
  stats,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("popular");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const displayedProposals = useMemo(
    () =>
      proposals
        .filter((proposal) => status === "all" || proposal.status === status)
        .filter((proposal) =>
          `${proposal.title} ${proposal.description} ${proposal.area}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort((a, b) => (sort === "popular" ? b.votes - a.votes : b.id - a.id)),
    [proposals, search, sort, status],
  );
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">KOLKATA SMART CITY · COMMUNITY VOICE</p>
          <h1>
            Vote for the change
            <br />
            you want to see.
          </h1>
          <p className="hero-description">
            Support local priorities across Kolkata. Each citizen can vote once
            per proposal and help city teams identify what matters most.
          </p>
          <a className="create-button" href="#voting">
            View active votes ↓
          </a>
        </div>
        <div className="hero-card">
          <span className="live-tag">● Live community impact</span>
          <div className="impact-number">{stats.votes.toLocaleString()}</div>
          <p>community votes cast</p>
          <hr />
          <div className="impact-row">
            <span>
              <b>{stats.open}</b> ideas open for voting
            </span>
            <span>
              <b>12</b> wards represented
            </span>
          </div>
        </div>
      </section>
      <section className="voting-steps" id="how-it-works">
        <div>
          <p className="eyebrow">HOW COMMUNITY VOTING WORKS</p>
          <h2>Your vote has a clear purpose.</h2>
        </div>
        <div className="step-grid">
          <article>
            <span>01</span>
            <h3>Explore priorities</h3>
            <p>See the local improvements proposed across Kolkata wards.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Vote once</h3>
            <p>
              Support the ideas that matter most to your area and community.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Track the outcome</h3>
            <p>
              City moderators review popular proposals and publish their
              decision.
            </p>
          </article>
        </div>
      </section>
      <section className="priorities-section" id="voting">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ACTIVE VOTING</p>
            <h2>Choose a priority to support</h2>
            <p>Votes are public totals; you can vote only once per proposal.</p>
          </div>
          <div className="result-count">
            {displayedProposals.length} proposals
          </div>
        </div>
        <div className="filters" aria-label="Proposal filters">
          <label className="search-box">
            ⌕{" "}
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search proposals"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="open">Open for voting</option>
            <option value="under_review">Under review</option>
            <option value="accepted">Accepted</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="popular">Most popular</option>
            <option value="latest">Latest</option>
          </select>
        </div>
        <div className="proposal-grid">
          {displayedProposals.map((proposal) => (
            <ProposalCard
              proposal={proposal}
              onNecessary={onNecessary}
              onNotNecessary={onNotNecessary}
              onAddComment={onAddComment}
              onShowLocation={setSelectedProposal}
              key={proposal.id}
            />
          ))}
        </div>
        {displayedProposals.length === 0 && (
          <div className="empty-state">
            <strong>No proposals match your filters.</strong>
            <p>Try another search term or view all statuses.</p>
          </div>
        )}
      </section>
      {selectedProposal && (
        <LocationModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
        />
      )}
    </>
  );
}
