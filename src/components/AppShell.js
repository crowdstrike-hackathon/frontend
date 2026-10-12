import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, PanelLeft, Settings, SquarePen } from "lucide-react";
import { CloudShader } from "../ui/aceternity/cloud-shader";
import { LogoMark } from "../ui/Logo";
import { useAuth } from "../context/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "../lib/utils";

const PANEL = "border-line bg-white/80 lg:rounded-xl lg:border";
const ROW = "flex h-8 items-center gap-2.5 rounded-md px-2 text-[13.5px] text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink [&_svg]:size-4 [&_svg]:shrink-0";
const ICON = "grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink";
const LEFT = { key: "riposte_sidebar", min: 208, max: 380, initial: 256 };
const RIGHT = { key: "riposte_details", min: 264, max: 480, initial: 312 };

function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return saved === null || typeof saved !== typeof initial ? initial : saved;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

function Resizer({ side, label, width, open, min, max, onResize, onOpenChange, className }) {
  const start = useRef(null);
  const [dragging, setDragging] = useState(false);
  const clamp = (value) => Math.min(max, Math.max(min, value));

  const apply = (raw) => {
    if (raw < min * 0.6) {
      if (open) onOpenChange(false);
      if (start.current?.width) onResize(start.current.width);
      return;
    }
    if (!open) onOpenChange(true);
    onResize(clamp(raw));
  };

  const release = () => {
    start.current = null;
    setDragging(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  useEffect(() => release, []);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={open ? width : 0}
      aria-valuemin={0}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, width: open ? width : 0 };
        setDragging(true);
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const moved = e.clientX - start.current.x;
        apply(start.current.width + (side === "left" ? moved : -moved));
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onDoubleClick={() => onOpenChange(!open)}
      onKeyDown={(e) => {
        const grow = side === "left" ? "ArrowRight" : "ArrowLeft";
        const shrink = side === "left" ? "ArrowLeft" : "ArrowRight";
        if (e.key === "Enter") onOpenChange(!open);
        else if (e.key === grow) apply((open ? width : 0) + 24);
        else if (e.key === shrink && open) apply(width <= min ? 0 : width - 24);
        else return;
        e.preventDefault();
      }}
      className={cn("group/resizer relative z-10 w-2 shrink-0 cursor-col-resize touch-none select-none focus-visible:outline-none", className)}
    >
      <span
        className={cn(
          "absolute inset-y-3 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-ink-3 opacity-0 transition-opacity group-hover/resizer:opacity-40 group-focus-visible/resizer:opacity-60",
          dragging && "opacity-70 group-hover/resizer:opacity-70"
        )}
      />
    </div>
  );
}

export default function AppShell({ onNew, newDisabled, sidebar, header, aside, asideOpen = true, onAsideOpenChange, children }) {
  const { user, logout } = useAuth();
  const name = user?.name || user?.email || "";
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useStored(`${LEFT.key}_open`, true);
  const [navWidth, setNavWidth] = useStored(LEFT.key, LEFT.initial);
  const [asideWidth, setAsideWidth] = useStored(RIGHT.key, RIGHT.initial);
  const compact = !navOpen;

  return (
    <div className="relative isolate flex h-screen overflow-hidden bg-[#E4EFF9] text-ink lg:py-2">
      <CloudShader className="absolute inset-0 -z-10" speed={0.2} count={3} cloudColor="#ffffff" skyTopColor="#a9cdee" skyBottomColor="#e3effa" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-white/45" />
      {navOpen && (
        <aside style={{ width: navWidth }} className="hidden shrink-0 flex-col pl-2 lg:flex">
          <div className="flex h-12 shrink-0 items-center pl-4 pr-2">
            <Link to="/" className="flex min-w-0 flex-1 items-center gap-2 text-[16px] font-semibold tracking-tight text-ink"><LogoMark size={24} /> Riposte</Link>
            <button onClick={() => setNavOpen(false)} aria-label="Collapse sidebar" className={cn(ICON, "text-ink-3")}>
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex shrink-0 flex-col gap-px px-2 pb-2">
            <button onClick={onNew} disabled={newDisabled} className={cn(ROW, "text-left disabled:cursor-default")}>
              <SquarePen /> New chat
            </button>
          </nav>
          <div className="min-h-0 flex-1">{sidebar}</div>
          <div className="flex shrink-0 items-center gap-1 px-2 pb-1 pt-2">
            <Link
              to="/settings"
              aria-label="Account and settings"
              className={cn("flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-md px-1.5 transition-colors hover:bg-paper-3", pathname === "/settings" && "bg-paper-3")}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-semibold uppercase text-white">{name.slice(0, 1)}</span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">{name}</span>
              <Settings className="h-4 w-4 shrink-0 text-ink-4" />
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={logout} aria-label="Sign out" className={cn(ICON, "text-ink-3")}>
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
            </Tooltip>
          </div>
        </aside>
      )}
      <Resizer side="left" label="Resize sidebar" width={navWidth} open={navOpen} {...LEFT} onResize={setNavWidth} onOpenChange={setNavOpen} className="hidden lg:block" />
      <div className={cn("flex min-w-0 flex-1 flex-col overflow-hidden", PANEL, !aside && "lg:mr-2")}>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3 md:px-4">
          {compact && (
            <button onClick={() => setNavOpen(true)} aria-label="Expand sidebar" className={cn(ICON, "-ml-1 hidden text-ink-3 lg:grid")}>
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
          <Link to="/" aria-label="Riposte" className={cn("mr-1", !compact && "lg:hidden")}><LogoMark size={26} /></Link>
          <button onClick={onNew} disabled={newDisabled} aria-label="New chat" className={cn(ICON, "disabled:cursor-default", !compact && "lg:hidden")}>
            <SquarePen className="h-4 w-4" />
          </button>
          <Link to="/settings" aria-label="Account and settings" className={cn(ICON, !compact && "lg:hidden")}>
            <Settings className="h-4 w-4" />
          </Link>
          {header}
        </header>
        <div className="flex min-h-0 flex-1">{children}</div>
      </div>
      {aside && (
        <>
          <Resizer side="right" label="Resize details panel" width={asideWidth} open={asideOpen} {...RIGHT} onResize={setAsideWidth} onOpenChange={onAsideOpenChange} className="hidden xl:block" />
          {asideOpen && (
            <aside style={{ width: asideWidth }} className={cn("mr-2 hidden shrink-0 overflow-hidden xl:block", PANEL)}>
              {aside}
            </aside>
          )}
        </>
      )}
    </div>
  );
}
