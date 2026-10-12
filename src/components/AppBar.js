import React from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { LogoMark } from "../ui/Logo";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "../lib/utils";

const LINKS = [
  { to: "/console", label: "Console" },
  { to: "/history", label: "History" },
];

export default function AppBar({ children, right }) {
  const { user, logout } = useAuth();
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 rounded-full border border-white/50 bg-white/20 px-3 shadow-lg backdrop-blur-xl">
      <Link to="/" className="flex items-center gap-2 pl-1 pr-2">
        <LogoMark size={28} className="shadow-sm" />
        <span className="hidden text-base font-semibold tracking-tight text-white [text-shadow:0_1px_3px_rgba(8,30,66,0.6)] sm:block">Riposte</span>
      </Link>
      <nav className="hidden items-center gap-1 md:flex">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              cn(
                "rounded-full px-3 py-1.5 text-[13px] font-semibold text-white/85 transition hover:bg-white/20 hover:text-white [text-shadow:0_1px_3px_rgba(8,30,66,0.5)]",
                isActive && "bg-white/25 text-white"
              )
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex min-w-0 flex-1 items-center justify-center">{children}</div>
      <div className="flex items-center gap-2">
        {right}
        <span className="hidden max-w-[10rem] truncate text-xs font-medium text-white/90 [text-shadow:0_1px_3px_rgba(8,30,66,0.6)] lg:block">{user?.name || user?.email}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="glass" size="icon" onClick={logout} aria-label="Sign out">
              <LogOut />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sign out</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
