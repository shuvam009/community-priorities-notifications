import { NavLink } from "react-router-dom";
import SmartCityMark from "./smart_city_mark_ad.jsx";

export default function AdminShell({ children }) {
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
          <NavLink to="/admin/voting">
            ▦ <span>Voting workspace</span>
          </NavLink>
          <button>
            ◫ <span>Issue management</span>
          </button>
          <NavLink to="/admin/announcements">
            ♧ <span>Citizen announcements</span>
          </NavLink>
          <NavLink to="/admin/voting-history">
            $ <span>Vote history</span>
          </NavLink>
          <NavLink to="/admin/community-history">
            ! <span>Community history</span>
          </NavLink>
        </nav>
        <div className="admin-account">
          <span>AS</span>
          <div>
            <b>Admin user</b>
            <small>City administrator</small>
          </div>
        </div>
      </aside>
      {children}
    </div>
  );
}
