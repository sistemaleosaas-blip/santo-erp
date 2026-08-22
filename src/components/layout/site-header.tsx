"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/empresa", label: "Empresa" },
  { href: "/servicos", label: "Serviços" },
  { href: "/clientes", label: "Clientes" },
  { href: "/trabalhe-conosco", label: "Trabalhe Conosco" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <ShieldCheck className="h-6 w-6 text-accent" aria-hidden />
          SANTO
          <span className="hidden text-xs font-normal uppercase tracking-widest text-muted-foreground sm:inline">
            Serviços Terceirizados
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Portais de Acesso</Link>
          </Button>
          <Button asChild size="sm" variant="accent">
            <Link href="/contato">Solicitar Orçamento</Link>
          </Button>
        </div>

        <button
          className="p-2 md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-background md:hidden" aria-label="Navegação móvel">
          <div className="container flex flex-col gap-1 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 px-3">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/login">Portais</Link>
              </Button>
              <Button asChild size="sm" variant="accent" className="flex-1">
                <Link href="/contato">Orçamento</Link>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
