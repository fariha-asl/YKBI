// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage  from "./pages/LoginPage";
import Dashboard  from "./pages/Dashboard";

const isAuthenticated = () => !!localStorage.getItem("fm_token");

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated()
          ? <Navigate to="/dashboard" replace />
          : <LoginPage />
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
