import { ClipboardList, History, Home, Vote, X } from "lucide-react";

const navigationItems = [
  {
    label: "HOME",
    detail: "Switch to main home page",
    icon: Home,
    disabled: false,
  },

  {
    label: "Suggestions",
    detail: "Share and support local ideas",
    icon: ClipboardList,
    path: "/community/suggestions",
  },
  {
    label: "Voting polls",
    detail: "Vote for your local priority",
    icon: Vote,
    path: "/community/polls",
  },
  {
    label: "Progress history",
    detail: "Track your voting and suggestion progress",
    icon: History,
    path: "/community/history",
  },
];

export default function CitizenMenu({
  isOpen,
  onClose,
  onNavigate,
  currentPath,
}) {
  return (
    <>
      <button
        className={`menu-backdrop ${isOpen ? "is-open" : ""}`}
        onClick={onClose}
        aria-label="Close citizen menu"
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        className={`citizen-menu ${isOpen ? "is-open" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="citizen-menu-header">
          <div>
            <span>COMMUNITY SPACE</span>
            <h2>Citizen menu</h2>
          </div>
          <button onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="citizen-menu-links" aria-label="Citizen menu links">
          {navigationItems.map(
            ({ label, detail, icon: Icon, path, disabled }) => (
              <button
                key={label}
                className={currentPath === path ? "active" : ""}
                disabled={disabled}
                onClick={() => !disabled && onNavigate(path)}
              >
                <span className="menu-item-icon">
                  <Icon size={18} />
                </span>
                <span>
                  <b>{label}</b>
                  <small>{detail}</small>
                </span>
                {disabled}
              </button>
            ),
          )}
        </nav>
        <p className="citizen-menu-note">
          Your participation helps Kolkata choose the changes that matter most.
        </p>
      </aside>
    </>
  );
}
