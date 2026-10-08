import {
  ClipboardList,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Vote,
} from "lucide-react";

const pages = [
  { label: "Suggestions", icon: ClipboardList, path: "/community/suggestions" },
  { label: "Voting polls", icon: Vote, path: "/community/polls" },
  { label: "History", icon: History, disabled: true },
];

export default function CommunitySwitcher({
  isOpen,
  onToggle,
  onNavigate,
  currentPath,
}) {
  return (
    <aside className={`community-switcher ${isOpen ? "is-open" : ""}`}>
      <button
        className="community-switcher-toggle"
        onClick={onToggle}
        aria-label={
          isOpen
            ? "Collapse community navigation"
            : "Expand community navigation"
        }
      >
        {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>
      <div className="community-switcher-content">
        <span className="switcher-label">COMMUNITY</span>
        <nav aria-label="Community page switcher">
          {pages.map(({ label, icon: Icon, path, disabled }) => (
            <button
              key={label}
              className={currentPath === path ? "active" : ""}
              disabled={disabled}
              title={disabled ? "Coming soon" : label}
              onClick={() => !disabled && onNavigate(path)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {disabled && <em></em>}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
