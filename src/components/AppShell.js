import React from "react";
import { Link, NavLink } from "react-router-dom";
import { History, LogOut, MessageSquare, SquarePen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "../lib/utils";

const LINKS = [
  { to: "/console", label: "Console", icon: MessageSquare },
  { to: "/history", label: "History", icon: History },
];

const ROW = "flex h-8 items-center gap-2.5 rounded-md px-2 text-[13.5px] text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink [&_svg]:size-4 [&_svg]:shrink-0";

export default function AppShell({ onNew, newDisabled, sidebar, header, children }) {
  const { user, logout } = useAuth();
  const name = user?.name || user?.email || "";
  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink">
      <aside className="hidden w-[264px] shrink-0 flex-col border-r border-line bg-paper-2 lg:flex">
        <div className="flex h-12 shrink-0 items-center px-4">
          <Link to="/" className="font-serif text-[19px] font-semibold tracking-tight text-ink">Riposte</Link>
        </div>
        <nav className="flex shrink-0 flex-col gap-px px-2 pb-2">
          {onNew ? (
            <button onClick={onNew} disabled={newDisabled} className={cn(ROW, "text-left disabled:opacity-40")}>
              <SquarePen className="text-clay" /> New chat
            </button>
          ) : (
            <Link to="/console" className={ROW}>
              <SquarePen className="text-clay" /> New chat
            </Link>
          )}
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => cn(ROW, isActive && "bg-paper-3 font-medium text-ink")}>
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="min-h-0 flex-1">{sidebar}</div>
        <div className="flex h-12 shrink-0 items-center gap-2.5 border-t border-line px-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-semibold uppercase text-white">{name.slice(0, 1)}</span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">{name}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={logout} aria-label="Sign out" className="grid h-7 w-7 place-items-center rounded-md text-ink-3 transition-colors hover:bg-paper-3 hover:text-ink">
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Sign out</TooltipContent>
          </Tooltip>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3 md:px-4">
          <Link to="/" className="mr-1 font-serif text-[18px] font-semibold tracking-tight lg:hidden">Riposte</Link>
          <nav className="flex items-center gap-0.5 lg:hidden">
            {LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} aria-label={label} className={({ isActive }) => cn("grid h-8 w-8 place-items-center rounded-md text-ink-3 hover:bg-paper-3", isActive && "bg-paper-3 text-ink")}>
                <Icon className="h-4 w-4" />
              </NavLink>
            ))}
          </nav>
          {header}
        </header>
        <div className="flex min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
