import { Navigate, Route, Routes } from "react-router-dom";
import CommunityModule from "../features/community/CommunityModule.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/community/*" element={<CommunityModule />} />
      <Route path="*" element={<Navigate to="/community/suggestions" replace />} />
    </Routes>
  );
}
