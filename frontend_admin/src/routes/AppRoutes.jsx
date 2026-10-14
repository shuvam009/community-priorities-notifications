import { Navigate, Route, Routes } from "react-router-dom";
import AdminVoting from "../pages/admin_voting.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/voting" element={<AdminVoting />} />
      <Route path="*" element={<Navigate to="/admin/voting" replace />} />
    </Routes>
  );
}
