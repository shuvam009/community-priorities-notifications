import { Navigate, Route, Routes } from "react-router-dom";
import AdminVoting from "../pages/admin_voting.jsx";
import CommunityHistory from "../pages/community_history.jsx";
import VotingHistory from "../pages/voting_history.jsx";
import AdminShell from "../components/AdminShell.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/voting" element={<AdminVoting />} />
      <Route
        path="/admin/community-history"
        element={
          <AdminShell>
            <CommunityHistory />
          </AdminShell>
        }
      />
      <Route
        path="/admin/voting-history"
        element={
          <AdminShell>
            <VotingHistory />
          </AdminShell>
        }
      />
      <Route path="*" element={<Navigate to="/admin/voting" replace />} />
    </Routes>
  );
}
