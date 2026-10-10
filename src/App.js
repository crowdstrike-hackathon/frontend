import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SiteNav from "./components/SiteNav";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

function Shell({ children }) {
  const { user, logout } = useAuth();
  const links = [
    { name: "Dashboard", to: "/dashboard" },
    { name: "History", to: "/history" },
  ];
  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-b from-sky-50 to-slate-100">
      <SiteNav links={links} note={user?.name || user?.email} actions={[{ label: "Sign out", onClick: logout, secondary: true }]} />
      <main className="h-full min-w-0 overflow-hidden pt-14">{children}</main>
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-sky-100">
        <Loader2 className="h-6 w-6 animate-spin text-sky-700" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

function Routing() {
  const { user, loading } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!loading && user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/history" element={<Protected><History /></Protected>} />
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
