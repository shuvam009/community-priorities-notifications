import { useMemo, useState } from "react";
import "./App.css";
import Voting from "./pages/voting.jsx";
import NotificationBell from "./components/notification_bell.jsx";
import NotificationList from "./components/notification_list.jsx";

const initialProposals = [
  {
    id: 1,
    title: "Install street lights near New Town bus stop",
    description:
      "Improve safety for commuters and local residents after sunset near the main bus stop.",
    ward: "Ward 39",
    area: "New Town",
    category: "Safety",
    status: "open",
    votes: 284,
    notNecessaryVotes: 11,
    voteChoice: null,
    author: "A. Mukherjee",
    createdAt: "2 days ago",
    latitude: 22.5787,
    longitude: 88.4756,
    comments: [
      {
        id: 101,
        author: "Riya S.",
        text: "This route is very dark after 8 PM.",
      },
    ],
  },
  {
    id: 2,
    title: "Repair drainage before monsoon in Ward 42",
    description:
      "Clean and repair blocked drains near the market to reduce waterlogging during heavy rain.",
    ward: "Ward 42",
    area: "Salt Lake",
    category: "Infrastructure",
    status: "under_review",
    votes: 198,
    notNecessaryVotes: 7,
    voteChoice: null,
    author: "S. Das",
    createdAt: "4 days ago",
    latitude: 22.5781,
    longitude: 88.4313,
    comments: [],
  },
  {
    id: 3,
    title: "Create a shaded public seating area at Rabindra Sarobar",
    description:
      "Add benches, drinking water points, and shade for senior citizens and walkers.",
    ward: "Ward 87",
    area: "South Kolkata",
    category: "Public spaces",
    status: "accepted",
    votes: 156,
    notNecessaryVotes: 18,
    voteChoice: null,
    author: "P. Roy",
    createdAt: "1 week ago",
    latitude: 22.5141,
    longitude: 88.3632,
    comments: [
      {
        id: 102,
        author: "Anik D.",
        text: "Please include accessible seating too.",
      },
    ],
  },
  {
    id: 4,
    title: "Add safer pedestrian crossings near Park Street Metro",
    description:
      "Install better markings and timed pedestrian signals around busy metro exits.",
    ward: "Ward 63",
    area: "Park Street",
    category: "Mobility",
    status: "open",
    votes: 121,
    notNecessaryVotes: 9,
    voteChoice: null,
    author: "R. Sen",
    createdAt: "1 week ago",
    latitude: 22.5524,
    longitude: 88.3541,
    comments: [],
  },
];

const initialNotifications = [
  { id: 1, type: "proposal_status", title: "Proposal under review", message: "The drainage proposal for Ward 42 is now being reviewed.", time: "12 min ago", isRead: false },
  { id: 2, type: "comment", title: "New community comment", message: "A resident commented on the New Town street lights proposal.", time: "1 hour ago", isRead: false },
  { id: 3, type: "system", title: "Community voting update", message: "This week’s priority list is now available.", time: "Yesterday", isRead: true },
];

export default function App() {
  const [proposals, setProposals] = useState(initialProposals);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const stats = useMemo(
    () => ({
      open: proposals.filter((proposal) => proposal.status === "open").length,
      votes: proposals.reduce((total, proposal) => total + proposal.votes, 0),
    }),
    [proposals],
  );

  function markNecessary(id) {
    setProposals((current) =>
      current.map((proposal) => {
        if (proposal.id !== id || proposal.voteChoice === "necessary")
          return proposal;
        return {
          ...proposal,
          voteChoice: "necessary",
          votes: proposal.votes + 1,
          notNecessaryVotes:
            proposal.notNecessaryVotes -
            (proposal.voteChoice === "not_necessary" ? 1 : 0),
        };
      }),
    );
  }

  function markNotNecessary(id, reason) {
    setProposals((current) =>
      current.map((proposal) => {
        if (proposal.id !== id) return proposal;
        const isChangingChoice = proposal.voteChoice === "necessary";
        const alreadyVoted = proposal.voteChoice === "not_necessary";
        return {
          ...proposal,
          voteChoice: "not_necessary",
          votes: proposal.votes - (isChangingChoice ? 1 : 0),
          notNecessaryVotes:
            proposal.notNecessaryVotes + (alreadyVoted ? 0 : 1),
          notNecessaryReason: reason,
        };
      }),
    );
  }

  function addComment(id, text) {
    setProposals((current) =>
      current.map((proposal) =>
        proposal.id === id
          ? {
              ...proposal,
              comments: [
                ...proposal.comments,
                { id: Date.now(), author: "You", text },
              ],
            }
          : proposal,
      ),
    );
  }

  function markNotificationRead(id) {
    setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, isRead: true } : notification));
  }

  function markAllNotificationsRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#voting">
          <span className="brand-mark">KS</span>
          <span>
            <b>Kolkata</b> Smart City<small>Citizen Command Center</small>
          </span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <div className="notification-wrapper">
            <NotificationBell unreadCount={notifications.filter((notification) => !notification.isRead).length} isOpen={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)} />
            {notificationsOpen && <NotificationList notifications={notifications} onMarkRead={markNotificationRead} onMarkAllRead={markAllNotificationsRead} onClose={() => setNotificationsOpen(false)} />}
          </div>
          <button className="profile">AM</button>
        </nav>
      </header>
      <main>
        <Voting
          proposals={proposals}
          onNecessary={markNecessary}
          onNotNecessary={markNotNecessary}
          onAddComment={addComment}
          stats={stats}
        />
      </main>
    </div>
  );
}
