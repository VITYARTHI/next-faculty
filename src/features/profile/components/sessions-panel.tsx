"use client";

import { useState } from "react";
import { Loader2, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/api";
import { useLogoutOtherSessions } from "../queries";

export function SessionsPanel() {
  const logoutOthers = useLogoutOtherSessions();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!password) {
      setError("Confirm with your password.");
      return;
    }
    setError(null);
    try {
      await logoutOthers.mutateAsync({ password });
      toast.success("Signed out other sessions");
      setOpen(false);
      setPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not sign out other sessions"));
    }
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-start justify-between gap-3 border-b px-6 py-4">
        <div>
          <h3 className="text-base font-semibold">Active sessions</h3>
          <p className="text-xs text-muted-foreground">
            Sign out everywhere else if you used a shared device.
          </p>
        </div>
      </div>
      <div className="p-6">
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
        >
          <ShieldOff className="size-4" />
          Sign out other sessions
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setPassword("");
            setError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out other sessions?</DialogTitle>
            <DialogDescription>
              This invalidates every other browser or device signed in to this
              account. Your current session stays active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="logout-password">Confirm password</Label>
            <Input
              id="logout-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error || undefined}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={logoutOthers.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submit}
              disabled={logoutOthers.isPending}
            >
              {logoutOthers.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Sign out others
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
