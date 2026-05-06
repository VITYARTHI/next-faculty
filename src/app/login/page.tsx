"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarRange,
  ClipboardList,
  GraduationCap,
  Library,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage, authToken } from "@/lib/api";
import { loginSchema, type LoginInput } from "@/features/auth/schema";
import { isFaculty, useLogin } from "@/features/auth/queries";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const highlights = [
  {
    icon: CalendarRange,
    title: "Manage your slots",
    body: "Track capacity and registration windows at a glance.",
  },
  {
    icon: ClipboardList,
    title: "Approve registrations",
    body: "Review pending students individually or in bulk.",
  },
  {
    icon: Library,
    title: "Share resources",
    body: "Distribute materials, quizzes and project briefs.",
  },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/";

  useEffect(() => {
    if (authToken.get()) router.replace(redirectTo);
  }, [router, redirectTo]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = useLogin();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login.mutateAsync(values);
      if (!isFaculty(user)) {
        authToken.clear();
        toast.error("This account is not linked to a faculty record.");
        return;
      }
      toast.success(`Welcome, ${user.name ?? ""}`.trim());
      router.replace(redirectTo);
    } catch (err) {
      toast.error(getErrorMessage(err, "Login failed"));
    }
  });

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-foreground text-background lg:flex lg:flex-col">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 40% 90%, rgba(255,255,255,0.25), transparent 50%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative flex h-full flex-col p-12">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-background/10 ring-1 ring-background/20 backdrop-blur">
              <GraduationCap className="size-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight">
                VITyarthi Faculty Panel
              </span>
              <span className="text-xs text-background/60">
                Flipped Course Administration
              </span>
            </div>
          </div>

          <div className="mt-auto space-y-10">
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                Run your courses with clarity.
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-background/70">
                A focused workspace for faculty to coordinate slots,
                registrations, resources and student work — all in one place.
              </p>
            </div>

            <ul className="grid gap-4">
              {highlights.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/10 ring-1 ring-background/15">
                    <Icon className="size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-background/60">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-10 text-xs text-background/50">
            © {new Date().getFullYear()} VITyarthi
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              VITyarthi Faculty Panel
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Use your institutional credentials to access the faculty panel.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@vitbhopal.ac.in"
                  className="pl-9"
                  aria-invalid={Boolean(errors.email) || undefined}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9"
                  aria-invalid={Boolean(errors.password) || undefined}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-10 w-full"
              disabled={login.isPending}
            >
              {login.isPending && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Trouble signing in? Contact your course administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
