"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9",
  },
  {
    href: "/history",
    label: "History",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  },
];

const ADMIN_NAV = [
  {
    href: "/admin/team",
    label: "Team",
    icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  },
  {
    href: "/admin/attendance",
    label: "Attendance",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    href: "/admin/locations",
    label: "Locations",
    icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a1 1 0 110-2 1 1 0 010 2z",
  },
];

interface Props {
  user: { name: string; email: string; role: Role };
}

export default function AppSidebar({ user }: Props) {
  const pathname = usePathname();
  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const isAdmin = user.role === "ADMIN";

  const NavItem = ({ href, label, icon }: { href: string; label: string; icon: string }) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        title={label}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
          ${active ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
      >
        {active && (
          <div className="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded-r bg-white" />
        )}
        <svg
          className="w-[18px] h-[18px] shrink-0"
          fill="none" stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.8}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
        {/* Label hidden at md, visible at lg */}
        <span className={`hidden lg:block text-sm font-${active ? "700" : "500"} whitespace-nowrap`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className="hidden md:flex flex-col shrink-0 md:w-16 lg:w-56 h-[100dvh] sticky top-0"
      style={{ background: "linear-gradient(175deg, #1D9E75 0%, #0A6644 100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 pt-6 pb-7">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6H2v14h14v-2M4 6V4h14v14h-2M8 12h8M12 8v8" />
          </svg>
        </div>
        <span className="hidden lg:block text-white font-extrabold text-base tracking-tight">TimeCheck</span>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {NAV.map((n) => <NavItem key={n.href} {...n} />)}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="hidden lg:block text-[10px] font-semibold text-white/40 uppercase tracking-widest px-3 pt-5 pb-1">
              Admin
            </div>
            <div className="lg:hidden my-2 border-t border-white/15" />
            {ADMIN_NAV.map((n) => <NavItem key={n.href} {...n} />)}
          </>
        )}
      </nav>

      {/* Bottom: settings + user card */}
      <div className="px-2 pb-4 flex flex-col gap-1">
        <NavItem
          href="/profile"
          label="Settings"
          icon="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        />

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all w-full"
        >
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span className="hidden lg:block text-sm font-medium">Sign Out</span>
        </button>

        {/* User card — desktop only */}
        <div className="hidden lg:flex items-center gap-2.5 mt-3 bg-white/10 rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-white font-semibold text-[13px] truncate">{user.name}</p>
            <p className="text-white/50 text-[11px]">{isAdmin ? "Administrator" : "Employee"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
