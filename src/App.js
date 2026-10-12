import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Rail from "./components/Rail";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Console from "./pages/Console";
import LiveFire from "./pages/LiveFire";
import RedTeam from "./pages/RedTeam";
import Settings from "./pages/Settings";

function Shell({ children }) {
  return (
    <div className="app-shell flex h-screen overflow-hidden bg-[#0a0e14] text-slate-200">
      <Rail />
      <main className="relative min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0e14]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

function Routing() {
  const { user, loading } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!loading && user ? <Navigate to="/console" replace /> : <Login />} />
      <Route path="/" element={<Landing />} />
      <Route path="/console" element={<Protected><Console /></Protected>} />
      <Route path="/live-fire" element={<Protected><LiveFire /></Protected>} />
      <Route path="/red-team" element={<Protected><RedTeam /></Protected>} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/history" element={<Protected><History /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routing />
      </BrowserRouter>
    </AuthProvider>
  );
}
