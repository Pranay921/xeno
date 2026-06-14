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
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border bg-card transition-all duration-300">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <span className="font-bold text-lg font-display">X</span>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-foreground font-display">
              XENO
            </span>
            <span className="ml-1.5 text-[10px] font-bold tracking-wider text-foreground bg-foreground/10 px-2 py-0.5 rounded-md uppercase">
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
                  ? "bg-foreground text-background shadow-sm"
                  : item.highlight
                  ? "text-foreground hover:bg-foreground/5 border border-border"
                  : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive
                    ? "text-current"
                    : item.highlight
                    ? "text-foreground"
                    : "text-foreground/50 group-hover:text-foreground"
                }`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile & Theme Toggle */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground bg-foreground/5 font-semibold text-sm">
              {session?.user?.name ? session.user.name.split(" ").map(n => n[0]).join("") : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {session?.user?.name || "User"}
              </span>
              <span className="text-xs text-foreground/60 truncate">
                {(session?.user as { role?: string })?.role || "Marketer"}
              </span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-foreground/75 hover:bg-foreground/5 hover:text-foreground transition-colors"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors duration-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
