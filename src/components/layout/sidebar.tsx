"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@/app/providers";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Layers,
  Sparkles,
  Megaphone,
  LogOut,
  Sun,
  Moon,
  TrendingUp,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Segments", href: "/segments", icon: Layers },
    { name: "AI Segment Builder", href: "/ai-segment-builder", icon: Sparkles, highlight: true },
    { name: "AI Campaign Assistant", href: "/ai-campaign-assistant", icon: TrendingUp, highlight: true },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0b0f19]/70 backdrop-blur-xl transition-all duration-300">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 shadow-md">
            <span className="text-white font-bold text-lg font-display">X</span>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-display">
              XENO
            </span>
            <span className="ml-1 text-[10px] font-semibold tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/40 px-1.5 py-0.5 rounded-full uppercase">
              AI-CRM
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? item.highlight
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/10"
                    : "bg-slate-100 dark:bg-slate-800/60 text-purple-600 dark:text-purple-400"
                  : item.highlight
                  ? "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive
                    ? "text-current"
                    : item.highlight
                    ? "text-purple-500 dark:text-purple-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                }`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile & Theme Toggle */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold text-sm">
              {session?.user?.name ? session.user.name.split(" ").map(n => n[0]).join("") : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-850 dark:text-slate-200 truncate">
                {session?.user?.name || "User"}
              </span>
              <span className="text-xs text-slate-550 dark:text-slate-400 truncate">
                {(session?.user as any)?.role || "Marketer"}
              </span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-450 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors duration-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
