"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarRange,
  ClipboardList,
  FolderKanban,
  Library,
  ListChecks,
  MessagesSquare,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogout } from "@/features/auth/queries";
import { nameInitials } from "@/lib/format";

const navGroups: {
  label: string;
  items: { href: string; label: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Workspace",
    items: [
      { href: "/slots", label: "Slots", icon: CalendarRange },
      { href: "/registrations", label: "Registrations", icon: ClipboardList },
      { href: "/resources", label: "Resources", icon: Library },
      {
        href: "/project-submissions",
        label: "Project Submissions",
        icon: FolderKanban,
      },
      { href: "/quizzes", label: "Quizzes", icon: ListChecks },
      { href: "/qna", label: "Questions", icon: MessagesSquare },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace("/login");
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-[260px_1fr] bg-muted/30">
      <aside className="sticky top-0 flex h-screen flex-col border-r bg-background">
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
            <GraduationCap className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold tracking-tight">
              VITyarthi
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              Faculty Panel
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-foreground"
                      />
                    )}
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {user && (
          <div className="border-t p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent/60"
                >
                  <Avatar className="size-9">
                    {user.photo && <AvatarImage src={user.photo} alt="" />}
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {nameInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {user.name || "—"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleLogout}
                  disabled={logout.isPending}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      <main className="flex min-w-0 flex-col">{children}</main>
    </div>
  );
}
