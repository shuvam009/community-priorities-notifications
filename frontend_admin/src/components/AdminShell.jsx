import { NavLink } from "react-router-dom";

export default function AdminShell({ children }) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>SC</span>
          <div>
            <b>Smart City</b>
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
          <button>
            ♧ <span>Citizen activity</span>
          </button>
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
