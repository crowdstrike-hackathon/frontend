import React from "react";
import { Link } from "react-router-dom";
import { LogOut, SquarePen } from "lucide-react";
import { LogoMark } from "../ui/Logo";
import { useAuth } from "../context/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "../lib/utils";

const ROW = "flex h-8 items-center gap-2.5 rounded-md px-2 text-[13.5px] text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink [&_svg]:size-4 [&_svg]:shrink-0";

export default function AppShell({ onNew, newDisabled, workspace, sidebar, header, children }) {
  const { user, logout } = useAuth();
  const name = user?.name || user?.email || "";
  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink">
      <aside className="hidden w-[264px] shrink-0 flex-col border-r border-line bg-paper-2 lg:flex">
        <div className="flex h-12 shrink-0 items-center px-4">
          <Link to="/" className="flex items-center gap-2 text-[16px] font-semibold tracking-tight text-ink"><LogoMark size={24} /> Riposte</Link>
        </div>
        {workspace && (
          <div className="mx-2 mb-2 rounded-md border border-line bg-white px-2.5 py-2">
            <div className="text-[10.5px] font-medium uppercase tracking-wide text-ink-4">Demo workspace</div>
            <div className="mt-0.5 text-[13px] font-medium text-ink">{workspace} support desk</div>
            <div className="text-[11.5px] leading-snug text-ink-3">A made-up company protected by Riposte</div>
          </div>
        )}
        <nav className="flex shrink-0 flex-col gap-px px-2 pb-2">
          <button onClick={onNew} disabled={newDisabled} className={cn(ROW, "text-left disabled:opacity-40")}>
            <SquarePen className="text-brand" /> New chat
          </button>
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
          <Link to="/" aria-label="Riposte" className="mr-1 lg:hidden"><LogoMark size={26} /></Link>
          <button onClick={onNew} disabled={newDisabled} aria-label="New chat" className="grid h-8 w-8 place-items-center rounded-md text-brand hover:bg-paper-3 disabled:opacity-40 lg:hidden">
            <SquarePen className="h-4 w-4" />
          </button>
          {header}
        </header>
        <div className="flex min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
