import { useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import NotificationBell from "../../components/notification_bell.jsx";
import NotificationList from "../../components/notification_list.jsx";
import SmartCityMark from "../../components/smart_city_mark.jsx";
import Polls from "../../pages/citizen/polls.jsx";
import Voting from "../../pages/citizen/voting.jsx";
import CitizenMenu from "../../pages/citizen/menu.jsx";
import { initialNotifications, initialProposals } from "./communityData.js";

export default function CommunityModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [proposals, setProposals] = useState(initialProposals);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );
  }
  function markAllNotificationsRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => navigate("/community/suggestions")}
        >
          <SmartCityMark />
        </button>
        <nav className="main-nav" aria-label="Community navigation">
          <div className="notification-wrapper">
            <NotificationBell
              unreadCount={notifications.filter((item) => !item.isRead).length}
              isOpen={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
            />
            {notificationsOpen && (
              <NotificationList
                notifications={notifications}
                onMarkRead={markNotificationRead}
                onMarkAllRead={markAllNotificationsRead}
                onClose={() => setNotificationsOpen(false)}
              />
            )}
          </div>
          <button className="profile" title="Profile">
            $
          </button>

          <button
            className="menu"
            title="Menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open citizen menu"
          >
            ☰
          </button>
        </nav>
      </header>
      <CitizenMenu
        isOpen={menuOpen}
        currentPath={location.pathname}
        onClose={() => setMenuOpen(false)}
        onNavigate={(path) => {
          navigate(path);
          setMenuOpen(false);
        }}
      />
      <main>
        <Routes>
          <Route
            path="suggestions"
            element={
              <Voting
                proposals={proposals}
                onNecessary={markNecessary}
                onNotNecessary={markNotNecessary}
                onAddComment={addComment}
                stats={stats}
                onShowPolls={() => navigate("/community/polls")}
              />
            }
          />
          <Route
            path="polls"
            element={
              <Polls onBack={() => navigate("/community/suggestions")} />
            }
          />
          <Route path="*" element={<Navigate to="suggestions" replace />} />
        </Routes>
      </main>
    </div>
  );
}
