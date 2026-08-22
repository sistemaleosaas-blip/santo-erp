import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { logout } from "@/app/(auth)/actions";
import type { SessionProfile } from "@/types/auth";
import { ROLE_LABELS } from "@/types/auth";

export function DashboardTopbar({ profile, portalLabel }: { profile: SessionProfile; portalLabel: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-2 font-display font-bold">
        <ShieldCheck className="h-5 w-5 text-accent" />
        SANTO <span className="text-sm font-normal text-muted-foreground">/ {portalLabel}</span>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight">{profile.fullName}</p>
          <p className="text-xs text-muted-foreground">
            {profile.roles.map((r) => ROLE_LABELS[r]).join(", ")}
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
