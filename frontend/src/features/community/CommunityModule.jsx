import { useEffect, useMemo, useState } from "react";
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
import CommunitySwitcher from "../../components/community_switcher.jsx";
import { Moon, Sun } from "lucide-react";
import Polls from "../../pages/citizen/polls.jsx";
import Voting from "../../pages/citizen/voting.jsx";
import History from "../../pages/citizen/history.jsx";
import CitizenMenu from "../../pages/citizen/menu.jsx";
import { initialNotifications, initialProposals } from "./communityData.js";
import { communityApi } from "../../services/communityApi.js";

export default function CommunityModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [proposals, setProposals] = useState(initialProposals);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    communityApi
      .getNotifications()
      .then(({ notifications: items }) => {
        setNotifications(
          items.map((item) => ({
            ...item,
            id: item._id,
            title: item.title || "Community update",
            time: new Date(item.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            }),
          })),
        );
      })
      // Keep the presentation demo working before a citizen JWT is connected.
      .catch(() => {});
  }, []);
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
    communityApi.markNotificationRead(id).catch(() => {});
  }
  function markAllNotificationsRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );
    communityApi.markAllNotificationsRead().catch(() => {});
  }

  return (
    <div className={`app-shell ${theme}-theme`}>
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
          <button
            className="theme-toggle"
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
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
      <CommunitySwitcher
        isOpen={switcherOpen}
        currentPath={location.pathname}
        onToggle={() => setSwitcherOpen((open) => !open)}
        onNavigate={(path) => {
          navigate(path);
          setSwitcherOpen(false);
        }}
      />
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
          <Route path="history" element={<History />} />
          <Route path="*" element={<Navigate to="suggestions" replace />} />
        </Routes>
      </main>
    </div>
  );
}
