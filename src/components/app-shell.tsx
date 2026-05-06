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

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/slots", label: "Slots", icon: CalendarRange },
  { href: "/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/project-submissions", label: "Project Submissions", icon: FolderKanban },
  { href: "/quizzes", label: "Quizzes", icon: ListChecks },
  { href: "/qna", label: "Questions", icon: MessagesSquare },
  { href: "/settings", label: "Settings", icon: Settings },
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
      <aside className="flex flex-col border-r bg-background">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">Faculty</span>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
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
