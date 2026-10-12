import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TooltipProvider } from "./components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Console from "./pages/Console";
import Settings from "./pages/Settings";
import Redteam from "./pages/Redteam";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Routing() {
  const { user, loading } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!loading && user ? <Navigate to="/console" replace /> : <Login />} />
      <Route path="/" element={<Landing />} />
      <Route path="/console" element={<Protected><Console /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />
      <Route path="/redteam" element={<Protected><Redteam /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider delayDuration={150}>
        <BrowserRouter>
          <Routing />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
}
