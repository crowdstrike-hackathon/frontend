import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar, NavBody, NavItems, MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle, NavbarButton } from "../ui/aceternity";
import { LogoMark } from "../ui/Logo";
import { cn } from "../lib/utils";

const GLASS = "border border-white/25 bg-transparent bg-gradient-to-b from-white/[0.10] to-transparent";

const TONE = {
  light: { text: "text-white", items: "[&_a]:!text-white [&_a>div]:!bg-white/20", note: "text-white/80", primary: "primary" },
  dark: { text: "text-slate-900", items: "[&_a]:!text-slate-800 [&_a>div]:!bg-slate-900/10", note: "text-slate-600", primary: "dark" },
};

function useOver(id) {
  const [over, setOver] = useState(!!id);
  useEffect(() => {
    if (!id) return;
    const check = () => {
      const el = document.getElementById(id);
      setOver(!!el && el.getBoundingClientRect().bottom > 48);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [id]);
  return over;
}

export default function SiteNav({ links, actions = [], note, lightOver, light: alwaysLight }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const over = useOver(lightOver);
  const light = alwaysLight || over;
  const tone = light ? TONE.light : TONE.dark;

  const items = links.map(({ name, to, link }) => ({
    name,
    link: link || to,
    active: !!to && to === pathname,
    onClick: to
      ? (e) => {
          e.preventDefault();
          nav(to);
        }
      : undefined,
  }));

  const renderAction = (a, inMenu) => {
    const variant = a.secondary ? "secondary" : inMenu ? "dark" : tone.primary;
    const className = cn(inMenu && "w-full", a.secondary && (inMenu ? "!text-slate-900" : tone.text));
    const close = () => setOpen(false);
    return a.to ? (
      <NavbarButton key={a.label} as={Link} to={a.to} variant={variant} className={className} onClick={close}>
        {a.label}
      </NavbarButton>
    ) : (
      <NavbarButton key={a.label} as="button" variant={variant} className={className} onClick={() => { close(); a.onClick(); }}>
        {a.label}
      </NavbarButton>
    );
  };

  const logo = (
    <Link to="/" className="relative z-20 flex items-center gap-2 px-2 py-1">
      <LogoMark size={28} className="shadow-sm" />
      <span className={cn("text-base font-semibold tracking-tight", tone.text)}>Riposte</span>
    </Link>
  );

  return (
    <Navbar className={cn("fixed top-2", light && "dark")}>
      <NavBody className={GLASS}>
        {logo}
        <NavItems items={items} className={tone.items} />
        <div className="relative z-20 flex items-center gap-2">
          {note && <span className={cn("max-w-[14rem] truncate px-2 text-xs", tone.note)}>{note}</span>}
          {actions.map((a) => renderAction(a, false))}
        </div>
      </NavBody>

      <MobileNav className={GLASS}>
        <MobileNavHeader className="px-4">
          {logo}
          <MobileNavToggle isOpen={open} onClick={() => setOpen(!open)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={open} onClose={() => setOpen(false)} className="!bg-white/90 backdrop-blur-xl">
          {items.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={(e) => {
                setOpen(false);
                item.onClick?.(e);
              }}
              className={item.active ? "font-semibold text-slate-900" : "text-slate-600"}
            >
              {item.name}
            </a>
          ))}
          <div className="flex w-full flex-col gap-3">{actions.map((a) => renderAction(a, true))}</div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
